import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { config } from '../config.js';
import { hashPassword, hashIp } from '../crypto/encrypt.js';
import {
  createLink,
  getLinkBySlug,
  countIpCreatesToday,
  countMonthlyCreates,
  revealLink,
} from '../db/links.js';
import { generateSlug } from '../db/links.js';
import { resolveRequestCaps } from '../utils/caps.js';
import { burnSecondsFromMode, BURN_TIMER_OPTIONS } from '../utils/tiers.js';
import { enforceDeviceAccess } from '../db/deviceSessions.js';
import { getDeviceId } from '../middleware/deviceAccess.js';

const router = Router();

const BLOCKED_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.dll', '.sh', '.app', '.dmg',
  '.deb', '.rpm', '.jar', '.apk', '.vbs', '.ps1', '.reg', '.hta',
]);

const BLOCKED_MIMES = new Set([
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-sh',
  'application/x-bat',
  'application/java-archive',
  'application/vnd.android.package-archive',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

const createLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many create requests. Wait a moment.' },
});

function clientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
}

function isExecutableFile(fileName, mime) {
  const ext = fileName ? `.${fileName.split('.').pop()?.toLowerCase()}` : '';
  if (BLOCKED_EXTENSIONS.has(ext)) return true;
  if (mime && BLOCKED_MIMES.has(mime.toLowerCase())) return true;
  return false;
}

function burnAtFromMode(mode) {
  if (mode === 'view') return null;
  const seconds = burnSecondsFromMode(mode);
  if (!seconds) return null;
  return new Date(Date.now() + seconds * 1000).toISOString();
}

router.get('/burn-options', (req, res) => {
  const resolved = resolveRequestCaps(req);
  const allowed = new Set(resolved.caps.burnOptions);
  res.json({
    options: BURN_TIMER_OPTIONS.filter((o) => allowed.has(o.id)),
    caps: resolved.caps,
  });
});

router.post('/create', createLimiter, upload.single('file'), (req, res) => {
  const resolved = resolveRequestCaps(req);
  const caps = resolved.caps;
  const ip = clientIp(req);
  const ipHash = hashIp(ip);

  if (resolved.source === 'subscription' && resolved.accessCode) {
    const deviceId = getDeviceId(req);
    const deviceCheck = enforceDeviceAccess(resolved.accessCode, deviceId);
    if (!deviceCheck.ok) {
      return res.status(403).json({
        error: deviceCheck.error,
        code: deviceCheck.code,
        sessions: deviceCheck.sessions ?? [],
        maxDevices: deviceCheck.maxDevices,
      });
    }
    if (caps.linksPerMonth > 0) {
      const monthly = countMonthlyCreates(resolved.accessCode, resolved.tier);
      if (monthly >= caps.linksPerMonth) {
        return res.status(429).json({ error: 'Monthly link limit reached', code: 'MONTHLY_LIMIT' });
      }
    }
  } else {
    const dailyLimit = caps.linksPerDayIp ?? config.freeCreatesPerDay ?? -1;
    if (dailyLimit > 0) {
      const daily = countIpCreatesToday(ipHash);
      if (daily >= dailyLimit) {
        return res.status(429).json({
          error: `Free limit: ${dailyLimit} links per 24h per IP`,
          code: 'RATE_LIMIT',
        });
      }
    }
  }

  const type = req.body?.type === 'file' || req.file ? 'file' : 'text';
  const burnMode = String(req.body?.burnMode || 'view');
  const allowedBurn = caps.burnOptions.includes(burnMode);
  if (!allowedBurn) {
    return res.status(400).json({ error: 'Burn mode not allowed on your tier' });
  }

  let text = '';
  let fileName = null;
  let fileMime = null;
  let fileBase64 = null;

  if (type === 'text') {
    text = String(req.body?.text || '').trim();
    if (!text) return res.status(400).json({ error: 'Text required' });
    if (text.length > caps.maxTextChars) {
      return res.status(400).json({ error: `Max ${caps.maxTextChars} characters` });
    }
  } else {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'File required' });
    if (file.size > caps.maxFileBytes) {
      return res.status(400).json({ error: `Max file size ${Math.round(caps.maxFileBytes / 1024 / 1024)}MB` });
    }
    fileName = file.originalname || 'upload';
    fileMime = file.mimetype || 'application/octet-stream';
    if (isExecutableFile(fileName, fileMime)) {
      return res.status(400).json({ error: 'Executable uploads blocked' });
    }
    fileBase64 = file.buffer.toString('base64');
  }

  const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
  if (password && !caps.password) {
    return res.status(400).json({ error: 'Password not available on your tier' });
  }
  const passwordHash = password ? hashPassword(password) : null;

  const customSlug = typeof req.body?.customSlug === 'string' ? req.body.customSlug.trim() : '';
  const slug = generateSlug(customSlug, caps);
  const burnAt = burnAtFromMode(burnMode);

  const result = createLink({
    slug,
    type,
    text,
    fileName,
    fileMime,
    fileBase64,
    burnMode,
    burnAt,
    passwordHash,
    tier: resolved.tier,
    ip,
    accessCode: resolved.accessCode,
  });

  if (result.error) {
    return res.status(409).json({ error: result.error });
  }

  const baseUrl = config.publicAppUrl?.replace(/\/$/, '') || `${req.protocol}://${req.get('host')}`;
  res.status(201).json({
    slug: result.link.slug,
    url: `${baseUrl}/v/${result.link.slug}`,
    burnMode: result.link.burnMode,
    burnAt: result.link.burnAt,
    hasPassword: Boolean(passwordHash),
    warning: 'You cannot view this secret again. Copy the link now.',
  });
});

router.get('/:slug/meta', (req, res) => {
  const link = getLinkBySlug(req.params.slug);
  if (!link) return res.status(404).json({ error: 'NOT_FOUND' });
  if (link.burned) return res.json({ status: 'burned' });
  if (link.burnAt && new Date(link.burnAt).getTime() <= Date.now()) {
    return res.json({ status: 'expired' });
  }
  res.json({
    status: 'active',
    hasPassword: Boolean(link.passwordHash),
    type: link.type,
    burnMode: link.burnMode,
    burnAt: link.burnAt,
    viewCount: link.viewCount,
  });
});

router.post('/:slug/reveal', rateLimit({ windowMs: 60_000, max: 20 }), (req, res) => {
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const result = revealLink(req.params.slug, password);

  if (result.error === 'NOT_FOUND') return res.status(404).json({ error: 'Link not found' });
  if (result.error === 'BURNED') return res.status(410).json({ error: 'This dead link has vanished', code: 'BURNED' });
  if (result.error === 'EXPIRED') return res.status(410).json({ error: 'Timer expired — secret destroyed', code: 'EXPIRED' });
  if (result.error === 'BAD_PASSWORD') return res.status(401).json({ error: 'Wrong password', code: 'BAD_PASSWORD' });
  if (result.error === 'ALREADY_VIEWED') return res.status(410).json({ error: 'Already viewed — secret destroyed', code: 'ALREADY_VIEWED' });
  if (result.error === 'CORRUPT') return res.status(500).json({ error: 'Secret corrupted' });

  const resolved = resolveRequestCaps(req);
  const showCounter = resolved.caps.viewCounter || result.link.tier !== 'free';

  res.json({
    content: result.content,
    burned: result.link.burned,
    burnMode: result.link.burnMode,
    burnAt: result.link.burnAt,
    viewCount: showCounter ? result.link.viewCount : undefined,
    warning: result.link.burned
      ? 'Secret destroyed. This link will never work again.'
      : 'Copy now — this may be your only chance.',
  });
});

export default router;
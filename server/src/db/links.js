import { randomBytes } from 'crypto';
import { createJsonFileStore } from './jsonFile.js';
import { config } from '../config.js';
import { encryptPayload, decryptPayload, hashIp, verifyPassword } from '../crypto/encrypt.js';

const file = createJsonFileStore(config.linksPath || './data/links.json', { links: [] });

function readStore() {
  return file.read();
}

function writeStore(data) {
  file.write(data);
}

export function generateSlug(custom, tierCaps) {
  if (custom && tierCaps.customSlug) {
    const clean = String(custom).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24);
    if (clean.length >= 4) return clean;
  }
  return randomBytes(6).toString('base64url').slice(0, 10);
}

export function createLink({
  slug,
  type,
  text,
  fileName,
  fileMime,
  fileBase64,
  burnMode,
  burnAt,
  passwordHash,
  tier,
  ip,
  accessCode,
}) {
  const store = readStore();
  if (store.links.some((l) => l.slug === slug && !l.burned)) {
    return { error: 'Slug already in use' };
  }

  let payload;
  if (type === 'text') {
    payload = encryptPayload(text);
  } else {
    payload = encryptPayload(JSON.stringify({ fileName, fileMime, fileBase64 }));
  }

  const link = {
    id: randomBytes(8).toString('hex'),
    slug,
    type,
    payload,
    burnMode,
    burnAt,
    passwordHash: passwordHash || null,
    tier: tier || 'free',
    accessCode: accessCode || null,
    ipHash: hashIp(ip),
    createdAt: new Date().toISOString(),
    viewedAt: null,
    viewCount: 0,
    burned: false,
    burnedAt: null,
  };

  store.links.unshift(link);
  if (store.links.length > 50_000) store.links = store.links.slice(0, 50_000);
  writeStore(store);
  return { link };
}

export function getLinkBySlug(slug) {
  const store = readStore();
  return store.links.find((l) => l.slug === slug) ?? null;
}

export function countIpCreatesToday(ipHash) {
  const store = readStore();
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return store.links.filter(
    (l) => l.ipHash === ipHash && new Date(l.createdAt).getTime() > dayAgo && l.tier === 'free'
  ).length;
}

export function countMonthlyCreates(accessCode, tier) {
  if (!accessCode) return 0;
  const store = readStore();
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return store.links.filter(
    (l) => l.accessCode === accessCode && new Date(l.createdAt).getTime() > monthAgo
  ).length;
}

export function revealLink(slug, password) {
  const store = readStore();
  const link = store.links.find((l) => l.slug === slug);
  if (!link) return { error: 'NOT_FOUND' };
  if (link.burned) return { error: 'BURNED' };
  if (link.burnAt && new Date(link.burnAt).getTime() <= Date.now()) {
    link.burned = true;
    link.burnedAt = new Date().toISOString();
    link.payload = null;
    writeStore(store);
    return { error: 'EXPIRED' };
  }

  if (link.passwordHash && !verifyPassword(password, link.passwordHash)) {
    return { error: 'BAD_PASSWORD' };
  }

  if (link.viewCount > 0 && link.burnMode === 'view') {
    return { error: 'ALREADY_VIEWED' };
  }

  let content;
  try {
    const plain = decryptPayload(link.payload);
    if (link.type === 'text') {
      content = { type: 'text', text: plain };
    } else {
      content = { type: 'file', ...JSON.parse(plain) };
    }
  } catch {
    return { error: 'CORRUPT' };
  }

  link.viewCount += 1;
  link.viewedAt = new Date().toISOString();

  if (link.burnMode === 'view') {
    link.burned = true;
    link.burnedAt = new Date().toISOString();
    link.payload = null;
  }

  writeStore(store);
  return { link, content };
}

export function purgeExpiredLinks() {
  const store = readStore();
  const now = Date.now();
  let changed = false;
  for (const link of store.links) {
    if (link.burned) continue;
    if (link.burnAt && new Date(link.burnAt).getTime() <= now) {
      link.burned = true;
      link.burnedAt = new Date().toISOString();
      link.payload = null;
      changed = true;
    }
  }
  if (changed) writeStore(store);
}

export function getLinkStats() {
  const store = readStore();
  const links = store.links;
  return {
    total: links.length,
    active: links.filter((l) => !l.burned).length,
    burned: links.filter((l) => l.burned).length,
  };
}

export function getAllLinksAdmin(limit = 100) {
  return readStore().links.slice(0, limit).map((l) => ({
    id: l.id,
    slug: l.slug,
    type: l.type,
    tier: l.tier,
    burned: l.burned,
    burnMode: l.burnMode,
    createdAt: l.createdAt,
    viewCount: l.viewCount,
  }));
}
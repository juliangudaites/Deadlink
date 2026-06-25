import { createCipheriv, createDecipheriv, randomBytes, scryptSync, createHash } from 'crypto';
import { config } from '../config.js';

function getKey() {
  const raw = config.encryptionKey?.trim();
  if (raw && raw.length >= 32) {
    return Buffer.from(raw.slice(0, 64), 'hex').length === 32
      ? Buffer.from(raw.slice(0, 64), 'hex')
      : scryptSync(raw, 'deadlink-salt', 32);
  }
  return scryptSync('deadlink-dev-only-change-in-production', 'deadlink-salt', 32);
}

export function encryptPayload(plaintext) {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: enc.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  };
}

export function decryptPayload({ ciphertext, iv, tag }) {
  const key = getKey();
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64')),
    decipher.final(),
  ]);
  return dec.toString('utf8');
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !password) return false;
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const check = scryptSync(password, salt, 32).toString('hex');
  return check === hash;
}

export function hashIp(ip) {
  return createHash('sha256').update(String(ip || 'unknown')).digest('hex').slice(0, 16);
}
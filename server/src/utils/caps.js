import { getTierCaps, normalizeTier } from './tiers.js';
import { getActiveSubscriptionByCode } from '../db/subscriptions.js';

export function resolveRequestCaps(req) {
  const code = req.headers['x-deadlink-code'] || req.body?.accessCode;
  if (code) {
    const sub = getActiveSubscriptionByCode(String(code).trim().toUpperCase());
    if (sub) {
      return {
        tier: normalizeTier(sub.tier),
        caps: getTierCaps(sub.tier),
        accessCode: sub.accessCode,
        expiresAt: sub.expiresAt,
        source: 'subscription',
      };
    }
  }
  return { tier: 'free', caps: getTierCaps('free'), accessCode: null, expiresAt: null, source: 'free' };
}
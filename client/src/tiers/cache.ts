import type { TierCaps, TierId } from './tiers';

const KEY = 'deadlink_tier_cache';

export interface TierCache {
  tier: TierId;
  caps: TierCaps;
  accessCode: string;
  expiresAt: string | null;
}

export function getTierCache(): TierCache | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TierCache) : null;
  } catch {
    return null;
  }
}

export function setTierCache(data: TierCache): void {
  sessionStorage.setItem(KEY, JSON.stringify(data));
}

export function clearTierCache(): void {
  sessionStorage.removeItem(KEY);
}
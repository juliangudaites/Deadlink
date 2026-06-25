import { fetchJson } from './api/fetch';
import { tierHeaders } from './api/tierHeaders';
import type { TierCaps, TierId } from './tiers/tiers';

export interface CreateLinkResult {
  slug: string;
  url: string;
  burnMode: string;
  burnAt: string | null;
  hasPassword: boolean;
  warning: string;
}

export interface LinkMeta {
  status: 'active' | 'burned' | 'expired';
  hasPassword?: boolean;
  type?: string;
  burnMode?: string;
  burnAt?: string | null;
}

export interface RevealResult {
  content: { type: 'text'; text: string } | { type: 'file'; fileName: string; fileMime: string; fileBase64: string };
  burned: boolean;
  burnMode: string;
  burnAt: string | null;
  viewCount?: number;
  warning: string;
}

export interface TierRedeemResult {
  tier: TierId;
  caps: TierCaps;
  accessCode: string;
  expiresAt?: string | null;
  label: string;
  sessions?: DeviceSession[];
  maxDevices?: number;
}

export interface DeviceSession {
  deviceId: string;
  label: string;
  lastSeen: string;
  isCurrent?: boolean;
  waiting?: boolean;
}

export interface TierInvoice {
  mode: 'static' | 'stripe' | 'btcpay';
  subscriptionId: string;
  tier: TierId;
  tierLabel: string;
  address?: string;
  amountBtc?: string;
  amountSats?: number;
  paymentUri?: string;
  checkoutUrl?: string;
  amountUsd?: number;
  currency?: string;
}

export async function createLink(formData: FormData): Promise<CreateLinkResult> {
  return fetchJson('/api/links/create', {
    method: 'POST',
    headers: tierHeaders(),
    body: formData,
    timeoutMs: 30_000,
  });
}

export async function fetchLinkMeta(slug: string): Promise<LinkMeta> {
  return fetchJson(`/api/links/${encodeURIComponent(slug)}/meta`);
}

export async function revealLink(slug: string, password?: string): Promise<RevealResult> {
  return fetchJson(`/api/links/${encodeURIComponent(slug)}/reveal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: password || '' }),
  });
}

export async function reportLink(slug: string, category: string, note?: string): Promise<void> {
  await fetchJson('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ linkSlug: slug, category, note }),
  });
}

export async function redeemTierAccess(code: string): Promise<TierRedeemResult> {
  return fetchJson('/api/tiers/redeem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...tierHeaders() },
    body: JSON.stringify({ code }),
  });
}

export async function revokeTierSession(deviceId: string): Promise<TierRedeemResult & { registered?: boolean }> {
  return fetchJson('/api/tiers/sessions/revoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...tierHeaders() },
    body: JSON.stringify({ deviceId }),
  });
}

export async function fetchTierPaymentConfig(): Promise<{
  enabled: boolean;
  paymentMethods: { bitcoin: boolean; stripe: boolean };
}> {
  return fetchJson('/api/tiers/config');
}

export async function createTierInvoice(tier: TierId, currency = 'USD'): Promise<TierInvoice> {
  return fetchJson('/api/tiers/invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier, currency }),
  });
}

export async function createStripeTierCheckout(
  tier: TierId,
  currency = 'USD',
  opts?: { endorselyReferral?: string; affiliateRef?: string }
): Promise<TierInvoice> {
  return fetchJson('/api/tiers/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier, currency, ...opts }),
  });
}

export async function pollTierPaymentStatus(subscriptionId: string) {
  return fetchJson<{ paid: boolean; accessCode?: string; expiresAt?: string; tier?: TierId; caps?: TierCaps }>(
    `/api/tiers/invoice/${subscriptionId}/status`
  );
}

export async function completeStripeSession(sessionId: string) {
  return fetchJson<{ paid: boolean; accessCode?: string; expiresAt?: string; tier?: TierId; caps?: TierCaps }>(
    `/api/tiers/stripe/complete?session_id=${encodeURIComponent(sessionId)}`
  );
}
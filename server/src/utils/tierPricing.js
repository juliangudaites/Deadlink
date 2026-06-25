import { createHash } from 'crypto';

export const TIER_PRICES = {
  shadow: { usd: 19, brl: 110 },
  void: { usd: 49, brl: 285 },
  spectre: { usd: 199, brl: 1150 },
};

export const PAID_TIER_IDS = ['shadow', 'void', 'spectre'];

export function getTierPrice(tier, currency = 'USD') {
  const prices = TIER_PRICES[tier];
  if (!prices) return null;
  return currency.toUpperCase() === 'BRL' ? prices.brl : prices.usd;
}

export function uniquePaymentSats(baseBtc, invoiceId) {
  const baseSats = Math.round(baseBtc * 1e8);
  const hash = createHash('sha256').update(String(invoiceId)).digest();
  const suffix = 100 + (hash.readUInt16BE(0) % 900);
  return baseSats + suffix;
}

export function satsToBtc(sats) {
  return sats / 1e8;
}
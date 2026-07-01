export const BURN_TIMER_OPTIONS = [
  { id: 'view', label: 'Burn on first view', seconds: 0 },
  { id: '1h', label: '1 hour', seconds: 3600 },
  { id: '24h', label: '24 hours', seconds: 86400 },
  { id: '7d', label: '7 days', seconds: 604800 },
  { id: '30d', label: '30 days', seconds: 2592000 },
];

export const TIER_CAPS = {
  free: {
    label: 'FREE',
    linksPerMonth: 0,
    linksPerDayIp: -1,
    maxTextChars: 50000,
    maxFileBytes: 25_000_000,
    customSlug: false,
    password: true,
    viewCounter: false,
    apiAccess: false,
    maxBurnSeconds: 604800,
    burnOptions: ['view', '1h', '24h', '7d'],
  },
  shadow: {
    label: 'SHADOW',
    linksPerMonth: -1,
    linksPerDayIp: 0,
    maxTextChars: 10000,
    maxFileBytes: 10_000_000,
    customSlug: true,
    password: true,
    viewCounter: false,
    apiAccess: false,
    maxBurnSeconds: 2592000,
    burnOptions: ['view', '1h', '24h', '7d', '30d'],
  },
  void: {
    label: 'VOID',
    linksPerMonth: -1,
    linksPerDayIp: 0,
    maxTextChars: 50000,
    maxFileBytes: 25_000_000,
    customSlug: true,
    password: true,
    viewCounter: true,
    apiAccess: false,
    maxBurnSeconds: 2592000,
    burnOptions: ['view', '1h', '24h', '7d', '30d'],
  },
  spectre: {
    label: 'SPECTRE',
    linksPerMonth: -1,
    linksPerDayIp: 0,
    maxTextChars: 200000,
    maxFileBytes: 100_000_000,
    customSlug: true,
    password: true,
    viewCounter: true,
    apiAccess: true,
    maxBurnSeconds: 2592000,
    burnOptions: ['view', '1h', '24h', '7d', '30d'],
  },
};

export const PAID_TIER_IDS = ['shadow', 'void', 'spectre'];

export function normalizeTier(value) {
  const tier = String(value || 'free').toLowerCase();
  return TIER_CAPS[tier] ? tier : 'free';
}

export function getTierCaps(tier) {
  return TIER_CAPS[normalizeTier(tier)];
}

export function burnSecondsFromMode(mode) {
  const opt = BURN_TIMER_OPTIONS.find((o) => o.id === mode);
  return opt ? opt.seconds : 0;
}
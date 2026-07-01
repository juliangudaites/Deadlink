export type TierId = 'free' | 'shadow' | 'void' | 'spectre';

export interface TierCaps {
  label: string;
  linksPerMonth: number;
  linksPerDayIp: number;
  maxTextChars: number;
  maxFileBytes: number;
  customSlug: boolean;
  password: boolean;
  viewCounter: boolean;
  apiAccess: boolean;
  maxBurnSeconds: number;
  burnOptions: string[];
}

export const FREE_CAPS: TierCaps = {
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
};
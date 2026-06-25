export const SITE = {
  name: 'DEADLINK',
  tagline: 'Send it once. Then it\'s gone.',
  url: import.meta.env.VITE_PUBLIC_SITE_URL || 'https://deadlink.onrender.com',
  defaultTitle: 'DEADLINK — One-Time Secret Links | Burn After Reading 2026',
  defaultDescription:
    'Free one-time secret link generator. Encrypted burn-after-reading notes and files. No login. Privnote alternative. Share passwords & API keys once — then gone forever.',
  keywords:
    'one time secret link, burn after reading, privnote alternative, self destructing message, send password securely, dead link, encrypted note, onetimesecret alternative',
  twitter: '@deadlink',
  ogImage: '/brand/og-image.svg',
  sisterSite: { name: 'FLUXGRID', url: 'https://fluxgrid.onrender.com', blurb: 'Anonymous channel chat in the void' },
} as const;
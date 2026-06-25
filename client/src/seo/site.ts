export const SITE = {
  name: 'DEADLINK',
  tagline: 'Send it once. Then it\'s gone.',
  url: import.meta.env.VITE_PUBLIC_SITE_URL || 'https://deadlink.onrender.com',
  defaultTitle: 'DEADLINK — One-Time Secret Links | Burn After Reading',
  defaultDescription:
    'Create encrypted one-time secret links. Paste text or upload a file, share the URL, recipient views once — then it vanishes forever. No account. Free.',
  twitter: '@deadlink',
  sisterSite: { name: 'FLUXGRID', url: 'https://fluxgrid.onrender.com', blurb: 'Anonymous channel chat in the void' },
} as const;
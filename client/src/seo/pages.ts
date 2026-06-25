export interface LearnPage {
  slug: string;
  title: string;
  description: string;
  h1: string;
  sections: { heading: string; paragraphs: string[] }[];
  faq: { q: string; a: string }[];
  related: string[];
}

export const LEARN_PAGES: Record<string, LearnPage> = {
  'privnote-alternative': {
    slug: 'privnote-alternative',
    title: 'Privnote Alternative 2026 — DEADLINK One-Time Secret Links',
    description:
      'Looking for a Privnote alternative? DEADLINK offers encrypted burn-after-reading links, optional passwords, file uploads, and no account required.',
    h1: 'Privnote Alternative — DEADLINK',
    sections: [
      {
        heading: 'Why switch from Privnote?',
        paragraphs: [
          'Privnote pioneered self-destructing notes, but modern users need file support, timers, optional passwords, and a cleaner mobile experience. DEADLINK is built for 2026: void-dark UI, AES-256-GCM encryption at rest, and burn-on-view or scheduled expiry.',
          'No signup. No email. Create a link in seconds, share it once, and the secret is permanently destroyed after viewing or when the timer ends.',
        ],
      },
      {
        heading: 'What DEADLINK adds',
        paragraphs: [
          'Text up to 2,000 characters free, or upload a 1MB file. Optional password gate. Burn on first view, or set 1h / 24h / 7d timers. Paid tiers add custom slugs, larger files, and API access.',
          'Same universe as FLUXGRID — cyberpunk-minimal, privacy-first, no clutter.',
        ],
      },
    ],
    faq: [
      { q: 'Is DEADLINK free?', a: 'Yes — 3 links per day per IP, no account.' },
      { q: 'Can recipients view twice?', a: 'No on burn-on-view mode. Timer mode allows views until expiry.' },
      { q: 'Is it encrypted?', a: 'Yes. AES-256-GCM server-side with keys from environment.' },
    ],
    related: ['one-time-secret-link', 'burn-after-reading', 'vs-onetimesecret'],
  },
  'one-time-secret-link': {
    slug: 'one-time-secret-link',
    title: 'One-Time Secret Link Generator — No Account | DEADLINK',
    description:
      'Generate a one-time secret link in seconds. Share passwords, API keys, or private messages that self-destruct after a single view.',
    h1: 'One-Time Secret Link Generator',
    sections: [
      {
        heading: 'What is a one-time secret link?',
        paragraphs: [
          'A one-time secret link is a URL that reveals sensitive content exactly once (or until a timer expires), then deletes the payload permanently. It replaces risky channels like email, Slack DMs, or SMS for sharing passwords and keys.',
          'DEADLINK encrypts your secret at rest, serves it over HTTPS, and wipes the ciphertext after burn. Creators cannot view the secret again after creation.',
        ],
      },
      {
        heading: 'Who uses one-time links?',
        paragraphs: [
          'Developers sharing API keys with contractors. Crypto holders sending wallet recovery hints. Journalists receiving tips. IT teams distributing temporary credentials. Anyone who needs "read once, then gone."',
        ],
      },
    ],
    faq: [
      { q: 'Do I need an account?', a: 'No. Anonymous create with IP rate limits on free tier.' },
      { q: 'What can I share?', a: 'Text or small files — never illegal content.' },
    ],
    related: ['send-password-securely', 'privnote-alternative', 'security'],
  },
  'send-password-securely': {
    slug: 'send-password-securely',
    title: 'Send a Password Securely — One-Time Link | DEADLINK',
    description:
      'Stop emailing passwords. Send a password securely with a one-time DEADLINK that burns after your recipient copies it.',
    h1: 'Send a Password Securely',
    sections: [
      {
        heading: 'Why email and chat fail',
        paragraphs: [
          'Email sits in inboxes, syncs to devices, and gets indexed. Slack and Teams log messages. A one-time link limits exposure to a single intentional view.',
          'Add an optional password on the link so even if the URL leaks, the secret stays gated.',
        ],
      },
      {
        heading: 'Best practice workflow',
        paragraphs: [
          '1. Create a DEADLINK with the password. 2. Send the URL via one channel. 3. Send the link password via another (SMS, call). 4. Confirm recipient copied it. 5. Link burns — no recovery.',
        ],
      },
    ],
    faq: [
      { q: 'Is this for team onboarding?', a: 'Yes. VOID and SPECTRE tiers support higher volume and API automation.' },
    ],
    related: ['one-time-secret-link', 'burn-after-reading'],
  },
  'burn-after-reading': {
    slug: 'burn-after-reading',
    title: 'Burn After Reading Links — Self-Destructing Messages | DEADLINK',
    description:
      'Create burn-after-reading links that self-destruct on first view or after a timer. Encrypted, anonymous, no archive.',
    h1: 'Burn After Reading',
    sections: [
      {
        heading: 'Burn on view vs timer',
        paragraphs: [
          'Burn on first view: the strictest mode — one reveal, then gone. Timer mode: secret lives until 1h, 24h, or 7d (free), up to 30d on paid tiers, then auto-purges.',
          'Expired and burned links show "This dead link has vanished" — no preview, no recovery.',
        ],
      },
    ],
    faq: [
      { q: 'Can I recover a burned link?', a: 'No. By design.' },
    ],
    related: ['one-time-secret-link', 'privnote-alternative'],
  },
  'vs-onetimesecret': {
    slug: 'vs-onetimesecret',
    title: 'DEADLINK vs OneTimeSecret — Comparison 2026',
    description:
      'Compare DEADLINK and OneTimeSecret for sharing passwords and keys. Features, burn modes, files, and pricing.',
    h1: 'DEADLINK vs OneTimeSecret',
    sections: [
      {
        heading: 'Feature comparison',
        paragraphs: [
          'Both tools split secrets across client and server (OneTimeSecret) or encrypt server-side (DEADLINK). DEADLINK focuses on speed: paste, burn mode, share — one screen, mobile-first.',
          'DEADLINK adds file upload, custom slugs on paid tiers, Bitcoin/Stripe access keys, and pairs with FLUXGRID for ongoing anonymous chat.',
        ],
      },
    ],
    faq: [
      { q: 'Which is more private?', a: 'Both aim to minimize retention. DEADLINK deletes ciphertext on burn with no creator preview.' },
    ],
    related: ['privnote-alternative', 'security'],
  },
  security: {
    slug: 'security',
    title: 'DEADLINK Security — Encryption, Burn Policy, Abuse',
    description:
      'How DEADLINK encrypts secrets, handles burn policies, rate limits, and illegal content. Security overview for teams and auditors.',
    h1: 'Security Overview',
    sections: [
      {
        heading: 'Encryption at rest',
        paragraphs: [
          'Secrets are encrypted with AES-256-GCM. Keys come from server environment (ENCRYPTION_KEY). Payloads are nulled on burn.',
          'HTTPS in transit. No logging of secret content after destruction.',
        ],
      },
      {
        heading: 'Abuse and legal',
        paragraphs: [
          'Zero tolerance for CSAM and illegal content. Report button on view pages. Admin abuse queue. Executable uploads blocked.',
        ],
      },
    ],
    faq: [
      { q: 'Do you scan content?', a: 'No content scanning by default; metadata and reports only.' },
    ],
    related: ['one-time-secret-link', 'burn-after-reading'],
  },
};

export const LEARN_SLUGS = Object.keys(LEARN_PAGES);
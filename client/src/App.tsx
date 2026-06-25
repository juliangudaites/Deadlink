import { useEffect, useState } from 'react';
import './App.css';
import { initAnalytics, trackEvent, trackPageView } from './utils/analytics';
import { ShareButtons } from './components/ShareButtons';
import { TrustStrip } from './components/TrustStrip';
import { SeoLearnIndex } from './seo/SeoLearnIndex';
import { useSeo } from './seo/useSeo';
import { SITE } from './seo/site';
import { SeoLearnPage } from './seo/SeoLearnPage';
import { SeoHomeSection } from './seo/SeoHomeSection';
import { CreateForm } from './components/CreateForm';
import { ViewPage } from './components/ViewPage';
import { PlansPanel } from './components/PlansPanel';
import { TierPayModal } from './components/TierPayModal';
import { AccessKeyModal } from './components/AccessKeyModal';
import { FAQModal } from './components/FAQModal';
import { LegalFooter } from './components/LegalFooter';
import { LegalModal } from './components/LegalModal';
import { SessionLimitModal } from './components/SessionLimitModal';
import { AdminPortal } from './admin/AdminPortal';
import { completeStripeSession } from './api';
import { useTier } from './tiers/context';
import type { TierId } from './tiers/tiers';

function useRoute() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    initAnalytics();
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => {
    trackPageView(path + window.location.search, document.title);
  }, [path]);
  return path;
}

const HOME_FAQ_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'DEADLINK',
      url: SITE.url,
      logo: `${SITE.url}/brand/logo.svg`,
      sameAs: [SITE.sisterSite.url],
    },
    {
      '@type': 'WebApplication',
      name: 'DEADLINK',
      url: SITE.url,
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Web',
      browserRequirements: 'Requires JavaScript',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: SITE.defaultDescription,
    },
    {
      '@type': 'HowTo',
      name: 'How to create a one-time secret link',
      description: 'Create an encrypted dead link that burns after one view.',
      step: [
        { '@type': 'HowToStep', name: 'Paste or upload', text: 'Enter your secret text or upload a small file.' },
        { '@type': 'HowToStep', name: 'Choose burn mode', text: 'Burn on first view or set a timer.' },
        { '@type': 'HowToStep', name: 'Share the link', text: 'Copy the URL and send it once. You cannot view it again.' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is DEADLINK?', acceptedAnswer: { '@type': 'Answer', text: 'A one-time secret link service. Share a URL, recipient views once, then the secret is destroyed.' } },
        { '@type': 'Question', name: 'Is DEADLINK free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — 3 links per day per IP without an account.' } },
        { '@type': 'Question', name: 'Are secrets encrypted?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. AES-256-GCM at rest, HTTPS in transit, deleted on burn.' } },
        { '@type': 'Question', name: 'Privnote alternative?', acceptedAnswer: { '@type': 'Answer', text: 'DEADLINK offers files, timers, passwords, and a modern mobile UI.' } },
      ],
    },
  ],
};

function Landing() {
  const { caps } = useTier();
  useSeo({
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
    path: '/',
    keywords: SITE.keywords,
    jsonLd: HOME_FAQ_LD,
  });
  const [created, setCreated] = useState<{ url: string; warning: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [legal, setLegal] = useState<'terms' | 'privacy' | null>(null);
  const [payTier, setPayTier] = useState<{ id: TierId; name: string; priceUsd: number } | null>(null);
  const { applyAccessCode } = useTier();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get('stripe_session');
    if (session) {
      completeStripeSession(session)
        .then(async (r) => {
          if (r.paid && r.accessCode) await applyAccessCode(r.accessCode);
        })
        .finally(() => {
          window.history.replaceState({}, '', '/');
        });
    }
  }, [applyAccessCode]);

  const copyUrl = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(created.url);
    setCopied(true);
    trackEvent('copy_link');
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (created) trackEvent('link_created');
  }, [created]);

  return (
    <div className="dl-page">
      <header className="dl-header">
        <div className="dl-logo">
          <img src="/brand/logo.svg" alt="DEADLINK" />
          <h1>DEADLINK</h1>
        </div>
        <nav className="dl-nav">
          <button type="button" onClick={() => setPlansOpen(true)}>PLANS</button>
          <button type="button" onClick={() => setAccessOpen(true)}>ACCESS KEY</button>
        </nav>
      </header>

      <section className="dl-hero">
        <p className="dl-hero__tagline">Send it once. Then it&apos;s gone.</p>
        <p className="dl-hero__sub">One-time secret links. No account. Encrypted. Destroyed forever.</p>
        <div className="dl-steps">
          <div className="dl-step"><div className="dl-step__icon">◈</div><div className="dl-step__label">Paste or upload</div></div>
          <div className="dl-step"><div className="dl-step__icon">⛓</div><div className="dl-step__label">Share link</div></div>
          <div className="dl-step"><div className="dl-step__icon">☠</div><div className="dl-step__label">Burns on view</div></div>
        </div>
        {caps.label !== 'FREE' && (
          <p style={{ fontSize: '0.8rem', color: 'var(--neon-cyan)', marginBottom: 12 }}>Tier: {caps.label}</p>
        )}
        <TrustStrip />
      </section>

      {created ? (
        <div className="dl-success">
          <h2>LINK CREATED</h2>
          <code className="dl-success__url">{created.url}</code>
          <p className="dl-success__warn">{created.warning}</p>
          <button type="button" className="dl-copy-btn" onClick={copyUrl}>{copied ? 'COPIED ✓' : 'COPY LINK'}</button>
          <ShareButtons url={created.url} />
          <p className="dl-success__hint">Send via a different channel than the password (if set).</p>
          <button type="button" style={{ color: 'var(--text-secondary)', minHeight: 44 }} onClick={() => setCreated(null)}>
            Create another
          </button>
        </div>
      ) : (
        <CreateForm onCreated={setCreated} />
      )}

      <SeoHomeSection />
      <LegalFooter onFaq={() => setFaqOpen(true)} onTerms={() => setLegal('terms')} onPrivacy={() => setLegal('privacy')} />

      <PlansPanel open={plansOpen} onClose={() => setPlansOpen(false)} onBuyTier={(id, priceUsd, name) => { setPlansOpen(false); setPayTier({ id, name, priceUsd }); }} />
      <AccessKeyModal open={accessOpen} onClose={() => setAccessOpen(false)} />
      <FAQModal open={faqOpen} onClose={() => setFaqOpen(false)} />
      <LegalModal open={legal !== null} type={legal ?? 'terms'} onClose={() => setLegal(null)} />
      {payTier && (
        <TierPayModal open tierId={payTier.id} tierName={payTier.name} priceUsd={payTier.priceUsd} onClose={() => setPayTier(null)} />
      )}
      <SessionLimitModal />
    </div>
  );
}

function ViewRoute({ slug }: { slug: string }) {
  useSeo({
    title: 'View secret — DEADLINK',
    description: 'One-time secret link viewer.',
    path: `/v/${slug}`,
    noindex: true,
  });
  return <ViewPage slug={slug} />;
}

export default function App() {
  const path = useRoute();
  const learnMatch = path.match(/^\/learn\/([a-z0-9-]+)$/);
  const viewMatch = path.match(/^\/v\/([a-zA-Z0-9_-]+)$/);

  if (path === '/admin' || path.startsWith('/admin/')) {
    return <AdminPortal />;
  }

  if (path === '/learn') {
    return <SeoLearnIndex />;
  }

  if (learnMatch) {
    return <SeoLearnPage slug={learnMatch[1]} />;
  }

  if (viewMatch) {
    return <ViewRoute slug={viewMatch[1]} />;
  }

  return <Landing />;
}
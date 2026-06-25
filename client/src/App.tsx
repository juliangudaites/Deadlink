import { useEffect, useState } from 'react';
import './App.css';
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
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return path;
}

function Landing() {
  const { caps } = useTier();
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
    setTimeout(() => setCopied(false), 2000);
  };

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
      </section>

      {created ? (
        <div className="dl-success">
          <h2>LINK CREATED</h2>
          <code className="dl-success__url">{created.url}</code>
          <p className="dl-success__warn">{created.warning}</p>
          <button type="button" className="dl-copy-btn" onClick={copyUrl}>{copied ? 'COPIED ✓' : 'COPY LINK'}</button>
          <button type="button" style={{ color: 'var(--text-secondary)', minHeight: 44 }} onClick={() => setCreated(null)}>
            Create another
          </button>
        </div>
      ) : (
        <CreateForm onCreated={setCreated} />
      )}

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

export default function App() {
  const path = useRoute();
  const viewMatch = path.match(/^\/v\/([a-zA-Z0-9-]+)$/);

  if (path === '/admin' || path.startsWith('/admin/')) {
    return <AdminPortal />;
  }

  if (viewMatch) {
    return <ViewPage slug={viewMatch[1]} />;
  }

  return <Landing />;
}
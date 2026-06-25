import { useCallback, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { createStripeTierCheckout, createTierInvoice, pollTierPaymentStatus } from '../api';
import type { TierId } from '../tiers/tiers';
import { useTier } from '../tiers/context';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { getStoredAffiliateRef } from '../utils/refCapture';
import { getEndorselyReferral, waitForEndorselyReferral } from '../utils/endorsely';
import type { TierInvoice } from '../api';

interface TierPayModalProps {
  open: boolean;
  tierId: TierId;
  tierName: string;
  priceUsd: number;
  onClose: () => void;
}

export function TierPayModal({ open, tierId, tierName, priceUsd, onClose }: TierPayModalProps) {
  const { applyAccessCode } = useTier();
  const methods = usePaymentMethods(open);
  const [invoice, setInvoice] = useState<TierInvoice | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paid, setPaid] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [copied, setCopied] = useState(false);

  const reset = useCallback(() => {
    setInvoice(null);
    setQrDataUrl('');
    setError('');
    setPaid(false);
    setAccessCode('');
    setCopied(false);
  }, []);

  useEffect(() => { if (open) reset(); }, [open, reset, tierId]);

  useEffect(() => {
    if (!invoice || paid || invoice.mode === 'stripe') return;
    const interval = setInterval(async () => {
      try {
        const status = await pollTierPaymentStatus(invoice.subscriptionId);
        if (status.paid && status.accessCode) {
          setPaid(true);
          setAccessCode(status.accessCode);
          await applyAccessCode(status.accessCode);
        }
      } catch { /* ignore */ }
    }, 2500);
    return () => clearInterval(interval);
  }, [invoice, paid, applyAccessCode]);

  if (!open) return null;

  const handleBtc = async () => {
    if (!methods.bitcoin) { setError('Bitcoin not configured'); return; }
    setLoading(true);
    setError('');
    try {
      const inv = await createTierInvoice(tierId, 'USD');
      setInvoice(inv);
      const qrTarget = inv.paymentUri || `bitcoin:${inv.address}?amount=${inv.amountBtc}`;
      const qr = await QRCode.toDataURL(qrTarget, { width: 220, margin: 2, color: { dark: '#00f0ff', light: '#0a0a12' } });
      setQrDataUrl(qr);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCard = async () => {
    if (!methods.stripe) { setError('Card payments not configured'); return; }
    setLoading(true);
    setError('');
    try {
      await waitForEndorselyReferral();
      const inv = await createStripeTierCheckout(tierId, 'USD', {
        endorselyReferral: getEndorselyReferral(),
        affiliateRef: getStoredAffiliateRef(),
      });
      if (!inv.checkoutUrl) throw new Error('Checkout unavailable');
      window.location.href = inv.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setLoading(false);
    }
  };

  return (
    <div className="dl-overlay" onClick={onClose}>
      <div className="dl-modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="dl-modal__header">
          <h2>{tierName} — ${priceUsd}/mo</h2>
          <button type="button" className="dl-modal__close" onClick={onClose}>×</button>
        </header>

        {paid && accessCode ? (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--neon-cyan)', marginBottom: 12 }}>ACTIVATED</h3>
            <code style={{ display: 'block', padding: 12, background: 'var(--void-900)', borderRadius: 8, marginBottom: 12, wordBreak: 'break-all' }}>{accessCode}</code>
            <button type="button" className="dl-copy-btn" onClick={async () => { await navigator.clipboard.writeText(accessCode); setCopied(true); }}>{copied ? 'COPIED' : 'COPY KEY'}</button>
            <p style={{ fontSize: '0.8rem', color: 'var(--neon-magenta)', marginTop: 12 }}>Save this key — no recovery.</p>
          </div>
        ) : invoice && invoice.mode !== 'stripe' ? (
          <div>
            <button type="button" style={{ fontSize: '0.8rem', marginBottom: 12 }} onClick={reset}>← Back</button>
            <p>Send exact: <strong>{invoice.amountBtc} BTC</strong></p>
            {qrDataUrl && <img src={qrDataUrl} alt="QR" style={{ display: 'block', margin: '12px auto' }} />}
            {invoice.address && <code style={{ display: 'block', fontSize: '0.7rem', wordBreak: 'break-all', marginBottom: 12 }}>{invoice.address}</code>}
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Watching for payment…</p>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: 16, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>30-day access key. Card or Bitcoin.</p>
            <button type="button" className="dl-cta" style={{ marginBottom: 8 }} onClick={handleCard} disabled={loading}>PAY WITH CARD</button>
            <button type="button" className="dl-copy-btn" style={{ width: '100%' }} onClick={handleBtc} disabled={loading}>PAY WITH BITCOIN</button>
            {error && <p className="dl-error">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
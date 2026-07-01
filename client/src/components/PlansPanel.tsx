import { useState } from 'react';
import { useTier } from '../tiers/context';
import type { TierId } from '../tiers/tiers';

interface PlansPanelProps {
  open: boolean;
  onClose: () => void;
  onBuyTier: (tierId: TierId, priceUsd: number, tierName: string) => void;
}

const PAID = [
  { id: 'shadow' as TierId, name: 'SHADOW', priceUsd: 19, features: ['50 links/mo', '10MB files', 'Custom slug', '30-day burn max'] },
  { id: 'void' as TierId, name: 'VOID', priceUsd: 49, featured: true, features: ['Unlimited links', '25MB files', 'View counter', '30-day burn'] },
  { id: 'spectre' as TierId, name: 'SPECTRE', priceUsd: 199, features: ['API access key', '100MB files', '5 team seats', 'Webhooks'] },
];

export function PlansPanel({ open, onClose, onBuyTier }: PlansPanelProps) {
  const { tier, caps, accessCode, expiresAt, applyAccessCode, clearAccess } = useTier();
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);

  if (!open) return null;

  const handleApply = async () => {
    if (!codeInput.trim()) return;
    setCodeLoading(true);
    setCodeError('');
    try {
      await applyAccessCode(codeInput.trim());
      setCodeInput('');
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : 'Invalid key');
    } finally {
      setCodeLoading(false);
    }
  };

  return (
    <div className="dl-overlay" onClick={onClose}>
      <div className="dl-modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="dl-modal__header">
          <div>
            <h2>PLANS</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Active: <strong>{caps.label}</strong>
              {accessCode && <> · <code>{accessCode}</code></>}
              {expiresAt && <> · until {new Date(expiresAt).toLocaleDateString()}</>}
            </p>
          </div>
          <button type="button" className="dl-modal__close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="dl-field" style={{ marginBottom: 16 }}>
          <label>Access key</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" placeholder="DL-SHAD-XXXX-XXXX-XXXX" value={codeInput} onChange={(e) => setCodeInput(e.target.value.toUpperCase())} spellCheck={false} />
            <button type="button" className="dl-copy-btn" style={{ margin: 0, flexShrink: 0 }} onClick={handleApply} disabled={codeLoading}>
              {codeLoading ? '…' : 'APPLY'}
            </button>
          </div>
          {codeError && <p className="dl-error">{codeError}</p>}
          {accessCode && (
            <button type="button" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }} onClick={clearAccess}>
              Use free tier
            </button>
          )}
        </div>

        <article className="dl-plan" style={{ marginBottom: 12 }}>
          <h3>FREE</h3>
          <p className="dl-plan__price">$0</p>
          <ul><li>Unlimited links</li><li>50K text · 25MB file</li><li>Burn on view or timer</li></ul>
        </article>

        <div className="dl-tier-grid">
          {PAID.map((plan) => (
            <article key={plan.id} className={`dl-plan ${plan.featured ? 'dl-plan--featured' : ''}`}>
              <h3>{plan.name}</h3>
              <p className="dl-plan__price">${plan.priceUsd}/mo</p>
              <ul>{plan.features.map((f) => <li key={f}>{f}</li>)}</ul>
              {tier === plan.id ? (
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--neon-cyan)' }}>ACTIVE</div>
              ) : (
                <button type="button" onClick={() => onBuyTier(plan.id, plan.priceUsd, plan.name)}>
                  GET {plan.name} →
                </button>
              )}
            </article>
          ))}
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          30-day keys. Max 2 devices. No account — your key is your only credential.
        </p>
      </div>
    </div>
  );
}
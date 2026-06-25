interface LegalModalProps {
  open: boolean;
  type: 'terms' | 'privacy';
  onClose: () => void;
}

const TERMS = `DEADLINK Terms — Use for lawful one-time secret sharing only. Zero tolerance for CSAM or illegal content. We do not recover burned secrets. Paid tiers are 30-day access keys, not accounts. Service provided as-is.`;

const PRIVACY = `DEADLINK Privacy — No accounts on free tier. Secrets encrypted at rest, deleted on burn. We store link metadata (slug, timestamps) not content after burn. IP hashes used for rate limits only. Paid keys stored on your device.`;

export function LegalModal({ open, type, onClose }: LegalModalProps) {
  if (!open) return null;
  return (
    <div className="dl-overlay" onClick={onClose}>
      <div className="dl-modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="dl-modal__header">
          <h2>{type === 'terms' ? 'TERMS' : 'PRIVACY'}</h2>
          <button type="button" className="dl-modal__close" onClick={onClose}>×</button>
        </header>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
          {type === 'terms' ? TERMS : PRIVACY}
        </p>
      </div>
    </div>
  );
}
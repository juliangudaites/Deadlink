import { useState } from 'react';
import { useTier } from '../tiers/context';

interface AccessKeyModalProps {
  open: boolean;
  onClose: () => void;
}

export function AccessKeyModal({ open, onClose }: AccessKeyModalProps) {
  const { applyAccessCode, caps, accessCode } = useTier();
  const [codeInput, setCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleApply = async () => {
    if (!codeInput.trim()) return;
    setLoading(true);
    setError('');
    try {
      await applyAccessCode(codeInput.trim());
      setCodeInput('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dl-overlay" onClick={onClose}>
      <div className="dl-modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="dl-modal__header">
          <h2>ACCESS KEY</h2>
          <button type="button" className="dl-modal__close" onClick={onClose}>×</button>
        </header>
        {accessCode && (
          <p style={{ fontSize: '0.85rem', marginBottom: 12 }}>Active: <strong>{caps.label}</strong></p>
        )}
        <input
          type="text"
          placeholder="DL-VOID-XXXX-XXXX-XXXX"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
          spellCheck={false}
          style={{ width: '100%', minHeight: 44, padding: 12, marginBottom: 12, background: 'var(--void-900)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--text-primary)' }}
        />
        <button type="button" className="dl-cta" onClick={handleApply} disabled={loading}>
          {loading ? '…' : 'ACTIVATE'}
        </button>
        {error && <p className="dl-error">{error}</p>}
      </div>
    </div>
  );
}
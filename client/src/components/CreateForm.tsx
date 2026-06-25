import { useState } from 'react';
import { createLink } from '../api';
import { useTier } from '../tiers/context';

const BURN_OPTIONS = [
  { id: 'view', label: 'Burn on first view' },
  { id: '1h', label: '1 hour' },
  { id: '24h', label: '24 hours' },
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
];

interface CreateFormProps {
  onCreated: (result: { url: string; warning: string }) => void;
}

export function CreateForm({ onCreated }: CreateFormProps) {
  const { caps, handleDeviceLimitError } = useTier();
  const [tab, setTab] = useState<'text' | 'file'>('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [burnMode, setBurnMode] = useState('view');
  const [password, setPassword] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const allowedBurn = BURN_OPTIONS.filter((o) => caps.burnOptions.includes(o.id));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('type', tab);
      fd.append('burnMode', burnMode);
      if (password) fd.append('password', password);
      if (caps.customSlug && customSlug) fd.append('customSlug', customSlug);
      if (tab === 'text') {
        fd.append('text', text);
      } else if (file) {
        fd.append('file', file);
      } else {
        setError('Select a file');
        setLoading(false);
        return;
      }
      const result = await createLink(fd);
      onCreated({ url: result.url, warning: result.warning });
      setText('');
      setFile(null);
      setPassword('');
      setCustomSlug('');
    } catch (err) {
      if (!handleDeviceLimitError(err)) {
        setError(err instanceof Error ? err.message : 'Create failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const maxMb = Math.round(caps.maxFileBytes / 1024 / 1024);

  return (
    <div className="dl-form">
      <div className="dl-tabs">
        <button type="button" className={tab === 'text' ? 'active' : ''} onClick={() => setTab('text')}>TEXT</button>
        <button type="button" className={tab === 'file' ? 'active' : ''} onClick={() => setTab('file')}>FILE</button>
      </div>

      {tab === 'text' ? (
        <div className="dl-field">
          <label>Secret text (max {caps.maxTextChars.toLocaleString()} chars)</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, caps.maxTextChars))}
            placeholder="Password, key, message…"
            maxLength={caps.maxTextChars}
          />
        </div>
      ) : (
        <div className="dl-field">
          <label>Upload (max {maxMb}MB)</label>
          <label className="dl-file-input">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              accept="image/*,text/*,.pdf,.zip,.json,.csv,.md"
            />
            {file ? `${file.name} (${Math.round(file.size / 1024)}KB)` : 'Tap to choose file'}
          </label>
        </div>
      )}

      <div className="dl-field">
        <label>Burn timer</label>
        <select value={burnMode} onChange={(e) => setBurnMode(e.target.value)}>
          {allowedBurn.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      </div>

      {caps.password && (
        <div className="dl-field">
          <label>Password (optional)</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Recipient needs this" autoComplete="new-password" />
        </div>
      )}

      {caps.customSlug && (
        <div className="dl-field">
          <label>Custom slug (optional)</label>
          <input type="text" value={customSlug} onChange={(e) => setCustomSlug(e.target.value)} placeholder="my-secret" />
        </div>
      )}

      <p className="dl-warning">
        Zero tolerance for illegal content. Secrets are encrypted, then permanently destroyed after viewing or expiry. No recovery.
      </p>

      <button type="button" className="dl-cta" onClick={handleSubmit} disabled={loading || (tab === 'text' && !text.trim())}>
        {loading ? 'CREATING…' : 'CREATE DEAD LINK'}
      </button>
      {error && <p className="dl-error">{error}</p>}
    </div>
  );
}
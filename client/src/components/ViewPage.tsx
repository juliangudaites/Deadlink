import { useEffect, useState } from 'react';
import { fetchLinkMeta, revealLink, reportLink } from '../api';

interface ViewPageProps {
  slug: string;
}

export function ViewPage({ slug }: ViewPageProps) {
  const [status, setStatus] = useState<'loading' | 'password' | 'ready' | 'revealed' | 'burned' | 'error'>('loading');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState<Awaited<ReturnType<typeof revealLink>>['content'] | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    fetchLinkMeta(slug)
      .then((meta) => {
        if (meta.status === 'burned' || meta.status === 'expired') {
          setStatus('burned');
        } else if (meta.hasPassword) {
          setStatus('password');
        } else {
          setStatus('ready');
        }
      })
      .catch(() => setStatus('error'));
  }, [slug]);

  useEffect(() => {
    if (status !== 'revealed') return;
    const iv = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(iv);
  }, [status]);

  const doReveal = async (pwd?: string) => {
    setError('');
    try {
      const result = await revealLink(slug, pwd);
      setContent(result.content);
      setStatus('revealed');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed';
      if (msg.includes('vanished') || msg.includes('destroyed') || msg.includes('expired')) {
        setStatus('burned');
      } else if ((err as { code?: string }).code === 'BAD_PASSWORD') {
        setError('Wrong password');
      } else {
        setError(msg);
      }
    }
  };

  const copySecret = async () => {
    if (!content) return;
    let text = '';
    if (content.type === 'text') text = content.text;
    else text = `[File: ${content.fileName}] — download below`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    if (!content || content.type !== 'file') return;
    const blob = new Blob([Uint8Array.from(atob(content.fileBase64), (c) => c.charCodeAt(0))], { type: content.fileMime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = content.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (status === 'loading') {
    return (
      <div className="dl-view dl-view--loading">
        <div className="dl-spinner" aria-label="Loading" />
        <p>Checking link…</p>
      </div>
    );
  }

  if (status === 'burned') {
    return (
      <div className="dl-view dl-view--burned">
        <img src="/brand/logo.svg" alt="" width={64} height={64} style={{ opacity: 0.4, marginBottom: 16 }} />
        <h2>THIS DEAD LINK HAS VANISHED</h2>
        <p style={{ color: 'var(--text-muted)' }}>Viewed, expired, or destroyed. No copy exists.</p>
        <p style={{ color: 'var(--text-secondary)', marginTop: 16, fontSize: '0.9rem' }}>Need to send a secret that burns after one view?</p>
        <a href="/" className="dl-cta dl-view__cta">CREATE YOUR DEAD LINK</a>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="dl-view dl-view--burned">
        <h2>LINK NOT FOUND</h2>
        <a href="/" style={{ color: 'var(--neon-cyan)' }}>← Home</a>
      </div>
    );
  }

  if (status === 'password') {
    return (
      <div className="dl-view">
        <div className="dl-secret">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.1em', marginBottom: 16 }}>PASSWORD REQUIRED</h2>
          <div className="dl-field">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" autoComplete="off" />
          </div>
          <button type="button" className="dl-cta" onClick={() => doReveal(password)}>UNLOCK</button>
          {error && <p className="dl-error">{error}</p>}
        </div>
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <div className="dl-view">
        <div className="dl-secret">
          <p style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>One view. Then gone forever.</p>
          <button type="button" className="dl-cta" onClick={() => doReveal()}>REVEAL SECRET</button>
          {error && <p className="dl-error">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="dl-view">
      <div className="dl-secret">
        {countdown > 0 && (
          <p className="dl-countdown">COPY NOW — {countdown}s</p>
        )}
        {content?.type === 'text' ? (
          <pre>{content.text}</pre>
        ) : content?.type === 'file' ? (
          <>
            <p style={{ marginBottom: 12 }}>{content.fileName}</p>
            <button type="button" className="dl-copy-btn" onClick={downloadFile}>DOWNLOAD FILE</button>
          </>
        ) : null}
        <button type="button" className="dl-copy-btn" onClick={copySecret}>
          {copied ? 'COPIED ✓' : 'COPY NOW'}
        </button>
        <p style={{ fontSize: '0.8rem', color: 'var(--neon-magenta)' }}>Closing this page may destroy the secret.</p>
        <button
          type="button"
          style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12, minHeight: 44 }}
          onClick={() => reportLink(slug, 'illegal').catch(() => {})}
        >
          Report abuse
        </button>
      </div>
    </div>
  );
}
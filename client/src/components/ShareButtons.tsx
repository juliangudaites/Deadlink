import { trackEvent } from '../utils/analytics';

interface ShareButtonsProps {
  url: string;
  title?: string;
}

function shareText(url: string) {
  return `Open this once — then it vanishes: ${url}`;
}

export function ShareButtons({ url, title = 'DEADLINK secret' }: ShareButtonsProps) {
  const text = shareText(url);
  const encoded = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        trackEvent('share_native', { method: 'native' });
      } catch { /* cancelled */ }
    }
  };

  const links = [
    { id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${encoded}`, event: 'share_whatsapp' },
    { id: 'telegram', label: 'Telegram', href: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent('One-time secret — open once')}`, event: 'share_telegram' },
    { id: 'x', label: 'X', href: `https://twitter.com/intent/tweet?text=${encoded}`, event: 'share_x' },
    { id: 'email', label: 'Email', href: `mailto:?subject=${encodeURIComponent(title)}&body=${encoded}`, event: 'share_email' },
  ];

  return (
    <div className="dl-share">
      <p className="dl-share__label">Share link</p>
      <div className="dl-share__grid">
        {links.map((l) => (
          <a
            key={l.id}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="dl-share__btn"
            onClick={() => trackEvent(l.event)}
          >
            {l.label}
          </a>
        ))}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button type="button" className="dl-share__btn" onClick={nativeShare}>
            Share…
          </button>
        )}
      </div>
    </div>
  );
}
interface FAQModalProps {
  open: boolean;
  onClose: () => void;
}

const FAQ = [
  { q: 'What is a dead link?', a: 'A one-time secret URL. Open it once (or until the timer ends), then it is permanently destroyed.' },
  { q: 'Can I see my secret again?', a: 'No. Creators never get a preview. Recipients get one view.' },
  { q: 'Is it encrypted?', a: 'Yes. AES-256-GCM at rest. Destroyed on burn — no logs of content.' },
  { q: 'Free limits?', a: '3 creates per IP per 24 hours. 2,000 chars or 1MB file.' },
  { q: 'Paid tiers?', a: 'SHADOW, VOID, SPECTRE — more links, bigger files, custom slugs, API on SPECTRE.' },
];

export function FAQModal({ open, onClose }: FAQModalProps) {
  if (!open) return null;
  return (
    <div className="dl-overlay" onClick={onClose}>
      <div className="dl-modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="dl-modal__header">
          <h2>FAQ</h2>
          <button type="button" className="dl-modal__close" onClick={onClose}>×</button>
        </header>
        <ul className="dl-faq">
          {FAQ.map((item) => (
            <li key={item.q}><strong>{item.q}</strong>{item.a}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
const ITEMS = [
  { icon: '🔐', label: 'AES-256 encrypted' },
  { icon: '👤', label: 'No account' },
  { icon: '☠', label: 'Burns on view' },
  { icon: '⚡', label: 'Free tier' },
];

export function TrustStrip() {
  return (
    <div className="dl-trust" role="list">
      {ITEMS.map((item) => (
        <span key={item.label} className="dl-trust__item" role="listitem">
          <span aria-hidden="true">{item.icon}</span> {item.label}
        </span>
      ))}
    </div>
  );
}
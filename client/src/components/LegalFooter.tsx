interface LegalFooterProps {
  onTerms: () => void;
  onPrivacy: () => void;
  onFaq: () => void;
}

export function LegalFooter({ onTerms, onPrivacy, onFaq }: LegalFooterProps) {
  return (
    <footer className="dl-footer">
      <p>DEADLINK · Send it once. Then it&apos;s gone.</p>
      <p style={{ marginTop: 8 }}>
        <a href="/learn" style={{ color: 'var(--text-secondary)', marginRight: 8 }}>Guides</a>
        <button type="button" onClick={onFaq}>FAQ</button>
        {' · '}
        <button type="button" onClick={onTerms}>Terms</button>
        {' · '}
        <button type="button" onClick={onPrivacy}>Privacy</button>
      </p>
    </footer>
  );
}
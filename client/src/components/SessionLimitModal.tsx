import { useTier } from '../tiers/context';

export function SessionLimitModal() {
  const { deviceLimitOpen, sessions, maxDevices, revokeSession, closeDeviceLimit } = useTier();
  if (!deviceLimitOpen) return null;

  return (
    <div className="dl-overlay">
      <div className="dl-modal" role="dialog">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', marginBottom: 12 }}>DEVICE LIMIT</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          Max {maxDevices} devices per key. Disconnect one to continue.
        </p>
        <ul style={{ listStyle: 'none', marginBottom: 16 }}>
          {sessions.filter((s) => !s.waiting).map((s) => (
            <li key={s.deviceId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: '0.85rem' }}>
              <span>{s.label}{s.isCurrent ? ' (this)' : ''}</span>
              {!s.isCurrent && (
                <button type="button" className="dl-copy-btn" style={{ margin: 0, padding: '6px 12px', minHeight: 36 }} onClick={() => revokeSession(s.deviceId)}>
                  DISCONNECT
                </button>
              )}
            </li>
          ))}
        </ul>
        <button type="button" style={{ color: 'var(--text-muted)' }} onClick={closeDeviceLimit}>Cancel</button>
      </div>
    </div>
  );
}
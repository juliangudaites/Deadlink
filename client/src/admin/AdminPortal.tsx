import { useCallback, useEffect, useState } from 'react';
import { adminApi, adminLogin, adminLogout, getAdminToken } from './adminApi';
import './AdminPortal.css';

type Tab = 'dashboard' | 'links' | 'reports' | 'subs';

export function AdminPortal() {
  const [authed, setAuthed] = useState(!!getAdminToken());
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [links, setLinks] = useState<Record<string, unknown>[]>([]);
  const [reports, setReports] = useState<Record<string, unknown>[]>([]);
  const [subs, setSubs] = useState<Record<string, unknown>[]>([]);

  const refresh = useCallback(async () => {
    if (!getAdminToken()) return;
    try {
      const [s, l, r, sub] = await Promise.all([
        adminApi.stats(),
        adminApi.links(200),
        adminApi.reports('pending'),
        adminApi.subscriptions(),
      ]);
      setStats(s);
      setLinks(l.links);
      setReports(r.reports);
      setSubs(sub.subscriptions);
    } catch (e) {
      if ((e as Error).message === 'UNAUTHORIZED') setAuthed(false);
    }
  }, []);

  useEffect(() => {
    if (authed) {
      refresh();
      const iv = setInterval(refresh, 10000);
      return () => clearInterval(iv);
    }
  }, [authed, refresh]);

  if (!authed) {
    return (
      <div className="admin-login">
        <div className="admin-login__card">
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--neon-cyan)' }}>DEADLINK ADMIN</span>
          <h1>Portal</h1>
          <form onSubmit={async (e) => { e.preventDefault(); setLoginError(''); try { await adminLogin(pin); setAuthed(true); setPin(''); } catch { setLoginError('Invalid PIN'); } }}>
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN" autoComplete="off" />
            {loginError && <p className="admin-login__error">{loginError}</p>}
            <button type="submit">ENTER</button>
          </form>
          <a href="/" className="admin-login__back">← Back</a>
        </div>
      </div>
    );
  }

  const linkStats = stats?.links as Record<string, number> | undefined;
  const reportStats = stats?.reports as Record<string, number> | undefined;
  const revenue = stats?.revenue as Record<string, number> | undefined;

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__brand"><span>DEADLINK</span><br /><small style={{ color: 'var(--text-muted)' }}>ADMIN</small></div>
        <nav style={{ marginTop: 16 }}>
          {(['dashboard', 'links', 'reports', 'subs'] as Tab[]).map((id) => (
            <button key={id} type="button" className={tab === id ? 'admin__nav-btn admin__nav-btn--active' : 'admin__nav-btn'} onClick={() => setTab(id)}>
              {id.toUpperCase()}
            </button>
          ))}
          <button type="button" className="admin__nav-btn" onClick={async () => { await adminLogout(); setAuthed(false); }}>LOGOUT</button>
        </nav>
      </aside>
      <main className="admin__main">
        {tab === 'dashboard' && (
          <>
            <div className="admin__stats">
              <div className="admin__stat"><strong>{linkStats?.total ?? 0}</strong><span>Total links</span></div>
              <div className="admin__stat"><strong>{linkStats?.active ?? 0}</strong><span>Active</span></div>
              <div className="admin__stat"><strong>{linkStats?.burned ?? 0}</strong><span>Burned</span></div>
              <div className="admin__stat"><strong>{reportStats?.pending ?? 0}</strong><span>Reports</span></div>
              <div className="admin__stat"><strong>${(revenue?.shadow ?? 0) + (revenue?.void ?? 0) + (revenue?.spectre ?? 0)}</strong><span>Est. revenue</span></div>
            </div>
            <button type="button" className="dl-copy-btn" onClick={() => adminApi.purge().then(refresh)}>Purge expired</button>
          </>
        )}
        {tab === 'links' && (
          <table>
            <thead><tr><th>Slug</th><th>Type</th><th>Tier</th><th>Burned</th><th>Views</th></tr></thead>
            <tbody>
              {links.map((l) => (
                <tr key={String(l.id)}>
                  <td><code>{String(l.slug)}</code></td>
                  <td>{String(l.type)}</td>
                  <td>{String(l.tier)}</td>
                  <td>{l.burned ? 'yes' : 'no'}</td>
                  <td>{String(l.viewCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === 'reports' && (
          <table>
            <thead><tr><th>Slug</th><th>Category</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {reports.map((r) => (
                <tr key={String(r.id)}>
                  <td><code>{String(r.linkSlug)}</code></td>
                  <td>{String(r.category)}</td>
                  <td>{String(r.status)}</td>
                  <td>
                    <button type="button" onClick={() => adminApi.patchReport(String(r.id), 'confirm').then(refresh)}>Confirm</button>
                    {' '}
                    <button type="button" onClick={() => adminApi.patchReport(String(r.id), 'dismiss').then(refresh)}>Dismiss</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === 'subs' && (
          <table>
            <thead><tr><th>Tier</th><th>Status</th><th>Code</th><th>Paid</th></tr></thead>
            <tbody>
              {subs.map((s) => (
                <tr key={String(s.id)}>
                  <td>{String(s.tier)}</td>
                  <td>{String(s.status)}</td>
                  <td><code>{String(s.accessCode || '—')}</code></td>
                  <td>{s.paidAt ? new Date(String(s.paidAt)).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
const TOKEN_KEY = 'deadlink_admin_token';

export function getAdminToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

function headers(): Record<string, string> {
  const token = getAdminToken();
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin${path}`, { ...init, headers: { ...headers(), ...init?.headers } });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || 'Request failed');
  }
  return res.json() as Promise<T>;
}

export async function adminLogin(pin: string) {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  });
  if (!res.ok) throw new Error('Invalid PIN');
  const data = await res.json() as { token: string };
  sessionStorage.setItem(TOKEN_KEY, data.token);
}

export async function adminLogout() {
  try { await adminFetch('/logout', { method: 'POST' }); } catch { /* ignore */ }
  sessionStorage.removeItem(TOKEN_KEY);
}

export const adminApi = {
  stats: () => adminFetch<Record<string, unknown>>('/stats'),
  links: (limit = 100) => adminFetch<{ links: Record<string, unknown>[] }>(`/links?limit=${limit}`),
  reports: (status?: string) => adminFetch<{ reports: Record<string, unknown>[] }>(`/reports${status ? `?status=${status}` : ''}`),
  patchReport: (id: string, action: string) => adminFetch(`/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ action }) }),
  subscriptions: () => adminFetch<{ subscriptions: Record<string, unknown>[] }>('/subscriptions'),
  purge: () => adminFetch('/purge', { method: 'POST' }),
};
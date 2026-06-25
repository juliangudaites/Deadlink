const REF_KEY = 'deadlink_ref';

export function captureRefFromUrl(): void {
  const ref = new URLSearchParams(window.location.search).get('ref');
  if (ref) localStorage.setItem(REF_KEY, ref.trim().slice(0, 100));
}

export function getStoredAffiliateRef(): string | undefined {
  const ref = localStorage.getItem(REF_KEY);
  return ref && ref.length > 0 ? ref : undefined;
}
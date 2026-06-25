const VIA_KEY = 'deadlink_endorsely_via';

declare global {
  interface Window {
    endorsely_referral?: string;
  }
}

export function captureEndorselyViaFromUrl(): void {
  const via = new URLSearchParams(window.location.search).get('via');
  if (via) sessionStorage.setItem(VIA_KEY, via.trim().slice(0, 200));
}

function getStoredVia(): string | undefined {
  const via = sessionStorage.getItem(VIA_KEY);
  return via && via.length > 0 ? via : undefined;
}

export function getEndorselyReferral(): string | undefined {
  const fromScript = window.endorsely_referral;
  if (fromScript && fromScript.length > 0) return fromScript;
  return getStoredVia();
}

export function waitForEndorselyReferral(timeoutMs = 4000): Promise<string | undefined> {
  const immediate = getEndorselyReferral();
  if (immediate) return Promise.resolve(immediate);
  return new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      const ref = getEndorselyReferral();
      if (ref) { resolve(ref); return; }
      if (Date.now() - started >= timeoutMs) { resolve(undefined); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
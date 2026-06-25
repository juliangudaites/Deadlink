const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined;

let initialized = false;

function loadScript(src: string, attrs: Record<string, string> = {}) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
  document.head.appendChild(s);
}

export function initAnalytics() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  if (PLAUSIBLE_DOMAIN?.trim()) {
    loadScript('https://plausible.io/js/script.js', {
      defer: '',
      'data-domain': PLAUSIBLE_DOMAIN.trim(),
    });
  }

  if (GA4_ID?.trim()) {
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID.trim()}`);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID.trim(), { send_page_view: false });
  }
}

export function trackPageView(path: string, title?: string) {
  if (PLAUSIBLE_DOMAIN?.trim() && window.plausible) {
    window.plausible('pageview', { u: path });
  }
  if (GA4_ID?.trim() && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
    });
  }
}

export function trackEvent(name: string, props?: Record<string, string | number>) {
  if (PLAUSIBLE_DOMAIN?.trim() && window.plausible) {
    window.plausible(name, { props });
  }
  if (GA4_ID?.trim() && window.gtag) {
    window.gtag('event', name, props);
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: { u?: string; props?: Record<string, string | number> }) => void;
  }
}
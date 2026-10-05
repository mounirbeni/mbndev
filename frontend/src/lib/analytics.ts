/**
 * Thin analytics layer over Vercel Web Analytics (`window.va`, cookieless,
 * always on in production) and Google Analytics 4 (`window.gtag`, loaded only
 * after the visitor accepts the consent banner). Both are optional at runtime:
 * every call is a no-op when the script isn't there.
 */

type EventData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    va?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';
export const CONSENT_KEY = 'mbndev_analytics_consent';
export type Consent = 'granted' | 'denied';

/**
 * Strip anything identifying from a URL before it leaves the browser:
 * the query string and path segments that are ids or tokens
 * (/reset-password/<token>, /share/<token>, /checkout/<orderId>, …).
 */
export function scrubUrl(url: string): string {
  try {
    const u = new URL(url, 'https://mbndev.ma');
    const path = u.pathname
      .split('/')
      .map((seg) => (/^[A-Za-z0-9_-]{16,}$/.test(seg) || /\d{4,}/.test(seg) ? '[id]' : seg))
      .join('/');
    return `${u.origin}${path}`;
  } catch {
    return url.split('?')[0];
  }
}

export function getConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(v: Consent) {
  try { localStorage.setItem(CONSENT_KEY, v); } catch { /* private mode */ }
}

/** Conversion / interaction event, sent to every analytics backend present. */
export function trackEvent(name: string, data?: EventData) {
  try { window.va?.('event', { name, data }); } catch { /* never break the UI */ }
  try { window.gtag?.('event', name, data ?? {}); } catch { /* never break the UI */ }
}

/** Vercel Analytics bootstrap: queue calls until the deferred script loads. */
export const VERCEL_ANALYTICS_BOOTSTRAP =
  'window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};' +
  'window.si=window.si||function(){(window.siq=window.siq||[]).push(arguments)};';

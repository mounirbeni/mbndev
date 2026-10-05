'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import { GA_ID, getConsent, setConsent, scrubUrl, trackEvent, type Consent } from '@/lib/analytics';

/**
 * Site-wide analytics glue:
 *  - Vercel Analytics: scrubs ids/tokens from URLs before they are sent.
 *  - GA4 (only when NEXT_PUBLIC_GA_ID is set): loaded after consent, with
 *    page views sent manually so the URLs can be scrubbed the same way.
 *  - Outbound contact clicks (WhatsApp, email, phone) and "Start your
 *    project" clicks are tracked from one delegated listener.
 */
export default function Analytics() {
  const pathname = usePathname();
  const [consent, setConsentState] = useState<Consent | null | undefined>(undefined);

  useEffect(() => {
    // Read after mount: localStorage isn't available during SSR.
    setConsentState(getConsent()); // eslint-disable-line react-hooks/set-state-in-effect
    const scrub = (event: { url: string }) => ({ ...event, url: scrubUrl(event.url) });
    window.va?.('beforeSend', scrub);
    (window as unknown as { si?: (...a: unknown[]) => void }).si?.('beforeSend', scrub);
  }, []);

  // GA4 page views (SPA navigations included), with a scrubbed location.
  // Calls queue in dataLayer until gtag.js loads, so order is preserved.
  useEffect(() => {
    if (consent !== 'granted' || !GA_ID) return;
    if (!window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        // gtag.js expects the arguments object itself, not an array.
        window.dataLayer!.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', GA_ID, { send_page_view: false });
    }
    window.gtag('event', 'page_view', {
      page_location: scrubUrl(window.location.href),
      page_title: document.title,
    });
  }, [pathname, consent]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a');
      const href = a?.getAttribute('href');
      if (!href) return;
      const from = window.location.pathname;
      if (href.includes('wa.me/')) trackEvent('whatsapp_click', { from });
      else if (href.startsWith('mailto:')) trackEvent('email_click', { from });
      else if (href.startsWith('tel:')) trackEvent('phone_click', { from });
      else if (href === '/request' || href.startsWith('/request?')) trackEvent('start_project_click', { from });
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  const choose = (v: Consent) => {
    setConsent(v);
    setConsentState(v);
  };

  if (!GA_ID) return null;

  return (
    <>
      {consent === 'granted' && (
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      )}

      {consent === null && (
        // Phones: sits above the bottom tab bar and the floating support button.
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Analytics cookies"
          className="fixed z-[80] left-4 right-4 lg:left-6 lg:right-auto lg:max-w-sm bottom-[calc(max(env(safe-area-inset-bottom,0px),8px)+140px)] lg:bottom-6 rounded-2xl border border-white/10 bg-[#121218]/95 backdrop-blur-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
        >
          <p className="text-[13px] leading-relaxed text-slate-300">
            We use Google Analytics cookies to understand how visitors use the site. No ads, no selling data.{' '}
            <Link href="/privacy" className="text-violet-300 underline underline-offset-2 hover:text-white">
              Privacy policy
            </Link>
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => choose('granted')}
              className="flex-1 rounded-full bg-[#ede6ff] px-4 py-2 text-[13px] font-semibold text-[#14092b] hover:bg-white transition-colors"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => choose('denied')}
              className="flex-1 rounded-full border border-white/15 px-4 py-2 text-[13px] font-medium text-slate-200 hover:border-white/30 transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </>
  );
}

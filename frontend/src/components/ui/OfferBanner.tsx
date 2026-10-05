'use client';

import { useEffect, useState } from 'react';
import { Gift } from 'lucide-react';
import type { Offer } from '@/lib/offer';
import { trackEvent } from '@/lib/analytics';
import { useLanguage } from '@/contexts/LanguageContext';

function timeLeft(expiresAt: string, now: number) {
  const ms = Math.max(0, new Date(expiresAt).getTime() - now);
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`;
}

/** "Your personal offer: -12% … ends in 2d 4h" — renders nothing without an offer. */
export default function OfferBanner({ offer, className = '' }: { offer: Offer | null; className?: string }) {
  const { t } = useLanguage();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!offer) return;
    trackEvent('offer_shown', { pct: offer.pct });
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [offer]);

  if (!offer) return null;

  return (
    <div
      role="status"
      className={`flex items-center gap-3 rounded-2xl border border-violet-400/25 bg-violet-500/10 px-4 py-3 text-left ${className}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/20">
        <Gift className="h-4 w-4 text-violet-300" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">
          {t('offer.title').replace('{pct}', String(offer.pct))}
        </p>
        <p className="text-xs text-slate-400">
          {t('offer.endsIn').replace('{time}', timeLeft(offer.expiresAt, now))} · {t('offer.applied')}
        </p>
      </div>
    </div>
  );
}

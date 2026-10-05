'use client';

import { useEffect, useState } from 'react';

/**
 * Personal random offer (backend: src/lib/offers.js). The server picks the
 * percentage and signs it; we only store the token and show it. The discount
 * is applied by the backend when the order is created.
 *
 * One offer per visitor: it is kept until it expires, and a new one is only
 * issued after a cool-down, so the countdown is never a fake deadline that
 * restarts on the next visit.
 */
export interface Offer {
  token: string;
  pct: number;
  expiresAt: string;
}

const KEY = 'mbndev_offer';
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

function readStored(): Offer | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Offer;
    return o && typeof o.token === 'string' && typeof o.pct === 'number' && typeof o.expiresAt === 'string' ? o : null;
  } catch {
    return null;
  }
}

function isLive(o: Offer, now = Date.now()) {
  return new Date(o.expiresAt).getTime() > now;
}

let inflight: Promise<Offer | null> | null = null;

export function loadOffer(): Promise<Offer | null> {
  const stored = readStored();
  if (stored) {
    if (isLive(stored)) return Promise.resolve(stored);
    if (Date.now() < new Date(stored.expiresAt).getTime() + COOLDOWN_MS) return Promise.resolve(null);
  }
  if (!inflight) {
    inflight = fetch('/api/offers')
      .then(async (res) => {
        if (!res.ok) {
          await res.body?.cancel();
          return null;
        }
        const { offer } = (await res.json()) as { offer?: Offer | null };
        if (!offer) return null;
        try { localStorage.setItem(KEY, JSON.stringify(offer)); } catch { /* private mode */ }
        return offer;
      })
      .catch(() => null)
      .finally(() => { inflight = null; });
  }
  return inflight;
}

/** Token of the visitor's live offer, sent with the order. */
export function activeOfferToken(): string | undefined {
  const o = readStored();
  return o && isLive(o) ? o.token : undefined;
}

export function discounted(price: number, pct: number) {
  return Math.round(price * (1 - pct / 100));
}

/** The visitor's live offer, or null (none, expired, or still loading). */
export function useOffer(): Offer | null {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let alive = true;
    loadOffer().then((o) => { if (alive) setOffer(o); });
    return () => { alive = false; };
  }, []);

  // Drop the offer the moment it expires.
  useEffect(() => {
    if (!offer) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [offer]);

  return offer && isLive(offer, now) ? offer : null;
}

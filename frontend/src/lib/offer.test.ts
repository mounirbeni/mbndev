import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadOffer, activeOfferToken, discounted } from './offer';

const future = () => new Date(Date.now() + 3_600_000).toISOString();

describe('personal offer', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('fetches once and reuses the stored offer while it is live', async () => {
    const offer = { token: 't1', pct: 12, expiresAt: future() };
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ offer }), { status: 200 }),
    );
    expect(await loadOffer()).toEqual(offer);
    expect(await loadOffer()).toEqual(offer);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(activeOfferToken()).toBe('t1');
  });

  it('does not issue a new offer during the cool-down after expiry', async () => {
    localStorage.setItem('mbndev_offer', JSON.stringify({ token: 'old', pct: 9, expiresAt: new Date(Date.now() - 60_000).toISOString() }));
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    expect(await loadOffer()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(activeOfferToken()).toBeUndefined();
  });

  it('returns null when the API has no offer', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ offer: null }), { status: 200 }));
    expect(await loadOffer()).toBeNull();
  });

  it('rounds discounted prices like the backend', () => {
    expect(discounted(1290, 12)).toBe(1135);
  });
});

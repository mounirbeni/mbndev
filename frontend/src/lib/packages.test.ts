import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchPackages } from './packages';

afterEach(() => vi.unstubAllGlobals());

describe('fetchPackages', () => {
  it('returns the package list from /api/packages', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, packages: [{ slug: 'starter' }] }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    await expect(fetchPackages()).resolves.toEqual([{ slug: 'starter' }]);
    expect(fetchMock).toHaveBeenCalledWith('/api/packages');
  });

  it('returns an empty list when the response has no packages', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })));
    await expect(fetchPackages()).resolves.toEqual([]);
  });

  it('rejects on a non-OK response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('nope', { status: 404 })));
    await expect(fetchPackages()).rejects.toThrow('packages: 404');
  });
});

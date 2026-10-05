import type { Package } from '@/types';

/**
 * Public package list for the marketing pages. Plain fetch on purpose: the
 * axios client (and its auth interceptors) isn't needed for a public,
 * CDN-cached GET, and keeping it out keeps the pages' JavaScript smaller.
 */
export async function fetchPackages(): Promise<Package[]> {
  const res = await fetch('/api/packages');
  if (!res.ok) {
    // Release the unread body so the connection doesn't stay open.
    await res.body?.cancel();
    throw new Error(`packages: ${res.status}`);
  }
  const data = (await res.json()) as { packages?: Package[] };
  return data.packages ?? [];
}

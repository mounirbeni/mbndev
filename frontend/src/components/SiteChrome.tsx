'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Site-wide extras (scroll bar, install / push prompts, analytics banner,
 * service worker) — left out of the chat widget, which runs in an iframe on
 * other people's websites.
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/widget/')) return null;
  return <>{children}</>;
}

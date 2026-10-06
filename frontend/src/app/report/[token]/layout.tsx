import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Online presence report',
  robots: { index: false, follow: false },
};

export default function SharedReportLayout({ children }: { children: ReactNode }) {
  return children;
}

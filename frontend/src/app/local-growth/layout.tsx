import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import LocalGrowthShell from '@/components/local-growth/LocalGrowthShell';

export const metadata: Metadata = {
  title: 'MBN Local Growth',
  robots: { index: false, follow: false },
};

export default function LocalGrowthLayout({ children }: { children: ReactNode }) {
  return <LocalGrowthShell>{children}</LocalGrowthShell>;
}

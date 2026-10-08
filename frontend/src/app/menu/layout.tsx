import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import MenuShell from '@/components/menu/MenuShell';

export const metadata: Metadata = {
  title: 'MBN Menu',
  robots: { index: false, follow: false },
};

export default function MenuLayout({ children }: { children: ReactNode }) {
  return <MenuShell>{children}</MenuShell>;
}

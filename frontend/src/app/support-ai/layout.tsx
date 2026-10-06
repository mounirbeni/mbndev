import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import SupportAiShell from '@/components/support-ai/SupportAiShell';

export const metadata: Metadata = {
  title: 'MBN Support AI',
  robots: { index: false, follow: false },
};

export default function SupportAiLayout({ children }: { children: ReactNode }) {
  return <SupportAiShell>{children}</SupportAiShell>;
}

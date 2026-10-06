import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import LeadsAiShell from '@/components/leads-ai/LeadsAiShell';

export const metadata: Metadata = {
  title: 'MBN Leads AI',
  robots: { index: false, follow: false },
};

export default function LeadsAiLayout({ children }: { children: ReactNode }) {
  return <LeadsAiShell>{children}</LeadsAiShell>;
}

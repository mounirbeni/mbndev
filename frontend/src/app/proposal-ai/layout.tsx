import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import ProposalShell from '@/components/proposal-ai/ProposalShell';

export const metadata: Metadata = {
  title: 'MBN Proposal AI',
  robots: { index: false, follow: false },
};

export default function ProposalAiLayout({ children }: { children: ReactNode }) {
  return <ProposalShell>{children}</ProposalShell>;
}

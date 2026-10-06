import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import ReviewBoosterShell from '@/components/review-booster/ReviewBoosterShell';

export const metadata: Metadata = {
  title: 'MBN Review Booster',
  robots: { index: false, follow: false },
};

export default function ReviewBoosterLayout({ children }: { children: ReactNode }) {
  return <ReviewBoosterShell>{children}</ReviewBoosterShell>;
}

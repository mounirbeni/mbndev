import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Leave a review',
  robots: { index: false, follow: false },
};

export default function ReviewPageLayout({ children }: { children: ReactNode }) {
  return children;
}

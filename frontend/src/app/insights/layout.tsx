import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:       'Insights & Articles',
  description: 'Practical thinking on web development, design strategy, and building digital products that perform — from MBN DEV.',
  alternates: { canonical: 'https://mbndev.ma/insights' },
  openGraph: {
    title:       'Insights & Articles — MBN DEV',
    description: 'Ideas that drive digital growth: web development, design strategy, and growth insights.',
    url:         'https://mbndev.ma/insights',
    type:        'website',
  },
};

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

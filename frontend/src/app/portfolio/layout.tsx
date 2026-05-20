import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:       'Portfolio',
  description: 'Explore selected projects built by MBN DEV — custom websites, e-commerce stores, SaaS platforms, and web applications.',
  alternates: { canonical: 'https://mbndev.ma/portfolio' },
  openGraph: {
    title:       'Portfolio — MBN DEV',
    description: 'Selected work from MBN DEV.',
    url:         'https://mbndev.ma/portfolio',
    type:        'website',
  },
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}

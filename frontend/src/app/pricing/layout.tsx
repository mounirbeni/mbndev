import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:       'Pricing',
  description: 'Simple, transparent pricing for custom web development. Starter, Pro, and Premium plans — save up to 47% vs. average freelancer market rates.',
  alternates: { canonical: 'https://mbndev.com/pricing' },
  openGraph: {
    title:       'Pricing — MBN DEV',
    description: 'Transparent pricing for web development. Save up to 47% vs market rates.',
    url:         'https://mbndev.com/pricing',
    type:        'website',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

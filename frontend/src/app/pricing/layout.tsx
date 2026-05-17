import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

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

const pricingSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Web Development Pricing Plans — MBN DEV',
  url: 'https://mbndev.com/pricing',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Offer',
        name: 'Starter Plan',
        description: '5 pages, SEO optimization, hosting setup. Ideal for landing pages and small business websites.',
        price: '799',
        priceCurrency: 'USD',
        seller: { '@type': 'Organization', name: 'MBN DEV', url: 'https://mbndev.com' },
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'Offer',
        name: 'Pro Plan',
        description: '10 pages, SEO, hosting, authentication, and API integration. For growing businesses.',
        price: '1799',
        priceCurrency: 'USD',
        seller: { '@type': 'Organization', name: 'MBN DEV', url: 'https://mbndev.com' },
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'Offer',
        name: 'Premium Plan',
        description: 'Unlimited pages, all features including payments, dashboard, and multi-language support.',
        price: '3499',
        priceCurrency: 'USD',
        seller: { '@type': 'Organization', name: 'MBN DEV', url: 'https://mbndev.com' },
      },
    },
  ],
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={pricingSchema} />
      {children}
    </>
  );
}

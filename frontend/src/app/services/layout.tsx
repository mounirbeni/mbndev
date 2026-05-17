import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:       'Web Development Services',
  description: 'Custom websites, e-commerce stores, SaaS dashboards, and web applications built by MBN DEV — fast, modern, and priced competitively for businesses worldwide.',
  alternates: { canonical: 'https://mbndev.com/services' },
  openGraph: {
    title:       'Services — MBN DEV',
    description: 'Custom websites, e-commerce, SaaS dashboards, and web apps. Professional quality, market-competitive pricing.',
    url:         'https://mbndev.com/services',
    type:        'website',
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:       'Services',
  description: 'Custom websites, e-commerce stores, SaaS dashboards, and web applications — built to elevate your business with prices up to 50% below market rates.',
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

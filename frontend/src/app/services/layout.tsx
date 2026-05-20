import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title:       'Web Development Services',
  description: 'Custom websites, e-commerce stores, SaaS dashboards, and web applications built by MBN DEV — fast, modern, and priced competitively for businesses worldwide.',
  alternates: { canonical: 'https://mbndev.ma/services' },
  openGraph: {
    title:       'Services — MBN DEV',
    description: 'Custom websites, e-commerce, SaaS dashboards, and web apps. Professional quality, market-competitive pricing.',
    url:         'https://mbndev.ma/services',
    type:        'website',
  },
};

const servicesSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Web Development Services by MBN DEV',
  url: 'https://mbndev.ma/services',
  itemListElement: [
    { '@type': 'ListItem', position: 1, item: { '@type': 'Service', name: 'Landing Page', description: 'High-converting landing pages designed to grow your business.', provider: { '@type': 'Organization', name: 'MBN DEV' } } },
    { '@type': 'ListItem', position: 2, item: { '@type': 'Service', name: 'Business Website', description: 'Professional multi-page websites for established businesses.', provider: { '@type': 'Organization', name: 'MBN DEV' } } },
    { '@type': 'ListItem', position: 3, item: { '@type': 'Service', name: 'E-Commerce Store', description: 'Full-featured online stores built on modern web technology.', provider: { '@type': 'Organization', name: 'MBN DEV' } } },
    { '@type': 'ListItem', position: 4, item: { '@type': 'Service', name: 'SaaS Platform', description: 'Scalable software-as-a-service applications with user management.', provider: { '@type': 'Organization', name: 'MBN DEV' } } },
    { '@type': 'ListItem', position: 5, item: { '@type': 'Service', name: 'Web Application', description: 'Custom web apps and dashboards tailored to your workflow.', provider: { '@type': 'Organization', name: 'MBN DEV' } } },
  ],
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={servicesSchema} />
      {children}
    </>
  );
}

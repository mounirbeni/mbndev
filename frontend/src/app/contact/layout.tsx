import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title:       'Contact',
  description: 'Get in touch with MBN DEV. We respond within 24 hours and are available via email, WhatsApp, and our project request form.',
  alternates: { canonical: 'https://mbndev.com/contact' },
  openGraph: {
    title:       'Contact — MBN DEV',
    description: 'Get in touch — we respond within 24 hours.',
    url:         'https://mbndev.com/contact',
    type:        'website',
  },
};

const contactSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact MBN DEV',
  url: 'https://mbndev.com/contact',
  description: 'Contact Mounir Banni for custom web development projects. Response within 24 hours via email or WhatsApp.',
  mainEntity: {
    '@type': 'Organization',
    name: 'MBN DEV',
    url: 'https://mbndev.com',
    email: 'hello@mbndev.com',
    telephone: '+212705914424',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['English', 'French', 'Arabic'],
      email: 'hello@mbndev.com',
    },
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={contactSchema} />
      {children}
    </>
  );
}

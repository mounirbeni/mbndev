import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title:       'Contact',
  description: 'Get in touch with MBN DEV. We respond within 24 hours and are available via email, WhatsApp, and our project request form.',
  alternates: { canonical: 'https://mbndev.ma/contact' },
  openGraph: {
    title:       'Contact — MBN DEV',
    description: 'Get in touch — we respond within 24 hours.',
    url:         'https://mbndev.ma/contact',
    type:        'website',
  },
};

const contactSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact MBN DEV',
  url: 'https://mbndev.ma/contact',
  description: 'Contact Mounir Banni for custom web development projects. Response within 24 hours via email or WhatsApp.',
  mainEntity: {
    '@type': 'Organization',
    name: 'MBN DEV',
    url: 'https://mbndev.ma',
    email: 'hello@mbndev.ma',
    telephone: '+212705914424',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['English', 'French', 'Arabic'],
      email: 'hello@mbndev.ma',
    },
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How long does it take to build a website?',
      acceptedAnswer: { '@type': 'Answer', text: 'Most websites are delivered within 7–21 business days depending on complexity. Landing pages can be ready in 3–5 days.' },
    },
    {
      '@type': 'Question',
      name: 'How much does a website cost?',
      acceptedAnswer: { '@type': 'Answer', text: 'Pricing starts from $299 for landing pages, $599 for business websites, and $999+ for SaaS platforms and e-commerce stores. All prices are fixed with no hidden fees.' },
    },
    {
      '@type': 'Question',
      name: 'Do you work with clients outside Morocco?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes — MBN DEV serves clients worldwide. We communicate in English, French, and Arabic.' },
    },
    {
      '@type': 'Question',
      name: 'What technologies do you use?',
      acceptedAnswer: { '@type': 'Answer', text: 'We build with Next.js, React, Node.js, PostgreSQL, and Tailwind CSS — modern, production-ready technologies used by top companies.' },
    },
    {
      '@type': 'Question',
      name: 'Will I own the source code?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes — full source code is handed over at project completion. No recurring fees, no vendor lock-in.' },
    },
  ],
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={contactSchema} />
      <JsonLd data={faqSchema} />
      {children}
    </>
  );
}

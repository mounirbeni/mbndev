import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Services from '@/components/landing/Services';
import Portfolio from '@/components/landing/Portfolio';
import Pricing from '@/components/landing/Pricing';
import Process from '@/components/landing/Process';
import Testimonials from '@/components/landing/Testimonials';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import JsonLd from '@/components/JsonLd';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MBN DEV',
  url: 'https://mbndev.com',
  logo: 'https://mbndev.com/logo.png',
  description: 'Custom websites, SaaS platforms, and web apps built by Mounir Banni.',
  founder: { '@type': 'Person', name: 'Mounir Banni' },
  address: { '@type': 'PostalAddress', addressCountry: 'MA' },
  sameAs: ['https://github.com/mbndev'],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MBN DEV',
  url: 'https://mbndev.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://mbndev.com/?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Web Development',
  provider: { '@type': 'Organization', name: 'MBN DEV', url: 'https://mbndev.com' },
  description: 'Custom websites, SaaS platforms, e-commerce stores, and web applications built fast, modern, and tailored to your business.',
  areaServed: { '@type': 'Place', name: 'Worldwide' },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Web Development Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Landing Page' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Business Website' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'SaaS Platform' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'E-Commerce Store' } },
    ],
  },
};

export const metadata: Metadata = {
  title: 'MBN DEV — Custom Websites Built to Elevate Your Business',
  description:
    'MBN DEV builds custom websites, SaaS platforms, e-commerce stores, and web applications — fast, modern, and tailored to your business. Based in Morocco, serving clients worldwide.',
  alternates: { canonical: 'https://mbndev.com' },
  openGraph: {
    title:       'MBN DEV — Custom Websites Built to Elevate Your Business',
    description: 'Custom websites, SaaS platforms, and web apps built by Mounir Banni. Fast, modern, and production-ready.',
    url:         'https://mbndev.com',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MBN DEV Homepage' }],
  },
};

export default function LandingPage() {
  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <JsonLd data={serviceSchema} />
      <main>
        <Navbar />
        <Hero />
        <Services />
        <Portfolio />
        <Pricing />
        <Process />
        <Testimonials />
        <CTA />
        <Footer />
      </main>
    </>
  );
}

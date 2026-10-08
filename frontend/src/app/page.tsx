import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import LandingBottomNav from '@/components/landing/LandingBottomNav';
import Hero from '@/components/landing/Hero';
import dynamic from 'next/dynamic';
import SmoothScroll from '@/components/ui/SmoothScroll';
import JsonLd from '@/components/JsonLd';
import CinemaLayer from '@/components/ui/CinemaLayer';

// Below-the-fold sections: still server-rendered (same HTML, same SEO), but
// each ships as its own chunk inside its own Suspense boundary, so React
// hydrates them one at a time instead of in one long main-thread task.
const TechMarquee = dynamic(() => import('@/components/landing/TechMarquee'));
const ScrollingBanner = dynamic(() => import('@/components/ui/ScrollingBanner'));
const Services = dynamic(() => import('@/components/landing/Services'));
const Portfolio = dynamic(() => import('@/components/landing/Portfolio'));
const Pricing = dynamic(() => import('@/components/landing/Pricing'));
const Process = dynamic(() => import('@/components/landing/Process'));
const Testimonials = dynamic(() => import('@/components/landing/Testimonials'));
const CTA = dynamic(() => import('@/components/landing/CTA'));
const Footer = dynamic(() => import('@/components/landing/Footer'));

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MBN DEV',
  url: 'https://mbndev.ma',
  logo: 'https://mbndev.ma/brand-icon-transparent.webp',
  description: 'Custom websites, SaaS platforms, and web apps built by Mounir Banni.',
  founder: { '@type': 'Person', name: 'Mounir Banni' },
  address: { '@type': 'PostalAddress', addressCountry: 'MA' },
  sameAs: ['https://github.com/mbndev'],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MBN DEV',
  url: 'https://mbndev.ma',
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://mbndev.ma/#business',
  name: 'MBN DEV',
  description: 'Custom websites, SaaS platforms, e-commerce stores, and web applications built fast, modern, and tailored to your business.',
  url: 'https://mbndev.ma',
  logo: 'https://mbndev.ma/brand-icon-transparent.webp',
  image: 'https://mbndev.ma/opengraph-image',
  telephone: '+212601439975',
  email: 'contact@mbndev.ma',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'MA',
    addressRegion: 'Morocco',
  },
  founder: { '@type': 'Person', name: 'Mounir Banni' },
  foundingDate: '2023',
  areaServed: [
    { '@type': 'Place', name: 'Morocco' },
    { '@type': 'Place', name: 'Worldwide' },
  ],
  priceRange: '$$',
  openingHours: 'Mo-Fr 09:00-18:00',
  sameAs: ['https://github.com/mbndev'],
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Web Development',
  provider: { '@type': 'Organization', name: 'MBN DEV', url: 'https://mbndev.ma' },
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
  alternates: { canonical: 'https://mbndev.ma' },
  openGraph: {
    title:       'MBN DEV — Custom Websites Built to Elevate Your Business',
    description: 'Custom websites, SaaS platforms, and web apps built by Mounir Banni. Fast, modern, and production-ready.',
    url:         'https://mbndev.ma',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'MBN DEV Homepage' }],
  },
};

export default function LandingPage() {
  return (
    <SmoothScroll>
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <JsonLd data={serviceSchema} />
      <JsonLd data={localBusinessSchema} />
      <main className="chapters pb-[74px] lg:pb-0">
        <Navbar />
        <Hero />
        <TechMarquee />
        <ScrollingBanner />
        <Services />
        <Portfolio />
        <Pricing />
        <Process />
        <Testimonials />
        <CTA />
        <Footer />
      </main>
      <LandingBottomNav />
      <CinemaLayer />
    </SmoothScroll>
  );
}

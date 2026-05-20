import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title:       'About Mounir Banni & MBN DEV',
  description: 'MBN DEV is built by Mounir Banni — a senior software engineer based in Morocco, building fast, modern, and high-performing websites and web applications for clients worldwide.',
  alternates: { canonical: 'https://mbndev.ma/about' },
  openGraph: {
    title:       'About — MBN DEV',
    description: 'Meet Mounir Banni and learn the story behind MBN DEV.',
    url:         'https://mbndev.ma/about',
    type:        'profile',
  },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Mounir Banni',
  url: 'https://mbndev.ma/about',
  jobTitle: 'Senior Software Engineer & Founder',
  worksFor: { '@type': 'Organization', name: 'MBN DEV', url: 'https://mbndev.ma' },
  description: 'Full-stack web developer specializing in React, Next.js, and Node.js. Building fast, modern web products for businesses worldwide.',
  address: { '@type': 'PostalAddress', addressCountry: 'MA', addressRegion: 'Morocco' },
  sameAs: ['https://github.com/mbndev'],
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={personSchema} />
      {children}
    </>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:       'Request a Project',
  description: 'Tell us about your project — pages, features, design preferences. Get an instant quote and start building.',
  alternates:  { canonical: 'https://mbndev.ma/request' },
  openGraph: {
    title:       'Request a Project — MBN DEV',
    description: 'Get an instant quote for your website, SaaS platform, or web app. Fast delivery, fixed pricing.',
    url:         'https://mbndev.ma/request',
    type:        'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Request a Project — MBN DEV' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Request a Project — MBN DEV',
    description: 'Get an instant quote for your website, SaaS platform, or web app.',
    images:      ['/og-image.png'],
  },
};

export default function RequestLayout({ children }: { children: React.ReactNode }) {
  return children;
}

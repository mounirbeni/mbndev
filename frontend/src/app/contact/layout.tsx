import type { Metadata } from 'next';

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

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}

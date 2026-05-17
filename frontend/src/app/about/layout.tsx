import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:       'About Mounir Banni & MBN DEV',
  description: 'MBN DEV is built by Mounir Banni — a senior software engineer based in Morocco, building fast, modern, and high-performing websites and web applications for clients worldwide.',
  alternates: { canonical: 'https://mbndev.com/about' },
  openGraph: {
    title:       'About — MBN DEV',
    description: 'Meet Mounir Banni and learn the story behind MBN DEV.',
    url:         'https://mbndev.com/about',
    type:        'profile',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}

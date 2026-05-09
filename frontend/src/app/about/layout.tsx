import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:       'About',
  description: 'MBN DEV is a Moroccan platform by Mounir Banni — a senior software engineer building modern, fast, and high-performing websites and web applications.',
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

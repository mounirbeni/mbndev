import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:       'Careers',
  description: 'Join MBN DEV as a freelance collaborator. Open positions for Frontend, Backend, Mobile developers and UI/UX Designers — remote, flexible, and project-based.',
  alternates: { canonical: 'https://mbndev.ma/careers' },
  openGraph: {
    title:       'Careers — MBN DEV',
    description: 'Open freelance positions at MBN DEV. Work remotely on real client projects.',
    url:         'https://mbndev.ma/careers',
    type:        'website',
  },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:       'Request a Project',
  description: 'Tell us about your project — pages, features, design preferences. Get an instant quote and start building.',
  alternates:  { canonical: 'https://mbndev.com/request' },
};

export default function RequestLayout({ children }: { children: React.ReactNode }) {
  return children;
}

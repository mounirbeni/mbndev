import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const SERVICE_META: Record<string, { title: string; description: string }> = {
  'custom-websites': {
    title:       'Custom Websites',
    description: 'Bespoke, responsive websites built from scratch for your brand — SEO-optimized, fast, and conversion-focused. Starting at $1,290.',
  },
  'ecommerce': {
    title:       'E-Commerce Stores',
    description: 'Full-featured online stores with secure payments, product catalogs, and optimized checkout flows. Stripe & PayPal integrated.',
  },
  'web-applications': {
    title:       'Web Applications',
    description: 'Custom web applications built for your business workflow — internal tools, customer platforms, and scalable architectures.',
  },
  'landing-pages': {
    title:       'Landing Pages',
    description: 'High-converting landing pages with A/B testing-ready layouts, lead capture, and sub-2s load times.',
  },
  'maintenance': {
    title:       'Support & Maintenance',
    description: 'Ongoing technical support, security updates, performance monitoring, and feature enhancements for existing projects.',
  },
};

// Only the known slugs exist: anything else is a real 404 at routing level
// (the root loading.tsx streams a 200 before a notFound() could change it).
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(SERVICE_META).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const meta = SERVICE_META[slug];
  if (!meta) notFound();
  const url = `https://mbndev.ma/services/${slug}`;
  return {
    title:       meta.title,
    description: meta.description,
    alternates:  { canonical: url },
    openGraph: {
      title:       `${meta.title} — MBN DEV`,
      description: meta.description,
      url,
      type:        'website',
    },
    twitter: {
      card:        'summary_large_image',
      title:       `${meta.title} — MBN DEV`,
      description: meta.description,
    },
  };
}

export default async function ServiceSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!SERVICE_META[slug]) notFound();
  return children;
}

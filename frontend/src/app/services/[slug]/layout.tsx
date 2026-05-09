import type { Metadata } from 'next';

const SERVICE_META: Record<string, { title: string; description: string }> = {
  'custom-websites': {
    title:       'Custom Websites',
    description: 'Bespoke, responsive websites built from scratch for your brand — SEO-optimized, fast, and conversion-focused. Starting at $799.',
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

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const meta = SERVICE_META[params.slug];
  if (!meta) {
    return { title: 'Service', description: 'MBN DEV service detail.' };
  }
  const url = `https://mbndev.com/services/${params.slug}`;
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

export default function ServiceSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}

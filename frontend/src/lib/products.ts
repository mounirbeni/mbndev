// MBN DEV's own software products, shown in the Products section.
// Add a product here and it appears on /products.

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  status: 'early-access' | 'available' | 'coming-soon';
  priceFrom: number;
  highlights: string[];
  appUrl?: string;
}

export const PRODUCTS: Product[] = [
  {
    slug: 'leads-ai',
    name: 'MBN Leads AI',
    tagline: 'Find businesses that need your service — and know exactly what to say to them.',
    description: 'Search any niche in any city, get every business audited automatically, see who needs you most with an opportunity score, and send a personalised message in one click.',
    status: 'early-access',
    priceFrom: 37,
    highlights: ['Business search worldwide', 'Automatic website audit', 'Opportunity score 0–100', 'AI-written outreach', 'Built-in lead tracker'],
    appUrl: '/leads-ai',
  },
];

export const STATUS_LABEL: Record<Product['status'], string> = {
  'early-access': 'Early access',
  available: 'Available',
  'coming-soon': 'Coming soon',
};

export const EARLY_ACCESS_WA = (product: string) =>
  `https://wa.me/212705914424?text=${encodeURIComponent(`Hi Mounir, I'd like early access to ${product}.`)}`;

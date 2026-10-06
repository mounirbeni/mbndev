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
    status: 'available',
    priceFrom: 37,
    highlights: ['Business search worldwide', 'Automatic website audit', 'Opportunity score 0–100', 'AI-written outreach', 'Built-in lead tracker'],
    appUrl: '/leads-ai',
  },
  {
    slug: 'local-growth',
    name: 'MBN Local Growth',
    tagline: 'See exactly how a local business compares to its competitors online — and what to fix first.',
    description: 'Type a business name and get a growth report in seconds: Google reputation vs nearby competitors, website check, profile gaps and a prioritised action plan you can share or print.',
    status: 'available',
    priceFrom: 37,
    highlights: ['Growth Score 0–100', 'Benchmark vs 5 nearby competitors', 'Website & Google profile check', 'Prioritised action plan', 'Shareable, printable reports'],
    appUrl: '/local-growth',
  },
];

export const STATUS_LABEL: Record<Product['status'], string> = {
  'early-access': 'Early access',
  available: 'Available',
  'coming-soon': 'Coming soon',
};

/** "local-growth:pro" → the product it belongs to (for order and checkout pages). */
export function productFromKey(key?: string | null): Product | null {
  if (!key) return null;
  return PRODUCTS.find((p) => p.slug === key.split(':')[0]) ?? null;
}

export const productQuestionWA = (product: string) =>
  `https://wa.me/212705914424?text=${encodeURIComponent(`Hi Mounir, I have a question about ${product}.`)}`;

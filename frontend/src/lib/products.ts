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
  {
    slug: 'support-ai',
    name: 'MBN Support AI',
    tagline: 'An AI assistant that answers your website visitors 24/7 — and turns them into leads.',
    description: 'Paste your website, the assistant learns it in a minute, then answers visitors in their language, captures their contact details and hands hot leads to you on WhatsApp or email.',
    status: 'available',
    priceFrom: 37,
    highlights: ['Learns your website automatically', 'Answers in the visitor\'s language', 'Captures leads (email / phone)', 'WhatsApp hand-off', 'One-line install on any site'],
    appUrl: '/support-ai',
  },
  {
    slug: 'review-booster',
    name: 'MBN Review Booster',
    tagline: 'Your Google reputation on autopilot — get more reviews, know about every new one, reply in seconds.',
    description: 'Collect reviews with a QR poster and one-tap WhatsApp requests, get an alert for every new Google review, reply with AI-written drafts in the reviewer\'s language, and see your rating trend every week.',
    status: 'available',
    priceFrom: 37,
    highlights: ['Alert for every new Google review', 'AI-written replies in any language', 'Weekly rating summary', 'QR poster + WhatsApp review requests', 'Private feedback before bad reviews'],
    appUrl: '/review-booster',
  },
  {
    slug: 'proposal-ai',
    name: 'MBN Proposal AI',
    tagline: 'Win more clients — AI-written proposals they can open, customise and sign online.',
    description: 'Describe the project in a few lines and get a complete, branded proposal: scope, phases, pricing with optional extras, terms. Send a link, know when it’s opened, and get it signed online.',
    status: 'available',
    priceFrom: 37,
    highlights: ['Full proposal from a short brief', 'Branded page with your logo colours', 'Optional extras the client can tick', 'Online signature & acceptance', 'Opened / accepted alerts + follow-up reminders'],
    appUrl: '/proposal-ai',
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

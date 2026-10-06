import { MetadataRoute } from 'next';
import { ARTICLES } from '@/lib/articles';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mbndev.ma';
  // Real "content last changed" dates: a build-time `new Date()` marked every
  // page as freshly modified on each deploy, which search engines learn to
  // ignore. Bump a date when that page's content actually changes.
  const SITE = new Date('2026-10-05');
  const LEGAL = new Date('2026-10-05');
  const CITIES = new Date('2026-10-01');
  const ARTICLES_UPDATED = new Date('2026-10-05');

  const articleEntries: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: `${base}/insights/${article.slug}`,
    lastModified: ARTICLES_UPDATED,
    changeFrequency: 'yearly',
    priority: 0.6,
  }));

  return [
    { url: base,                   lastModified: SITE, changeFrequency: 'weekly',  priority: 1 },
    { url: `${base}/services`,     lastModified: SITE, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/portfolio`,    lastModified: SITE, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/products`,     lastModified: SITE, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/products/leads-ai`, lastModified: SITE, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/pricing`,      lastModified: SITE, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/about`,        lastModified: SITE, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/contact`,      lastModified: SITE, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/request`,      lastModified: SITE, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/privacy`,      lastModified: LEGAL, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/terms`,        lastModified: LEGAL, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/insights`,     lastModified: SITE, changeFrequency: 'weekly',  priority: 0.7 },
    // Service sub-pages
    { url: `${base}/services/custom-websites`,    lastModified: SITE, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/services/ecommerce`,          lastModified: SITE, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/services/web-applications`,   lastModified: SITE, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/services/landing-pages`,      lastModified: SITE, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/services/maintenance`,        lastModified: SITE, changeFrequency: 'monthly', priority: 0.7 },
    // City landing pages
    { url: `${base}/web-design-marrakech`,   lastModified: CITIES, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/web-design-casablanca`,  lastModified: CITIES, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/web-design-rabat`,       lastModified: CITIES, changeFrequency: 'monthly', priority: 0.8 },
    // Insights articles
    ...articleEntries,
  ];
}

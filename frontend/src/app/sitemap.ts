import { MetadataRoute } from 'next';
import { ARTICLES } from '@/lib/articles';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mbndev.ma';
  const now = new Date();

  const articleEntries: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: `${base}/insights/${article.slug}`,
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.6,
  }));

  return [
    { url: base,                   lastModified: now, changeFrequency: 'weekly',  priority: 1 },
    { url: `${base}/services`,     lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/portfolio`,    lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/pricing`,      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/about`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/contact`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/request`,      lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/privacy`,      lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/terms`,        lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/insights`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    // Service sub-pages
    { url: `${base}/services/custom-websites`,    lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/services/ecommerce`,          lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/services/web-applications`,   lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/services/landing-pages`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/services/maintenance`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    // City landing pages
    { url: `${base}/web-design-marrakech`,   lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/web-design-casablanca`,  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/web-design-rabat`,       lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    // Insights articles
    ...articleEntries,
  ];
}

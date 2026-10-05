import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ARTICLES } from '@/lib/articles';
import JsonLd from '@/components/JsonLd';

// Only the known slugs exist: anything else is a real 404 at routing level
// (the root loading.tsx streams a 200 before a notFound() could change it).
export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES.find(a => a.slug === slug);
  if (!article) notFound();
  const url = `https://mbndev.ma/insights/${slug}`;
  return {
    title:       article.title,
    description: article.excerpt,
    alternates:  { canonical: url },
    openGraph: {
      title:       article.title,
      description: article.excerpt,
      url,
      type:        'article',
    },
    twitter: {
      card:        'summary_large_image',
      title:       article.title,
      description: article.excerpt,
    },
  };
}

export default async function ArticleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = ARTICLES.find(a => a.slug === slug);

  if (!article) notFound();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: { '@type': 'Organization', name: 'MBN DEV' },
    publisher: { '@type': 'Organization', name: 'MBN DEV' },
    mainEntityOfPage: `https://mbndev.ma/insights/${slug}`,
  };

  return (
    <>
      <JsonLd data={schema} />
      {children}
    </>
  );
}

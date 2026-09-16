import type { Metadata } from 'next';
import { ARTICLES } from '@/lib/articles';
import JsonLd from '@/components/JsonLd';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES.find(a => a.slug === slug);
  if (!article) {
    return { title: 'Article', description: 'MBN DEV insights article.' };
  }
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

  if (!article) return children;

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

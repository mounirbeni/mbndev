'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import PublicLayout from '@/components/landing/PublicLayout';
import { ARTICLES, TAG_COLORS, getArticleBySlug } from '@/lib/articles';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = getArticleBySlug(slug);

  if (!article) {
    return (
      <PublicLayout>
        <section className="pt-32 pb-32 px-6 sm:px-10 lg:px-14 xl:px-20 text-center">
          <h1 className="text-3xl font-black text-white mb-4">Article not found</h1>
          <p className="text-slate-400 mb-8">The article you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/insights" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
            ← Back to Insights
          </Link>
        </section>
      </PublicLayout>
    );
  }

  const Icon = article.icon;
  const color = TAG_COLORS[article.tag] || '#7c3aed';

  const currentIndex = ARTICLES.findIndex(a => a.slug === slug);
  const nextArticle = ARTICLES[(currentIndex + 1) % ARTICLES.length];
  const prevArticle = ARTICLES[(currentIndex - 1 + ARTICLES.length) % ARTICLES.length];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative pt-28 pb-12 px-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
            style={{ background: `radial-gradient(ellipse, ${color}12 0%, transparent 70%)` }} />
        </div>

        <div className="max-w-3xl mx-auto relative">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Insights
            </Link>
          </motion.div>

          {/* Tag + read time */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="flex items-center gap-4 mb-6"
          >
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase"
              style={{
                background: `${color}12`,
                border: `1px solid ${color}30`,
                color: `${color}cc`,
              }}
            >
              <Icon className="w-3 h-3" />
              {article.tag}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight leading-[1.1]"
          >
            {article.title}
          </motion.h1>

          {/* Excerpt */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-slate-400 leading-relaxed"
          >
            {article.excerpt}
          </motion.p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />
      </div>

      {/* Content */}
      <section className="py-14 px-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="max-w-3xl mx-auto">
          {article.content.map((paragraph, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.05 }}
              className="text-slate-300 text-base leading-[1.85] mb-7"
              style={{ fontFeatureSettings: "'cv02', 'cv03', 'cv04', 'cv11'" }}
            >
              {paragraph}
            </motion.p>
          ))}
        </div>
      </section>

      {/* Author / CTA */}
      <section className="px-6 sm:px-10 lg:px-14 xl:px-20 pb-12">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6"
            style={{
              background: 'rgba(10,10,16,0.88)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.25)',
              }}
            >
              <span className="text-lg font-black text-violet-400">MB</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm mb-1">Written by Mounir Banni</p>
              <p className="text-slate-500 text-sm leading-relaxed">
                Founder of MBN DEV. Building production-grade web products for businesses worldwide.
              </p>
            </div>
            <Link
              href="/request"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase text-white transition-all duration-200"
              style={{
                background: 'rgba(124,58,237,0.15)',
                border: '1px solid rgba(124,58,237,0.4)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(124,58,237,0.25)';
                e.currentTarget.style.borderColor = 'rgba(168,85,247,0.6)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(124,58,237,0.15)';
                e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)';
              }}
            >
              Work with me
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Prev / Next navigation */}
      <section className="px-6 sm:px-10 lg:px-14 xl:px-20 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="h-px mb-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href={`/insights/${prevArticle.slug}`}
              className="group rounded-2xl p-6 transition-all duration-300"
              style={{
                background: 'rgba(10,10,16,0.7)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
            >
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-600 mb-2 flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Previous
              </p>
              <p className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors leading-snug">
                {prevArticle.title}
              </p>
            </Link>
            <Link
              href={`/insights/${nextArticle.slug}`}
              className="group rounded-2xl p-6 text-right transition-all duration-300"
              style={{
                background: 'rgba(10,10,16,0.7)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
            >
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-600 mb-2 flex items-center justify-end gap-1">
                Next <ArrowRight className="w-3 h-3" />
              </p>
              <p className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors leading-snug">
                {nextArticle.title}
              </p>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

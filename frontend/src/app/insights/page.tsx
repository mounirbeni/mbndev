'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Search, ArrowRight, Clock, Zap,
} from 'lucide-react';
import Link from 'next/link';
import PublicLayout from '@/components/landing/PublicLayout';
import { ARTICLES, TAG_COLORS } from '@/lib/articles';
import type { Article } from '@/lib/articles';

const CATEGORIES = ['All', 'Strategy', 'Development', 'Design', 'Growth', 'Security'];

function ArticleCard({ article, index }: { article: Article; index: number }) {
  const Icon = article.icon;
  const color = TAG_COLORS[article.tag] || '#7c3aed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link
        href={`/insights/${article.slug}`}
        className="group rounded-2xl p-6 flex flex-col gap-4 cursor-pointer relative overflow-hidden block h-full"
        style={{
          background: 'rgba(10,10,16,0.88)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 60px rgba(0,0,0,0.35)',
          transition: 'border-color 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget;
          el.style.borderColor = `${color}35`;
          el.style.transform = 'translateY(-3px)';
          el.style.boxShadow = `0 1px 0 rgba(255,255,255,0.06) inset, 0 24px 60px rgba(0,0,0,0.4), 0 0 40px ${color}08`;
        }}
        onMouseLeave={e => {
          const el = e.currentTarget;
          el.style.borderColor = 'rgba(255,255,255,0.07)';
          el.style.transform = 'none';
          el.style.boxShadow = '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 60px rgba(0,0,0,0.35)';
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, transparent, ${color}70, transparent)` }}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300"
              style={{ width: 36, height: 36, background: `${color}15`, border: `1px solid ${color}25` }}
            >
              <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.8} />
            </div>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: `${color}90` }}>
              {article.tag}
            </span>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-slate-600">
            <Clock className="w-3 h-3" />
            {article.readTime}
          </span>
        </div>

        <h3 className="text-base font-bold text-white leading-snug tracking-tight group-hover:text-violet-100 transition-colors duration-200">
          {article.title}
        </h3>

        <p className="text-slate-500 text-sm leading-relaxed flex-1">
          {article.excerpt}
        </p>

        <div
          className="flex items-center gap-1.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1"
          style={{ color }}
        >
          Read article <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </Link>
    </motion.div>
  );
}

function FeaturedCard({ article, index }: { article: Article; index: number }) {
  const Icon = article.icon;
  const color = TAG_COLORS[article.tag] || '#7c3aed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
    >
      <Link
        href={`/insights/${article.slug}`}
        className="group rounded-3xl relative overflow-hidden cursor-pointer block"
        style={{
          background: 'rgba(10,10,16,0.92)',
          border: '1px solid rgba(124,58,237,0.18)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 0 60px rgba(124,58,237,0.06), 0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
          transition: 'border-color 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)';
          e.currentTarget.style.transform = 'translateY(-3px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(124,58,237,0.18)';
          e.currentTarget.style.transform = 'none';
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />

        <div className="p-8 lg:p-10 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.12em] uppercase"
              style={{ background: `${color}12`, border: `1px solid ${color}30`, color: `${color}cc` }}
            >
              <Zap className="w-3 h-3" />
              Featured
            </span>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: `${color}80` }}>
              {article.tag}
            </span>
          </div>

          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
            style={{ background: `${color}15`, border: `1.5px solid ${color}30`, boxShadow: `0 0 24px ${color}12` }}
          >
            <Icon className="w-6 h-6" style={{ color }} strokeWidth={1.7} />
          </div>

          <h3 className="text-2xl lg:text-3xl font-bold text-white leading-snug tracking-tight">
            {article.title}
          </h3>

          <p className="text-slate-400 text-base leading-relaxed max-w-lg">
            {article.excerpt}
          </p>

          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-sm text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime}
            </span>
            <span
              className="flex items-center gap-1.5 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300"
              style={{ color }}
            >
              Read article <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function InsightsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const featured = ARTICLES.filter(a => a.featured);
  const filtered = ARTICLES.filter(a => {
    if (a.featured) return false;
    const matchesCategory = activeCategory === 'All' || a.tag === activeCategory;
    const matchesSearch = searchQuery === '' ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex items-center justify-center mb-6"
          >
            <span className="section-label">Insights & Articles</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 tracking-tight leading-[1.06]"
          >
            Ideas that drive{' '}
            <span className="gradient-text">digital growth.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed"
          >
            Practical thinking on web development, design strategy, and building digital products that perform.
          </motion.p>
        </div>
      </section>

      {/* Featured */}
      <section className="px-6 sm:px-10 lg:px-14 xl:px-20 pb-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          {featured.map((article, i) => (
            <FeaturedCard key={article.slug} article={article} index={i} />
          ))}
        </div>
      </section>

      {/* Filter + Search */}
      <section className="px-6 sm:px-10 lg:px-14 xl:px-20 pb-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200"
                  style={{
                    background: activeCategory === cat ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${activeCategory === cat ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: activeCategory === cat ? '#c4b5fd' : 'rgba(148,163,184,0.7)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 sm:px-10 lg:px-14 xl:px-20 pb-20">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((article, i) => (
                <ArticleCard key={article.slug} article={article} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Search className="w-10 h-10 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-medium mb-2">No articles found</p>
              <p className="text-slate-600 text-sm">Try a different category or search term.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 sm:px-10 lg:px-14 xl:px-20 pb-32">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden text-center"
            style={{
              background: 'rgba(10,10,16,0.9)',
              border: '1px solid rgba(124,58,237,0.2)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 0 80px rgba(124,58,237,0.08), 0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)' }} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-24 bg-violet-500/8 blur-2xl pointer-events-none" />

            <div className="relative z-10 py-14 px-8 sm:px-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase mb-6"
                style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: 'rgba(168,85,247,0.9)' }}
              >
                <BookOpen className="w-3 h-3" />
                Have a project in mind?
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white mb-4 tracking-tight">
                Let&apos;s build something great together
              </h3>

              <p className="text-slate-400 text-base leading-relaxed max-w-md mx-auto mb-8">
                From strategy to deployment — we turn your ideas into production-grade digital products.
              </p>

              <Link
                href="/request"
                className="inline-flex items-center gap-2.5 group"
                style={{
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  boxShadow: '0 8px 32px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'; }}
              >
                Start Your Project
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}

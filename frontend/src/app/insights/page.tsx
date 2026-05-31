'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Lightbulb, TrendingUp, Code2, Palette, Shield,
  Rocket, Search, ArrowRight, Clock, Zap, Globe,
  ShoppingCart, BarChart3, Smartphone,
} from 'lucide-react';
import Link from 'next/link';
import PublicLayout from '@/components/landing/PublicLayout';

const CATEGORIES = ['All', 'Strategy', 'Development', 'Design', 'Growth', 'Security'];

const ARTICLES = [
  {
    icon: Lightbulb,
    tag: 'Strategy',
    title: 'Why Your Business Needs a Custom Website in 2025',
    excerpt: 'Template websites can only take you so far. Learn why investing in a custom-built site pays off in performance, SEO, and brand trust.',
    readTime: '5 min read',
    featured: true,
  },
  {
    icon: TrendingUp,
    tag: 'Growth',
    title: 'How a Fast Website Directly Impacts Your Revenue',
    excerpt: 'Every second of load time costs conversions. We break down the data and show you what to prioritize for maximum speed.',
    readTime: '4 min read',
    featured: true,
  },
  {
    icon: Code2,
    tag: 'Development',
    title: 'SaaS vs Traditional Web App: Choosing the Right Architecture',
    excerpt: 'Understand the trade-offs between SaaS platforms and traditional web applications for your next project.',
    readTime: '7 min read',
    featured: false,
  },
  {
    icon: Palette,
    tag: 'Design',
    title: 'The Psychology of Dark Mode: Why Users Prefer It',
    excerpt: 'Dark interfaces aren\'t just trendy — they reduce eye strain, save battery, and create a premium feel that builds trust.',
    readTime: '4 min read',
    featured: false,
  },
  {
    icon: Shield,
    tag: 'Security',
    title: 'Web Security Essentials Every Business Owner Should Know',
    excerpt: 'From HTTPS to JWT tokens — the non-technical guide to keeping your website and customer data safe.',
    readTime: '6 min read',
    featured: false,
  },
  {
    icon: Globe,
    tag: 'Strategy',
    title: 'Going Global: How to Build a Website That Works Worldwide',
    excerpt: 'Multilingual support, RTL layouts, and CDN optimization — everything you need to serve a global audience.',
    readTime: '5 min read',
    featured: false,
  },
  {
    icon: ShoppingCart,
    tag: 'Growth',
    title: '7 E-Commerce Mistakes That Kill Your Conversion Rate',
    excerpt: 'From slow checkout flows to missing trust signals — the common pitfalls we see and how to fix them fast.',
    readTime: '6 min read',
    featured: false,
  },
  {
    icon: Rocket,
    tag: 'Development',
    title: 'Next.js vs React SPA: Which One Should You Choose?',
    excerpt: 'Server-side rendering, static generation, and API routes — when Next.js is the right choice and when it isn\'t.',
    readTime: '8 min read',
    featured: false,
  },
  {
    icon: Smartphone,
    tag: 'Design',
    title: 'Mobile-First Design: It\'s Not Just About Screen Size',
    excerpt: 'Touch targets, gesture navigation, safe areas, and performance budgets — designing for mobile properly.',
    readTime: '5 min read',
    featured: false,
  },
  {
    icon: BarChart3,
    tag: 'Growth',
    title: 'SEO in 2025: What Actually Moves the Needle',
    excerpt: 'Core Web Vitals, structured data, and content authority — the SEO strategies that matter now.',
    readTime: '7 min read',
    featured: false,
  },
  {
    icon: Zap,
    tag: 'Development',
    title: 'Real-Time Features: SSE, WebSockets, or Polling?',
    excerpt: 'Compare the three main approaches to real-time data and learn which one fits your use case best.',
    readTime: '6 min read',
    featured: false,
  },
  {
    icon: Shield,
    tag: 'Security',
    title: 'GDPR & Privacy: What Your Website Must Have',
    excerpt: 'Cookie consent, data handling, and user rights — the legal requirements every modern website needs to meet.',
    readTime: '5 min read',
    featured: false,
  },
];

const TAG_COLORS: Record<string, string> = {
  Strategy: '#7c3aed',
  Development: '#3b82f6',
  Design: '#ec4899',
  Growth: '#10b981',
  Security: '#f59e0b',
};

function ArticleCard({ article, index }: { article: typeof ARTICLES[0]; index: number }) {
  const Icon = article.icon;
  const color = TAG_COLORS[article.tag] || '#7c3aed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group rounded-2xl p-6 flex flex-col gap-4 cursor-default relative overflow-hidden"
      style={{
        background: 'rgba(10,10,16,0.88)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
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
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${color}70, transparent)` }}
      />

      {/* Tag + read time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300"
            style={{
              width: 36, height: 36,
              background: `${color}15`,
              border: `1px solid ${color}25`,
            }}
          >
            <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.8} />
          </div>
          <span
            className="text-[10px] font-bold tracking-[0.15em] uppercase"
            style={{ color: `${color}90` }}
          >
            {article.tag}
          </span>
        </div>
        <span className="flex items-center gap-1 text-[11px] text-slate-600">
          <Clock className="w-3 h-3" />
          {article.readTime}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-white leading-snug tracking-tight group-hover:text-violet-100 transition-colors duration-200">
        {article.title}
      </h3>

      {/* Excerpt */}
      <p className="text-slate-500 text-sm leading-relaxed flex-1">
        {article.excerpt}
      </p>

      {/* Read more */}
      <div
        className="flex items-center gap-1.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1"
        style={{ color }}
      >
        Read article <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </motion.div>
  );
}

function FeaturedCard({ article, index }: { article: typeof ARTICLES[0]; index: number }) {
  const Icon = article.icon;
  const color = TAG_COLORS[article.tag] || '#7c3aed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className="group rounded-3xl relative overflow-hidden cursor-default"
      style={{
        background: 'rgba(10,10,16,0.92)',
        border: '1px solid rgba(124,58,237,0.18)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 0 60px rgba(124,58,237,0.06), 0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        transition: 'border-color 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget;
        el.style.borderColor = 'rgba(124,58,237,0.35)';
        el.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.borderColor = 'rgba(124,58,237,0.18)';
        el.style.transform = 'none';
      }}
    >
      {/* Top beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />

      <div className="p-8 lg:p-10 flex flex-col gap-5">
        {/* Badge */}
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.12em] uppercase"
            style={{
              background: `${color}12`,
              border: `1px solid ${color}30`,
              color: `${color}cc`,
            }}
          >
            <Zap className="w-3 h-3" />
            Featured
          </span>
          <span
            className="text-[10px] font-bold tracking-[0.15em] uppercase"
            style={{ color: `${color}80` }}
          >
            {article.tag}
          </span>
        </div>

        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
          style={{
            background: `${color}15`,
            border: `1.5px solid ${color}30`,
            boxShadow: `0 0 24px ${color}12`,
          }}
        >
          <Icon className="w-6 h-6" style={{ color }} strokeWidth={1.7} />
        </div>

        {/* Title */}
        <h3 className="text-2xl lg:text-3xl font-bold text-white leading-snug tracking-tight">
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className="text-slate-400 text-base leading-relaxed max-w-lg">
          {article.excerpt}
        </p>

        {/* Meta */}
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
    </motion.div>
  );
}

export default function InsightsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const featured = ARTICLES.filter(a => a.featured);
  const filtered = ARTICLES.filter(a => {
    if (!a.featured) {
      const matchesCategory = activeCategory === 'All' || a.tag === activeCategory;
      const matchesSearch = searchQuery === '' ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }
    return false;
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

      {/* Featured Articles */}
      <section className="px-6 sm:px-10 lg:px-14 xl:px-20 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {featured.map((article, i) => (
              <FeaturedCard key={article.title} article={article} index={i} />
            ))}
          </div>
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
            {/* Category tabs */}
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

            {/* Search */}
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Articles Grid */}
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
                <ArticleCard key={article.title} article={article} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Search className="w-10 h-10 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-medium mb-2">No articles found</p>
              <p className="text-slate-600 text-sm">Try a different category or search term.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
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
            {/* Top beam */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)' }} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-24 bg-violet-500/8 blur-2xl pointer-events-none" />

            <div className="relative z-10 py-14 px-8 sm:px-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase mb-6"
                style={{
                  background: 'rgba(124,58,237,0.1)',
                  border: '1px solid rgba(124,58,237,0.25)',
                  color: 'rgba(168,85,247,0.9)',
                }}
              >
                <BookOpen className="w-3 h-3" />
                Stay Updated
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white mb-4 tracking-tight">
                More articles are on the way
              </h3>

              <p className="text-slate-400 text-base leading-relaxed max-w-md mx-auto mb-8">
                We&apos;re writing in-depth guides on web development, design, and growing your business online. Have a project in mind?
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
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.1)';
                }}
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

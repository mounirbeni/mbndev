'use client';

import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import PublicLayout from '@/components/landing/PublicLayout';

const ARTICLES = [
  {
    icon: Lightbulb,
    tag: 'Strategy',
    title: 'Why Your Business Needs a Custom Website in 2025',
    excerpt: 'Template websites can only take you so far. Learn why investing in a custom-built site pays off in performance, SEO, and brand trust.',
    date: 'Coming Soon',
  },
  {
    icon: TrendingUp,
    tag: 'Growth',
    title: 'How a Fast Website Directly Impacts Your Revenue',
    excerpt: 'Every second of load time costs conversions. We break down the data and show you what to prioritize.',
    date: 'Coming Soon',
  },
  {
    icon: BookOpen,
    tag: 'Development',
    title: 'SaaS vs Traditional Web App: Choosing the Right Architecture',
    excerpt: 'Understand the trade-offs between SaaS platforms and traditional web applications for your next project.',
    date: 'Coming Soon',
  },
];

const cardStyle = {
  background: 'rgba(10,10,16,0.88)',
  border: '1px solid rgba(255,255,255,0.07)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 60px rgba(0,0,0,0.35)',
};

export default function InsightsPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div style={{ width: 28, height: 1, background: 'rgba(139,92,246,0.65)' }} />
            <span style={{
              fontSize: '10.5px', fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'rgba(139,92,246,0.85)',
            }}>
              Insights & Articles
            </span>
            <div style={{ width: 28, height: 1, background: 'rgba(139,92,246,0.65)' }} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#fff',
              marginBottom: 16,
            }}
          >
            Ideas that drive{' '}
            <span style={{
              background: 'linear-gradient(135deg, #c084fc 0%, #9333ea 50%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              digital growth.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              fontSize: 'clamp(0.9rem, 1.3vw, 1.05rem)',
              lineHeight: 1.75,
              color: 'rgba(148,163,184,0.78)',
              maxWidth: 520,
              margin: '0 auto',
            }}
          >
            Practical thinking on web development, design strategy, and building digital products that perform.
          </motion.p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="px-6 sm:px-10 lg:px-14 xl:px-20 pb-32">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
          {ARTICLES.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 * i }}
                className="rounded-2xl p-6 flex flex-col gap-4 group cursor-default transition-all duration-300"
                style={{
                  ...cardStyle,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.3)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center rounded-xl shrink-0"
                    style={{
                      width: 36, height: 36,
                      background: 'rgba(124,58,237,0.12)',
                      border: '1px solid rgba(124,58,237,0.2)',
                    }}
                  >
                    <Icon className="w-4 h-4 text-violet-400" strokeWidth={1.8} />
                  </div>
                  <span style={{
                    fontSize: '10px', fontWeight: 700,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: 'rgba(139,92,246,0.7)',
                  }}>
                    {a.tag}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', lineHeight: 1.35 }}>
                  {a.title}
                </h3>

                <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'rgba(148,163,184,0.65)', flex: 1 }}>
                  {a.excerpt}
                </p>

                <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(148,163,184,0.4)' }}>
                  {a.date}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-5xl mx-auto mt-16 text-center"
        >
          <p style={{ fontSize: '0.95rem', color: 'rgba(148,163,184,0.6)', marginBottom: 24 }}>
            More articles are on the way. Have a project in mind?
          </p>
          <Link
            href="/request"
            className="inline-flex items-center gap-2 transition-all duration-200"
            style={{
              padding: '13px 28px',
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.55)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.28)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(168,85,247,0.7)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.15)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.55)';
            }}
          >
            Start Your Project <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </section>
    </PublicLayout>
  );
}

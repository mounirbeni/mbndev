'use client';

import { useRef } from 'react';
import { m as motion, useInView } from 'framer-motion';
import Link from 'next/link';
import {
  ShieldCheck, Repeat, Clock, MessageSquare, Code2, Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Testimonials() {
  const { t } = useLanguage();
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' });

  const commitments = [
    { icon: ShieldCheck,    title: t('commit.c1.title'), desc: t('commit.c1.desc'), color: '#7c3aed' },
    { icon: Repeat,         title: t('commit.c2.title'), desc: t('commit.c2.desc'), color: '#3b82f6' },
    { icon: Clock,          title: t('commit.c3.title'), desc: t('commit.c3.desc'), color: '#10b981' },
    { icon: MessageSquare,  title: t('commit.c4.title'), desc: t('commit.c4.desc'), color: '#f59e0b' },
    { icon: Code2,          title: t('commit.c5.title'), desc: t('commit.c5.desc'), color: '#ec4899' },
    { icon: Sparkles,       title: t('commit.c6.title'), desc: t('commit.c6.desc'), color: '#06b6d4' },
  ];

  return (
    <section id="commitments" className="py-14 sm:py-20 lg:py-28 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 ambient-grid opacity-25" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">

        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="section-label mb-6">{t('commit.eyebrow')}</span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-[-0.035em]">
            {t('commit.title')}{' '}
            <span className="serif-accent silk-text pr-[0.06em]">{t('commit.title.bold')}</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            {t('commit.subtitle')}
          </p>
        </motion.div>

        {/* Commitments grid */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {commitments.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  whileTap={{ scale: 0.97 }}
                  className="group rounded-2xl p-5 relative overflow-hidden"
                  style={{
                    background: 'rgba(10,10,16,0.88)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    transition: 'border-color 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget;
                    el.style.borderColor = `${c.color}30`;
                    el.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget;
                    el.style.borderColor = 'rgba(255,255,255,0.07)';
                    el.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, transparent, ${c.color}60, transparent)` }}
                  />
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-105"
                    style={{
                      background: `${c.color}15`,
                      border: `1px solid ${c.color}25`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: c.color }} strokeWidth={1.8} />
                  </div>
                  <h3 className="text-white font-bold text-sm mb-1.5 leading-snug">{c.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{c.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Link
            href="/request"
            className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors group"
          >
            {t('commit.cta')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

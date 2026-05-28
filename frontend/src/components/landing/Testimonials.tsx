'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ShieldCheck, Repeat, Clock, MessageSquare, Code2, Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Testimonials() {
  const { t } = useLanguage();

  const commitments = [
    { icon: ShieldCheck, title: t('commit.c1.title'), desc: t('commit.c1.desc') },
    { icon: Repeat,      title: t('commit.c2.title'), desc: t('commit.c2.desc') },
    { icon: Clock,       title: t('commit.c3.title'), desc: t('commit.c3.desc') },
    { icon: MessageSquare, title: t('commit.c4.title'), desc: t('commit.c4.desc') },
    { icon: Code2,       title: t('commit.c5.title'), desc: t('commit.c5.desc') },
    { icon: Sparkles,    title: t('commit.c6.title'), desc: t('commit.c6.desc') },
  ];

  return (
    <section id="commitments" className="py-28 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 ambient-grid opacity-25" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="section-label mb-6">{t('commit.eyebrow')}</span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 tracking-tight">
            {t('commit.title')}{' '}
            <span className="gradient-text">{t('commit.title.bold')}</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            {t('commit.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {commitments.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.65, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                className="group relative rounded-2xl p-6 overflow-hidden"
                style={{
                  background: 'rgba(10,10,16,0.88)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 50px rgba(0,0,0,0.25)',
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'rgba(124,58,237,0.25)';
                  el.style.boxShadow = '0 1px 0 rgba(255,255,255,0.06) inset, 0 20px 60px rgba(0,0,0,0.35), 0 0 40px rgba(124,58,237,0.07)';
                  el.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'rgba(255,255,255,0.07)';
                  el.style.boxShadow = '0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 50px rgba(0,0,0,0.25)';
                  el.style.transform = 'translateY(0)';
                }}
              >
                {/* Top accent line on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.55), transparent)' }}
                />

                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background: 'rgba(124,58,237,0.12)',
                    border: '1px solid rgba(124,58,237,0.2)',
                    boxShadow: '0 0 16px rgba(124,58,237,0.1) inset',
                  }}
                >
                  <Icon className="w-5 h-5 text-violet-400" strokeWidth={1.7} />
                </div>
                <h3 className="text-white font-bold text-base mb-2 leading-snug group-hover:text-violet-100 transition-colors duration-200">{c.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            );
          })}
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

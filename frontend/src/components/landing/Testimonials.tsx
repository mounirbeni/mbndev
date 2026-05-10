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
    <section id="commitments" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary-400 text-sm font-medium uppercase tracking-widest mb-3 block">
            {t('commit.eyebrow')}
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            {t('commit.title')} <span className="gradient-text">{t('commit.title.bold')}</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            {t('commit.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {commitments.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl p-6 border border-white/5 hover:border-primary-500/25 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-500/15 border border-primary-500/25 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary-300" />
                </div>
                <h3 className="text-white font-semibold text-base mb-1.5">{c.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/request"
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
          >
            {t('commit.cta')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

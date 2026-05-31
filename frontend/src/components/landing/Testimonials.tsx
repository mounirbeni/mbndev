'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ShieldCheck, Repeat, Clock, MessageSquare, Code2, Sparkles,
  ArrowRight, Quote, Star,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const TESTIMONIALS = [
  {
    quote: "MBN DEV transformed our online presence completely. The website they built loads incredibly fast and our conversion rate doubled within the first month.",
    name: 'Youssef A.',
    role: 'Founder, E-Commerce Brand',
    initials: 'YA',
    color: '#7c3aed',
  },
  {
    quote: "Working with Mounir was seamless. He understood our vision from day one and delivered a SaaS platform that exceeded our expectations — on time and on budget.",
    name: 'Sarah M.',
    role: 'CEO, Tech Startup',
    initials: 'SM',
    color: '#3b82f6',
  },
  {
    quote: "The attention to detail is unmatched. Every interaction, every animation, every pixel was carefully crafted. Our clients constantly compliment the design.",
    name: 'Karim B.',
    role: 'Marketing Director',
    initials: 'KB',
    color: '#ec4899',
  },
  {
    quote: "We needed a complex booking system built fast. MBN DEV delivered in 3 weeks what other agencies quoted 3 months for. Truly impressive work.",
    name: 'Amina R.',
    role: 'Operations Manager, RiadConnect',
    initials: 'AR',
    color: '#10b981',
  },
];

function TestimonialCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const t = TESTIMONIALS[active];

  return (
    <div className="relative">
      <div
        className="rounded-3xl p-8 lg:p-12 relative overflow-hidden min-h-[280px] flex flex-col justify-between"
        style={{
          background: 'rgba(10,10,16,0.9)',
          border: '1px solid rgba(124,58,237,0.15)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 0 80px rgba(124,58,237,0.06), 0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Top beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)' }} />

        {/* Quote icon */}
        <div className="absolute top-6 right-8 opacity-[0.06]">
          <Quote className="w-20 h-20" />
        </div>

        {/* Stars */}
        <div className="flex gap-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          ))}
        </div>

        {/* Quote text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1"
          >
            <p className="text-white text-lg lg:text-xl leading-relaxed mb-8 font-medium">
              &ldquo;{t.quote}&rdquo;
            </p>

            <div className="flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: `${t.color}30`, border: `1px solid ${t.color}40` }}
              >
                {t.initials}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-slate-500 text-xs">{t.role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation dots */}
        <div className="flex items-center gap-2 mt-8">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="transition-all duration-300"
              style={{
                width: i === active ? 32 : 8,
                height: 8,
                borderRadius: 99,
                background: i === active
                  ? 'linear-gradient(90deg, #7c3aed, #a855f7)'
                  : 'rgba(255,255,255,0.1)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

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
    <section id="commitments" className="py-28 relative overflow-hidden">

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
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 tracking-tight">
            {t('commit.title')}{' '}
            <span className="gradient-text">{t('commit.title.bold')}</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            {t('commit.subtitle')}
          </p>
        </motion.div>

        {/* Two-column: testimonial + commitments */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* Testimonial carousel */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <TestimonialCarousel />
          </motion.div>

          {/* Commitments grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {commitments.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
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

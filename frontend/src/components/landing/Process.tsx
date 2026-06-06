'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  MessageSquare, Palette, Code2, Eye, Wrench, Rocket,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import WordReveal from '@/components/ui/WordReveal';

const STEP_ICONS = [MessageSquare, Palette, Code2, Eye, Wrench, Rocket];
const STEP_COLORS = ['#7c3aed', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

function TimelineStep({ step, index, total }: {
  step: { num: string; title: string; desc: string };
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const Icon = STEP_ICONS[index];
  const color = STEP_COLORS[index];
  const isLast = index === total - 1;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex gap-6"
    >
      {/* Timeline track */}
      <div className="flex flex-col items-center shrink-0">
        {/* Dot */}
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background: `${color}18`,
            border: `1.5px solid ${color}40`,
            boxShadow: `0 0 24px ${color}15`,
          }}
        >
          <Icon className="w-5 h-5" style={{ color }} strokeWidth={1.8} />
        </motion.div>

        {/* Connector line */}
        {!isLast && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
            className="w-px flex-1 origin-top"
            style={{
              background: `linear-gradient(to bottom, ${color}40, rgba(255,255,255,0.06))`,
              minHeight: 40,
            }}
          />
        )}
      </div>

      {/* Card */}
      <div className="group flex-1 pb-10">
        <div
          className="rounded-2xl p-6 lg:p-8 relative overflow-hidden transition-all duration-300"
          style={{
            background: 'rgba(10,10,16,0.88)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 50px rgba(0,0,0,0.25)',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.borderColor = `${color}30`;
            el.style.boxShadow = `0 1px 0 rgba(255,255,255,0.06) inset, 0 20px 60px rgba(0,0,0,0.35), 0 0 40px ${color}08`;
            el.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.borderColor = 'rgba(255,255,255,0.07)';
            el.style.boxShadow = '0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 50px rgba(0,0,0,0.25)';
            el.style.transform = 'translateY(0)';
          }}
        >
          {/* Top accent line on hover */}
          <div
            className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }}
          />

          {/* Watermark number */}
          <div
            className="absolute top-2 right-4 font-black leading-none select-none pointer-events-none"
            style={{
              fontSize: 'clamp(60px, 8vw, 100px)',
              lineHeight: 0.85,
              background: `linear-gradient(135deg, ${color}12, transparent)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {step.num}
          </div>

          <div className="relative z-10">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: `${color}90` }}>
              Step {step.num}
            </p>
            <h3 className="text-xl font-bold text-white mb-3 leading-snug tracking-tight">
              {step.title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-md">{step.desc}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HorizontalStep({ step, index, total }: {
  step: { num: string; title: string; desc: string };
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const Icon = STEP_ICONS[index];
  const color = STEP_COLORS[index];
  const isLast = index === total - 1;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center text-center group"
    >
      {/* Top connector + dot */}
      <div className="flex items-center w-full mb-6">
        {index > 0 && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex-1 h-px origin-left"
            style={{ background: `linear-gradient(90deg, rgba(255,255,255,0.06), ${color}40)` }}
          />
        )}
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 mx-auto group-hover:scale-110 transition-transform duration-300"
          style={{
            background: `${color}15`,
            border: `1.5px solid ${color}35`,
            boxShadow: `0 0 28px ${color}12`,
          }}
        >
          <Icon className="w-5.5 h-5.5" style={{ color }} strokeWidth={1.8} />
        </motion.div>
        {!isLast && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.25 }}
            className="flex-1 h-px origin-left"
            style={{ background: `linear-gradient(90deg, ${color}40, rgba(255,255,255,0.06))` }}
          />
        )}
      </div>

      <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: `${color}80` }}>
        Step {step.num}
      </p>
      <h3 className="text-base font-bold text-white mb-2 leading-snug tracking-tight">
        {step.title}
      </h3>
      <p className="text-slate-500 text-xs leading-relaxed max-w-[180px]">{step.desc}</p>
    </motion.div>
  );
}

export default function Process() {
  const { t } = useLanguage();
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' });

  const steps = [
    { num: '01', title: t('process.s1.title'), desc: t('process.s1.desc') },
    { num: '02', title: t('process.s2.title'), desc: t('process.s2.desc') },
    { num: '03', title: t('process.s3.title'), desc: t('process.s3.desc') },
    { num: '04', title: t('process.s4.title'), desc: t('process.s4.desc') },
    { num: '05', title: t('process.s5.title'), desc: t('process.s5.desc') },
    { num: '06', title: t('process.s6.title'), desc: t('process.s6.desc') },
  ];

  return (
    <section id="process" className="py-32 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 ambient-grid opacity-20" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.05) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">

        {/* Header */}
        <div ref={headerRef} className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center mb-7"
          >
            <span className="section-label">{t('process.eyebrow')}</span>
          </motion.div>

          <WordReveal
            text={`${t('process.title')} ${t('process.title.bold')}`}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-5 tracking-tight leading-[1.04]"
            delay={0.1}
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="text-slate-500 max-w-lg mx-auto text-lg leading-relaxed"
          >
            {t('process.subtitle')}
          </motion.p>
        </div>

        {/* Desktop: horizontal timeline */}
        <div className="hidden lg:grid lg:grid-cols-6 gap-2">
          {steps.map((step, i) => (
            <HorizontalStep key={step.num} step={step} index={i} total={steps.length} />
          ))}
        </div>

        {/* Mobile/Tablet: vertical timeline */}
        <div className="lg:hidden max-w-xl mx-auto">
          {steps.map((step, i) => (
            <TimelineStep key={step.num} step={step} index={i} total={steps.length} />
          ))}
        </div>
      </div>
    </section>
  );
}

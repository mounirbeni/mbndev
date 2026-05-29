'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

/* ─────────────────────────────────────────────────────────────────────────────
   A linear narrative — each step is a chapter, connected by a vertical thread.
   The number is present but not loud. The title takes the stage.
───────────────────────────────────────────────────────────────────────────── */

function TimelineStep({
  num,
  title,
  desc,
  index,
  isLast,
}: {
  num: string;
  title: string;
  desc: string;
  index: number;
  isLast: boolean;
}) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-[32px_1fr] sm:grid-cols-[80px_1fr] gap-6 sm:gap-10"
    >
      {/* ── Left: connector column ── */}
      <div className="flex flex-col items-center">
        {/* Step dot */}
        <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1"
          style={{
            background: inView ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
            border:     '1px solid rgba(124,58,237,0.3)',
            transition: 'background 0.4s ease 0.3s',
          }}>
          <span className="text-[10px] font-black tabular-nums" style={{ color: 'rgba(168,85,247,0.9)' }}>
            {num}
          </span>
        </div>
        {/* Connector line */}
        {!isLast && (
          <div className="flex-1 w-px mt-3" style={{ background: 'rgba(255,255,255,0.06)' }} />
        )}
      </div>

      {/* ── Right: content ── */}
      <div className={isLast ? 'pb-0' : 'pb-14 sm:pb-16'}>
        <h3 className="font-black text-white leading-tight tracking-tight mb-3"
          style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)' }}>
          {title}
        </h3>
        <p className="text-slate-500 text-[15px] leading-relaxed max-w-lg">{desc}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Section
───────────────────────────────────────────────────────────────────────────── */

export default function Process() {
  const { t }      = useLanguage();
  const headerRef  = useRef<HTMLDivElement>(null);
  const headerView = useInView(headerRef, { once: true, margin: '-80px' });

  const steps = [
    { num: '01', title: t('process.s1.title'), desc: t('process.s1.desc') },
    { num: '02', title: t('process.s2.title'), desc: t('process.s2.desc') },
    { num: '03', title: t('process.s3.title'), desc: t('process.s3.desc') },
    { num: '04', title: t('process.s4.title'), desc: t('process.s4.desc') },
    { num: '05', title: t('process.s5.title'), desc: t('process.s5.desc') },
    { num: '06', title: t('process.s6.title'), desc: t('process.s6.desc') },
  ];

  return (
    <section id="process" className="relative overflow-hidden"
      style={{ paddingTop: '7rem', paddingBottom: '7rem' }}>

      {/* Single light source — comes from bottom-right, like a late-afternoon angle */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 100% 100%, rgba(124,58,237,0.07) 0%, transparent 65%)',
        }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">

        {/* ── Header ── */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 lg:mb-24"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] mb-5"
            style={{ color: 'rgba(124,58,237,0.7)' }}>
            {t('process.eyebrow')}
          </p>
          <h2 className="font-black text-white tracking-tight leading-[1.04] max-w-xl"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>
            {t('process.title')}{' '}
            <span className="gradient-text">{t('process.title.bold')}</span>
          </h2>
          <p className="text-slate-500 mt-5 text-lg max-w-lg leading-relaxed">
            {t('process.subtitle')}
          </p>
        </motion.div>

        {/* ── Timeline ── */}
        <div>
          {steps.map((step, i) => (
            <TimelineStep
              key={step.num}
              num={step.num}
              title={step.title}
              desc={step.desc}
              index={i}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

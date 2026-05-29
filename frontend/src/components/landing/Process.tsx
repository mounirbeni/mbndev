'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLanguage } from '@/contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function StepNumber({ n }: { n: string }) {
  return (
    <span
      className="font-black leading-none tabular-nums select-none"
      style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(168,85,247,0.06) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {n}
    </span>
  );
}

function Step({ step, index }: { step: { num: string; title: string; desc: string }; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-3xl overflow-hidden premium-surface p-8 lg:p-10"
    >
      {/* Top beam on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.55), transparent)' }}
      />

      {/* Watermark number */}
      <div
        className="absolute top-0 right-0 leading-none select-none pointer-events-none"
        style={{ fontSize: 'clamp(88px, 11vw, 140px)', lineHeight: 0.85 }}
      >
        <StepNumber n={step.num} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div
          className="inline-flex items-center justify-center w-10 h-10 rounded-2xl mb-6 shrink-0"
          style={{
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.22)',
          }}
        >
          <span className="text-xs font-bold text-violet-400 tabular-nums">{step.num}</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-3 leading-snug tracking-tight">
          {step.title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
      </div>
    </motion.div>
  );
}

export default function Process() {
  const { t } = useLanguage();
  const headerRef  = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' });

  // GSAP: stagger-reveal each step card on scroll
  useGSAP(() => {
    gsap.fromTo('.process-step',
      { opacity: 0, x: -24 },
      {
        opacity: 1, x: 0,
        duration: 0.65,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.process-steps-grid',
          start: 'top 85%',
          once: true,
        },
      }
    );
  }, { scope: sectionRef });

  const steps = [
    { num: '01', title: t('process.s1.title'), desc: t('process.s1.desc') },
    { num: '02', title: t('process.s2.title'), desc: t('process.s2.desc') },
    { num: '03', title: t('process.s3.title'), desc: t('process.s3.desc') },
    { num: '04', title: t('process.s4.title'), desc: t('process.s4.desc') },
    { num: '05', title: t('process.s5.title'), desc: t('process.s5.desc') },
    { num: '06', title: t('process.s6.title'), desc: t('process.s6.desc') },
  ];

  return (
    <section ref={sectionRef} id="process" className="py-32 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 ambient-grid opacity-20" />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.05) 0%, transparent 70%)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">

        {/* ── Header ── */}
        <div ref={headerRef} className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center mb-7"
          >
            <span className="section-label">{t('process.eyebrow')}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-5 tracking-tight leading-[1.04]"
          >
            {t('process.title')}{' '}
            <span className="gradient-text">{t('process.title.bold')}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="text-slate-500 max-w-lg mx-auto text-lg leading-relaxed"
          >
            {t('process.subtitle')}
          </motion.p>
        </div>

        {/* ── Steps grid ── */}
        <div className="process-steps-grid grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {steps.map((step, i) => (
            <div key={step.num} className="process-step" style={{ opacity: 0 }}>
              <Step step={step} index={i} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

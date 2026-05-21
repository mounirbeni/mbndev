'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

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
        <div className="absolute inset-0 ambient-grid opacity-15" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(201,168,76,0.03) 0%, transparent 70%)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">

        {/* ── Header ── */}
        <div ref={headerRef} className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center mb-8"
          >
            <span className="section-label">{t('process.eyebrow')}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.04]"
          >
            {t('process.title')}{' '}
            <span className="gold-text-gradient font-display italic">{t('process.title.bold')}</span>
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

        {/* ── Steps: alternating layout on desktop ── */}
        <div className="space-y-0">
          {steps.map((step, i) => {
            const isEven = i % 2 === 0;
            const stepRef = useRef<HTMLDivElement>(null);
            const inView = useInView(stepRef, { once: true, margin: '-60px' });

            return (
              <motion.div
                key={step.num}
                ref={stepRef}
                initial={{ opacity: 0, x: isEven ? -32 : 32 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-0 lg:gap-0`}
              >
                {/* Left / Right content block */}
                <div className={`flex-1 py-12 lg:py-16 ${isEven ? 'lg:pr-20 lg:text-right' : 'lg:pl-20 lg:text-left'} text-left px-4 lg:px-0`}>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.2 }}
                  >
                    <p className="font-display font-semibold text-xs tracking-[0.25em] uppercase mb-4 gold-text-gradient">
                      Step {step.num}
                    </p>
                    <h3 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-slate-500 text-base leading-relaxed max-w-sm">
                      {step.desc}
                    </p>
                  </motion.div>
                </div>

                {/* Center number column */}
                <div className="hidden lg:flex flex-col items-center shrink-0 w-32 relative">
                  {/* Vertical line above */}
                  {i > 0 && (
                    <div
                      className="w-px flex-1 mb-4"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(201,168,76,0.15), rgba(201,168,76,0.05))',
                        minHeight: '40px',
                      }}
                    />
                  )}

                  {/* Number bubble */}
                  <div
                    className="relative w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110"
                    style={{
                      background: 'rgba(201,168,76,0.06)',
                      border: '1px solid rgba(201,168,76,0.2)',
                      boxShadow: '0 0 0 8px rgba(201,168,76,0.03)',
                    }}
                  >
                    <span
                      className="font-display font-bold text-sm tracking-tight"
                      style={{ color: '#d4b86a' }}
                    >
                      {step.num}
                    </span>
                  </div>

                  {/* Vertical line below */}
                  {i < steps.length - 1 && (
                    <div
                      className="w-px mt-4"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(201,168,76,0.05), rgba(201,168,76,0.15))',
                        minHeight: '40px',
                        flex: 1,
                      }}
                    />
                  )}
                </div>

                {/* Right / Left spacer */}
                <div className="flex-1 hidden lg:block" />

                {/* Mobile: show step number inline */}
                <div className="lg:hidden flex items-center gap-3 px-4 pb-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.18)' }}
                  >
                    <span className="font-display font-bold text-xs" style={{ color: '#d4b86a' }}>
                      {step.num}
                    </span>
                  </div>
                  <div className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.1)' }} />
                </div>

                {/* Watermark giant number — desktop only */}
                <div
                  className={`hidden lg:block absolute pointer-events-none select-none ${isEven ? 'left-0' : 'right-0'}`}
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                >
                  <span
                    className="luxury-number font-display font-bold"
                    style={{ fontSize: 'clamp(100px, 12vw, 180px)', opacity: 0.6 }}
                  >
                    {step.num}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-center mt-20"
        >
          <div className="luxury-divider max-w-xs mx-auto mb-8" />
          <p className="font-display italic text-slate-500 text-lg">
            "From first call to final launch — we own every step."
          </p>
        </motion.div>

      </div>
    </section>
  );
}

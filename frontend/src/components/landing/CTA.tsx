'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/* ─────────────────────────────────────────────────────────────────────────────
   The closing scene. One idea. One light source. One action.
   No cards, no feature lists, no info blocks.
───────────────────────────────────────────────────────────────────────────── */

export default function CTA() {
  const { t }   = useLanguage();
  const ref     = useRef<HTMLDivElement>(null);
  const inView  = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="contact" className="relative overflow-hidden"
      style={{ paddingTop: '10rem', paddingBottom: '10rem' }}>

      {/* ── Stage lighting — single upward column of violet light ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary beam — centred, rising */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-full"
          style={{
            background: 'linear-gradient(to top, rgba(124,58,237,0.35) 0%, rgba(124,58,237,0.12) 40%, transparent 75%)',
          }} />
        {/* Halo around the beam */}
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px]"
          style={{
            background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(124,58,237,0.16) 0%, transparent 65%)',
          }} />
        {/* Secondary warm haze — offset right */}
        <div className="absolute bottom-[-5%] left-[60%] w-[400px] h-[400px]"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, rgba(59,130,246,0.07) 0%, transparent 65%)',
          }} />
      </div>

      {/* ── Thin top horizon line ── */}
      <div className="absolute top-0 left-1/4 right-1/4 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

      {/* ── Content — centred, minimal ── */}
      <div ref={ref} className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-[10px] font-bold uppercase tracking-[0.28em] mb-10"
          style={{ color: 'rgba(124,58,237,0.7)' }}
        >
          {t('cta.badge')}
        </motion.p>

        {/* The headline — this IS the design */}
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="font-black text-white tracking-tight leading-[1.03] mb-8"
          style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}
        >
          {t('cta.title')}
        </motion.h2>

        {/* Supporting line — understated */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="text-slate-400 text-lg leading-relaxed max-w-lg mx-auto mb-14"
        >
          {t('cta.body')}
        </motion.p>

        {/* ── Actions — two weights of action ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Primary CTA */}
          <Link href="/request">
            <button
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl
                         text-[15px] font-bold text-white transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow:  '0 8px 32px rgba(124,58,237,0.4), 0 1px 0 rgba(255,255,255,0.1) inset',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = '0 14px 40px rgba(124,58,237,0.55), 0 1px 0 rgba(255,255,255,0.12) inset';
                el.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = '0 8px 32px rgba(124,58,237,0.4), 0 1px 0 rgba(255,255,255,0.1) inset';
                el.style.transform = 'none';
              }}
            >
              {t('cta.start')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>

          {/* Secondary — text weight only */}
          <a
            href="https://wa.me/212705914424"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl
                       text-[15px] font-semibold transition-all duration-200"
            style={{
              color:      'rgba(148,163,184,0.85)',
              background: 'rgba(255,255,255,0.03)',
              border:     '1px solid rgba(255,255,255,0.08)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.color       = '#fff';
              el.style.borderColor = 'rgba(255,255,255,0.15)';
              el.style.background  = 'rgba(255,255,255,0.06)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.color       = 'rgba(148,163,184,0.85)';
              el.style.borderColor = 'rgba(255,255,255,0.08)';
              el.style.background  = 'rgba(255,255,255,0.03)';
            }}
          >
            <MessageCircle className="w-4 h-4" />
            {t('cta.whatsapp')}
          </a>
        </motion.div>

        {/* ── Contact email — typographic, not a button ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.42 }}
          className="mt-14 flex items-center justify-center gap-3"
          style={{ color: 'rgba(100,116,139,0.6)' }}
        >
          <div className="h-px w-12" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <a
            href="mailto:contact@mbndev.ma"
            className="text-sm font-medium tracking-wide transition-colors duration-200"
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(168,85,247,0.9)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(100,116,139,0.6)')}
          >
            contact@mbndev.ma
          </a>
          <div className="h-px w-12" style={{ background: 'rgba(255,255,255,0.1)' }} />
        </motion.div>

      </div>

      {/* ── Bottom fade — transitions into footer ── */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(4,4,8,0.6))' }} />

    </section>
  );
}

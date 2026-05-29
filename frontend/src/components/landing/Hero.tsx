'use client';

/**
 * Hero — "The Mark on Stage"
 *
 * Architectural concept: a split-screen composition where the 3D brand mark
 * commands the right half of the viewport and the left carries the minimum
 * necessary text — label, headline, one sentence, one CTA.
 *
 * The mark IS the hero. The text is the title card.
 * Reference: Apple product reveals, Tesla homepage, Linear, Vercel.
 */

import { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Three.js scene — SSR-safe dynamic import
const HeroScene3D = dynamic(() => import('@/components/ui/HeroScene3D'), {
  ssr: false,
  loading: () => <div className="absolute inset-0" style={{ background: '#06050f' }} />,
});

/* ─────────────────────────────────────────────────────────────────────────── */

export default function Hero() {
  const { t } = useLanguage();

  // Refs passed directly to the Three.js rig — no Framer Motion overhead
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);
  const scrollYRef = useRef(0);

  // Scroll-driven fade for the text column only
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const textOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const textY       = useTransform(scrollYProgress, [0, 0.45], ['0%', '8%']);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      mouseXRef.current = (e.clientX / window.innerWidth)  - 0.5;
      mouseYRef.current = (e.clientY / window.innerHeight) - 0.5;
    };
    const onScroll = () => { scrollYRef.current = window.scrollY; };
    window.addEventListener('mousemove', onMouse,  { passive: true });
    window.addEventListener('scroll',   onScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('scroll',   onScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative overflow-hidden"
      style={{
        height:     '100dvh',
        minHeight:  '600px',
        background: '#06050f',
      }}
    >

      {/* ── THE STAGE ─────────────────────────────────────────────────────
          Full-bleed 3D canvas. No containers. No padding. Edge to edge.
      ──────────────────────────────────────────────────────────────────── */}
      <HeroScene3D mouseX={mouseXRef} mouseY={mouseYRef} scrollY={scrollYRef} />

      {/* Left-side vignette — text stays readable against any lighting */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(100deg, rgba(6,5,15,0.96) 0%, rgba(6,5,15,0.82) 28%, rgba(6,5,15,0.3) 52%, transparent 70%)',
        }}
      />
      {/* Bottom vignette — grounds the composition */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
        style={{
          height: '28%',
          background: 'linear-gradient(to top, rgba(6,5,15,0.9) 0%, transparent 100%)',
        }}
      />

      {/* ── TEXT COLUMN ───────────────────────────────────────────────────
          Left third of the viewport. Vertically centred.
          Fades and lifts as the user scrolls into the next section.
      ──────────────────────────────────────────────────────────────────── */}
      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="absolute inset-0 z-20 flex items-center pointer-events-none"
      >
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
          <div className="max-w-[520px]">

            {/* Label — sparse, barely there */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 pointer-events-auto"
              style={{
                fontSize:      '10px',
                fontWeight:    700,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color:         'rgba(168,85,247,0.7)',
                display:       'flex',
                alignItems:    'center',
                gap:           '10px',
              }}
            >
              <span style={{
                display:    'inline-block',
                width:      28,
                height:     1,
                background: 'rgba(168,85,247,0.5)',
              }} />
              Premium Web Development
            </motion.p>

            {/* Headline — the only large type on screen */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-white tracking-tight leading-[1.03] mb-7 pointer-events-auto"
              style={{ fontSize: 'clamp(2.6rem, 5.5vw, 5rem)', fontWeight: 900 }}
            >
              {t('hero.title.line1')}{' '}
              <br className="hidden sm:block" />
              {t('hero.title.line2a')}{' '}
              <span style={{
                background:             'linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #3b82f6 100%)',
                WebkitBackgroundClip:   'text',
                WebkitTextFillColor:    'transparent',
                backgroundClip:         'text',
              }}>
                {t('hero.title.elevate')}
              </span>
            </motion.h1>

            {/* One sentence — nothing more */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="mb-10 pointer-events-auto"
              style={{
                fontSize:   'clamp(0.95rem, 1.5vw, 1.1rem)',
                lineHeight: 1.7,
                color:      'rgba(148,163,184,0.8)',
                maxWidth:   420,
              }}
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* CTAs — one solid, one ghost */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-5 mb-14 pointer-events-auto"
            >
              <Link href="/request">
                <button
                  className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-white text-[14px] transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    boxShadow:  '0 6px 24px rgba(124,58,237,0.45)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = '0 10px 36px rgba(124,58,237,0.65)';
                    el.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = '0 6px 24px rgba(124,58,237,0.45)';
                    el.style.transform = 'none';
                  }}
                >
                  {t('hero.cta.primary')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>

              <a
                href="#portfolio"
                className="text-[14px] font-medium transition-colors duration-200"
                style={{ color: 'rgba(148,163,184,0.6)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(148,163,184,0.6)')}
              >
                {t('hero.cta.secondary')} →
              </a>
            </motion.div>

            {/* Social proof — numbers only, no cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.72 }}
              className="flex items-center gap-7 pointer-events-auto"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20 }}
            >
              {[
                { val: '34+', label: 'Clients'  },
                { val: '98%', label: 'On Time'  },
                { val: '5.0', label: 'Rating'   },
                { val: '40+', label: 'Projects' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-white font-black text-lg tabular-nums leading-none">{s.val}</div>
                  <div className="mt-1 text-[11px]" style={{ color: 'rgba(100,116,139,0.65)' }}>{s.label}</div>
                </div>
              ))}
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* ── Scroll indicator ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        style={{ color: 'rgba(100,116,139,0.5)' }}
      >
        <div
          className="w-px"
          style={{
            height:     36,
            background: 'linear-gradient(to bottom, rgba(124,58,237,0.6), transparent)',
          }}
        />
        <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
          Scroll
        </span>
      </motion.div>

    </section>
  );
}

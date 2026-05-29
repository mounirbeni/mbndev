'use client';

/**
 * Hero — Cinematic split composition
 *
 * The artwork dominates the right side of the viewport.
 * Content lives on the left, in the natural darkness of the image.
 * No hard edges. No borders. One continuous scene.
 *
 * Image path: /hero-artwork.jpg  (save the provided artwork there)
 */

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/* ── Stats ────────────────────────────────────────────────────────────────── */
const STATS = [
  { val: '34+', label: 'Clients'   },
  { val: '98%', label: 'On Time'   },
  { val: '5.0', label: 'Rating'    },
  { val: '40+', label: 'Projects'  },
];

/* ── Main component ─────────────────────────────────────────────────────────
   Layout:  [  content 42%  |  artwork 58%  ]  on desktop
            [  artwork 45vh  →  content  ]  on mobile
──────────────────────────────────────────────────────────────────────────── */
export default function Hero() {
  const { t } = useLanguage();

  /* Scroll-driven parallax — content drifts up, artwork retreats */
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target:  sectionRef,
    offset: ['start start', 'end start'],
  });
  const contentY  = useTransform(scrollYProgress, [0, 1], ['0%',  '14%']);
  const contentOp = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const artworkY  = useTransform(scrollYProgress, [0, 1], ['0%',  '6%']);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative overflow-hidden"
      style={{
        height:     '100dvh',
        minHeight:  '600px',
        background: '#060510',
      }}
    >

      {/* ── ARTWORK — right side, full height ─────────────────────────────
          Positioned as an overlay that fills the right portion.
          On mobile it covers the full top half.
          Multiple gradient masks blend it seamlessly into the background.
      ─────────────────────────────────────────────────────────────────── */}
      <motion.div
        style={{ y: artworkY }}
        className="absolute inset-0 lg:left-[38%]"
      >
        <Image
          src="/hero.png"
          alt="MBN DEV — Premium digital craft"
          fill
          priority
          quality={95}
          sizes="(max-width: 1024px) 100vw, 62vw"
          className="object-cover object-[68%_center] lg:object-[62%_center]"
        />

        {/* Left blend — the primary integration gradient
            Fully opaque on left → fully transparent on right.
            This is how the image "grows from" the dark background. */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(95deg, #060510 0%, rgba(6,5,16,0.92) 12%, rgba(6,5,16,0.55) 28%, rgba(6,5,16,0.15) 48%, transparent 65%)',
          }}
        />

        {/* Top vignette — grounds the sky */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(6,5,16,0.75) 0%, rgba(6,5,16,0.2) 18%, transparent 40%)',
          }}
        />

        {/* Bottom vignette — connects to the next section */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, #060510 0%, rgba(6,5,16,0.7) 12%, rgba(6,5,16,0.2) 28%, transparent 45%)',
          }}
        />

        {/* Mobile-only: extra bottom fade so content is readable below */}
        <div
          className="absolute bottom-0 left-0 right-0 lg:hidden"
          style={{ height: '55%', background: 'linear-gradient(to top, #060510 40%, transparent)' }}
        />
      </motion.div>

      {/* ── CONTENT — left zone, vertically centred ───────────────────────
          Sits on top of the gradient-masked dark left portion of the artwork.
          Feels like text floating inside the scene, not on top of an image.
      ─────────────────────────────────────────────────────────────────── */}
      <motion.div
        style={{ y: contentY, opacity: contentOp }}
        className="relative z-10 h-full flex items-center"
      >
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="pt-24 pb-16 lg:pt-0 lg:pb-0 max-w-[540px]">

            {/* Studio label */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 mb-9"
            >
              <div style={{ width: 24, height: 1, background: 'rgba(168,85,247,0.6)' }} />
              <span style={{
                fontSize:      '10px',
                fontWeight:    700,
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                color:         'rgba(168,85,247,0.75)',
              }}>
                Premium Web Development
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-white tracking-tight leading-[1.08] mb-7"
              style={{ fontSize: 'clamp(2.4rem, 3.6vw, 3.75rem)', fontWeight: 900 }}
            >
              {t('hero.title.line1')}{' '}
              {t('hero.title.line2a')}{' '}
              <span style={{
                background:           'linear-gradient(135deg, #c084fc 0%, #9333ea 50%, #6366f1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
                backgroundClip:       'text',
              }}>
                {t('hero.title.elevate')}
              </span>{' '}
              {t('hero.title.line2b')}{' '}
              <span style={{
                background:           'linear-gradient(135deg, #c084fc 0%, #9333ea 50%, #6366f1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
                backgroundClip:       'text',
              }}>
                {t('hero.title.business')}
              </span>
            </motion.h1>

            {/* Subtitle — restrained, one breath */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize:   'clamp(0.95rem, 1.4vw, 1.05rem)',
                lineHeight: 1.75,
                color:      'rgba(148,163,184,0.75)',
                maxWidth:   420,
                marginBottom: 40,
              }}
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.46, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-5 mb-14"
            >
              <Link href="/request">
                <button
                  className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-white transition-all duration-300"
                  style={{
                    fontSize:   '14px',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    boxShadow:  '0 6px 28px rgba(124,58,237,0.45), 0 1px 0 rgba(255,255,255,0.1) inset',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = '0 10px 40px rgba(124,58,237,0.65), 0 1px 0 rgba(255,255,255,0.14) inset';
                    el.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = '0 6px 28px rgba(124,58,237,0.45), 0 1px 0 rgba(255,255,255,0.1) inset';
                    el.style.transform = 'none';
                  }}
                >
                  {t('hero.cta.primary')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>

              <a
                href="#portfolio"
                style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(148,163,184,0.55)', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(148,163,184,0.55)')}
              >
                {t('hero.cta.secondary')} →
              </a>
            </motion.div>

            {/* Proof — four numbers, no cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.65 }}
              className="flex items-center gap-8"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 22 }}
            >
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.06, duration: 0.5 }}
                >
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(100,116,139,0.65)', marginTop: 5 }}>
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* ── Scroll indicator ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2.5"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(124,58,237,0.7), transparent)' }}
        />
        <span style={{ fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, color: 'rgba(100,116,139,0.5)' }}>
          Scroll
        </span>
      </motion.div>

    </section>
  );
}

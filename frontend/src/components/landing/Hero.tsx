'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Users, Rocket, TrendingUp, Shield, Play } from 'lucide-react';
import { useRef } from 'react';

/* ── Bottom stats — matching reference ───────────────────────────────────── */
const STATS = [
  { icon: Users,      val: '50+',  label: 'Happy Clients'       },
  { icon: Rocket,     val: '120+', label: 'Projects Delivered'  },
  { icon: TrendingUp, val: '98%',  label: 'Client Satisfaction' },
  { icon: Shield,     val: '5+',   label: 'Years of Experience' },
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const contentY  = useTransform(scrollYProgress, [0, 1], ['0%',  '12%']);
  const contentOp = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const imageY    = useTransform(scrollYProgress, [0, 1], ['0%',  '5%']);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative overflow-hidden"
      style={{ height: '100dvh', minHeight: '640px', background: '#07060f' }}
    >

      {/* ── FULL-BLEED ARTWORK ────────────────────────────────────────────── */}
      <motion.div style={{ y: imageY }} className="absolute inset-0">
        <Image
          src="/hero.png"
          alt="MBN DEV"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover object-[60%_center]"
        />

        {/* Left dark gradient — text lives here */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(100deg, rgba(7,6,15,0.97) 0%, rgba(7,6,15,0.88) 22%, rgba(7,6,15,0.6) 42%, rgba(7,6,15,0.2) 62%, transparent 78%)',
        }} />

        {/* Top vignette */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(7,6,15,0.55) 0%, transparent 22%)',
        }} />

        {/* Bottom vignette — fades into stats bar */}
        <div className="absolute bottom-0 left-0 right-0" style={{
          height: '45%',
          background: 'linear-gradient(to top, rgba(7,6,15,0.98) 0%, rgba(7,6,15,0.6) 35%, transparent 70%)',
        }} />
      </motion.div>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <motion.div
        style={{ opacity: contentOp, y: contentY }}
        className="absolute inset-0 z-10 flex flex-col"
      >
        {/* Main content area — grows to fill space above stats */}
        <div className="flex-1 flex items-center px-6 sm:px-10 lg:px-14 xl:px-20">
          <div className="max-w-[580px] w-full">

            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="flex items-center gap-3 mb-8"
            >
              <div style={{ width: 28, height: 1, background: 'rgba(139,92,246,0.65)' }} />
              <span style={{
                fontSize: '10.5px', fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'rgba(139,92,246,0.85)',
              }}>
                Premium Web Development Company
              </span>
            </motion.div>

            {/* Headline — 3 clean lines matching reference */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(2.6rem, 4.2vw, 4.4rem)',
                fontWeight: 900,
                lineHeight: 1.04,
                letterSpacing: '-0.02em',
                marginBottom: 24,
                color: '#fff',
              }}
            >
              We build<br />
              digital experiences<br />
              that{' '}
              <span style={{
                background: 'linear-gradient(135deg, #c084fc 0%, #9333ea 50%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                drive real impact.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(0.9rem, 1.3vw, 1rem)',
                lineHeight: 1.75,
                color: 'rgba(148,163,184,0.78)',
                maxWidth: 480,
                marginBottom: 40,
              }}
            >
              We design and develop high-performance websites, SaaS platforms
              and digital products for ambitious brands and modern businesses.
            </motion.p>

            {/* CTAs — matching reference buttons */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4 flex-wrap"
            >
              {/* Primary: dark bordered solid */}
              <Link href="/request">
                <button
                  className="flex items-center gap-2.5 transition-all duration-200"
                  style={{
                    padding:       '13px 28px',
                    background:    'rgba(124,58,237,0.15)',
                    border:        '1px solid rgba(124,58,237,0.55)',
                    borderRadius:  '8px',
                    color:         '#fff',
                    fontSize:      '12px',
                    fontWeight:    700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background   = 'rgba(124,58,237,0.28)';
                    el.style.borderColor  = 'rgba(168,85,247,0.7)';
                    el.style.transform    = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background  = 'rgba(124,58,237,0.15)';
                    el.style.borderColor = 'rgba(124,58,237,0.55)';
                    el.style.transform   = 'none';
                  }}
                >
                  Start Your Project
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </Link>

              {/* Secondary: ghost with circle play icon */}
              <a
                href="#portfolio"
                className="flex items-center gap-3 transition-all duration-200 group"
                style={{
                  padding:       '13px 24px',
                  background:    'transparent',
                  border:        '1px solid rgba(255,255,255,0.15)',
                  borderRadius:  '8px',
                  color:         'rgba(255,255,255,0.7)',
                  fontSize:      '12px',
                  fontWeight:    700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'rgba(255,255,255,0.35)';
                  el.style.color       = '#fff';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'rgba(255,255,255,0.15)';
                  el.style.color       = 'rgba(255,255,255,0.7)';
                }}
              >
                View Our Work
                <span
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 26, height: 26,
                    border: '1px solid rgba(255,255,255,0.3)',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <Play className="w-3 h-3 fill-current" />
                </span>
              </a>
            </motion.div>

          </div>
        </div>

        {/* ── STATS BAR — bottom, full width ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="shrink-0 hidden lg:flex"
          style={{
            background:           'rgba(7,6,15,0.82)',
            backdropFilter:       'blur(24px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
            borderTop:            '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex-1 flex items-center gap-4 py-6"
                style={{
                  padding:     '22px 0 22px',
                  paddingLeft: i === 0 ? '5rem' : '2.5rem',
                  borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                }}
              >
                <div
                  className="flex items-center justify-center rounded-xl shrink-0"
                  style={{
                    width: 40, height: 40,
                    background: 'rgba(124,58,237,0.12)',
                    border:     '1px solid rgba(124,58,237,0.2)',
                  }}
                >
                  <Icon className="w-4 h-4 text-violet-400" strokeWidth={1.8} />
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(148,163,184,0.6)', marginTop: 4 }}>
                    {s.label}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Mobile stats — inline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="lg:hidden shrink-0 flex justify-around px-6 py-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(7,6,15,0.9)' }}
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>{s.val}</div>
              <div style={{ fontSize: '10px', color: 'rgba(148,163,184,0.6)', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-[88px] lg:bottom-[100px] left-1/2 -translate-x-1/2 z-20 hidden lg:flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: 1, height: 32, background: 'linear-gradient(to bottom, rgba(124,58,237,0.6), transparent)' }}
        />
        <span style={{ fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, color: 'rgba(100,116,139,0.5)' }}>
          Scroll
        </span>
      </motion.div>

    </section>
  );
}

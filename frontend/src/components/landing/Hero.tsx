'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Users, Rocket, TrendingUp, Shield, Play } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';

const STATS = [
  { icon: Users,      val: 50,   suffix: '+', label: 'Happy Clients'       },
  { icon: Rocket,     val: 120,  suffix: '+', label: 'Projects Delivered'  },
  { icon: TrendingUp, val: 98,   suffix: '%', label: 'Client Satisfaction' },
  { icon: Shield,     val: 5,    suffix: '+', label: 'Years of Experience' },
];

const ROTATING_PHRASES = [
  'drive real impact.',
  'convert more visitors.',
  'scale your business.',
  'stand out online.',
];

function AnimatedCounter({ val, suffix }: { val: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1800;
        const steps = 60;
        const increment = val / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= val) {
            setCount(val);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [val]);

  return <div ref={ref}>{count}{suffix}</div>;
}

function RotatingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'linear-gradient(135deg, #c084fc 0%, #9333ea 40%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'inline-block',
          }}
        >
          {ROTATING_PHRASES[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function FloatingOrb({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`absolute rounded-full pointer-events-none ${className}`} style={style} />;
}

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

      {/* ── ANIMATED GRADIENT ORBS ─────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingOrb
          className="animate-float-a"
          style={{
            width: 600, height: 600,
            top: '-10%', left: '-5%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <FloatingOrb
          className="animate-float-b"
          style={{
            width: 500, height: 500,
            top: '20%', right: '-10%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <FloatingOrb
          className="animate-float-a"
          style={{
            width: 400, height: 400,
            bottom: '5%', left: '30%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animationDelay: '-3s',
          }}
        />
      </div>

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

        <div className="absolute inset-0" style={{
          background: 'linear-gradient(100deg, rgba(7,6,15,0.97) 0%, rgba(7,6,15,0.88) 22%, rgba(7,6,15,0.6) 42%, rgba(7,6,15,0.2) 62%, transparent 78%)',
        }} />

        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(7,6,15,0.55) 0%, transparent 22%)',
        }} />

        <div className="absolute bottom-0 left-0 right-0" style={{
          height: '45%',
          background: 'linear-gradient(to top, rgba(7,6,15,0.98) 0%, rgba(7,6,15,0.6) 35%, transparent 70%)',
        }} />
      </motion.div>

      {/* ── AMBIENT GRID ──────────────────────────────────────────────────── */}
      <div className="absolute inset-0 ambient-grid opacity-[0.03] pointer-events-none" />

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <motion.div
        style={{ opacity: contentOp, y: contentY }}
        className="absolute inset-0 z-10 flex flex-col"
      >
        <div className="flex-1 flex items-center px-6 sm:px-10 lg:px-14 xl:px-20 pt-20 lg:pt-24">
          <div className="max-w-[620px] w-full">

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(2.4rem, 4.2vw, 4.2rem)',
                fontWeight: 900,
                lineHeight: 1.06,
                letterSpacing: '-0.025em',
                marginBottom: 24,
                color: '#fff',
              }}
            >
              We build<br />
              digital experiences<br />
              that <RotatingText />
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(0.9rem, 1.3vw, 1.05rem)',
                lineHeight: 1.75,
                color: 'rgba(148,163,184,0.78)',
                maxWidth: 500,
                marginBottom: 40,
              }}
            >
              We design and develop high-performance websites, SaaS platforms
              and digital products for ambitious brands and modern businesses.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4 flex-wrap"
            >
              <Link href="/request">
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative flex items-center gap-2.5 overflow-hidden group"
                  style={{
                    padding:       '14px 32px',
                    background:    'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    borderRadius:  '12px',
                    color:         '#fff',
                    fontSize:      '13px',
                    fontWeight:    700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    boxShadow:     '0 8px 32px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center gap-2.5">
                    Start Your Project
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </motion.button>
              </Link>

              <motion.a
                href="#portfolio"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 group"
                style={{
                  padding:       '14px 28px',
                  background:    'rgba(255,255,255,0.04)',
                  border:        '1px solid rgba(255,255,255,0.12)',
                  borderRadius:  '12px',
                  color:         'rgba(255,255,255,0.7)',
                  fontSize:      '13px',
                  fontWeight:    700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  transition:    'border-color 0.2s, color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'rgba(255,255,255,0.25)';
                  el.style.color       = '#fff';
                  el.style.background  = 'rgba(255,255,255,0.07)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'rgba(255,255,255,0.12)';
                  el.style.color       = 'rgba(255,255,255,0.7)';
                  el.style.background  = 'rgba(255,255,255,0.04)';
                }}
              >
                View Our Work
                <span
                  className="flex items-center justify-center rounded-full transition-colors duration-200 group-hover:bg-white/10"
                  style={{ width: 28, height: 28, border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <Play className="w-3 h-3 fill-current" />
                </span>
              </motion.a>
            </motion.div>
          </div>
        </div>

        {/* ── STATS BAR — desktop ─────────────────────────────────────────── */}
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
                    <AnimatedCounter val={s.val} suffix={s.suffix} />
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(148,163,184,0.6)', marginTop: 4 }}>
                    {s.label}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Mobile stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="lg:hidden shrink-0 flex justify-around px-6 py-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(7,6,15,0.9)' }}
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
                <AnimatedCounter val={s.val} suffix={s.suffix} />
              </div>
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

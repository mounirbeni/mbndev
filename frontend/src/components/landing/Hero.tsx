'use client';

import { useRef, useEffect, useState } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useScroll,
  useInView,
} from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Code2, CheckCircle2, Circle,
  BarChart2, TrendingUp,
} from 'lucide-react';
import {
  SiNextdotjs, SiReact, SiTypescript, SiNodedotjs,
  SiTailwindcss, SiMongodb, SiDocker, SiStripe,
} from 'react-icons/si';
import { useLanguage } from '@/contexts/LanguageContext';

/* ── Stack icons ─────────────────────────────────────────────────────────── */
const stack = [
  { label: 'Next.js',    Icon: SiNextdotjs,   hex: '#ffffff' },
  { label: 'React',      Icon: SiReact,       hex: '#61DAFB' },
  { label: 'TypeScript', Icon: SiTypescript,  hex: '#3178C6' },
  { label: 'Node.js',    Icon: SiNodedotjs,   hex: '#339933' },
  { label: 'Tailwind',   Icon: SiTailwindcss, hex: '#06B6D4' },
  { label: 'MongoDB',    Icon: SiMongodb,     hex: '#47A248' },
  { label: 'Docker',     Icon: SiDocker,      hex: '#2496ED' },
  { label: 'Stripe',     Icon: SiStripe,      hex: '#635BFF' },
];

/* ── Cinematic orbs ──────────────────────────────────────────────────────── */
const orbs = [
  { x: '18%',  y: '22%',  size: 640, color: 'rgba(124,58,237,0.13)',  blur: 160, dur: 14 },
  { x: '72%',  y: '60%',  size: 480, color: 'rgba(59,130,246,0.09)',  blur: 140, dur: 18 },
  { x: '55%',  y: '15%',  size: 360, color: 'rgba(168,85,247,0.07)',  blur: 100, dur: 22 },
  { x: '10%',  y: '70%',  size: 280, color: 'rgba(6,182,212,0.06)',   blur: 90,  dur: 26 },
  { x: '88%',  y: '20%',  size: 220, color: 'rgba(236,72,153,0.05)', blur: 80,  dur: 20 },
];

/* ── Counter animation ───────────────────────────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(start);
    }, 28);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Word-by-word reveal ─────────────────────────────────────────────────── */
function CinematicTitle({ t }: { t: (k: string) => string }) {
  const words1 = t('hero.title.line1').split(' ');
  return (
    <h1 className="text-[2.4rem] sm:text-5xl lg:text-[5.2rem] font-black text-white leading-[1.04] tracking-tight mb-6">
      <span className="block overflow-hidden">
        {words1.map((w, i) => (
          <motion.span
            key={i}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block mr-[0.25em]"
          >
            {w}
          </motion.span>
        ))}
      </span>
      <span className="block overflow-hidden mt-1">
        {[t('hero.title.line2a'), ' '].map((w, i) => (
          <motion.span
            key={i}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.28 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block mr-[0.2em]"
          >
            {w}
          </motion.span>
        ))}
        <motion.span
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block gradient-text"
        >
          {t('hero.title.elevate')}
        </motion.span>
      </span>
      <span className="block overflow-hidden mt-1">
        {[t('hero.title.line2b'), ' '].map((w, i) => (
          <motion.span
            key={i}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.54 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block mr-[0.2em]"
          >
            {w}
          </motion.span>
        ))}
        <motion.span
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.68, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block gradient-text"
        >
          {t('hero.title.business')}
        </motion.span>
      </span>
    </h1>
  );
}

/* ── Desktop mockup ──────────────────────────────────────────────────────── */
function DashboardMockup({ t }: { t: (k: string) => string }) {
  const projects = [
    { name: 'E-Commerce Store',  progress: 100, isLive: true,  bar: '#22c55e' },
    { name: 'Corporate Website', progress: 76,  isLive: false, bar: '#3b82f6' },
    { name: 'SaaS Dashboard',    progress: 42,  isLive: false, bar: '#7c3aed' },
    { name: 'Portfolio Site',    progress: 100, isLive: true,  bar: '#22c55e' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, rotateY: -8 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative hidden lg:flex items-center justify-center"
      style={{ perspective: '1200px' }}
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{ boxShadow: '0 0 100px 20px rgba(124,58,237,0.12), 0 0 200px 60px rgba(59,130,246,0.06)' }}
      />

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="w-full max-w-md"
      >
        {/* Main card */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: 'rgba(14,14,20,0.95)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Internal top light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-semibold text-sm">{t('hero.mock.title')}</h3>
              <p className="text-slate-500 text-xs mt-0.5">{t('hero.mock.subtitle')}</p>
            </div>
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
              <span className="relative flex w-1.5 h-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-green-400" />
              </span>
              <span className="text-green-400 text-xs font-medium">{t('hero.mock.live')}</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: t('hero.mock.total'),      bg: 'rgba(255,255,255,0.04)', val: '12', color: '#fff' },
              { label: t('hero.mock.inProgress'), bg: 'rgba(59,130,246,0.08)', val: '5',  color: '#60a5fa' },
              { label: t('hero.mock.completed'),  bg: 'rgba(124,58,237,0.08)',  val: '7',  color: '#a78bfa' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: s.bg }}>
                <div className="font-bold text-xl" style={{ color: s.color }}>{s.val}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Project list */}
          <div className="space-y-3">
            {projects.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${p.bar}15` }}>
                  {p.isLive
                    ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: p.bar }} />
                    : <Circle       className="w-3.5 h-3.5" style={{ color: p.bar }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-xs font-medium truncate">{p.name}</span>
                    <span className="text-[10px] font-semibold shrink-0 ml-2" style={{ color: p.bar }}>
                      {p.isLive ? t('status.live') : t('status.inProgress')}
                    </span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.progress}%` }}
                      transition={{ duration: 1.2, delay: 0.9 + i * 0.1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: p.bar }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating mini card */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-8 -right-8 rounded-2xl p-3.5 w-48"
          style={{
            background: 'rgba(14,14,20,0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-white text-xs font-medium">{t('hero.mock.activity')}</span>
          </div>
          <div className="space-y-1.5">
            {[
              { dot: '#22c55e', text: t('hero.mock.act1') },
              { dot: '#3b82f6', text: t('hero.mock.act2') },
              { dot: '#7c3aed', text: t('hero.mock.act3') },
            ].map((a, i) => (
              <motion.div
                key={a.text}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.15 }}
                className="flex items-center gap-1.5"
              >
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: a.dot }} />
                <span className="text-slate-400 text-[10px]">{a.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top floating badge */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
          className="absolute -top-6 -left-6 rounded-xl px-3 py-2 flex items-center gap-2"
          style={{
            background: 'rgba(14,14,20,0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(124,58,237,0.25)',
            boxShadow: '0 8px 32px rgba(124,58,237,0.2)',
          }}
        >
          <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-white text-xs font-semibold">+24% this month</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ── Mobile mockup ───────────────────────────────────────────────────────── */
function MobileMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="lg:hidden w-full max-w-sm mx-auto"
    >
      <div
        className="rounded-3xl p-5"
        style={{
          background: 'rgba(14,14,20,0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 60px rgba(124,58,237,0.08)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-slate-400 text-xs">Active Projects</p>
            <p className="text-white font-black text-3xl leading-tight mt-0.5">12</p>
          </div>
          <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-green-400 text-xs font-semibold">+24%</span>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {[
            { name: 'E-Commerce Store',  pct: 100, color: '#22c55e', done: true },
            { name: 'Corporate Website', pct: 76,  color: '#3b82f6', done: false },
            { name: 'SaaS Dashboard',    pct: 42,  color: '#7c3aed', done: false },
          ].map((p) => (
            <div key={p.name} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${p.color}15` }}>
                {p.done
                  ? <CheckCircle2 className="w-4 h-4" style={{ color: p.color }} />
                  : <Circle       className="w-4 h-4" style={{ color: p.color }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-xs font-medium truncate">{p.name}</span>
                  <span className="text-slate-500 text-[10px] ml-2 shrink-0">{p.pct}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.pct}%` }}
                    transition={{ duration: 1.2, delay: 0.7, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: p.color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Clients', value: '34+', bg: 'rgba(124,58,237,0.12)' },
            { label: 'On Time', value: '98%', bg: 'rgba(34,197,94,0.10)'  },
            { label: 'Rating',  value: '5.0', bg: 'rgba(234,179,8,0.10)'  },
          ].map((s) => (
            <div key={s.label} className="rounded-xl py-2.5 px-2 text-center" style={{ background: s.bg }}>
              <div className="text-white font-bold text-sm">{s.value}</div>
              <div className="text-slate-500 text-[10px] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN HERO                                                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Hero() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth parallax from mouse
  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 25 });

  const orb1X = useTransform(smoothX, [-0.5, 0.5], ['-3%', '3%']);
  const orb1Y = useTransform(smoothY, [-0.5, 0.5], ['-3%', '3%']);
  const orb2X = useTransform(smoothX, [-0.5, 0.5], ['2%', '-2%']);
  const orb2Y = useTransform(smoothY, [-0.5, 0.5], ['2%', '-2%']);

  // Scroll fade
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY       = useTransform(scrollYProgress, [0, 0.5], ['0%', '12%']);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) - 0.5);
      mouseY.set((e.clientY / window.innerHeight) - 0.5);
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, [mouseX, mouseY]);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-dvh flex flex-col justify-center overflow-hidden"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
    >
      {/* ── Hero background image ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Dark overlay — keeps text readable, deepens atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(4,3,10,0.55) 0%, rgba(4,3,10,0.30) 40%, rgba(4,3,10,0.70) 75%, rgba(4,3,10,0.97) 100%)',
        }}
      />

      {/* Left vignette — content side stays dark */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, rgba(4,3,10,0.65) 0%, rgba(4,3,10,0.15) 50%, transparent 100%)',
        }}
      />

      {/* Subtle purple tint layer — ties image to brand */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 60% 50%, rgba(124,58,237,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Film grain */}
      <div className="absolute inset-0 film-grain pointer-events-none z-0" />

      {/* Top edge glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.6), rgba(168,85,247,0.8), rgba(59,130,246,0.6), transparent)' }}
      />

      {/* Mouse parallax subtle orbs */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: '15%', top: '25%',
          width: 500, height: 500,
          background: 'rgba(124,58,237,0.06)',
          filter: 'blur(120px)',
          x: orb1X, y: orb1Y,
          translateX: '-50%', translateY: '-50%',
        }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: '75%', top: '60%',
          width: 380, height: 380,
          background: 'rgba(59,130,246,0.05)',
          filter: 'blur(100px)',
          x: orb2X, y: orb2Y,
          translateX: '-50%', translateY: '-50%',
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      {/* ── Main content (scrolls out) ───────────────────────────────────── */}
      <motion.div
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10 flex flex-col flex-1"
      >
        {/* ── Single-column editorial composition ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20 w-full flex-1 flex flex-col justify-center">

          {/* Availability signal — minimal, not a card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2.5 mb-10"
          >
            <span className="relative flex w-1.5 h-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-violet-400" />
            </span>
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase"
              style={{ color: 'rgba(168,85,247,0.8)' }}>
              Premium Web Development — Available Now
            </span>
          </motion.div>

          {/* The headline — the scene */}
          <CinematicTitle t={t} />

          {/* Subtitle — restrained, beneath */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="text-slate-400 leading-relaxed mb-10 max-w-xl"
            style={{ fontSize: 'clamp(1rem, 1.8vw, 1.125rem)' }}
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTAs — one heavy, one light */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.88, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-16"
          >
            <Link href="/request">
              <button
                className="group inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl
                           text-[15px] font-bold text-white transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  boxShadow:  '0 8px 28px rgba(124,58,237,0.4), 0 1px 0 rgba(255,255,255,0.1) inset',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = '0 12px 36px rgba(124,58,237,0.55), 0 1px 0 rgba(255,255,255,0.12) inset';
                  el.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = '0 8px 28px rgba(124,58,237,0.4), 0 1px 0 rgba(255,255,255,0.1) inset';
                  el.style.transform = 'none';
                }}
              >
                {t('hero.cta.primary')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
            <a href="#portfolio"
              className="text-[15px] font-semibold transition-colors duration-200 flex items-center gap-1.5"
              style={{ color: 'rgba(148,163,184,0.7)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(148,163,184,0.7)')}
            >
              {t('hero.cta.secondary')}
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </a>
          </motion.div>

          {/* Proof numbers — inline, not cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="flex flex-wrap items-center gap-8 pt-8"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            {[
              { val: '34+',  label: 'Clients worldwide'    },
              { val: '98%',  label: 'On-time delivery'     },
              { val: '5.0',  label: 'Average rating'       },
              { val: '40+',  label: 'Projects delivered'   },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.05 + i * 0.07 }}
                className="flex items-baseline gap-2"
              >
                <span className="text-xl font-black text-white tabular-nums">{s.val}</span>
                <span className="text-[12px]" style={{ color: 'rgba(100,116,139,0.7)' }}>{s.label}</span>
              </motion.div>
            ))}

            {/* Tech stack — inline, compact */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.35 }}
              className="hidden sm:flex items-center gap-2 ml-auto"
            >
              <span className="text-[10px] uppercase tracking-widest font-semibold"
                style={{ color: 'rgba(100,116,139,0.5)' }}>
                Built with
              </span>
              {stack.map(({ label, Icon, hex }) => (
                <div key={label} title={label}
                  className="w-7 h-7 flex items-center justify-center rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Icon style={{ color: hex }} className="w-3.5 h-3.5 shrink-0" />
                </div>
              ))}
            </motion.div>
          </motion.div>

        </div>
      </motion.div>

    </section>
  );
}

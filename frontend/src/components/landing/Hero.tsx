'use client';

import { useRef, useEffect, useState } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useScroll,
  useInView,
  AnimatePresence,
} from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Code2, CheckCircle2, Circle,
  BarChart2, TrendingUp, Zap, Shield, Headphones, Sparkles,
} from 'lucide-react';
import {
  SiNextdotjs, SiReact, SiTypescript, SiNodedotjs,
  SiTailwindcss, SiMongodb, SiDocker, SiStripe,
} from 'react-icons/si';
import Button from '@/components/ui/Button';
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

  const stats = [
    { icon: Zap,        label: t('hero.stat.fast'),    desc: t('hero.stat.fast.desc') },
    { icon: Shield,     label: t('hero.stat.secure'),  desc: t('hero.stat.secure.desc') },
    { icon: Code2,      label: t('hero.stat.clean'),   desc: t('hero.stat.clean.desc') },
    { icon: Headphones, label: t('hero.stat.support'), desc: t('hero.stat.support.desc') },
  ];

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-dvh flex flex-col justify-center overflow-hidden"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
    >
      {/* ── Cinematic background ──────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(59,130,246,0.10) 0%, transparent 60%), #07070d' }}
      />

      {/* Film grain */}
      <div className="absolute inset-0 film-grain pointer-events-none z-0" />

      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none z-0" />

      {/* Animated orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: orb.x,
            top:  orb.y,
            width:  orb.size,
            height: orb.size,
            background: orb.color,
            filter: `blur(${orb.blur}px)`,
            x: i === 0 ? orb1X : i === 1 ? orb2X : undefined,
            y: i === 0 ? orb1Y : i === 1 ? orb2Y : undefined,
            translateX: '-50%',
            translateY: '-50%',
          }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: orb.dur,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2,
          }}
        />
      ))}

      {/* Sweep beam */}
      <motion.div
        className="absolute top-1/3 left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.4) 30%, rgba(168,85,247,0.6) 50%, rgba(59,130,246,0.4) 70%, transparent 100%)',
          filter: 'blur(1px)',
        }}
        animate={{ opacity: [0, 1, 0], scaleX: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 8, ease: 'easeInOut' }}
      />

      {/* Top edge glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.6), rgba(168,85,247,0.8), rgba(59,130,246,0.6), transparent)' }}
      />

      {/* ── Main content (scrolls out) ───────────────────────────────────── */}
      <motion.div
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10 flex flex-col flex-1"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-8 w-full flex-1 flex flex-col justify-center">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* ── Left ────────────────────────────────────────────────── */}
            <div className="flex flex-col justify-center">

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="mb-6"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-violet-300 border border-violet-500/20 bg-violet-500/8 backdrop-blur-sm">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                    <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-violet-400" />
                  </span>
                  <Sparkles className="w-3 h-3" />
                  Premium Web Development — Available Now
                </span>
              </motion.div>

              {/* Title */}
              <CinematicTitle t={t} />

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg text-slate-400 mb-8 max-w-lg leading-relaxed"
              >
                {t('hero.subtitle')}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row gap-3 mb-10"
              >
                <Link href="/request" className="w-full sm:w-auto">
                  <Button size="lg" className="group w-full sm:w-auto justify-center text-[15px] py-4 relative overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                      {t('hero.cta.primary')}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                    </span>
                    {/* Button sweep */}
                    <span className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </Link>
                <a href="#portfolio" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto justify-center text-[15px] py-4 relative overflow-hidden group"
                  >
                    <span className="relative z-10">{t('hero.cta.secondary')}</span>
                    <span className="absolute inset-0 bg-white/4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Button>
                </a>
              </motion.div>

              {/* Mobile mockup */}
              <MobileMockup />

              {/* Tech stack */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="hidden sm:block mt-8 lg:mt-6"
              >
                <p className="text-xs text-slate-600 mb-3 flex items-center gap-1.5 uppercase tracking-widest font-medium">
                  <Code2 className="w-3 h-3" />
                  {t('hero.stack.label')}
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  {stack.map(({ label, Icon, hex }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.1 + i * 0.05, duration: 0.4, ease: 'easeOut' }}
                      whileHover={{ scale: 1.15, y: -2 }}
                      title={label}
                      className="w-9 h-9 flex items-center justify-center rounded-xl cursor-default transition-all duration-200"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <Icon style={{ color: hex }} className="w-4 h-4 shrink-0" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ── Right — Desktop Mockup ──────────────────────────────── */}
            <DashboardMockup t={t} />
          </div>
        </div>

        {/* ── Stats bar ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 border-t border-white/5"
          style={{ background: 'rgba(7,7,13,0.6)', backdropFilter: 'blur(20px)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 + i * 0.08, duration: 0.5 }}
                    whileHover={{ y: -2, borderColor: 'rgba(124,58,237,0.3)' }}
                    className="rounded-2xl p-3.5 sm:p-4 flex gap-3 items-start cursor-default transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(124,58,237,0.15)' }}
                    >
                      <Icon className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-white text-xs sm:text-sm font-semibold leading-tight">{s.label}</div>
                      <div className="text-slate-500 text-[11px] sm:text-xs mt-0.5 leading-relaxed hidden sm:block">{s.desc}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden lg:flex flex-col items-center gap-2"
      >
        <span className="text-slate-600 text-[10px] uppercase tracking-[0.2em] font-medium">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-violet-500/60 to-transparent" />
      </motion.div>
    </section>
  );
}

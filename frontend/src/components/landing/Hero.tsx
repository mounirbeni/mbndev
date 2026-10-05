'use client';

import { m as motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Check, Play, MessageSquare } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import Magnetic from '@/components/ui/Magnetic';
import SilkRibbons from '@/components/ui/SilkRibbons';
import CountUp from '@/components/ui/CountUp';
import RotatingPhrase from './RotatingPhrase';

const STATS = [
  { val: 48,  suffix: '+', label: 'Happy clients'       },
  { val: 145, suffix: '+', label: 'Projects delivered'  },
  { val: 98,  suffix: '%', label: 'Client satisfaction' },
  { val: 5,   suffix: '+', label: 'Years of experience' },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/* ── Glass mock of the client portal ─────────────────────────────────── */

const STAGES = [
  { label: 'Brief',  note: 'Goals & pages agreed', state: 'done' },
  { label: 'Design', note: 'Homepage approved',    state: 'done' },
  { label: 'Build',  note: 'Menu & booking pages', state: 'active' },
  { label: 'Review', note: 'Your feedback round',  state: 'todo' },
  { label: 'Launch', note: 'Live on your domain',  state: 'todo' },
] as const;

function PortalPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 1.1, delay: 0.5, ease: EASE }}
      className="relative w-full max-w-[440px]"
    >
      <div className="silk-glass rounded-[22px] p-5">
        {/* window bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          </div>
          <span className="font-mono text-[10.5px] tracking-wide text-slate-500">mbndev.ma/dashboard</span>
        </div>

        {/* project row */}
        <div className="flex items-start justify-between pt-4 pb-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Your project</p>
            <p className="mt-1 text-[17px] font-semibold text-white tracking-tight">Restaurant website</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-200">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-violet-300 animate-ping opacity-60" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-violet-300" />
            </span>
            In progress
          </span>
        </div>

        {/* stages */}
        <ol className="relative">
          <span aria-hidden className="absolute left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-violet-400/60 via-violet-400/25 to-white/5" />
          {STAGES.map((s, i) => (
            <motion.li
              key={s.label}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.9 + i * 0.09, ease: EASE }}
              className="relative flex items-center gap-3.5 py-2"
            >
              <span
                className={`relative z-10 flex items-center justify-center w-[23px] h-[23px] rounded-full border text-[10px] ${
                  s.state === 'done'
                    ? 'bg-violet-500/90 border-violet-300/60 text-white'
                    : s.state === 'active'
                      ? 'bg-[#120c24] border-violet-300/70 text-violet-200 shadow-[0_0_18px_rgba(168,85,247,0.55)]'
                      : 'bg-[#0d0b16] border-white/10 text-slate-600'
                }`}
              >
                {s.state === 'done' ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className={`text-[13.5px] font-semibold ${s.state === 'todo' ? 'text-slate-500' : 'text-white'}`}>{s.label}</span>
                  <span className="font-mono text-[10.5px] text-slate-500 truncate">{s.note}</span>
                </div>
                {s.state === 'active' && (
                  <div className="mt-2 h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '68%' }}
                      transition={{ duration: 2.2, delay: 1.5, ease: EASE }}
                      className="h-full rounded-full bg-gradient-to-r from-[#a855f7] via-[#3b82f6] to-[#06b6d4]"
                    />
                  </div>
                )}
              </div>
            </motion.li>
          ))}
        </ol>
      </div>

      {/* floating message */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 2.1, ease: EASE }}
        className="silk-glass absolute -left-14 -bottom-9 flex items-center gap-3 rounded-2xl py-3 pl-3 pr-4"
      >
        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500">
          <MessageSquare className="w-4 h-4 text-white" />
        </span>
        <div>
          <p className="text-[12.5px] font-semibold text-white leading-tight">New update from your team</p>
          <p className="font-mono text-[10.5px] text-slate-400 mt-0.5">Menu page ready for review</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Hero ────────────────────────────────────────────────────────────── */

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const contentY  = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const contentOp = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  // Desktop: the ribbon sweeps behind the portal panel on the right.
  // Mobile: it sits low, under the CTAs, so it never crosses body text.
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative overflow-hidden bg-[#07060f]"
      style={{ minHeight: '100dvh' }}
    >
      {/* ribbons */}
      {/* Held in place (no scroll parallax) so it never slides past the section edge. */}
      <SilkRibbons className="absolute inset-0" anchor={wide ? [0.66, 0.5] : [0.56, 0.22]} />

      {/* readability scrims */}
      <div aria-hidden className="absolute inset-0 pointer-events-none hidden lg:block"
        style={{ background: 'linear-gradient(90deg, rgba(7,6,15,0.94) 0%, rgba(7,6,15,0.72) 30%, rgba(7,6,15,0.15) 58%, transparent 75%)' }} />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[12%] lg:h-1/4 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #07060f 0%, rgba(7,6,15,0.6) 45%, transparent 100%)' }} />
      <div aria-hidden className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(7,6,15,0.7), transparent)' }} />

      <motion.div
        style={{ y: contentY, opacity: contentOp }}
        className="relative z-10 flex flex-col min-h-[100dvh]"
      >
        <div className="flex-1 w-full max-w-[1320px] mx-auto px-6 sm:px-10 lg:px-14 pt-32 pb-16 lg:pt-28 grid lg:grid-cols-[1.08fr_0.92fr] items-center gap-16">
          {/* copy */}
          <div className="max-w-[640px]">
            <div
              style={{ '--hero-y': '12px' } as React.CSSProperties}
              className="hero-enter inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] pl-1.5 pr-3.5 py-1.5 backdrop-blur-md"
            >
              <span className="rounded-full bg-violet-400/15 border border-violet-300/25 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-violet-200">
                Studio
              </span>
              <span className="font-mono text-[11px] tracking-wide text-slate-400">
                <span className="hidden sm:inline">Websites · SaaS · Web apps — </span>Morocco → worldwide
              </span>
            </div>

            <h1
              className="hero-enter-blur mt-8 text-white font-extrabold tracking-[-0.035em] leading-[0.98]"
              style={{ fontSize: 'clamp(2.7rem, 5.6vw, 5.6rem)', '--hero-delay': '0.12s' } as React.CSSProperties}
            >
              <span className="whitespace-nowrap">Websites that</span>
              <br />
              <RotatingPhrase className="serif-accent pr-2" />
            </h1>

            <p
              style={{ '--hero-y': '16px', '--hero-delay': '0.3s' } as React.CSSProperties}
              className="hero-enter mt-7 max-w-[500px] text-[clamp(0.98rem,1.25vw,1.1rem)] leading-[1.7] text-slate-400"
            >
              We design and develop high-performance websites, SaaS platforms
              and digital products — and you follow every step from your own client portal.
            </p>

            <div
              style={{ '--hero-y': '14px', '--hero-delay': '0.42s' } as React.CSSProperties}
              className="hero-enter mt-10 flex flex-wrap items-center gap-3"
            >
              <Magnetic>
                <Link
                  href="/request"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#ede6ff] pl-6 pr-2 py-2 text-[14px] font-semibold text-[#14092b] shadow-[0_10px_40px_-8px_rgba(168,85,247,0.65)] transition-colors hover:bg-white"
                >
                  Start your project
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#14092b] text-white transition-transform duration-300 group-hover:rotate-45">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </Link>
              </Magnetic>
              <a
                href="#portfolio"
                className="group inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-[14px] font-medium text-slate-200 backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/[0.06]"
              >
                <Play className="w-3.5 h-3.5 fill-current text-violet-300" />
                See our work
              </a>
            </div>

            <p
              style={{ '--hero-y': '0px', '--hero-delay': '0.7s' } as React.CSSProperties}
              // Phones: the ribbon passes behind this line, so it gets a dim backing.
              className="hero-enter mt-7 font-mono text-[11px] tracking-wide text-slate-500 max-lg:w-fit max-lg:-mx-2.5 max-lg:px-2.5 max-lg:py-1.5 max-lg:rounded-lg max-lg:bg-[#07060f]/75 max-lg:backdrop-blur-sm"
            >
              Reply within 24h <span className="text-slate-700 mx-2">/</span>
              No surprise pricing <span className="text-slate-700 mx-2">/</span>
              You own the code
            </p>
          </div>

          {/* portal mock */}
          <div className="hidden lg:flex justify-end pr-2">
            <PortalPanel />
          </div>
        </div>

        {/* stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
          className="w-full border-t border-white/[0.07] bg-[#07060f]/60 backdrop-blur-xl"
        >
          <div className="max-w-[1320px] mx-auto px-6 sm:px-10 lg:px-14 grid grid-cols-2 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`py-5 lg:py-7 ${i % 2 === 1 ? 'pl-6' : ''} lg:pl-0 ${i > 0 ? 'lg:pl-8 lg:border-l lg:border-white/[0.07]' : ''} ${i > 1 ? 'border-t border-white/[0.07] lg:border-t-0' : ''}`}
              >
                <div className="text-[clamp(1.6rem,2.4vw,2.2rem)] font-semibold tracking-tight text-white tabular-nums leading-none">
                  <CountUp value={s.val} suffix={s.suffix} duration={1.8} />
                </div>
                <div className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

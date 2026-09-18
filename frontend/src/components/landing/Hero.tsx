'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Play } from 'lucide-react';

// Describe the service rather than inventing conversion lifts, years of
// experience, client counts or a customer satisfaction percentage.
const PHRASES = [
  'reflect your brand.',
  'support your goals.',
  'feel effortless.',
  'are made for you.',
];

function RotatingText() {
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => setIndex((previous) => (previous + 1) % PHRASES.length), 3800);
    return () => clearInterval(interval);
  }, [reducedMotion]);
  return (
    <span className="relative inline-block gradient-text">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={index} initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="inline-block">
          {PHRASES[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);

  return (
    <section ref={sectionRef} id="home" className="relative min-h-[680px] h-[100svh] overflow-hidden bg-[#07060f]">
      {/* Keep the approved cinematic hero artwork and purple/blue atmosphere. */}
      <motion.div style={reducedMotion ? undefined : { y: imageY }} className="absolute inset-0 pointer-events-none">
        <Image src="/hero.png" alt="" fill priority quality={90} sizes="100vw" className="object-cover object-[60%_center]" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(100deg, rgba(7,6,15,0.98) 0%, rgba(7,6,15,0.9) 24%, rgba(7,6,15,0.63) 45%, rgba(7,6,15,0.25) 70%, transparent 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,rgba(7,6,15,0.52),transparent 24%,rgba(7,6,15,0.3) 70%,rgba(7,6,15,0.95))' }} />
      </motion.div>
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[110px]" />
        <div className="absolute top-1/4 -right-40 w-[560px] h-[560px] rounded-full bg-blue-600/10 blur-[115px]" />
        <div className="absolute inset-0 ambient-grid opacity-[0.03]" />
      </div>
      <motion.div style={reducedMotion ? undefined : { y: contentY }} className="relative z-10 min-h-[680px] h-full flex items-center px-6 sm:px-10 lg:px-14 xl:px-20 pt-20 pb-24">
        <div className="max-w-[660px]">
          <motion.div initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-3 py-1.5 border border-violet-400/20 bg-violet-500/10 rounded-full text-[11px] tracking-[0.15em] uppercase font-semibold text-violet-200 mb-7">
            MBN DEV <span aria-hidden="true" className="text-violet-500">/</span> Digital development
          </motion.div>
          <motion.h1 initial={reducedMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-white font-black tracking-tight leading-[1.07] mb-7" style={{ fontSize: 'clamp(2.6rem, 4.35vw, 4.6rem)' }}>
            We build<br />digital experiences<br />that <RotatingText />
          </motion.h1>
          <motion.p initial={reducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.2 }} className="text-slate-300/80 leading-relaxed max-w-[510px] text-base mb-10">
            Custom websites, SaaS platforms and web applications crafted around your requirements, with a client workspace to follow the project from brief to delivery.
          </motion.p>
          <motion.div initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="flex flex-wrap items-center gap-4">
            <Link href="/request" className="group relative inline-flex items-center gap-2.5 px-7 py-4 bg-gradient-to-r from-violet-600 to-purple-700 border border-violet-500/30 rounded-xl text-white font-bold tracking-wide uppercase text-xs shadow-[0_8px_32px_rgba(124,58,237,0.3)] hover:shadow-[0_10px_40px_rgba(124,58,237,0.4)] transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300">
              Start your project <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </Link>
            <Link href="/#portfolio" className="group inline-flex items-center gap-3 px-6 py-4 bg-white/[0.04] border border-white/15 rounded-xl text-slate-200 font-bold tracking-wide uppercase text-xs hover:border-white/30 hover:bg-white/[0.08] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300">
              View our work <Play className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
      <Link href="/#portfolio" className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-slate-400 hover:text-white text-[10px] tracking-[0.2em] uppercase font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300">
        Explore <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
      </Link>
    </section>
  );
}

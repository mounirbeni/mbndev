'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

interface ProjectMeta {
  key: string;
  title: string;
  url: string;
  /** Small cover, used for the room light and the film strip. */
  image: string;
  /** What plays on the big screen (full-size capture when we have one). */
  screen: string;
  /** Optional phone capture, shown in a handset next to the screen. */
  mobile?: string;
  accentHex: string;
}

// Frames with real full-size captures lead the reel.
const projectsMeta: ProjectMeta[] = [
  { key: 'watchstore', title: 'Tarique',        url: 'https://www.tarique.ma',             image: '/images/portfolio/tarique.png',     screen: '/images/portfolio/hd/tarique.webp',     mobile: '/images/portfolio/hd/tarique-mobile.webp',     accentHex: '#3b82f6' },
  { key: 'riad',       title: 'RiadConnect',    url: 'https://riadconnect.vercel.app/',    image: '/images/portfolio/riadconnect.png', screen: '/images/portfolio/hd/riadconnect.webp', mobile: '/images/portfolio/hd/riadconnect-mobile.webp', accentHex: '#d97706' },
  { key: 'carrylink',  title: 'Transo',         url: 'https://transomaroc.vercel.app',     image: '/images/portfolio/transo.png',      screen: '/images/portfolio/hd/transo.webp',      accentHex: '#38bdf8' },
  { key: 'lueur',      title: 'Lueur Skin',     url: 'https://lueurskin.vercel.app/',      image: '/images/portfolio/lueur-skin.png',  screen: '/images/portfolio/hd/lueur-skin.webp',  accentHex: '#a78bfa' },
  { key: 'tyy',        title: 'VitaCore',       url: 'https://vitapara.vercel.app/fr',     image: '/images/portfolio/vitacore.png',    screen: '/images/portfolio/hd/vitacore.webp',    accentHex: '#fda4af' },
  { key: 'emll',       title: 'EMLL',           url: 'https://emll.vercel.app/',           image: '/images/portfolio/emll.png',        screen: '/images/portfolio/hd/emll.webp',        accentHex: '#c4b5fd' },
  { key: 'riaddemo',   title: 'ChronoCraft',    url: 'https://watchstoremaroc.vercel.app', image: '/images/portfolio/chronocraft.png', screen: '/images/portfolio/hd/chronocraft.webp', accentHex: '#eab308' },
];

const pad = (n: number) => String(n).padStart(2, '0');

/** Film timecode for a 0..1 progress through a ~2-minute "reel". */
function timecode(p: number) {
  const total = p * 128;
  const m = Math.floor(total / 60), s = Math.floor(total % 60), f = Math.floor((total % 1) * 24);
  return `00:${pad(m)}:${pad(s)}:${pad(f)}`;
}

/* ── One project on a glowing screen ──────────────────────────────────── */

function Screen({ src, title, active, tilt = true }: { src: string; title: string; active: boolean; tilt?: boolean }) {
  return (
    <div
      className="absolute inset-0 transition-[opacity,transform,filter] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? 'scale(1)' : 'scale(1.04)',
        filter: active ? 'blur(0px)' : 'blur(6px)',
      }}
      aria-hidden={!active}
    >
      <Image
        src={src}
        alt={`${title} — homepage`}
        fill
        sizes="(min-width: 1024px) 50vw, 90vw"
        className={`object-cover object-top ${tilt && active ? 'cinema-kenburns' : ''}`}
      />
    </div>
  );
}

export default function Portfolio() {
  const { t } = useLanguage();
  const projects = projectsMeta.map((p) => ({ ...p, type: t(`portfolio.type.${p.key}`), desc: t(`portfolio.desc.${p.key}`) }));
  const n = projects.length;

  const rootRef = useRef<HTMLElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  // Desktop: pin the reel and let scroll advance the scenes.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const st = ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: () => `+=${window.innerHeight * (n - 1) * 0.85}`,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          setProgress(self.progress);
          setActive(Math.min(n - 1, Math.round(self.progress * (n - 1))));
        },
      });
      stRef.current = st;
      return () => { st.kill(); stRef.current = null; };
    });
    return () => mm.revert();
  }, [n]);

  const goTo = (i: number) => {
    const st = stRef.current;
    if (!st) { setActive(i); return; }
    window.scrollTo({ top: st.start + (st.end - st.start) * (i / (n - 1)), behavior: 'smooth' });
  };

  const p = projects[active];

  return (
    <div id="portfolio">
      {/* ── Desktop: the pinned cinema reel ─────────────────────────────── */}
      <section
        ref={rootRef}
        aria-label="Selected work"
        className="relative hidden lg:block h-screen overflow-hidden bg-[#040308]"
      >
        {/* Light thrown into the room by the screen — one layer per project */}
        {projects.map((proj, i) => (
          <div
            key={proj.key}
            aria-hidden
            className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
            style={{ opacity: i === active ? 1 : 0 }}
          >
            <Image src={proj.image} alt="" fill sizes="30vw" className="object-cover scale-[1.6] blur-[90px] saturate-[1.4] opacity-[0.55]" />
            <div className="absolute inset-0" style={{ background: `radial-gradient(50% 55% at 66% 52%, ${proj.accentHex}38 0%, transparent 70%)` }} />
          </div>
        ))}
        <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 60% 50%, transparent 35%, rgba(4,3,8,0.92) 80%)' }} />
        <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(4,3,8,0.95) 0%, rgba(4,3,8,0.6) 34%, transparent 58%)' }} />

        {/* Letterbox bars */}
        <div className="absolute inset-x-0 top-0 h-[9vh] bg-black/90 border-b border-white/[0.04] z-20 flex items-center justify-between px-14 font-mono text-[11px] uppercase tracking-[0.22em] text-slate-500">
          <span><span className="text-violet-300">●</span>&nbsp; MBN DEV — Selected work</span>
          <span>Reel 2026 · {pad(active + 1)} / {pad(n)}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[13vh] bg-black/90 border-t border-white/[0.04] z-20 px-14 flex items-center gap-8">
          <span className="font-mono text-[11px] tracking-[0.18em] text-slate-500 tabular-nums w-[118px] shrink-0">{timecode(progress)}</span>
          {/* Film strip */}
          <div className="flex-1 flex items-center gap-2.5">
            {projects.map((proj, i) => (
              <button
                key={proj.key}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show ${proj.title}`}
                aria-current={i === active}
                data-cursor="Play"
                className={`relative h-[6.2vh] aspect-video rounded-[6px] overflow-hidden border transition-all duration-500 ${
                  i === active ? 'border-violet-300/80 opacity-100 scale-105' : 'border-white/10 opacity-40 hover:opacity-80'
                }`}
              >
                <Image src={proj.image} alt="" fill sizes="120px" className="object-cover object-top" />
              </button>
            ))}
          </div>
          <div className="w-[220px] shrink-0">
            <div className="h-px bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#a855f7] via-[#3b82f6] to-[#06b6d4]" style={{ width: `${progress * 100}%` }} />
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">Scroll to play</p>
          </div>
        </div>

        {/* Stage */}
        <div className="relative z-10 h-full max-w-[1400px] mx-auto px-14 pt-[9vh] pb-[13vh] grid grid-cols-[0.8fr_1.2fr] items-center gap-12">
          {/* Credits */}
          <div className="relative min-h-[380px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-6">
              <span className="text-violet-300">{pad(active + 1)}</span> — {p.type}
            </p>
            <div className="relative h-[clamp(4.5rem,8vw,7.5rem)]">
              {projects.map((proj, i) => (
                <h3
                  key={proj.key}
                  aria-hidden={i !== active}
                  className="absolute inset-0 serif-accent silk-text whitespace-nowrap transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    fontSize: 'clamp(3.4rem, 6.4vw, 6.2rem)',
                    opacity: i === active ? 1 : 0,
                    transform: `translateY(${i === active ? 0 : i < active ? -40 : 40}px)`,
                    filter: i === active ? 'blur(0px)' : 'blur(10px)',
                  }}
                >
                  {proj.title}
                </h3>
              ))}
            </div>
            <p key={p.key} className="mt-6 max-w-[420px] text-[16px] leading-[1.7] text-slate-400 cinema-fade">
              {p.desc}
            </p>
            <div className="mt-9 flex items-center gap-3">
              <a href={p.url} target="_blank" rel="noopener noreferrer" data-cursor="Visit" className="btn-silk group inline-flex items-center gap-2 pl-6 pr-2 py-2 text-[14px] font-semibold">
                Visit live site
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#14092b] text-white transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </a>
              <Link href="/portfolio" className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-[14px] font-medium text-slate-200 backdrop-blur-md transition-colors hover:border-white/25">
                {t('portfolio.viewAll')}
              </Link>
            </div>
          </div>

          {/* The screen */}
          <a href={p.url} target="_blank" rel="noopener noreferrer" data-cursor="Visit" aria-label={`Visit ${p.title}`} className="relative block" style={{ perspective: '1600px' }}>
            <div
              className="relative aspect-[16/10] rounded-[18px] overflow-hidden border border-white/10 bg-black shadow-[0_60px_140px_-30px_rgba(0,0,0,0.9)]"
              style={{ transform: 'rotateY(-11deg) rotateX(3deg)', boxShadow: `0 0 120px -20px ${p.accentHex}66, 0 60px 140px -30px rgba(0,0,0,0.9)` }}
            >
              {/* browser chrome */}
              <div className="absolute inset-x-0 top-0 h-8 z-10 flex items-center gap-1.5 px-4 bg-black/70 backdrop-blur border-b border-white/[0.06]">
                <span className="w-2 h-2 rounded-full bg-white/20" /><span className="w-2 h-2 rounded-full bg-white/20" /><span className="w-2 h-2 rounded-full bg-white/20" />
                <span className="ml-4 font-mono text-[10px] text-slate-500 truncate">{p.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
              </div>
              <div className="absolute inset-0 top-8">
                {projects.map((proj, i) => <Screen key={proj.key} src={proj.screen} title={proj.title} active={i === active} />)}
              </div>
              {/* glass glare + pixel grid so the screen reads as a real display */}
              <div aria-hidden className="absolute inset-0 pointer-events-none cinema-screen" />
            </div>
            {/* Handset, for projects with a phone capture */}
            {projects.map((proj, i) => proj.mobile && (
              <div
                key={proj.key}
                aria-hidden
                className="absolute -right-6 -bottom-12 w-[21%] aspect-[9/19.5] rounded-[26px] border-[5px] border-[#16131f] bg-black overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  opacity: i === active ? 1 : 0,
                  transform: `rotateY(-8deg) translateY(${i === active ? 0 : 40}px)`,
                }}
              >
                <Image src={proj.mobile} alt="" fill sizes="220px" className="object-cover object-top" />
                <div className="absolute inset-0 cinema-screen" />
              </div>
            ))}
            {/* reflection on the "desk" */}
            <div aria-hidden className="absolute -bottom-20 inset-x-10 h-24 blur-3xl opacity-60" style={{ background: `radial-gradient(50% 50% at 50% 0%, ${p.accentHex}55, transparent 70%)` }} />
          </a>
        </div>
      </section>

      {/* ── Phones & tablets: stacked scenes ────────────────────────────── */}
      <section aria-label="Selected work" className="lg:hidden relative bg-[#040308] py-20">
        <div className="px-6 mb-10">
          <span className="section-label">{t('portfolio.eyebrow')}</span>
          <h2 className="text-[2.6rem] leading-[1.02] font-bold text-white">
            {t('portfolio.title')} <span className="serif-accent silk-text pr-[0.06em]">{t('portfolio.title.bold')}</span>
          </h2>
        </div>
        <div className="space-y-14">
          {projects.map((proj, i) => (
            <article key={proj.key} className="relative px-6">
              <div aria-hidden className="absolute inset-x-0 -top-10 -bottom-10 overflow-hidden">
                <Image src={proj.image} alt="" fill sizes="50vw" className="object-cover scale-150 blur-[70px] opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#040308] via-transparent to-[#040308]" />
              </div>
              <div className="relative">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-black" style={{ boxShadow: `0 0 70px -20px ${proj.accentHex}88` }}>
                  <Image src={proj.screen} alt={`${proj.title} — homepage`} fill sizes="90vw" className="object-cover object-top" />
                  <div aria-hidden className="absolute inset-0 cinema-screen" />
                </div>
                <p className="mt-5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-500"><span className="text-violet-300">{pad(i + 1)}</span> — {proj.type}</p>
                <h3 className="mt-1 serif-accent silk-text text-[2.6rem]">{proj.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-400">{proj.desc}</p>
                <a href={proj.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-violet-200">
                  Visit live site <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
        <div className="px-6 mt-14">
          <Link href="/portfolio" className="btn-silk inline-flex items-center px-6 py-3 text-[14px] font-semibold">{t('portfolio.viewAll')}</Link>
        </div>
      </section>
    </div>
  );
}

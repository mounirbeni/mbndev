'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import SilkRibbons from '@/components/ui/SilkRibbons';
import { PROJECT_MEDIA } from '@/lib/portfolioMedia';
import BrandWordmark from './BrandWordmark';


// Below the desktop breakpoint the reel is a stacked list with its own silk
// layer; each layout mounts only its own, so a device runs one WebGL context.
const SMALL = '(max-width: 1023.98px)';
const subscribeSmall = (cb: () => void) => {
  const mq = window.matchMedia(SMALL);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const isSmall = () => window.matchMedia(SMALL).matches;

interface ProjectMeta {
  /** Translation key suffix for type/description. */
  key: string;
  /** Slug in PROJECT_MEDIA (mockup + palette). */
  media: string;
  title: string;
  url: string;
}

const projectsMeta: ProjectMeta[] = [
  { key: 'watchstore', media: 'tarique',     title: 'Tarique',     url: 'https://www.tarique.ma' },
  { key: 'riaddemo',   media: 'chronocraft', title: 'ChronoCraft', url: 'https://watchstoremaroc.vercel.app' },
  { key: 'abaq',       media: 'abaq',        title: 'Abaq',        url: 'https://abaq-peach.vercel.app' },
  { key: 'riad',       media: 'riadconnect', title: 'RiadConnect', url: 'https://riadconnect.vercel.app/' },
  { key: 'emll',       media: 'emll',        title: 'EMLL',        url: 'https://emll.vercel.app/' },
  { key: 'caramelio',  media: 'caramelio',   title: 'Caramelio',   url: 'https://caramelio.vercel.app' },
  { key: 'carrylink',  media: 'transo',      title: 'Transo',      url: 'https://transomaroc.vercel.app' },
  { key: 'tyy',        media: 'vitacore',    title: 'VitaCore',    url: 'https://vitapara.vercel.app/fr' },
];

const pad = (n: number) => String(n).padStart(2, '0');

/** Long, soft ease shared by every reel transition. */
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * Slides before the active one wait on one side, slides after it on the
 * other, so a change always travels in the direction of the scroll.
 */
function slide(i: number, active: number, axis: 'x' | 'y', dist: number) {
  const d = i === active ? 0 : i < active ? -dist : dist;
  return {
    opacity: i === active ? 1 : 0,
    transform: `translate${axis.toUpperCase()}(${d}px) scale(${i === active ? 1 : 0.97})`,
    filter: i === active ? 'blur(0px)' : 'blur(8px)',
    transition: `opacity 1s ${EASE}, transform 1.25s ${EASE}, filter 1s ${EASE}`,
  } as const;
}

/** Film timecode for a 0..1 progress through a ~2-minute "reel". */
function timecode(p: number) {
  const total = p * 128;
  const m = Math.floor(total / 60), s = Math.floor(total % 60), f = Math.floor((total % 1) * 24);
  return `00:${pad(m)}:${pad(s)}:${pad(f)}`;
}

export default function Portfolio() {
  const { t } = useLanguage();
  const projects = projectsMeta.map((p) => {
    const media = PROJECT_MEDIA[p.media];
    return {
      ...p,
      mockup: media.mockup!,
      // Same shot with the backdrop removed, so the devices float in the reel.
      cutout: `/images/portfolio/cutouts/${p.media}.webp`,
      palette: media.palette,
      type: t(`portfolio.type.${p.key}`),
      desc: t(`portfolio.desc.${p.key}`),
    };
  });
  const n = projects.length;

  const rootRef = useRef<HTMLElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const small = useSyncExternalStore(subscribeSmall, isSmall, () => false);
  const [mActive, setMActive] = useState(0);
  const sceneRefs = useRef<(HTMLElement | null)[]>([]);
  // Brand typefaces for the wordmarks load only once the reel is near the
  // viewport — otherwise ~160 KB of fonts compete with the page's first paint.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [nearView, setNearView] = useState(false);

  useEffect(() => {
    const root = wrapRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setNearView(true); io.disconnect(); } },
      { rootMargin: '800px 0px' },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  // Phones: the scene crossing the middle of the screen sets the silk colours.
  useEffect(() => {
    if (!small) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setMActive(Number((e.target as HTMLElement).dataset.i));
      }),
      { rootMargin: '-45% 0px -45% 0px' },
    );
    sceneRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [small, n]);

  // Desktop: pin the reel and let scroll advance the scenes. GSAP is loaded
  // after mount so it stays off the page's critical path.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let cancelled = false;
    let revert: (() => void) | undefined;
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      revert = () => mm.revert();
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const st = ScrollTrigger.create({
          trigger: root,
          start: 'top top',
          end: () => `+=${window.innerHeight * (n - 1)}`,
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
    });
    return () => { cancelled = true; revert?.(); };
  }, [n]);

  const goTo = (i: number) => {
    const st = stRef.current;
    if (!st) { setActive(i); return; }
    window.scrollTo({ top: st.start + (st.end - st.start) * (i / (n - 1)), behavior: 'smooth' });
  };

  const p = projects[active];

  return (
    <div id="portfolio" ref={wrapRef}>
      {/* ── Desktop: the pinned cinema reel ─────────────────────────────── */}
      <section
        ref={rootRef}
        aria-label="Selected work"
        className="relative hidden lg:block h-screen overflow-hidden bg-[#040308]"
      >
        {/* The project's own colours, woven into the MBN DEV silk */}
        {!small && <SilkRibbons className="absolute inset-0" anchor={[0.66, 0.46]} intensity={0.9} speed={0.7} palette={p.palette} />}
        <div
          aria-hidden
          className="absolute inset-0 transition-[background] duration-[1200ms]"
          style={{ background: `radial-gradient(45% 55% at 66% 50%, ${p.palette[1]}2e 0%, transparent 70%)` }}
        />
        <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(4,3,8,0.96) 0%, rgba(4,3,8,0.7) 30%, rgba(4,3,8,0.1) 55%, transparent 70%)' }} />

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
                className={`relative h-[6.2vh] aspect-video rounded-[6px] overflow-hidden border transition-all duration-500 ${
                  i === active ? 'opacity-100 scale-105' : 'border-white/10 opacity-40 hover:opacity-80'
                }`}
                style={i === active ? { borderColor: proj.palette[2] } : undefined}
              >
                <Image src={proj.mockup} alt="" fill sizes="120px" className="object-cover" />
              </button>
            ))}
          </div>
          <div className="w-[220px] shrink-0">
            <div className="h-px bg-white/10 overflow-hidden">
              <div
                className="h-full"
                style={{ width: `${progress * 100}%`, background: `linear-gradient(90deg, ${p.palette.join(', ')})` }}
              />
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">Scroll to play</p>
          </div>
        </div>

        {/* Stage */}
        <div className="relative z-10 h-full max-w-[1440px] mx-auto px-14 pt-[9vh] pb-[13vh] grid grid-cols-[0.68fr_1.32fr] items-center gap-10">
          {/* Credits */}
          <div className="relative min-h-[380px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-6">
              <span style={{ color: p.palette[2], transition: `color 1s ${EASE}` }}>{pad(active + 1)}</span> — {p.type}
            </p>
            <div className="relative h-[clamp(5rem,8.5vw,8rem)]" style={{ fontSize: 'clamp(3.2rem, 5.6vw, 5.6rem)' }}>
              {projects.map((proj, i) => (
                <h3
                  key={proj.key}
                  aria-hidden={i !== active}
                  className="absolute inset-x-0 bottom-0 leading-none whitespace-nowrap"
                  style={slide(i, active, 'y', 36)}
                >
                  <BrandWordmark brand={proj.media} title={proj.title} loadFonts={nearView} />
                </h3>
              ))}
            </div>
            <div className="relative mt-6 max-w-[400px] h-[5.4em] text-[16px] leading-[1.7]">
              {projects.map((proj, i) => (
                <p key={proj.key} aria-hidden={i !== active} className="absolute inset-0 text-slate-400" style={slide(i, active, 'y', 14)}>
                  {proj.desc}
                </p>
              ))}
            </div>
            <div className="mt-9 flex items-center gap-3">
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn-silk group inline-flex items-center gap-2 pl-6 pr-2 py-2 text-[14px] font-semibold">
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

          {/* The presentation frame */}
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${p.title}`}
            className="relative block"
          >
            <div className="relative aspect-[1672/941]">
              {/* soft floor light under the devices, in the project's colour */}
              <div
                aria-hidden
                className="absolute inset-x-[8%] bottom-[2%] h-[16%] rounded-[50%] blur-3xl"
                style={{ background: p.palette[1], opacity: 0.32, transition: `background 1.2s ${EASE}` }}
              />
              {projects.map((proj, i) => (
                <div key={proj.key} aria-hidden={i !== active} className="absolute inset-0" style={slide(i, active, 'x', 70)}>
                  <Image
                    src={proj.cutout}
                    alt={`${proj.title} on laptop and phone`}
                    fill
                    sizes="(min-width: 1024px) 62vw, 90vw"
                    priority={i === 0}
                    className="object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.65)]"
                  />
                </div>
              ))}
            </div>
          </a>
        </div>
      </section>

      {/* ── Phones & tablets: stacked scenes ────────────────────────────── */}
      <section aria-label="Selected work" className="lg:hidden relative isolate bg-[#040308] py-20">
        {/* Silk in the current project's colours, held behind the scenes as they scroll */}
        {small && (
          <div aria-hidden className="pointer-events-none sticky top-0 -z-10 h-[100svh] -mb-[100svh]">
            <SilkRibbons className="absolute inset-0" anchor={[0.5, 0.6]} intensity={0.85} speed={0.7} palette={projects[mActive].palette} />
            <div
              className="absolute inset-0 transition-[background] duration-[1200ms]"
              style={{ background: `radial-gradient(80% 45% at 50% 40%, ${projects[mActive].palette[1]}26 0%, transparent 70%)` }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(4,3,8,0.35) 0%, rgba(4,3,8,0.15) 35%, rgba(4,3,8,0.55) 100%)' }} />
          </div>
        )}
        {/* soften the section's top and bottom edges into the page */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 -z-[5] bg-gradient-to-b from-[#040308] to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 -z-[5] bg-gradient-to-t from-[#040308] to-transparent" />
        <div className="px-6 mb-10">
          <span className="section-label">{t('portfolio.eyebrow')}</span>
          <h2 className="text-[2.6rem] leading-[1.02] font-bold text-white">
            {t('portfolio.title')} <span className="serif-accent silk-text pr-[0.06em]">{t('portfolio.title.bold')}</span>
          </h2>
        </div>
        <div className="space-y-16">
          {projects.map((proj, i) => (
            <article
              key={proj.key}
              ref={(el) => { sceneRefs.current[i] = el; }}
              data-i={i}
              className="relative px-5"
            >
              {/* Each project lit in its own colours */}
              <div
                aria-hidden
                className="absolute inset-x-0 -top-12 -bottom-12"
                style={{ background: `radial-gradient(70% 45% at 50% 30%, ${proj.palette[1]}40 0%, ${proj.palette[0]}14 45%, transparent 75%)` }}
              />
              <div className="relative">
                <div className="relative aspect-[1672/941]">
                  <Image src={proj.cutout} alt={`${proj.title} on laptop and phone`} fill sizes="92vw" className="object-contain drop-shadow-[0_24px_36px_rgba(0,0,0,0.6)]" />
                </div>
                <p className="mt-5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-500">
                  <span style={{ color: proj.palette[2] }}>{pad(i + 1)}</span> — {proj.type}
                </p>
                <h3 className="mt-2 text-[2.5rem] leading-none">
                  <BrandWordmark brand={proj.media} title={proj.title} loadFonts={nearView} />
                </h3>
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

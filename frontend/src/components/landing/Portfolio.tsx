'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import SilkRibbons from '@/components/ui/SilkRibbons';
import { PROJECT_MEDIA } from '@/lib/portfolioMedia';

gsap.registerPlugin(ScrollTrigger);

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
    return { ...p, mockup: media.mockup!, palette: media.palette, type: t(`portfolio.type.${p.key}`), desc: t(`portfolio.desc.${p.key}`) };
  });
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
        {/* The project's own colours, woven into the MBN DEV silk */}
        <SilkRibbons className="absolute inset-0" anchor={[0.66, 0.46]} intensity={0.9} speed={0.7} palette={p.palette} />
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
                data-cursor="Play"
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
                className="h-full transition-[background] duration-700"
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
              <span style={{ color: p.palette[2] }} className="transition-colors duration-700">{pad(active + 1)}</span> — {p.type}
            </p>
            <div className="relative h-[clamp(4.5rem,8vw,7.5rem)]">
              {projects.map((proj, i) => (
                <h3
                  key={proj.key}
                  aria-hidden={i !== active}
                  className="absolute inset-0 serif-accent whitespace-nowrap transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    fontSize: 'clamp(3.4rem, 6vw, 6rem)',
                    background: `linear-gradient(100deg, #ffffff 0%, ${proj.palette[2]} 45%, ${proj.palette[1]} 100%)`,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    opacity: i === active ? 1 : 0,
                    transform: `translateY(${i === active ? 0 : i < active ? -40 : 40}px)`,
                    filter: i === active ? 'blur(0px)' : 'blur(10px)',
                  }}
                >
                  {proj.title}
                </h3>
              ))}
            </div>
            <p key={p.key} className="mt-6 max-w-[400px] text-[16px] leading-[1.7] text-slate-400 cinema-fade">
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

          {/* The presentation frame */}
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="Visit"
            aria-label={`Visit ${p.title}`}
            className="relative block"
          >
            <div
              className="relative aspect-[1672/941] rounded-[22px] overflow-hidden border border-white/10 transition-shadow duration-[1200ms]"
              style={{ boxShadow: `0 0 140px -30px ${p.palette[1]}aa, 0 60px 140px -40px rgba(0,0,0,0.95)` }}
            >
              {projects.map((proj, i) => (
                <div
                  key={proj.key}
                  aria-hidden={i !== active}
                  className="absolute inset-0 transition-[opacity,transform,filter] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    opacity: i === active ? 1 : 0,
                    transform: i === active ? 'scale(1)' : 'scale(1.04)',
                    filter: i === active ? 'blur(0px)' : 'blur(8px)',
                  }}
                >
                  <Image
                    src={proj.mockup}
                    alt={`${proj.title} on laptop and phone`}
                    fill
                    sizes="(min-width: 1024px) 62vw, 90vw"
                    priority={i === 0}
                    className={`object-cover ${i === active ? 'cinema-kenburns' : ''}`}
                  />
                </div>
              ))}
              <div aria-hidden className="absolute inset-0 pointer-events-none cinema-screen" />
            </div>
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
        <div className="space-y-16">
          {projects.map((proj, i) => (
            <article key={proj.key} className="relative px-5">
              {/* Each project lit in its own colours */}
              <div
                aria-hidden
                className="absolute inset-x-0 -top-12 -bottom-12"
                style={{ background: `radial-gradient(70% 45% at 50% 30%, ${proj.palette[1]}40 0%, ${proj.palette[0]}14 45%, transparent 75%)` }}
              />
              <div className="relative">
                <div className="relative aspect-[1672/941] rounded-2xl overflow-hidden border border-white/10" style={{ boxShadow: `0 0 70px -20px ${proj.palette[1]}aa` }}>
                  <Image src={proj.mockup} alt={`${proj.title} on laptop and phone`} fill sizes="92vw" className="object-cover" />
                </div>
                <p className="mt-5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-500">
                  <span style={{ color: proj.palette[2] }}>{pad(i + 1)}</span> — {proj.type}
                </p>
                <h3
                  className="mt-1 serif-accent text-[2.6rem]"
                  style={{ background: `linear-gradient(100deg, #fff 0%, ${proj.palette[2]} 50%, ${proj.palette[1]} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  {proj.title}
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

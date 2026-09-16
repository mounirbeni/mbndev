'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, ArrowUpRight, BadgeCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type ProjectKey = 'carrylink' | 'lueur' | 'tyy' | 'emll' | 'riad' | 'riaddemo' | 'watchstore';

const projectsMeta: {
  key: ProjectKey;
  title: string;
  url: string;
  image: string;
  gradient: string;
  accentHex: string;
  initial: string;
  index: string;
}[] = [
  { key: 'carrylink',  title: 'Transo',          url: 'https://transomaroc.vercel.app',         image: '/images/portfolio/transo.png',       gradient: 'from-sky-600/20 to-blue-700/10',      accentHex: '#38bdf8', initial: 'TR', index: '01' },
  { key: 'lueur',      title: 'Lueur Skin',      url: 'https://lueurskin.vercel.app/',          image: '/images/portfolio/lueur-skin.png',   gradient: 'from-purple-500/20 to-violet-700/10', accentHex: '#a78bfa', initial: 'LS', index: '02' },
  { key: 'tyy',        title: 'VitaCore',        url: 'https://vitapara.vercel.app/fr',         image: '/images/portfolio/vitacore.png',     gradient: 'from-rose-500/20 to-pink-700/10',     accentHex: '#fda4af', initial: 'VC', index: '03' },
  { key: 'emll',       title: 'EMLL',            url: 'https://emll.vercel.app/',               image: '/images/portfolio/emll.png',         gradient: 'from-violet-400/20 to-indigo-600/10', accentHex: '#c4b5fd', initial: 'EM', index: '04' },
  { key: 'riad',       title: 'RiadConnect',     url: 'https://riadconnect.vercel.app/',        image: '/images/portfolio/riadconnect.png',  gradient: 'from-purple-600/20 to-violet-500/10', accentHex: '#7c3aed', initial: 'RC', index: '05' },
  { key: 'riaddemo',   title: 'ChronoCraft',     url: 'https://watchstoremaroc.vercel.app',     image: '/images/portfolio/chronocraft.png',  gradient: 'from-yellow-500/20 to-amber-700/10',  accentHex: '#eab308', initial: 'CC', index: '06' },
  { key: 'watchstore', title: 'Tarique / طريق',  url: 'https://www.tarique.ma',                 image: '/images/portfolio/tarique.png',      gradient: 'from-amber-500/20 to-orange-700/10',  accentHex: '#fbbf24', initial: 'TA', index: '07' },
];

function ProjectNumber({ n }: { n: string }) {
  return (
    <span
      className="font-black leading-none select-none tabular-nums"
      style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.20) 0%, rgba(168,85,247,0.06) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {n}
    </span>
  );
}

export default function Portfolio() {
  const { t } = useLanguage();
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' });

  const projects = projectsMeta.map((p) => ({
    ...p,
    type: t(`portfolio.type.${p.key}`),
    desc: t(`portfolio.desc.${p.key}`),
  }));

  const [featured, ...rest] = projects;

  return (
    <section id="portfolio" className="py-32 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full -translate-y-1/3 translate-x-1/4"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.05) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 ambient-grid opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">

        {/* ── Header ── */}
        <div ref={headerRef} className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center mb-7"
          >
            <span className="section-label">{t('portfolio.eyebrow')}</span>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <motion.h2
              initial={{ opacity: 0, y: 28 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.04] tracking-tight"
            >
              {t('portfolio.title')}{' '}
              <span className="gradient-text">{t('portfolio.title.bold')}</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-slate-500 max-w-xs text-sm leading-relaxed shrink-0 lg:text-right"
            >
              {t('portfolio.subtitle')}
            </motion.p>
          </div>
        </div>

        {/* ── Featured card ── */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.99 }}
          className="mb-5 group"
        >
          <a
            href={featured.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-3xl overflow-hidden transition-all duration-300 premium-surface"
            style={{ borderColor: 'rgba(124,58,237,0.18)' }}
          >
            {/* Top beam */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)' }} />

            <div className="flex flex-col md:flex-row">
              {/* Preview */}
              <div className={`relative md:w-5/12 h-60 md:h-80 bg-gradient-to-br ${featured.gradient} overflow-hidden shrink-0`}>
                <Image
                  src={featured.image}
                  alt={`${featured.title} project preview`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090713]/85 via-[#090713]/20 to-transparent" />
                {/* Giant initial watermark */}
                <div
                  className="absolute inset-0 flex items-center justify-center font-black select-none transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-rotate-2"
                  style={{
                    fontSize: 'clamp(90px, 18vw, 200px)',
                    color: 'rgba(124,58,237,0.07)',
                    letterSpacing: '-0.05em',
                  }}
                >
                  {featured.initial}
                </div>

                {/* Big index number */}
                <div className="absolute bottom-6 left-7" style={{ fontSize: '88px' }}>
                  <ProjectNumber n={featured.index} />
                </div>

                {/* Live badge */}
                <div className="absolute top-5 left-6 flex items-center gap-2 text-[11px] font-semibold text-violet-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  {t('portfolio.live')}
                </div>

                {/* Hover icon */}
                <div className="absolute top-5 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-9 h-9 rounded-xl bg-white/8 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-white/60" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 md:p-12 flex flex-col justify-center flex-1">
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-violet-500 mb-4">
                  {featured.type}
                </p>
                <h3 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight tracking-tight">
                  {featured.title}
                </h3>
                <div className="inline-flex items-center gap-1.5 mb-5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 w-fit">
                  <BadgeCheck className="w-3 h-3 text-violet-400" />
                  <span className="text-[10px] font-semibold text-violet-400 tracking-wide">Powered by MBN DEV</span>
                </div>
                <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-sm">
                  {featured.desc}
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-violet-400 group-hover:text-violet-300 transition-colors">
                  View Project
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </a>
        </motion.div>

        {/* ── Grid ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {rest.map((p, i) => (
            <motion.a
              key={p.title}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.975 }}
              className="group block rounded-2xl overflow-hidden premium-surface"
            >
              {/* Top beam on hover */}
              <div
                className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.55), transparent)' }}
              />

              {/* Preview */}
              <div className={`h-36 bg-gradient-to-br ${p.gradient} relative overflow-hidden`}>
                <Image
                  src={p.image}
                  alt={`${p.title} project preview`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090713]/85 via-[#090713]/20 to-transparent" />
                <div
                  className="absolute inset-0 flex items-center justify-center font-black select-none transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-rotate-2"
                  style={{ fontSize: '72px', color: 'rgba(124,58,237,0.08)' }}
                >
                  {p.initial}
                </div>
                <div className="absolute bottom-3 left-4" style={{ fontSize: '50px' }}>
                  <ProjectNumber n={p.index} />
                </div>
                <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[10px] font-semibold text-violet-400">
                  <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" />
                  {t('portfolio.live')}
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-7 h-7 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center">
                    <ExternalLink className="w-3 h-3 text-white/50" />
                  </div>
                </div>
              </div>

              <div className="p-5">
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-violet-600 mb-2">
                  {p.type}
                </p>
                <h3 className="text-base font-bold text-white mb-1.5 leading-snug tracking-tight">
                  {p.title}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-2">{p.desc}</p>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/8 border border-violet-500/15 w-fit">
                  <BadgeCheck className="w-2.5 h-2.5 text-violet-500" />
                  <span className="text-[9px] font-semibold text-violet-500 tracking-wide">Powered by MBN DEV</span>
                </div>
              </div>
            </motion.a>
          ))}

          {/* View all */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: rest.length * 0.09, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/portfolio" className="block h-full">
              <div className="h-full min-h-[220px] rounded-2xl flex flex-col items-center justify-center gap-5 p-8 text-center group cursor-pointer premium-surface hover:border-violet-500/25 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-violet-500/15 transition-all duration-300">
                  <ArrowUpRight className="w-5 h-5 text-violet-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div>
                  <p className="font-bold text-white mb-1 text-sm">{t('portfolio.viewAll')}</p>
                  <p className="text-slate-600 text-xs">{t('portfolio.viewAll.sub')}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ExternalLink, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type ProjectKey = 'carrylink' | 'lueur' | 'tyy' | 'emll' | 'riad';

const projectsMeta: {
  key: ProjectKey;
  title: string;
  url: string;
  gradient: string;
  accentColor: string;
  initial: string;
  index: string;
}[] = [
  { key: 'carrylink', title: 'CarryLink',   url: 'https://carrylink.vercel.app/',   gradient: 'from-sky-600/30 via-blue-700/20 to-transparent',     accentColor: '#38bdf8', initial: 'CL', index: '01' },
  { key: 'lueur',     title: 'Lueur Skin',  url: 'https://lueurskin.vercel.app/',   gradient: 'from-rose-500/30 via-pink-700/20 to-transparent',     accentColor: '#fb7185', initial: 'LS', index: '02' },
  { key: 'tyy',       title: 'TyyMaroc',    url: 'https://tyymaroc.vercel.app/',    gradient: 'from-teal-500/30 via-emerald-700/20 to-transparent',  accentColor: '#2dd4bf', initial: 'TM', index: '03' },
  { key: 'emll',      title: 'Emll',        url: 'https://emll.vercel.app/',        gradient: 'from-amber-500/30 via-orange-700/20 to-transparent',  accentColor: '#fbbf24', initial: 'EM', index: '04' },
  { key: 'riad',      title: 'RiadConnect', url: 'https://www.riadconnect.com/',    gradient: 'from-violet-500/30 via-purple-700/20 to-transparent', accentColor: '#a78bfa', initial: 'RC', index: '05' },
];

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
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.05) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 ambient-grid opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">

        {/* ── Section header ── */}
        <div ref={headerRef} className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center mb-8"
          >
            <span className="section-label">{t('portfolio.eyebrow')}</span>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <motion.h2
              initial={{ opacity: 0, y: 28 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.04] tracking-tight"
            >
              {t('portfolio.title')}{' '}
              <span className="gold-text-gradient font-display italic">{t('portfolio.title.bold')}</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="text-slate-500 max-w-xs lg:text-right text-sm leading-relaxed shrink-0"
            >
              {t('portfolio.subtitle')}
            </motion.p>
          </div>
        </div>

        {/* ── Featured project (large) ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 group"
        >
          <a
            href={featured.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(8,8,12,0.95)',
              border: `1px solid ${featured.accentColor}20`,
              boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 80px ${featured.accentColor}08`,
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = `${featured.accentColor}35`;
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 32px 100px rgba(0,0,0,0.7), 0 0 100px ${featured.accentColor}12`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = `${featured.accentColor}20`;
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 32px 80px rgba(0,0,0,0.6), 0 0 80px ${featured.accentColor}08`;
            }}
          >
            {/* Top beam */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${featured.accentColor}60, transparent)` }} />

            <div className="flex flex-col md:flex-row">
              {/* Preview area */}
              <div
                className={`relative md:w-1/2 h-64 md:h-80 bg-gradient-to-br ${featured.gradient} overflow-hidden shrink-0`}
              >
                {/* Giant initial */}
                <div
                  className="absolute inset-0 flex items-center justify-center font-display font-bold select-none"
                  style={{
                    fontSize: 'clamp(80px, 20vw, 180px)',
                    color: `${featured.accentColor}09`,
                    letterSpacing: '-0.05em',
                  }}
                >
                  {featured.initial}
                </div>

                {/* Index number */}
                <div className="absolute bottom-5 left-6">
                  <span className="luxury-number font-display font-bold" style={{ fontSize: '80px' }}>
                    {featured.index}
                  </span>
                </div>

                {/* Live dot */}
                <div className="absolute top-5 left-6 flex items-center gap-2 text-[11px] font-semibold"
                  style={{ color: featured.accentColor }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: featured.accentColor }} />
                  {t('portfolio.live')}
                </div>
              </div>

              {/* Content area */}
              <div className="p-8 md:p-12 flex flex-col justify-center flex-1">
                <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4"
                  style={{ color: featured.accentColor }}>
                  {featured.type}
                </p>
                <h3 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  {featured.title}
                </h3>
                <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-sm">
                  {featured.desc}
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold transition-all duration-200"
                  style={{ color: featured.accentColor }}>
                  View Project
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </a>
        </motion.div>

        {/* ── Remaining projects grid ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {rest.map((p, i) => (
            <motion.a
              key={p.title}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group block relative rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(8,8,12,0.95)',
                border: `1px solid ${p.accentColor}18`,
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
              }}
              whileHover={{ y: -4 }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = `${p.accentColor}30`;
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 24px 60px rgba(0,0,0,0.6), 0 0 60px ${p.accentColor}08`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = `${p.accentColor}18`;
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 16px 48px rgba(0,0,0,0.5)';
              }}
            >
              {/* Top beam */}
              <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${p.accentColor}50, transparent)` }} />

              {/* Preview */}
              <div className={`h-36 bg-gradient-to-br ${p.gradient} relative overflow-hidden`}>
                <div
                  className="absolute inset-0 flex items-center justify-center font-display font-bold select-none"
                  style={{ fontSize: '72px', color: `${p.accentColor}10` }}
                >
                  {p.initial}
                </div>

                {/* Index */}
                <div className="absolute bottom-3 left-4">
                  <span className="luxury-number font-display font-bold" style={{ fontSize: '48px' }}>
                    {p.index}
                  </span>
                </div>

                {/* Arrow on hover */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${p.accentColor}20`, border: `1px solid ${p.accentColor}30` }}>
                    <ExternalLink className="w-3 h-3" style={{ color: p.accentColor }} />
                  </div>
                </div>

                {/* Live dot */}
                <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[10px] font-semibold"
                  style={{ color: p.accentColor }}>
                  <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: p.accentColor }} />
                  {t('portfolio.live')}
                </div>
              </div>

              <div className="p-5">
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-2"
                  style={{ color: p.accentColor }}>
                  {p.type}
                </p>
                <h3 className="font-display text-lg font-bold text-white mb-1.5 leading-tight">
                  {p.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">{p.desc}</p>
              </div>
            </motion.a>
          ))}

          {/* View all card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: rest.length * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/portfolio" className="block h-full">
              <div
                className="h-full min-h-[220px] rounded-2xl flex flex-col items-center justify-center gap-5 p-8 text-center group cursor-pointer transition-all duration-300"
                style={{
                  background: 'rgba(8,8,12,0.6)',
                  border: '1px solid rgba(201,168,76,0.12)',
                  transition: 'border-color 0.3s, background 0.3s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.3)';
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(201,168,76,0.04)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.12)';
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(8,8,12,0.6)';
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.2)' }}
                >
                  <ArrowUpRight className="w-5 h-5" style={{ color: '#d4b86a' }} />
                </div>
                <div>
                  <p className="font-display font-bold text-white mb-1">{t('portfolio.viewAll')}</p>
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

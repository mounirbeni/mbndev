'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/* ─────────────────────────────────────────────────────────────────────────────
   Each service is a full-width catalogue row — number, title, description,
   feature tags. No cards. No icons. Typography and negative space carry it.
───────────────────────────────────────────────────────────────────────────── */

function ServiceRow({
  num,
  title,
  desc,
  tags,
  href,
  index,
}: {
  num: string;
  title: string;
  desc: string;
  tags: string[];
  href: string;
  index: number;
}) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={href} className="group block">
        {/* Divider */}
        <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />

        <div className="grid lg:grid-cols-[64px_1fr_1fr_40px] gap-x-10 xl:gap-x-16
                        py-10 sm:py-12 items-start">

          {/* ── Number ── */}
          <div className="hidden lg:block pt-1">
            <span className="text-[11px] font-bold tabular-nums tracking-[0.16em]"
              style={{ color: 'rgba(124,58,237,0.5)' }}>
              {num}
            </span>
          </div>

          {/* ── Title ── */}
          <div className="flex items-start gap-4 lg:gap-0 lg:block">
            {/* Mobile number */}
            <span className="lg:hidden text-[11px] font-bold tabular-nums tracking-widest pt-1 shrink-0"
              style={{ color: 'rgba(124,58,237,0.5)' }}>
              {num}
            </span>
            <h3
              className="font-black text-white leading-[1.06] tracking-tight
                         transition-colors duration-300 group-hover:text-violet-200"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.8rem)' }}
            >
              {title}
            </h3>
          </div>

          {/* ── Description + Tags ── */}
          <div className="mt-4 lg:mt-0 lg:pt-1">
            <p className="text-slate-500 text-[15px] leading-relaxed mb-5 max-w-sm">
              {desc}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {tags.map((tag, i) => (
                <span key={tag} className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold"
                  style={{ color: 'rgba(148,163,184,0.5)' }}>
                  {i > 0 && <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>}
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* ── Arrow ── */}
          <div className="hidden lg:flex items-start justify-end pt-2">
            <ArrowUpRight
              className="w-5 h-5 transition-all duration-300 group-hover:text-violet-400
                         -translate-y-1 group-hover:translate-y-0 group-hover:translate-x-0.5
                         opacity-0 group-hover:opacity-100"
              style={{ color: 'rgba(148,163,184,0.6)' }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Section
───────────────────────────────────────────────────────────────────────────── */

export default function Services() {
  const { t }      = useLanguage();
  const headerRef  = useRef<HTMLDivElement>(null);
  const headerView = useInView(headerRef, { once: true, margin: '-80px' });

  const services = [
    {
      num:   '01',
      title: t('services.customWebsites'),
      desc:  t('services.customWebsitesDesc'),
      tags:  [t('services.feat.responsive'), t('services.feat.seo'), t('services.feat.fast')],
      href:  '/services/custom-websites',
    },
    {
      num:   '02',
      title: t('services.ecommerce'),
      desc:  t('services.ecommerceDesc'),
      tags:  [t('services.feat.payment'), t('services.feat.productMgmt'), t('services.feat.orderTracking')],
      href:  '/services/ecommerce',
    },
    {
      num:   '03',
      title: t('services.saas'),
      desc:  t('services.saasDesc'),
      tags:  [t('services.feat.realtime'), t('services.feat.userAuth'), t('services.feat.analytics')],
      href:  '/services/web-applications',
    },
    {
      num:   '04',
      title: t('services.landing'),
      desc:  t('services.landingDesc'),
      tags:  [t('services.feat.abTesting'), t('services.feat.leadCapture'), t('services.feat.cro')],
      href:  '/services/landing-pages',
    },
    {
      num:   '05',
      title: t('services.webApps'),
      desc:  t('services.webAppsDesc'),
      tags:  [t('services.feat.pwa'), t('services.feat.offline'), t('services.feat.push')],
      href:  '/services/web-applications',
    },
    {
      num:   '06',
      title: t('services.maintenance'),
      desc:  t('services.maintenanceDesc'),
      tags:  [t('services.feat.monitoring'), 'Performance', 'Updates'],
      href:  '/services/maintenance',
    },
  ];

  return (
    <section id="services" className="relative overflow-hidden"
      style={{ paddingTop: '7rem', paddingBottom: '7rem' }}>

      {/* Single directional light — comes from top-left */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 0% 0%, rgba(124,58,237,0.09) 0%, transparent 65%)',
        }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">

        {/* ── Editorial header — left-aligned, not centered ── */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 lg:mb-28"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] mb-5"
            style={{ color: 'rgba(124,58,237,0.7)' }}>
            {t('services.badge')}
          </p>
          <h2 className="font-black text-white tracking-tight leading-[1.02] max-w-2xl"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)' }}>
            {t('services.title')}{' '}
            <span className="gradient-text">{t('services.titleHighlight')}</span>
          </h2>
          <p className="text-slate-500 mt-5 text-lg max-w-xl leading-relaxed">
            {t('services.sub')}
          </p>
        </motion.div>

        {/* ── Catalogue rows ── */}
        <div>
          {services.map((s, i) => (
            <ServiceRow key={s.num} index={i} {...s} />
          ))}
          {/* Closing divider */}
          <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* ── Foot note ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 text-[13px]"
          style={{ color: 'rgba(100,116,139,0.7)' }}
        >
          Not sure where to start?{' '}
          <Link href="/contact"
            className="font-semibold transition-colors duration-200"
            style={{ color: 'rgba(168,85,247,0.85)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(196,181,253,1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(168,85,247,0.85)')}>
            Let's talk →
          </Link>
        </motion.p>

      </div>
    </section>
  );
}

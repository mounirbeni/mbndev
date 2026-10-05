'use client';

import { useRef } from 'react';
import { m as motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Magnetic from '@/components/ui/Magnetic';
import { ArrowRight, MapPin, Zap, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import SilkRibbons from '@/components/ui/SilkRibbons';

export default function CTA() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  // Last two words of the title in the serif accent: "Have a project *in mind?*"
  const titleWords = t('cta.title').split(' ');
  const titleLead = titleWords.slice(0, -2).join(' ');
  const titleAccent = titleWords.slice(-2).join(' ');

  return (
    <section id="contact" className="py-32 relative overflow-hidden">

      {/* Silk ribbon bookend — echoes the hero */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)',
        }}
      >
        <SilkRibbons className="absolute inset-0" anchor={[0.5, 0.3]} intensity={0.75} speed={0.8} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(55% 45% at 50% 38%, rgba(7,6,15,0.82) 0%, rgba(7,6,15,0.35) 70%, transparent 100%)' }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10" ref={ref}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center mb-8"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-violet-300 border border-violet-500/25 bg-violet-500/8">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
            </span>
            {t('cta.badge')}
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-[-0.035em] leading-[1.06]"
        >
          {titleLead}{' '}
          <span className="serif-accent silk-text pr-[0.06em]">{titleAccent}</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl text-violet-300 mb-3 font-medium"
        >
          {t('cta.sub')}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="text-slate-400 mb-10 max-w-xl mx-auto text-base leading-relaxed"
        >
          {t('cta.body')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-14"
        >
          <Magnetic>
            <Link
              href="/request"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#ede6ff] pl-6 pr-2 py-2 text-[15px] font-semibold text-[#14092b] shadow-[0_10px_40px_-8px_rgba(168,85,247,0.65)] transition-colors hover:bg-white"
            >
              {t('cta.start')}
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#14092b] text-white transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </Magnetic>
          <a
            href="https://wa.me/212705914424"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3.5 text-[15px] font-medium text-slate-200 backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/[0.06]"
          >
            {t('cta.whatsapp')}
          </a>
        </motion.div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(10,10,16,0.85)',
            border: '1px solid rgba(124,58,237,0.2)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 0 80px rgba(124,58,237,0.1), 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-violet-500/70 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-violet-500/8 blur-2xl pointer-events-none" />

          <div className="relative z-10 py-10 px-6 sm:px-12">
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              {[
                { icon: MapPin,       text: t('cta.location'),  color: 'text-violet-400' },
                { icon: Clock,        text: t('cta.response'),  color: 'text-blue-400' },
                { icon: Zap,          text: t('cta.nocommit'),  color: 'text-emerald-400' },
                { icon: CheckCircle2, text: 'Free consultation', color: 'text-amber-400' },
              ].map(({ icon: Icon, text, color }) => (
                <motion.span
                  key={text}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className={`flex items-center gap-2 font-medium ${color}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-slate-300">{text}</span>
                </motion.span>
              ))}
            </div>
          </div>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}

'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ArrowRight, MapPin, Zap, Clock, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CTA() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="contact" className="py-32 relative overflow-hidden">

      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-violet-500/10 blur-[130px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-full bg-blue-500/6 blur-[100px]" />
        <div className="absolute inset-0 ambient-grid opacity-30" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10" ref={ref}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-violet-300 border border-violet-500/25 bg-violet-500/8">
            <Sparkles className="w-3 h-3" />
            {t('cta.badge')}
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 tracking-tight leading-[1.06]"
        >
          {t('cta.title')}
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
          className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
        >
          <Link href="/request">
            <Button size="lg" className="group relative overflow-hidden glow-button">
              <span className="relative z-10 flex items-center gap-2">
                {t('cta.start')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
          <a href="https://wa.me/212705914424" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="group relative overflow-hidden">
              <span className="relative z-10">{t('cta.whatsapp')}</span>
              <span className="absolute inset-0 bg-white/4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Button>
          </a>
        </motion.div>

        {/* The main cinematic card */}
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
          {/* Top beam */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-violet-500/70 to-transparent" />

          {/* Inner glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-violet-500/8 blur-2xl pointer-events-none" />

          <div className="relative z-10 py-10 px-6 sm:px-12">
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              {[
                { icon: MapPin, text: t('cta.location'),  color: 'text-violet-400' },
                { icon: Clock,  text: t('cta.response'),  color: 'text-blue-400' },
                { icon: Zap,    text: t('cta.nocommit'),  color: 'text-emerald-400' },
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

          {/* Bottom beam */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        </motion.div>

      </div>
    </section>
  );
}

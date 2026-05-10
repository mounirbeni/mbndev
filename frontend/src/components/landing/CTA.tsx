'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ArrowRight, MapPin, Zap, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CTA() {
  const { t } = useLanguage();
  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary-500/10 via-transparent to-transparent" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="glass rounded-3xl p-12 border border-primary-500/20 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              <span className="text-primary-400 text-sm font-medium uppercase tracking-widest mb-4 block">
                {t('cta.badge')}
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                {t('cta.title')}
              </h2>
              <p className="text-xl text-primary-300 mb-3">
                {t('cta.sub')}
              </p>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                {t('cta.body')}
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/request">
                  <Button size="lg" className="group">
                    {t('cta.start')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <a href="https://wa.me/212705914424" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline">
                    {t('cta.whatsapp')}
                  </Button>
                </a>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-8 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {t('cta.location')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {t('cta.response')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> {t('cta.nocommit')}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

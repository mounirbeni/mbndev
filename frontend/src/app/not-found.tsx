'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Home } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0d] px-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/8 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5 mb-12">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">MBN DEV</span>
        </Link>

        {/* 404 */}
        <div className="text-[120px] font-black text-white/5 leading-none select-none mb-2">
          404
        </div>
        <h1 className="text-2xl font-bold text-white mb-3 -mt-4">{t('notfound.title')}</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          {t('notfound.sub')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button size="md">
              <Home className="w-4 h-4" />
              {t('notfound.backHome')}
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="md" variant="outline">
              {t('notfound.contact')}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

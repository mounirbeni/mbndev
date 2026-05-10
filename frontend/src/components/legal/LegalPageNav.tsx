'use client';

import Link from 'next/link';
import { Zap, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function LegalPageNav() {
  const { t } = useLanguage();
  return (
    <nav className="border-b border-white/5 px-4 sm:px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-bold">MBN DEV</span>
      </Link>
      <Link
        href="/"
        className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('legal.back')}
      </Link>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Logo3D from '@/components/ui/Logo3D';
import { useLanguage } from '@/contexts/LanguageContext';

export function LegalPageNav() {
  const { t } = useLanguage();
  return (
    <nav className="border-b border-white/5 px-4 sm:px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
      <Link href="/" className="flex items-center gap-2.5">
        <Logo3D size="sm" />
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

'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export function LegalPageFooter() {
  const { t } = useLanguage();
  return (
    <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-slate-600 text-sm">
        © {new Date().getFullYear()} MBN DEV. {t('legal.footer.rights')}
      </p>
      <div className="flex gap-4 text-sm text-slate-500">
        <Link href="/privacy" className="hover:text-slate-300 transition-colors">
          {t('legal.footer.privacy')}
        </Link>
        <Link href="/terms" className="hover:text-slate-300 transition-colors">
          {t('legal.footer.terms')}
        </Link>
        <Link href="/contact" className="hover:text-slate-300 transition-colors">
          {t('legal.footer.contact')}
        </Link>
      </div>
    </div>
  );
}

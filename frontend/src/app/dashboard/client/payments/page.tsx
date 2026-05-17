'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { paymentAPI } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { Payment } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, FileText, AlertTriangle, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function ClientPaymentsPage() {
  const { t } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchPayments = useCallback((silent = false) => {
    if (!silent) { setLoading(true); setFetchError(null); }
    paymentAPI.getAll()
      .then(({ data }) => setPayments(data.payments))
      .catch((err) => {
        console.error(err);
        if (!silent) setFetchError(t('toast.error'));
      })
      .finally(() => { if (!silent) setLoading(false); });
  }, []);

  // Initial load
  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  // Real-time polling (20 s when tab is visible)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => { timer = setInterval(() => fetchPayments(true), 20_000); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
    const onVis = () => document.visibilityState === 'visible' ? start() : stop();
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, [fetchPayments]);

  const total = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-300 flex-1">{fetchError}</span>
          <button
            onClick={() => fetchPayments(false)}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}
      <h1 className="text-2xl font-bold text-white">{t('dash.nav.payments')}</h1>

      <div className="glass rounded-2xl p-6 border border-white/5">
        <p className="text-slate-400 text-sm">{t('invoice.total')}</p>
        <p className="text-4xl font-bold text-white mt-1">{formatCurrency(total)}</p>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">{t('client.noPayments')}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">{t('admin.col.project')}</th>
                <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">{t('admin.col.milestone')}</th>
                <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">{t('admin.col.amount')}</th>
                <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">{t('admin.status')}</th>
                <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">{t('admin.col.date')}</th>
                <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">{t('invoice.title')}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((pay, i) => {
                const project = typeof pay.project === 'object' ? pay.project : null;
                return (
                  <motion.tr
                    key={pay._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/2 transition-colors"
                  >
                    <td className="p-4 text-sm text-white">{project?.title || '—'}</td>
                    <td className="p-4 text-sm text-slate-400">{pay.milestoneTitle || '—'}</td>
                    <td className="p-4 text-sm font-semibold text-white">{formatCurrency(pay.amount)}</td>
                    <td className="p-4">
                      <StatusBadge status={pay.status} />
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {pay.paidAt ? formatDate(pay.paidAt) : formatDate(pay.createdAt)}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/invoice/${pay._id}`}
                        className="inline-flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {t('invoice.title')}
                      </Link>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

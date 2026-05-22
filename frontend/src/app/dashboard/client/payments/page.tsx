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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t('dash.nav.payments')}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? 'Loading...' : `${payments.length} transaction${payments.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Total revenue card */}
      <div className="relative glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500" />
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1">{t('invoice.total')} paid</p>
            <p className="text-3xl font-black text-white tabular-nums">
              {formatCurrency(total)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-emerald-400" strokeWidth={1.8} />
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-white/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="w-9 h-9 rounded-xl skeleton-shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 rounded skeleton-shimmer" />
                  <div className="h-2.5 w-1/5 rounded skeleton-shimmer" />
                </div>
                <div className="h-5 w-16 rounded-full skeleton-shimmer" />
                <div className="h-4 w-20 rounded skeleton-shimmer" />
              </div>
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-6 h-6 text-slate-600" strokeWidth={1.5} />
            </div>
            <p className="text-slate-300 text-sm font-medium mb-1">{t('client.noPayments')}</p>
            <p className="text-slate-600 text-xs">Your payment history will appear here</p>
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="divide-y divide-white/5 sm:hidden">
              {payments.map((pay, i) => {
                const project = typeof pay.project === 'object' ? pay.project : null;
                return (
                  <motion.div
                    key={pay._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white font-medium truncate">{project?.title || '—'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {pay.paidAt ? formatDate(pay.paidAt) : formatDate(pay.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={pay.status} />
                      <span className="text-sm font-semibold text-white tabular-nums">{formatCurrency(pay.amount)}</span>
                      <Link
                        href={`/invoice/${pay._id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-violet-400 transition-colors"
                        style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Invoice
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/6">
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{t('admin.col.project')}</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden sm:table-cell">{t('admin.col.milestone')}</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{t('admin.col.amount')}</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden md:table-cell">{t('admin.status')}</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden lg:table-cell">{t('admin.col.date')}</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{t('invoice.title')}</th>
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
                        <td className="p-4 text-sm text-slate-400 hidden sm:table-cell">{pay.milestoneTitle || '—'}</td>
                        <td className="p-4 text-sm font-semibold text-white">{formatCurrency(pay.amount)}</td>
                        <td className="p-4 hidden md:table-cell">
                          <StatusBadge status={pay.status} />
                        </td>
                        <td className="p-4 text-sm text-slate-400 hidden lg:table-cell">
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}

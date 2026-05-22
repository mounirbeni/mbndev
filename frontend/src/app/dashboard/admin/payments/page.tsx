'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { paymentAPI } from '@/lib/api';
import { Payment } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, CheckCircle, Clock, FileText, AlertTriangle, RefreshCcw, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const METHOD_LABELS: Record<string, string> = {
  cih_bank:   'CIH Bank',
  paypal:     'PayPal',
  taptapsend: 'TapTapSend',
  mock:       'Mock',
};

export default function AdminPaymentsPage() {
  const { t } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);

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

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => { timer = setInterval(() => fetchPayments(true), 15_000); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
    const onVis = () => document.visibilityState === 'visible' ? start() : stop();
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, [fetchPayments]);

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      await paymentAPI.approveManual(id);
      toast.success(t('toast.saved'));
      fetchPayments(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('toast.error'));
    } finally {
      setApproving(null);
    }
  };

  const totalRevenue  = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pendingVerif  = payments.filter((p) => p.status === 'pending_verification');
  const pendingAmount = payments.filter((p) => p.status === 'pending' || p.status === 'pending_verification').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 max-w-6xl">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t('admin.payments')}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? 'Loading...' : `${payments.length} transaction${payments.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {pendingVerif.length > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-yellow-300 self-start"
               style={{ background: 'rgba(234,179,8,0.10)', border: '1px solid rgba(234,179,8,0.22)' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
            </span>
            {pendingVerif.length} {t('admin.awaitingVerif')}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <div className="relative glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500" />
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs mb-1">{t('admin.totalRevenue')}</p>
              <p className="text-2xl font-black text-white tabular-nums">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center"
                 style={{ boxShadow: '0 0 12px rgba(16,185,129,0.15)' }}>
              <DollarSign className="w-5 h-5 text-emerald-400" strokeWidth={1.8} />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="relative glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500" />
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs mb-1">{t('status.pending')}</p>
              <p className="text-2xl font-black text-amber-400 tabular-nums">{formatCurrency(pendingAmount)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center"
                 style={{ boxShadow: '0 0 12px rgba(245,158,11,0.15)' }}>
              <Clock className="w-5 h-5 text-amber-400" strokeWidth={1.8} />
            </div>
          </div>
        </div>

        {/* Total Invoices */}
        <div className="relative glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-primary-600 via-primary-500 to-violet-500" />
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs mb-1">{t('admin.totalInvoices')}</p>
              <p className="text-2xl font-black text-white tabular-nums">{payments.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center"
                 style={{ boxShadow: '0 0 12px rgba(124,58,237,0.15)' }}>
              <TrendingUp className="w-5 h-5 text-primary-400" strokeWidth={1.8} />
            </div>
          </div>
        </div>
      </div>

      {/* Payments table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-white/5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="w-8 h-8 rounded-xl skeleton-shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 rounded skeleton-shimmer" />
                  <div className="h-2.5 w-1/5 rounded skeleton-shimmer" />
                </div>
                <div className="h-4 w-20 rounded skeleton-shimmer hidden sm:block" />
                <div className="h-5 w-16 rounded-full skeleton-shimmer" />
                <div className="h-7 w-20 rounded-xl skeleton-shimmer hidden md:block" />
              </div>
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-6 h-6 text-slate-600" strokeWidth={1.5} />
            </div>
            <p className="text-slate-300 text-sm font-medium mb-1">{t('empty.payments')}</p>
            <p className="text-slate-600 text-xs">Payment records will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{t('admin.clients')}</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden sm:table-cell">{t('admin.col.orderProject')}</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{t('admin.col.amount')}</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden md:table-cell">{t('admin.col.method')}</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{t('admin.status')}</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden lg:table-cell">{t('admin.col.date')}</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden sm:table-cell">{t('invoice.title')}</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{t('admin.col.action')}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((pay, i) => {
                  const client  = typeof pay.client  === 'object' ? pay.client  : null;
                  const project = typeof pay.project === 'object' ? pay.project : null;
                  const order   = typeof pay.order   === 'object' ? pay.order   : null;
                  const isVerif = pay.status === 'pending_verification';

                  return (
                    <motion.tr
                      key={pay._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={`border-b border-white/5 transition-colors ${
                        isVerif ? 'bg-yellow-500/5 hover:bg-yellow-500/8' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="p-4 text-sm text-white font-medium">{client?.name || '—'}</td>
                      <td className="p-4 text-sm text-slate-400 hidden sm:table-cell">
                        {order?.title || project?.title || '—'}
                      </td>
                      <td className="p-4 text-sm font-semibold text-white">{formatCurrency(pay.amount)}</td>
                      <td className="p-4 text-sm text-slate-400 hidden md:table-cell">
                        {pay.method ? METHOD_LABELS[pay.method] || pay.method : t('admin.col.manual')}
                      </td>
                      <td className="p-4"><StatusBadge status={pay.status} /></td>
                      <td className="p-4 text-sm text-slate-400 hidden lg:table-cell">
                        {pay.paidAt ? formatDate(pay.paidAt) : formatDate(pay.createdAt)}
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <Link
                          href={`/invoice/${pay._id}`}
                          className="inline-flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {t('common.view')}
                        </Link>
                      </td>
                      <td className="p-4">
                        {isVerif ? (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(pay._id as string)}
                            disabled={approving === pay._id}
                          >
                            {approving === pay._id ? (
                              <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                                {t('admin.approving')}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {t('admin.approve')}
                              </span>
                            )}
                          </Button>
                        ) : (
                          <span className="text-slate-700 text-xs">—</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

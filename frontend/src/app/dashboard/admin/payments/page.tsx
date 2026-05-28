'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { paymentAPI } from '@/lib/api';
import { Payment } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  CreditCard, CheckCircle, Clock, FileText, AlertTriangle,
  RefreshCcw, TrendingUp, DollarSign, XCircle, Link2, X,
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const METHOD_LABELS: Record<string, string> = {
  cih_bank:   'CIH Bank',
  paypal:     'PayPal',
  taptapsend: 'TapTapSend',
  mock:       'Mock (Test)',
};

// ─── Confirmation portal modal ────────────────────────────────────────────────

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  loading: boolean;
  mode: 'approve' | 'reject';
  payment: Payment | null;
}

function ConfirmModal({ open, onClose, onConfirm, loading, mode, payment }: ConfirmModalProps) {
  const [reason, setReason] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reset reason when modal opens
  useEffect(() => {
    if (open) {
      setReason('');
      if (mode === 'reject') setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open, mode]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (typeof window === 'undefined') return null;

  const isApprove = mode === 'approve';
  const client  = typeof payment?.client  === 'object' ? payment?.client  : null;
  const order   = typeof payment?.order   === 'object' ? payment?.order   : null;
  const project = typeof payment?.project === 'object' ? payment?.project : null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{ opacity: 0,   scale: 0.94, y: 12  }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            style={{ background: '#13111C' }}
          >
            {/* Top accent */}
            <div className={`h-[3px] ${isApprove
              ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400'
              : 'bg-gradient-to-r from-red-700 via-red-500 to-rose-400'}`}
            />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isApprove ? 'bg-emerald-500/15' : 'bg-red-500/15'
                  }`}>
                    {isApprove
                      ? <CheckCircle className="w-5 h-5 text-emerald-400" strokeWidth={1.8} />
                      : <XCircle    className="w-5 h-5 text-red-400"     strokeWidth={1.8} />}
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-base">
                      {isApprove ? 'Approve Payment' : 'Reject Payment'}
                    </h2>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {isApprove
                        ? 'This will create the project and notify the client.'
                        : 'The client will be notified that payment was not received.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-600 hover:text-slate-400 transition-colors shrink-0 mt-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Payment summary */}
              {payment && (
                <div className="rounded-xl border border-white/6 p-4 mb-5 space-y-2"
                     style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Client</span>
                    <span className="text-white font-medium">{client?.name || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Order / Project</span>
                    <span className="text-slate-300">{order?.title || project?.title || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Amount</span>
                    <span className="text-white font-bold">{formatCurrency(payment.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Method</span>
                    <span className="text-slate-300">{payment.method ? METHOD_LABELS[payment.method] || payment.method : 'Manual'}</span>
                  </div>
                  {payment.externalRef && (
                    <div className="flex items-start justify-between text-sm gap-3">
                      <span className="text-slate-400 shrink-0">Ref / TxID</span>
                      <span className="text-emerald-400 font-mono text-xs break-all text-right">{payment.externalRef}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Rejection reason input */}
              {!isApprove && (
                <div className="mb-5">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Rejection reason <span className="text-slate-600">(optional — shown to client)</span>
                  </label>
                  <textarea
                    ref={inputRef}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="e.g. Payment reference not found in our records. Please resubmit with the correct transaction ID."
                    className="w-full rounded-xl border border-white/10 bg-white/4 text-white text-sm px-3.5 py-2.5 resize-none placeholder-slate-600 focus:outline-none focus:border-red-500/40 transition-colors"
                  />
                  <div className="text-right text-xs text-slate-600 mt-1">{reason.length}/500</div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-white/10 hover:bg-white/4 hover:text-white transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onConfirm(reason || undefined)}
                  disabled={loading}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
                    isApprove
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/30'
                      : 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/30'
                  }`}
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isApprove ? (
                    <><CheckCircle className="w-4 h-4" /> Approve & Create Project</>
                  ) : (
                    <><XCircle className="w-4 h-4" /> Reject Payment</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminPaymentsPage() {
  const { t } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modal state
  const [modalOpen,    setModalOpen]    = useState(false);
  const [modalMode,    setModalMode]    = useState<'approve' | 'reject'>('approve');
  const [modalPayment, setModalPayment] = useState<Payment | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

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

  // Poll every 15 s while tab is visible
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => { timer = setInterval(() => fetchPayments(true), 15_000); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
    const onVis = () => document.visibilityState === 'visible' ? start() : stop();
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, [fetchPayments]);

  const openModal = (pay: Payment, mode: 'approve' | 'reject') => {
    setModalPayment(pay);
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleConfirm = async (reason?: string) => {
    if (!modalPayment) return;
    setModalLoading(true);
    try {
      if (modalMode === 'approve') {
        await paymentAPI.approveManual(modalPayment._id as string);
        toast.success('Payment approved. Project created!');
      } else {
        await paymentAPI.rejectManual(modalPayment._id as string, reason);
        toast.success('Payment rejected. Client notified.');
      }
      setModalOpen(false);
      fetchPayments(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('toast.error');
      toast.error(msg);
    } finally {
      setModalLoading(false);
    }
  };

  const totalRevenue  = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pendingVerif  = payments.filter((p) => p.status === 'pending_verification');
  const pendingAmount = payments.filter((p) => p.status === 'pending' || p.status === 'pending_verification').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 max-w-6xl">
      <ConfirmModal
        open={modalOpen}
        onClose={() => { if (!modalLoading) setModalOpen(false); }}
        onConfirm={handleConfirm}
        loading={modalLoading}
        mode={modalMode}
        payment={modalPayment}
      />

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
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden lg:table-cell">Proof / Ref</th>
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

                      {/* Proof of payment / external reference */}
                      <td className="p-4 hidden lg:table-cell">
                        {pay.externalRef ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-lg max-w-[160px] truncate"
                                title={pay.externalRef}>
                            <Link2 className="w-3 h-3 shrink-0" />
                            {pay.externalRef}
                          </span>
                        ) : (
                          <span className="text-slate-700 text-xs">—</span>
                        )}
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
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => openModal(pay, 'approve')}
                              disabled={modalLoading}
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              {t('admin.approve')}
                            </Button>
                            <button
                              onClick={() => openModal(pay, 'reject')}
                              disabled={modalLoading}
                              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-2.5 py-1.5 rounded-lg border border-red-500/25 hover:bg-red-500/10 transition-all disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Not Received
                            </button>
                          </div>
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

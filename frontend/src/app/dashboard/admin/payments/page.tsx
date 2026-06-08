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
  ShieldAlert, History, ChevronRight, RotateCcw, Activity,
  Upload, Timer, Plus, type LucideIcon,
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

const EVENT_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  submitted:   { icon: Upload,        color: 'text-blue-400'   },
  approved:    { icon: CheckCircle,   color: 'text-emerald-400' },
  rejected:    { icon: XCircle,       color: 'text-red-400'     },
  expired:     { icon: Timer,         color: 'text-amber-400'  },
  flagged:     { icon: AlertTriangle, color: 'text-yellow-400'  },
  rolled_back: { icon: RotateCcw,     color: 'text-slate-400'   },
  created:     { icon: Plus,          color: 'text-slate-400'   },
  refunded:    { icon: RefreshCcw,    color: 'text-violet-400'  },
};

// ─── Confirm / reject modal (portal) ─────────────────────────────────────────

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

  useEffect(() => {
    if (open) { setReason(''); if (mode === 'reject') setTimeout(() => inputRef.current?.focus(), 80); }
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && !loading) onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose, loading]);

  if (typeof window === 'undefined') return null;

  const isApprove = mode === 'approve';
  const client    = typeof payment?.client  === 'object' ? payment?.client  : null;
  const order     = typeof payment?.order   === 'object' ? payment?.order   : null;
  const project   = typeof payment?.project === 'object' ? payment?.project : null;
  const isHighRisk = (payment?.riskScore ?? 0) >= 80;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0   }}
            exit={   { opacity: 0, scale: 0.94, y: 12  }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            style={{ background: '#13111C' }}
          >
            <div className={`h-[3px] ${isApprove
              ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400'
              : 'bg-gradient-to-r from-red-700 via-red-500 to-rose-400'}`} />

            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isApprove ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
                    {isApprove ? <CheckCircle className="w-5 h-5 text-emerald-400" strokeWidth={1.8} />
                               : <XCircle    className="w-5 h-5 text-red-400"     strokeWidth={1.8} />}
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-base">
                      {isApprove ? 'Approve Payment' : 'Reject Payment'}
                    </h2>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {isApprove ? 'Project will be created and client notified.' : 'Client will be notified to resubmit.'}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} disabled={loading} className="text-slate-600 hover:text-slate-400 transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* High-risk warning banner */}
              {isHighRisk && isApprove && (
                <div className="mb-4 p-3 rounded-xl border border-amber-500/30 flex items-start gap-2.5"
                     style={{ background: 'rgba(245,158,11,0.08)' }}>
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-400 text-xs font-semibold">High-Risk Payment (score {payment?.riskScore}/100)</p>
                    <p className="text-amber-300/70 text-xs mt-0.5">{payment?.flaggedReason}</p>
                  </div>
                </div>
              )}

              {/* Payment summary */}
              {payment && (
                <div className="rounded-xl border border-white/6 p-4 mb-5 space-y-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Client</span>
                    <span className="text-white font-medium">{client?.name || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Order</span>
                    <span className="text-slate-300 truncate max-w-[180px]">{order?.title || project?.title || '—'}</span>
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
                  {(payment.riskScore ?? 0) > 0 && (
                    <div className="flex items-center justify-between text-sm pt-1 border-t border-white/5">
                      <span className="text-slate-400">Risk Score</span>
                      <span className={`font-mono font-bold text-xs ${
                        (payment.riskScore ?? 0) >= 80 ? 'text-red-400'
                          : (payment.riskScore ?? 0) >= 60 ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}>{payment.riskScore}/100</span>
                    </div>
                  )}
                </div>
              )}

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

              <div className="flex gap-3">
                <button onClick={onClose} disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-white/10 hover:bg-white/4 hover:text-white transition-all disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={() => onConfirm(reason || undefined)} disabled={loading}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
                    isApprove ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/30'
                              : 'bg-red-600   hover:bg-red-500   shadow-lg shadow-red-900/30'}`}>
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : isApprove
                      ? <><CheckCircle className="w-4 h-4" /> Approve & Create Project</>
                      : <><XCircle    className="w-4 h-4" /> Reject Payment</>}
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

// ─── Payment event timeline drawer (portal) ───────────────────────────────────

interface EventDrawerProps {
  paymentId: string | null;
  onClose:   () => void;
}

function EventDrawer({ paymentId, onClose }: EventDrawerProps) {
  const [events,  setEvents]  = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!paymentId) return;
    setLoading(true);
    paymentAPI.getEvents(paymentId)
      .then(({ data }) => setEvents(data.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [paymentId]);

  useEffect(() => {
    if (!paymentId) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [paymentId, onClose]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {paymentId && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9990] bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm z-[9991] flex flex-col border-l border-white/10 shadow-2xl"
            style={{ background: '#0F0D17' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary-400" />
                <span className="text-white font-semibold text-sm">Payment Audit Trail</span>
              </div>
              <button onClick={onClose} className="text-slate-600 hover:text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-400 rounded-full animate-spin" />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-16">
                  <History className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No events recorded yet</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-4 top-2 bottom-2 w-px bg-white/6" />
                  <div className="space-y-5">
                    {events.map((ev, i) => {
                      const meta = EVENT_ICONS[ev.event] || { icon: Activity, color: 'text-slate-400' };
                      return (
                        <div key={ev.id} className="flex gap-3 relative">
                          {/* Dot */}
                          <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-sm shrink-0 z-10 ${
                            i === events.length - 1 ? 'bg-primary-500/15' : 'bg-white/4'
                          }`}>
                            <meta.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0 pb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-bold uppercase tracking-wide ${meta.color}`}>
                                {ev.event.replace(/_/g, ' ')}
                              </span>
                              {ev.actorRole && (
                                <span className="text-[10px] text-slate-600 bg-white/4 px-1.5 py-0.5 rounded-md">
                                  {ev.actorRole}
                                </span>
                              )}
                            </div>
                            {ev.fromStatus && ev.toStatus && (
                              <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-600">
                                <span>{ev.fromStatus}</span>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-slate-400">{ev.toStatus}</span>
                              </div>
                            )}
                            {ev.note && (
                              <p className="text-slate-400 text-xs mt-1 leading-relaxed break-words">{ev.note}</p>
                            )}
                            {ev.ip && (
                              <p className="text-slate-700 text-[10px] mt-1 font-mono">IP: {ev.ip}</p>
                            )}
                            <p className="text-slate-700 text-[10px] mt-1">
                              {new Date(ev.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminPaymentsPage() {
  const { t } = useLanguage();
  const [payments,    setPayments]    = useState<Payment[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState<string | null>(null);
  const [showFlagged, setShowFlagged] = useState(false);

  // Modal state
  const [modalOpen,    setModalOpen]    = useState(false);
  const [modalMode,    setModalMode]    = useState<'approve' | 'reject'>('approve');
  const [modalPayment, setModalPayment] = useState<Payment | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Event drawer state
  const [drawerPaymentId, setDrawerPaymentId] = useState<string | null>(null);

  // Reconcile state
  const [reconciling, setReconciling] = useState(false);

  const fetchPayments = useCallback((silent = false) => {
    if (!silent) { setLoading(true); setFetchError(null); }
    const params = showFlagged ? { flagged: 'true' } : {};
    paymentAPI.getAll(params)
      .then(({ data }) => setPayments(data.payments))
      .catch((err) => { console.error(err); if (!silent) setFetchError(t('toast.error')); })
      .finally(() => { if (!silent) setLoading(false); });
  }, [showFlagged]);

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
      toast.error(err?.response?.data?.message || t('toast.error'));
    } finally {
      setModalLoading(false);
    }
  };

  const handleReconcile = async () => {
    setReconciling(true);
    try {
      await paymentAPI.reconcile();
      toast.success('Reconciliation started in background.');
      setTimeout(() => fetchPayments(true), 3000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('toast.error'));
    } finally {
      setReconciling(false);
    }
  };

  const totalRevenue  = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pendingVerif  = payments.filter((p) => p.status === 'pending_verification');
  const pendingAmount = payments.filter((p) => p.status === 'pending' || p.status === 'pending_verification').reduce((s, p) => s + p.amount, 0);
  const flaggedCount  = payments.filter((p) => (p.riskScore ?? 0) >= 60).length;

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
      <EventDrawer
        paymentId={drawerPaymentId}
        onClose={() => setDrawerPaymentId(null)}
      />

      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-300 flex-1">{fetchError}</span>
          <button onClick={() => fetchPayments(false)} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-medium transition-colors">
            <RefreshCcw className="w-3.5 h-3.5" /> Retry
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
        <div className="flex items-center gap-2 flex-wrap">
          {pendingVerif.length > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-yellow-300"
                 style={{ background: 'rgba(234,179,8,0.10)', border: '1px solid rgba(234,179,8,0.22)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
              </span>
              {pendingVerif.length} {t('admin.awaitingVerif')}
            </div>
          )}
          <button
            onClick={handleReconcile}
            disabled={reconciling}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 border border-white/10 hover:bg-white/4 hover:text-slate-200 transition-all disabled:opacity-50"
            title="Run payment reconciliation check"
          >
            {reconciling
              ? <span className="w-3.5 h-3.5 border border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
              : <Activity className="w-3.5 h-3.5" />
            }
            Reconcile
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="relative glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-emerald-600 to-teal-500" />
          <div className="p-4">
            <p className="text-slate-400 text-xs mb-1">{t('admin.totalRevenue')}</p>
            <p className="text-xl font-black text-white tabular-nums">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
        <div className="relative glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-amber-600 to-yellow-500" />
          <div className="p-4">
            <p className="text-slate-400 text-xs mb-1">{t('status.pending')}</p>
            <p className="text-xl font-black text-amber-400 tabular-nums">{formatCurrency(pendingAmount)}</p>
          </div>
        </div>
        <div className="relative glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-primary-600 to-violet-500" />
          <div className="p-4">
            <p className="text-slate-400 text-xs mb-1">{t('admin.totalInvoices')}</p>
            <p className="text-xl font-black text-white tabular-nums">{payments.length}</p>
          </div>
        </div>
        <button
          onClick={() => setShowFlagged((v) => !v)}
          className={`relative glass rounded-2xl border overflow-hidden text-left transition-all ${
            showFlagged ? 'border-amber-500/40' : 'border-white/5 hover:border-white/10'
          }`}
        >
          <div className={`h-[3px] bg-gradient-to-r ${showFlagged ? 'from-amber-600 to-orange-500' : 'from-slate-700 to-slate-600'}`} />
          <div className="p-4">
            <p className="text-slate-400 text-xs mb-1">Risk Flagged</p>
            <div className="flex items-center justify-between">
              <p className={`text-xl font-black tabular-nums ${flaggedCount > 0 ? 'text-amber-400' : 'text-slate-600'}`}>{flaggedCount}</p>
              {flaggedCount > 0 && <ShieldAlert className="w-4 h-4 text-amber-400" />}
            </div>
          </div>
        </button>
      </div>

      {showFlagged && flaggedCount > 0 && (
        <div className="px-4 py-2.5 rounded-xl text-xs text-amber-400 flex items-center gap-2"
             style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.20)' }}>
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          Showing {flaggedCount} flagged payment{flaggedCount !== 1 ? 's' : ''}. Click the stat card again to show all.
        </div>
      )}

      {/* Table */}
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
                <div className="h-5 w-16 rounded-full skeleton-shimmer" />
                <div className="h-7 w-24 rounded-xl skeleton-shimmer hidden md:block" />
              </div>
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-6 h-6 text-slate-600" strokeWidth={1.5} />
            </div>
            <p className="text-slate-300 text-sm font-medium mb-1">
              {showFlagged ? 'No flagged payments' : t('empty.payments')}
            </p>
            <p className="text-slate-600 text-xs">Payment records will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Client</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden sm:table-cell">Order</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Amount</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden md:table-cell">Method</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden lg:table-cell">Proof / Ref</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden lg:table-cell">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden sm:table-cell">Invoice</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((pay, i) => {
                  const client    = typeof pay.client  === 'object' ? pay.client  : null;
                  const project   = typeof pay.project === 'object' ? pay.project : null;
                  const order     = typeof pay.order   === 'object' ? pay.order   : null;
                  const isVerif   = pay.status === 'pending_verification';
                  const riskScore = pay.riskScore ?? 0;
                  const isRisk    = riskScore >= 60;
                  const isHigh    = riskScore >= 80;

                  return (
                    <motion.tr
                      key={pay._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.025 }}
                      className={`border-b border-white/5 transition-colors ${
                        isHigh  ? 'bg-red-500/5 hover:bg-red-500/8' :
                        isRisk  ? 'bg-amber-500/4 hover:bg-amber-500/7' :
                        isVerif ? 'bg-yellow-500/4 hover:bg-yellow-500/7' :
                                  'hover:bg-white/[0.02]'
                      }`}
                    >
                      {/* Client */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-medium">{client?.name || '—'}</span>
                          {isHigh && <span title={`Risk score: ${riskScore}/100`}><ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" /></span>}
                          {isRisk && !isHigh && <span title={`Risk score: ${riskScore}/100`}><ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" /></span>}
                        </div>
                        {isRisk && (
                          <p className="text-[10px] text-amber-500/80 mt-0.5">Risk {riskScore}/100</p>
                        )}
                      </td>

                      <td className="p-4 text-sm text-slate-400 hidden sm:table-cell">
                        {order?.title || project?.title || '—'}
                      </td>

                      <td className="p-4 text-sm font-semibold text-white">{formatCurrency(pay.amount)}</td>

                      <td className="p-4 text-sm text-slate-400 hidden md:table-cell">
                        {pay.method ? METHOD_LABELS[pay.method] || pay.method : '—'}
                      </td>

                      {/* Proof / Ref */}
                      <td className="p-4 hidden lg:table-cell">
                        {pay.externalRef ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-lg max-w-[140px] truncate"
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

                      {/* Invoice + audit trail */}
                      <td className="p-4 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Link href={`/invoice/${pay._id}`}
                            className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                            <FileText className="w-3.5 h-3.5" />
                            View
                          </Link>
                          <button
                            onClick={() => setDrawerPaymentId(pay._id as string)}
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                            title="View audit trail"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="p-4">
                        {isVerif ? (
                          <div className="flex items-center gap-2">
                            <Button size="sm" onClick={() => openModal(pay, 'approve')} disabled={modalLoading}>
                              <CheckCircle className="w-3.5 h-3.5" />
                              {t('admin.approve')}
                            </Button>
                            <button
                              onClick={() => openModal(pay, 'reject')}
                              disabled={modalLoading}
                              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-2.5 py-1.5 rounded-lg border border-red-500/25 hover:bg-red-500/10 transition-all disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
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

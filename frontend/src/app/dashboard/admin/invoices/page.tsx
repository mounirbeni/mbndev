'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FileText, DollarSign, CheckCircle2, Clock, XCircle, TrendingUp,
  RefreshCcw, Loader2, CreditCard, ArrowRight, Search, X,
  BarChart2, AlertTriangle, Receipt,
} from 'lucide-react';
import { paymentAPI } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency, formatDate } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Payment {
  _id:       string;
  amount:    number;
  status:    string;
  method?:   string;
  client?:   { name: string; email: string; company?: string };
  order?:    { title: string };
  project?:  { title: string };
  createdAt: string;
  paidAt?:   string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const METHOD_LABELS: Record<string, string> = {
  cih_bank:   'CIH Bank',
  paypal:     'PayPal',
  taptapsend: 'TapTapSend',
  mock:       'Online',
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: any; bg: string; border: string }> = {
  paid: {
    label: 'Paid', icon: CheckCircle2,
    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
  },
  pending_verification: {
    label: 'Verifying', icon: Clock,
    color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20',
  },
  pending: {
    label: 'Pending', icon: Clock,
    color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20',
  },
  failed: {
    label: 'Failed', icon: XCircle,
    color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20',
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function invoiceNum(p: Payment) {
  const year = new Date(p.createdAt).getFullYear();
  const id   = (p._id || '').slice(-6).toUpperCase();
  return `INV-${year}-${id}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  title, value, sub, icon: Icon, accentClass, glowColor, index,
}: {
  title: string; value: string | number; sub: string;
  icon: any; accentClass: string; glowColor: string; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="relative glass rounded-2xl border border-white/5 overflow-hidden"
    >
      <div className={`h-[3px] bg-gradient-to-r ${accentClass}`} />
      <div className="p-5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
          style={{ background: glowColor, boxShadow: `0 0 14px ${glowColor}` }}
        >
          <Icon className="w-4 h-4" style={{ color: '#fff' }} strokeWidth={1.8} />
        </div>
        <div className="text-2xl font-black text-white tabular-nums">{value}</div>
        <div className="text-white text-sm font-medium mt-0.5">{title}</div>
        <div className="text-slate-500 text-xs mt-0.5">{sub}</div>
      </div>
    </motion.div>
  );
}

function StatusChip({ status }: { status: string }) {
  const s = STATUS_MAP[status] || {
    label: status, icon: FileText,
    color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20',
  };
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${s.color} ${s.bg} ${s.border}`}>
      <Icon className="w-3 h-3" />
      {s.label}
    </span>
  );
}

// Pure CSS bar chart — same pattern as analytics page
function RevenueChart({ payments }: { payments: Payment[] }) {
  const months = useMemo(() => {
    const now   = new Date();
    const out: { month: string; label: string; revenue: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      out.push({
        month:   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label:   d.toLocaleString('en', { month: 'short' }),
        revenue: 0,
      });
    }
    payments
      .filter((p) => p.status === 'paid' && p.paidAt)
      .forEach((p) => {
        const d = new Date(p.paidAt!);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const bucket = out.find((o) => o.month === key);
        if (bucket) bucket.revenue += p.amount;
      });
    return out;
  }, [payments]);

  const maxVal  = Math.max(...months.map((m) => m.revenue), 1);
  const hasData = months.some((m) => m.revenue > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-36 gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center"
             style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
          <BarChart2 className="w-5 h-5 text-slate-600" />
        </div>
        <p className="text-slate-500 text-sm">No payment data yet</p>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1.5 h-36">
      {months.map((m, i) => {
        const pct = (m.revenue / maxVal) * 100;
        return (
          <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group relative">
            {m.revenue > 0 && (
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 pointer-events-none
                              opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                <div className="bg-[#0d0d15] border border-white/10 rounded-lg px-2 py-1 text-xs text-white shadow-xl">
                  {formatCurrency(m.revenue)}
                </div>
              </div>
            )}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: m.revenue > 0 ? `${pct}%` : '3px' }}
              transition={{ delay: i * 0.03, duration: 0.5, ease: 'easeOut' }}
              className={`w-full rounded-t-sm cursor-pointer transition-colors ${
                m.revenue > 0
                  ? 'bg-primary-500/70 hover:bg-primary-500'
                  : 'bg-white/5'
              }`}
              style={{ minHeight: '3px' }}
            />
            <span className="text-slate-600 text-[9px] leading-none">{m.label.slice(0, 1)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminInvoicesPage() {
  const { t } = useLanguage();

  const [payments,   setPayments]   = useState<Payment[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search,     setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchPayments = useCallback((silent = false) => {
    if (!silent) { setLoading(true); setFetchError(null); }
    paymentAPI.getAll()
      .then(({ data }) => setPayments(data.payments ?? []))
      .catch(() => { if (!silent) setFetchError('Failed to load invoices'); })
      .finally(() => { if (!silent) setLoading(false); });
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  // Auto-refresh every 15s when tab is visible
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => { timer = setInterval(() => fetchPayments(true), 15_000); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
    const onVis = () => document.visibilityState === 'visible' ? start() : stop();
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, [fetchPayments]);

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const paid    = payments.filter((p) => p.status === 'paid');
    const pending = payments.filter((p) => p.status === 'pending' || p.status === 'pending_verification');
    const failed  = payments.filter((p) => p.status === 'failed');
    return {
      total:         payments.length,
      totalRevenue:  paid.reduce((s, p) => s + p.amount, 0),
      paidCount:     paid.length,
      pendingAmount: pending.reduce((s, p) => s + p.amount, 0),
      pendingCount:  pending.length,
      failedCount:   failed.length,
    };
  }, [payments]);

  // ── Status breakdown for sidebar chart ────────────────────────────────────

  const breakdown = useMemo(() => [
    { label: 'Paid',      count: stats.paidCount,                        color: 'bg-emerald-500', text: 'text-emerald-400' },
    { label: 'Pending',   count: stats.pendingCount,                     color: 'bg-amber-500',   text: 'text-amber-400'   },
    { label: 'Failed',    count: stats.failedCount,                      color: 'bg-red-500',     text: 'text-red-400'     },
  ].filter((s) => s.count > 0), [stats]);

  // ── Filtered / searched list ───────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...payments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (filterStatus !== 'all') {
      if (filterStatus === 'pending') {
        list = list.filter((p) => p.status === 'pending' || p.status === 'pending_verification');
      } else {
        list = list.filter((p) => p.status === filterStatus);
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.client?.name?.toLowerCase().includes(q) ||
        (p.order?.title || p.project?.title || '').toLowerCase().includes(q) ||
        invoiceNum(p).toLowerCase().includes(q)
      );
    }
    return list;
  }, [payments, filterStatus, search]);

  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading invoices…</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">Failed to load</p>
          <p className="text-slate-500 text-sm mb-4">{fetchError}</p>
          <button
            onClick={() => fetchPayments(false)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 border border-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Invoices</h1>
          <p className="text-slate-400 text-sm mt-1">
            {payments.length} invoice{payments.length !== 1 ? 's' : ''} &nbsp;&middot;&nbsp; {formatCurrency(stats.totalRevenue)} collected
          </p>
        </div>
        {stats.pendingCount > 0 && (
          <Link
            href="/dashboard/admin/payments"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-amber-300 shrink-0 transition-colors hover:text-amber-200"
            style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.22)' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            {stats.pendingCount} pending
          </Link>
        )}
      </motion.div>

      {/* ── Stats row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Invoiced"
          value={formatCurrency(payments.reduce((s, p) => s + p.amount, 0))}
          sub={`${payments.length} invoices`}
          icon={Receipt}
          accentClass="from-primary-600 via-primary-500 to-violet-500"
          glowColor="rgba(124,58,237,0.35)"
          index={0}
        />
        <StatCard
          title="Collected"
          value={formatCurrency(stats.totalRevenue)}
          sub={`${stats.paidCount} paid`}
          icon={CheckCircle2}
          accentClass="from-emerald-600 via-emerald-500 to-teal-500"
          glowColor="rgba(16,185,129,0.35)"
          index={1}
        />
        <StatCard
          title="Pending"
          value={formatCurrency(stats.pendingAmount)}
          sub={`${stats.pendingCount} awaiting`}
          icon={Clock}
          accentClass="from-amber-600 via-amber-500 to-yellow-500"
          glowColor="rgba(245,158,11,0.35)"
          index={2}
        />
        <StatCard
          title="Total Invoices"
          value={payments.length}
          sub={`${stats.failedCount} failed`}
          icon={FileText}
          accentClass="from-blue-600 via-blue-500 to-cyan-500"
          glowColor="rgba(59,130,246,0.35)"
          index={3}
        />
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Revenue chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold">Monthly Revenue</h3>
              <p className="text-slate-500 text-xs mt-0.5">Collected payments — last 12 months</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              {formatCurrency(stats.totalRevenue)}
            </div>
          </div>
          <RevenueChart payments={payments} />
        </div>

        {/* Status breakdown */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-5">Status Breakdown</h3>
          {breakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-3">
              <CreditCard className="w-8 h-8 text-slate-700" />
              <p className="text-slate-500 text-sm">No data</p>
            </div>
          ) : (
            <div className="space-y-4">
              {breakdown.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className={s.text}>{s.label}</span>
                    <span className="text-slate-400 font-semibold">{s.count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${payments.length > 0 ? (s.count / payments.length) * 100 : 0}%` }}
                      transition={{ duration: 0.7 }}
                      className={`h-full ${s.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Totals summary */}
          {payments.length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Collection rate</span>
                <span className="text-emerald-400 font-semibold">
                  {Math.round((stats.paidCount / payments.length) * 100)}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Avg invoice</span>
                <span className="text-white font-semibold">
                  {payments.length > 0 ? formatCurrency(payments.reduce((s, p) => s + p.amount, 0) / payments.length) : '—'}
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-white/5">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
            <input
              type="text"
              placeholder="Search client, project, or invoice #…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-sm rounded-xl text-white placeholder-slate-600
                         bg-white/5 border border-white/8 focus:outline-none focus:border-primary-500/50
                         focus:bg-white/7 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3 h-3 text-slate-500 hover:text-slate-300 transition-colors" />
              </button>
            )}
          </div>

          {/* Status filter chips */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            {['all', 'paid', 'pending', 'failed'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterStatus === s
                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                    : 'text-slate-500 border border-white/6 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table body */}
        {filtered.length === 0 ? (
          <div className="p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-slate-600" strokeWidth={1.5} />
            </div>
            <p className="text-slate-300 text-sm font-medium mb-1">No invoices found</p>
            <p className="text-slate-600 text-xs">
              {search || filterStatus !== 'all' ? 'Try a different search or filter' : 'Invoices will appear here when payments are created'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/6">
                  {['Invoice', 'Client', 'Project', 'Amount', 'Method', 'Status', 'Date', ''].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((pay, i) => {
                  const client  = typeof pay.client  === 'object' ? pay.client  : null;
                  const order   = typeof pay.order   === 'object' ? pay.order   : null;
                  const project = typeof pay.project === 'object' ? pay.project : null;
                  const title   = order?.title || project?.title || '—';
                  const num     = invoiceNum(pay);
                  const date    = pay.status === 'paid' && pay.paidAt
                    ? formatDate(pay.paidAt)
                    : formatDate(pay.createdAt);

                  return (
                    <motion.tr
                      key={pay._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.025 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Invoice # */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-mono text-primary-400">{num}</span>
                      </td>

                      {/* Client */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-blue-500
                                          flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {(client?.name?.[0] || '?').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm text-white font-medium truncate max-w-[120px]">
                              {client?.name || '—'}
                            </div>
                            {client?.company && (
                              <div className="text-[10px] text-slate-600 truncate max-w-[120px]">{client.company}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Project */}
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="text-sm text-slate-400 truncate block max-w-[180px]">{title}</span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5">
                        <span className={`text-sm font-semibold tabular-nums ${
                          pay.status === 'paid' ? 'text-emerald-400' : 'text-white'
                        }`}>
                          {formatCurrency(pay.amount)}
                        </span>
                      </td>

                      {/* Method */}
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-xs text-slate-500">
                          {pay.method ? (METHOD_LABELS[pay.method] || pay.method) : '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusChip status={pay.status} />
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-xs text-slate-500 whitespace-nowrap">{date}</span>
                      </td>

                      {/* View */}
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/invoice/${pay._id}`}
                          className="inline-flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors whitespace-nowrap"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">View</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-600">
                {filtered.length} of {payments.length} invoice{payments.length !== 1 ? 's' : ''}
              </span>
              <Link
                href="/dashboard/admin/payments"
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
              >
                Manage payments <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

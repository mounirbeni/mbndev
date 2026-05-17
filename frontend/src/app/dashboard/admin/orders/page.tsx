'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ShoppingBag, Clock, CheckCircle2, XCircle, ArrowRight,
  Search, Loader2, DollarSign, AlertTriangle, RefreshCcw,
} from 'lucide-react';
import { orderAPI } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, formatCurrency } from '@/lib/utils';

const SERVICE_LABELS: Record<string, string> = {
  website: 'Website', ecommerce: 'E-Commerce', dashboard: 'SaaS Dashboard',
  mobile: 'Mobile App', custom: 'Custom',
};

export default function AdminOrdersPage() {
  const { t } = useLanguage();
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState<string>('all');

  // STATUS_CONFIG inside component so labels re-evaluate on locale change
  const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    pending:   { label: t('orders.pendingPayment'), color: 'text-amber-400', bg: 'bg-amber-500/10',  icon: Clock        },
    paid:      { label: t('status.paid'),           color: 'text-green-400', bg: 'bg-green-500/10',  icon: CheckCircle2 },
    cancelled: { label: t('status.cancelled'),      color: 'text-red-400',   bg: 'bg-red-500/10',   icon: XCircle      },
  };

  const fetchOrders = useCallback((silent = false) => {
    if (!silent) { setLoading(true); setFetchError(null); }
    orderAPI.getAll(filter !== 'all' ? { status: filter } : {})
      .then(({ data }) => setOrders(data.orders || []))
      .catch((err) => {
        console.error(err);
        if (!silent) setFetchError(t('toast.error'));
      })
      .finally(() => { if (!silent) setLoading(false); });
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => { timer = setInterval(() => fetchOrders(true), 20_000); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
    const onVis = () => document.visibilityState === 'visible' ? start() : stop();
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, [fetchOrders]);

  const filtered = orders.filter((o) =>
    !search ||
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.client?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const revenue = orders.filter((o) => o.status === 'paid').reduce((s, o) => s + o.totalPrice, 0);
  const pending = orders.filter((o) => o.status === 'pending').length;

  const filterLabels: Record<string, string> = {
    all:       t('admin.allStatuses'),
    pending:   t('status.pending'),
    paid:      t('status.paid'),
    cancelled: t('status.cancelled'),
  };

  const stats = [
    { label: t('orders.totalOrders'),    value: orders.length,                                icon: ShoppingBag, color: 'text-white'        },
    { label: t('orders.pendingPayment'), value: pending,                                      icon: Clock,       color: 'text-amber-400'     },
    { label: t('status.paid'),           value: orders.filter(o=>o.status==='paid').length,   icon: CheckCircle2, color: 'text-green-400'   },
    { label: t('admin.totalRevenue'),    value: formatCurrency(revenue),                      icon: DollarSign,  color: 'text-primary-400'   },
  ];

  return (
    <div className="space-y-6">
      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-300 flex-1">{fetchError}</span>
          <button
            onClick={() => fetchOrders(false)}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-white">{t('admin.orders')}</h1>
        <div className="text-slate-400 text-sm">
          {orders.length} total · {formatCurrency(revenue)} {t('admin.totalRevenue').toLowerCase()}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-slate-500 text-xs">{s.label}</span>
              </div>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search')}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'paid', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(s); setLoading(true); }}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
                filter === s
                  ? 'bg-primary-500/20 border-primary-500/60 text-primary-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {filterLabels[s] || s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingBag className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">{t('empty.orders')}</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {[t('admin.clients'), t('admin.col.service'), t('admin.col.title'), t('admin.col.amount'), t('admin.col.delivery'), t('admin.status'), t('admin.col.date'), ''].map((h) => (
                      <th key={h} className="text-left p-4 text-xs text-slate-500 font-medium uppercase whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((order, i) => {
                    const cfg  = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    const Icon = cfg.icon;
                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-white/2 transition-colors"
                      >
                        <td className="p-4">
                          <div className="text-white text-sm font-medium">{order.client?.name}</div>
                          <div className="text-slate-500 text-xs">{order.client?.email}</div>
                        </td>
                        <td className="p-4 text-slate-400 text-sm whitespace-nowrap">
                          {SERVICE_LABELS[order.serviceType] || order.serviceType}
                        </td>
                        <td className="p-4 text-white text-sm max-w-[180px] truncate">{order.title}</td>
                        <td className="p-4 text-white font-semibold text-sm whitespace-nowrap">
                          {formatCurrency(order.totalPrice)}
                        </td>
                        <td className="p-4 text-slate-400 text-sm whitespace-nowrap">
                          {order.deliveryDays}d
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.color} ${cfg.bg}`}>
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 text-xs whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="p-4">
                          {order.project ? (
                            <Link
                              href={`/dashboard/admin/projects/${order.project.id}`}
                              className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 whitespace-nowrap"
                            >
                              {t('common.view')} <ArrowRight className="w-3 h-3" />
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-600">—</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-white/5">
              {filtered.map((order, i) => {
                const cfg  = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-white font-medium text-sm">{order.title}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{order.client?.name}</div>
                      </div>
                      <div className="text-white font-bold text-sm shrink-0">{formatCurrency(order.totalPrice)}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.color} ${cfg.bg}`}>
                        <Icon className="w-3 h-3" /> {cfg.label}
                      </span>
                      <span className="text-slate-500 text-xs">{SERVICE_LABELS[order.serviceType]}</span>
                      <span className="text-slate-500 text-xs">{formatDate(order.createdAt)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

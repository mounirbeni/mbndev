'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ShoppingBag, Clock, CheckCircle2, XCircle,
  ArrowRight, Plus, CreditCard, Loader2, AlertTriangle, RefreshCcw,
} from 'lucide-react';
import { orderAPI } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import { formatDate, formatCurrency } from '@/lib/utils';

const SERVICE_LABELS: Record<string, string> = {
  website: 'Website', ecommerce: 'E-Commerce', dashboard: 'SaaS Dashboard',
  mobile: 'Mobile App', custom: 'Custom',
};

export default function ClientOrdersPage() {
  const { t } = useLanguage();
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // STATUS_CONFIG built inside component so labels re-evaluate on locale change
  const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    pending:   { label: t('orders.pendingPayment'), color: 'text-amber-400',  bg: 'bg-amber-500/10',  icon: Clock         },
    paid:      { label: t('status.paid'),           color: 'text-green-400',  bg: 'bg-green-500/10',  icon: CheckCircle2  },
    cancelled: { label: t('status.cancelled'),      color: 'text-red-400',    bg: 'bg-red-500/10',    icon: XCircle       },
  };

  const fetchOrders = useCallback((silent = false) => {
    if (!silent) { setLoading(true); setFetchError(null); }
    orderAPI.getAll()
      .then(({ data }) => setOrders(data.orders || []))
      .catch((err) => {
        console.error(err);
        if (!silent) setFetchError('Failed to load. Please try again.');
      })
      .finally(() => { if (!silent) setLoading(false); });
  }, []);

  // Initial load
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Real-time polling (20 s when tab is visible)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => { timer = setInterval(() => fetchOrders(true), 20_000); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
    const onVis = () => document.visibilityState === 'visible' ? start() : stop();
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, [fetchOrders]);

  const pending    = orders.filter((o) => o.status === 'pending').length;
  const totalSpent = orders.filter((o) => o.status === 'paid').reduce((s, o) => s + o.totalPrice, 0);

  const stats = [
    { label: t('orders.totalOrders'),   value: orders.length,         color: 'text-white'      },
    { label: t('orders.pendingPayment'), value: pending,               color: 'text-amber-400'  },
    { label: t('orders.totalSpent'),     value: formatCurrency(totalSpent), color: 'text-green-400' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
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
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">{t('dash.nav.myOrders')}</h1>
        <Link href="/request">
          <Button size="sm">
            <Plus className="w-4 h-4" /> {t('orders.newOrder')}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 border border-white/5 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Orders list */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">{t('empty.orders')}</p>
            <p className="text-slate-600 text-sm mb-5">{t('orders.ready')}</p>
            <Link href="/request">
              <Button size="sm">
                <Plus className="w-4 h-4" /> {t('orders.firstOrder')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {orders.map((order, i) => {
              const cfg  = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-4 sm:p-5 hover:bg-white/2 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5 text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="text-white font-semibold text-sm truncate">{order.title}</h3>
                          <p className="text-slate-500 text-xs mt-0.5">
                            {SERVICE_LABELS[order.serviceType] || order.serviceType} ·{' '}
                            {order.deliveryDays}{t('common.days')} · {order.features?.length || 0} {t('common.features')}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-white font-bold">{formatCurrency(order.totalPrice)}</div>
                          <div className="text-slate-500 text-xs">{formatDate(order.createdAt)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {/* Status badge */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.color} ${cfg.bg}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </span>

                        {/* Linked project */}
                        {order.project && (
                          <Link
                            href={`/dashboard/client/projects/${order.project.id}`}
                            className="text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
                          >
                            {t('orders.viewProject')} <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}

                        {/* Pay now button */}
                        {order.status === 'pending' && (
                          <Link href={`/checkout/${order.id}`} className="ml-auto">
                            <button
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all active:scale-95"
                              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              {t('orders.payNow')}
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

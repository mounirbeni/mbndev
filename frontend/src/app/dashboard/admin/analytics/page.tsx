'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, FolderOpen, Users, CreditCard, Clock,
  CheckCircle2, AlertCircle, BarChart2, ArrowRight,
  Activity, Package, Loader2, DollarSign, Target, Zap,
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency, formatDate } from '@/lib/utils';

// TYPE_LABELS moved inside component (uses t() for locale-aware labels)

// ─── Stat card ────────────────────────────────────────────────────────────────

function Stat({
  title, value, sub, icon: Icon, color, index,
}: {
  title: string; value: string | number; sub: string;
  icon: any; color: string; index: number;
}) {
  const colors: Record<string, string> = {
    green:  'bg-green-500/15 text-green-400',
    blue:   'bg-blue-500/15 text-blue-400',
    purple: 'bg-primary-500/15 text-primary-400',
    yellow: 'bg-amber-500/15 text-amber-400',
    red:    'bg-red-500/15 text-red-400',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass rounded-2xl p-5 border border-white/5"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colors[color] || colors.purple}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-white text-sm font-medium mt-0.5">{title}</div>
      <div className="text-slate-500 text-xs mt-0.5">{sub}</div>
    </motion.div>
  );
}

// ─── Delta badge (MoM change indicator) ──────────────────────────────────────

function Delta({ value }: { value: number }) {
  if (value === 0) return <span className="text-slate-500 text-xs">–</span>;
  const isUp = value > 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
      <Icon className="w-3 h-3" />
      {isUp ? '+' : ''}{value}%
    </span>
  );
}

// ─── Funnel step ─────────────────────────────────────────────────────────────

function FunnelStep({
  label, count, total, color, isLast,
}: { label: string; count: number; total: number; color: string; isLast?: boolean }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">{label}</span>
          <span className="text-white font-semibold">{count}</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8 }}
            className={`h-full ${color} rounded-full opacity-80`}
          />
        </div>
      </div>
      <span className="text-[10px] text-slate-600 w-8 text-right">{pct}%</span>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 gap-3">
      <div className="w-12 h-12 rounded-full flex items-center justify-center"
           style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
        <BarChart2 className="w-5 h-5 text-slate-600" />
      </div>
      <p className="text-slate-500 text-sm">{label}</p>
    </div>
  );
}

// ─── Bar chart (pure CSS/motion, no external lib) ─────────────────────────────

function BarChart({
  data, valueKey = 'value', labelKey = 'month', color = 'bg-primary-500',
  formatVal, noDataLabel,
}: {
  data: any[]; valueKey?: string; labelKey?: string; color?: string;
  formatVal?: (v: number) => string; noDataLabel?: string;
}) {
  const values = data.map((d) => Number(d[valueKey]));
  const max    = Math.max(...values, 1);
  const hasData = values.some((v) => v > 0);

  if (!hasData) return <EmptyChart label={noDataLabel || 'No data recorded yet'} />;

  return (
    <div className="flex items-end gap-1.5 h-40">
      {data.map((d, i) => {
        const val  = Number(d[valueKey]);
        const pct  = (val / max) * 100;
        const future = !!d.future;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            {val > 0 && (
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 pointer-events-none
                              opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                <div className="bg-dark-100 border border-white/10 rounded-lg px-2 py-1 text-xs text-white shadow-xl">
                  {formatVal ? formatVal(val) : val}
                </div>
              </div>
            )}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: val > 0 ? `${pct}%` : '3px' }}
              transition={{ delay: i * 0.03, duration: 0.5, ease: 'easeOut' }}
              className={`w-full rounded-t-sm cursor-pointer ${
                future
                  ? 'bg-white/5'
                  : val > 0
                  ? `${color}/70 hover:${color} transition-colors`
                  : 'bg-white/5'
              }`}
              style={{ minHeight: '3px' }}
            />
            <span className="text-slate-600 text-[9px] leading-none">{String(d[labelKey]).slice(0, 1)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const { t } = useLanguage();
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(({ data: res }) => setData(res.analytics))
      .catch((err) => setError(err?.response?.data?.message || t('admin.analytics.loadError')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">{t('common.error')}</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const {
    totalProjects, totalClients, activeClients,
    totalRevenue, pendingRevenue, paidCount,
    byStatus, byType,
    monthlyRevenue, monthlyClients, monthlyProjects,
    recentProjects, recentPayments, recentClients,
    year,
  } = data;

  const completionRate = totalProjects > 0
    ? Math.round((byStatus.completed / totalProjects) * 100)
    : 0;

  const avgProjectValue = totalProjects > 0
    ? totalRevenue / Math.max(paidCount, 1)
    : 0;

  // Monthly Recurring Revenue estimation (last 3 paid months avg)
  const paidMonths = monthlyRevenue.filter((m: any) => !m.future && Number(m.revenue) > 0);
  const mrrEstimate = paidMonths.length > 0
    ? paidMonths.slice(-3).reduce((s: number, m: any) => s + Number(m.revenue), 0) / Math.min(paidMonths.length, 3)
    : 0;
  const arrEstimate = mrrEstimate * 12;

  // MoM revenue change (last 2 paid months)
  const revenueChange = paidMonths.length >= 2
    ? Math.round(((Number(paidMonths.at(-1)?.revenue) - Number(paidMonths.at(-2)?.revenue))
        / Math.max(Number(paidMonths.at(-2)?.revenue), 1)) * 100)
    : 0;

  // Pipeline: projects not yet completed or cancelled
  const activeInPipeline = (byStatus.pending || 0) + (byStatus.paid || 0)
    + (byStatus.inProgress || 0) + (byStatus.review || 0) + (byStatus.revision || 0);

  const statusRows = [
    { label: t('status.pending'),    count: byStatus.pending,    color: 'bg-amber-500',   text: 'text-amber-400'   },
    { label: t('status.paid'),       count: byStatus.paid,        color: 'bg-emerald-500', text: 'text-emerald-400' },
    { label: t('status.inProgress'), count: byStatus.inProgress,  color: 'bg-blue-500',    text: 'text-blue-400'    },
    { label: t('status.review'),     count: byStatus.review,      color: 'bg-purple-500',  text: 'text-purple-400'  },
    { label: t('status.revision'),   count: byStatus.revision,    color: 'bg-orange-500',  text: 'text-orange-400'  },
    { label: t('status.completed'),  count: byStatus.completed,   color: 'bg-green-500',   text: 'text-green-400'   },
    { label: t('status.cancelled'),  count: byStatus.cancelled,   color: 'bg-red-500',     text: 'text-red-400'     },
  ].filter((s) => s.count > 0);

  // TYPE_LABELS: locale-aware service type labels
  const TYPE_LABELS: Record<string, string> = {
    website:        t('request.svc.website'),
    ecommerce:      t('request.svc.ecommerce'),
    dashboard:      t('request.svc.dashboard'),
    mobile:         t('request.svc.mobile'),
    custom:         t('request.svc.custom'),
    'landing-page': t('services.landing.title'),
    saas:           t('services.saas.title'),
    portfolio:      'Portfolio',
    'web-app':      t('services.webapp.title'),
  };

  const typeRows = Object.entries(byType as Record<string, number>)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('admin.analytics')}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {t('admin.analytics.sub')} — {year}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          {t('admin.live')}
        </div>
      </motion.div>

      {/* ── KPI row ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title={t('admin.totalRevenue')}   value={formatCurrency(totalRevenue)}   sub={t('admin.allPaid')}                    icon={CreditCard} color="green"  index={0} />
        <Stat title={t('admin.allProjects')}    value={totalProjects}                  sub={t('admin.allTime')}                    icon={FolderOpen} color="purple" index={1} />
        <Stat title={t('status.active')}        value={activeClients}                  sub={`${totalClients} total`}               icon={Users}      color="blue"   index={2} />
        <Stat title={t('admin.pendingRevenue')} value={formatCurrency(pendingRevenue)} sub={t('admin.awaitingPay')}                icon={Clock}      color="yellow" index={3} />
      </div>

      {/* ── Secondary KPIs ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('admin.completionRate'), value: `${completionRate}%`,  color: 'text-green-400'   },
          { label: t('status.paid'),          value: paidCount,             color: 'text-emerald-400' },
          { label: t('status.inProgress'),    value: byStatus.inProgress,   color: 'text-blue-400'    },
          { label: t('status.completed'),     value: byStatus.completed,    color: 'text-primary-400' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="glass rounded-xl p-4 border border-white/5 text-center"
          >
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Business Intelligence row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: DollarSign,
            label: t('admin.analytics.avgValue'),
            value: formatCurrency(avgProjectValue),
            sub: t('admin.analytics.perInvoice'),
            color: 'text-green-400',
            bg: 'bg-green-500/15',
            delta: null,
          },
          {
            icon: TrendingUp,
            label: t('admin.analytics.momRevenue'),
            value: revenueChange === 0 ? '—' : `${revenueChange > 0 ? '+' : ''}${revenueChange}%`,
            sub: t('admin.analytics.vsPrevMonth'),
            color: revenueChange >= 0 ? 'text-green-400' : 'text-red-400',
            bg: revenueChange >= 0 ? 'bg-green-500/15' : 'bg-red-500/15',
            delta: null,
          },
          {
            icon: Zap,
            label: t('admin.analytics.arrEstimate'),
            value: formatCurrency(arrEstimate),
            sub: t('admin.analytics.mrrBasis'),
            color: 'text-primary-400',
            bg: 'bg-primary-500/15',
            delta: null,
          },
          {
            icon: Target,
            label: t('admin.analytics.activePipeline'),
            value: activeInPipeline,
            sub: t('admin.analytics.pipelineSub'),
            color: 'text-blue-400',
            bg: 'bg-blue-500/15',
            delta: null,
          },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.06 }}
              className="glass rounded-2xl p-5 border border-white/5"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${kpi.bg}`}>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
              <div className="text-white text-sm font-medium mt-0.5">{kpi.label}</div>
              <div className="text-slate-500 text-xs mt-0.5">{kpi.sub}</div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Revenue chart + Status breakdown ────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly revenue bar chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold">{t('admin.monthlyRevenue')}</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                {t('admin.analytics.realPayments')} {year}
              </p>
            </div>
            <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              {formatCurrency(totalRevenue)}
            </div>
          </div>
          <BarChart
            data={monthlyRevenue}
            valueKey="revenue"
            color="bg-primary-500"
            formatVal={(v) => formatCurrency(v)}
            noDataLabel={t('admin.analytics.noData')}
          />
        </div>

        {/* Status breakdown */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-5">{t('admin.projectStatus')}</h3>
          {statusRows.length === 0 ? (
            <EmptyChart label={t('admin.analytics.noProjects')} />
          ) : (
            <div className="space-y-3">
              {statusRows.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className={s.text}>{s.label}</span>
                    <span className="text-slate-400 font-medium">{s.count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.count / totalProjects) * 100}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full ${s.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-slate-500 text-xs">{t('admin.completionRate')}</span>
            <span className="text-green-400 font-bold text-sm">{completionRate}%</span>
          </div>
        </div>
      </div>

      {/* ── Growth charts ────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Client growth */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-semibold">{t('admin.clientGrowth')}</h3>
              <p className="text-slate-500 text-xs mt-0.5">{t('admin.analytics.clientsPerMo')} {year}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <BarChart data={monthlyClients} valueKey="count" color="bg-blue-500" noDataLabel={t('admin.analytics.noData')} />
        </div>

        {/* Project creation */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-semibold">{t('admin.projectsCreated')}</h3>
              <p className="text-slate-500 text-xs mt-0.5">{t('admin.analytics.projectsPerMo')} {year}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-primary-500/15 flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-primary-400" />
            </div>
          </div>
          <BarChart data={monthlyProjects} valueKey="count" color="bg-primary-500" noDataLabel={t('admin.analytics.noData')} />
        </div>
      </div>

      {/* ── Project Funnel ───────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-semibold">{t('admin.projectFunnel')}</h3>
            <p className="text-slate-500 text-xs mt-0.5">{t('admin.analytics.pipelineDesc')}</p>
          </div>
          <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
            <Activity className="w-4 h-4" />
            {activeInPipeline} {t('admin.analytics.activeSuffix')}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: t('admin.funnel.pendingReview'),  count: byStatus.pending    || 0, color: 'bg-amber-500'   },
            { label: t('admin.funnel.paidQueued'),     count: byStatus.paid       || 0, color: 'bg-emerald-500' },
            { label: t('admin.funnel.inDevelopment'),  count: byStatus.inProgress || 0, color: 'bg-blue-500'   },
            { label: t('admin.funnel.underReview'),    count: byStatus.review     || 0, color: 'bg-purple-500'  },
            { label: t('status.revision'),             count: byStatus.revision   || 0, color: 'bg-orange-500'  },
            { label: t('status.completed'),            count: byStatus.completed  || 0, color: 'bg-green-500'   },
          ].map((step, i) => (
            <FunnelStep
              key={step.label}
              label={step.label}
              count={step.count}
              total={totalProjects}
              color={step.color}
              isLast={i === 5}
            />
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-400">{completionRate}%</div>
            <div className="text-slate-500 text-xs">{t('admin.completionRate')}</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-400">
              {totalProjects > 0 ? Math.round(((byStatus.inProgress || 0) / totalProjects) * 100) : 0}%
            </div>
            <div className="text-slate-500 text-xs">{t('admin.inDevelopment')}</div>
          </div>
          <div>
            <div className="text-lg font-bold text-amber-400">
              {totalProjects > 0 ? Math.round(((byStatus.pending || 0) / totalProjects) * 100) : 0}%
            </div>
            <div className="text-slate-500 text-xs">{t('admin.pendingReview')}</div>
          </div>
        </div>
      </div>

      {/* ── Type breakdown + Recent payments ────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* By type */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-5">{t('admin.projectsByType')}</h3>
          {typeRows.length === 0 ? (
            <EmptyChart label={t('admin.analytics.noProjects')} />
          ) : (
            <div className="space-y-3">
              {typeRows.map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Package className="w-3.5 h-3.5 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{TYPE_LABELS[type] || type}</span>
                      <span className="text-white font-semibold">{count}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / totalProjects) * 100}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-primary-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent payments */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold">{t('admin.recentPayments')}</h3>
            <Link href="/dashboard/admin/payments" className="text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1">
              {t('admin.analytics.viewAll')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                   style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
                <CreditCard className="w-5 h-5 text-slate-600" />
              </div>
              <p className="text-slate-500 text-sm">{t('admin.analytics.noPayments')}</p>
              <p className="text-slate-600 text-xs">{t('admin.analytics.paymentsSub')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((p: any) => {
                const label = p.project?.title || p.order?.title || t('admin.analytics.payment');
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      p.status === 'paid' ? 'bg-green-500/10' : 'bg-amber-500/10'
                    }`}>
                      {p.status === 'paid'
                        ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                        : <AlertCircle  className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-300 text-sm truncate">{label}</div>
                      <div className="text-slate-600 text-xs">{p.client?.name}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-sm font-semibold ${p.status === 'paid' ? 'text-green-400' : 'text-amber-400'}`}>
                        {formatCurrency(p.amount)}
                      </div>
                      <div className="text-slate-600 text-[10px] capitalize">{p.status}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent projects table ────────────────────────────────────────────── */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="text-white font-semibold">{t('admin.recentProjects')}</h3>
          <Link href="/dashboard/admin/projects" className="text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1">
            {t('admin.analytics.viewAll')} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
                 style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.12)' }}>
              <FolderOpen className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">{t('admin.analytics.noProjects')}</p>
            <p className="text-slate-600 text-sm">{t('admin.analytics.projectsSub')}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentProjects.map((p: any) => (
              <Link
                key={p.id}
                href={`/dashboard/admin/projects/${p.id}`}
                className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{p.title}</div>
                  <div className="text-slate-500 text-xs">
                    {TYPE_LABELS[p.type] || p.type} · {p.client?.name}
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-slate-400 text-xs w-8">{p.progress}%</span>
                </div>
                <div className="text-white text-sm font-semibold w-20 text-right shrink-0">
                  {formatCurrency(p.budget)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Recent clients ───────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="text-white font-semibold">{t('admin.recentClients')}</h3>
          <Link href="/dashboard/admin/clients" className="text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1">
            {t('admin.analytics.viewAll')} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
                 style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.12)' }}>
              <Users className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">{t('admin.analytics.noClients')}</p>
            <p className="text-slate-600 text-sm">{t('admin.analytics.clientsSub')}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentClients.map((c: any) => (
              <div key={c.id} className="flex items-center gap-4 p-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {c.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium">{c.name}</div>
                  <div className="text-slate-500 text-xs">{c.email}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-slate-500 text-xs">{formatDate(c.createdAt)}</div>
                  <div className={`text-xs mt-0.5 ${c.isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {c.isActive ? t('status.active') : t('status.inactive')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

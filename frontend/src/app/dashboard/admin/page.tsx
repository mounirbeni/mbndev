'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  FolderOpen, Users, CreditCard, Clock, ArrowRight, TrendingUp,
  AlertTriangle, RefreshCcw, DollarSign, Activity, CheckCircle2,
  ArrowUpRight, ShoppingBag, Package, Mail,
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Project, User, Payment } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import StatsCard from '@/components/dashboard/StatsCard';
import ProjectCard from '@/components/dashboard/ProjectCard';
import { formatCurrency, timeAgo, getInitials } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface Analytics {
  totalProjects:  number;
  totalClients:   number;
  activeClients:  number;
  totalRevenue:   number;
  pendingRevenue: number;
  byStatus:       {
    pending: number; inProgress: number; completed: number;
    cancelled: number; review: number; revision: number; paid: number;
  };
  recentProjects: Project[];
  recentClients:  User[];
  recentPayments: Payment[];
}

/* ── Activity item ────────────────────────────────────────────────────────── */
function PaymentRow({ payment }: { payment: Payment }) {
  const client = typeof payment.client === 'object' ? payment.client : null;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 group">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-blue-500
                      flex items-center justify-center text-white text-xs font-bold shrink-0">
        {client ? getInitials(client.name).charAt(0) : '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium leading-tight truncate">
          {client?.name ?? 'Unknown client'}
        </p>
        <p className="text-slate-500 text-xs mt-0.5 truncate">
          {timeAgo((payment as any).createdAt ?? '')}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-emerald-400 text-sm font-bold tabular-nums">
          {formatCurrency(payment.amount)}
        </p>
        <StatusBadge status={payment.status} size="sm" className="mt-0.5" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [analytics,     setAnalytics]     = useState<Analytics | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [fetchError,    setFetchError]    = useState<string | null>(null);
  const [activeTab,     setActiveTab]     = useState<'projects' | 'clients' | 'payments'>('projects');
  const [broadcasting,    setBroadcasting]    = useState(false);
  const [broadcastDone,   setBroadcastDone]   = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('platformUpdate');
  const [showBroadcast,   setShowBroadcast]   = useState(false);

  const fetchAnalytics = useCallback((silent = false) => {
    if (!silent) { setLoading(true); setFetchError(null); }
    adminAPI.getAnalytics()
      .then(({ data }) => setAnalytics(data.analytics))
      .catch((err) => {
        console.error(err);
        if (!silent) setFetchError('Failed to load analytics. Please try again.');
      })
      .finally(() => { if (!silent) setLoading(false); });
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => { timer = setInterval(() => fetchAnalytics(true), 30_000); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
    const onVis = () => document.visibilityState === 'visible' ? start() : stop();
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, [fetchAnalytics]);

  const TEMPLATES = [
    { key: 'platformUpdate', label: 'May 2026 — Platform Update',    when: 'Now',    color: 'violet' },
    { key: 'getStarted',     label: 'Week 1 — Get started nudge',    when: 'Week 1', color: 'green'  },
    { key: 'checkIn',        label: 'Week 1 — Personal check-in',    when: 'Week 1', color: 'blue'   },
    { key: 'comingSoon',     label: 'Week 2 — What\'s coming next',  when: 'Week 2', color: 'amber'  },
    { key: 'specialOffer',   label: 'Week 2 — 10% discount offer',   when: 'Week 2', color: 'amber'  },
  ];

  const sendBroadcast = async () => {
    if (broadcastDone) return;
    setBroadcasting(true);
    try {
      const { data } = await adminAPI.broadcast(selectedTemplate);
      setBroadcastDone(true);
      setShowBroadcast(false);
      toast.success(data.message || 'Email sent to all users!');
    } catch {
      toast.error('Failed to send broadcast. Try again.');
    } finally {
      setBroadcasting(false);
    }
  };

  const a = analytics;

  const statsRow = useMemo(() => [
    {
      title:    t('admin.allProjects'),
      value:    loading ? '—' : (a?.totalProjects ?? 0),
      subtitle: 'Total in platform',
      icon:     FolderOpen,
      color:    'purple' as const,
      index:    0,
    },
    {
      title:    t('status.inProgress'),
      value:    loading ? '—' : (a?.byStatus.inProgress ?? 0),
      subtitle: 'Active right now',
      icon:     Activity,
      color:    'blue' as const,
      index:    1,
    },
    {
      title:    t('admin.totalRevenue'),
      value:    loading ? '—' : formatCurrency(a?.totalRevenue ?? 0),
      subtitle: 'All confirmed payments',
      icon:     DollarSign,
      color:    'green' as const,
      index:    2,
    },
    {
      title:    'Active Clients',
      value:    loading ? '—' : (a?.activeClients ?? 0),
      subtitle: `${a?.totalClients ?? 0} total registered`,
      icon:     Users,
      color:    'yellow' as const,
      index:    3,
    },
  ], [loading, a, t]);

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t('admin.dashboard')}
          </h1>
          <p className="text-slate-400 text-sm mt-1">{t('admin.dashboard.sub')}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0 relative">

          {/* ── Broadcast panel ──────────────────────────────────────────── */}
          <AnimatePresence>
            {showBroadcast && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{   opacity: 0, scale: 0.95, y: -6  }}
                transition={{ duration: 0.15 }}
                className="absolute top-10 right-0 z-50 w-72 bg-[#111118] border border-white/10 rounded-2xl shadow-2xl p-4"
              >
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                  Send email to all users
                </p>

                {/* Template selector */}
                <div className="space-y-1.5 mb-4">
                  {TEMPLATES.map((tpl) => {
                    const whenColors: Record<string, string> = {
                      'Now':    'bg-violet-500/20 text-violet-300',
                      'Week 1': 'bg-blue-500/20 text-blue-300',
                      'Week 2': 'bg-amber-500/20 text-amber-300',
                    };
                    return (
                      <button
                        key={tpl.key}
                        onClick={() => setSelectedTemplate(tpl.key)}
                        className={[
                          'w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all border flex items-center gap-2',
                          selectedTemplate === tpl.key
                            ? 'bg-violet-500/15 border-violet-500/30 text-violet-300'
                            : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10',
                        ].join(' ')}
                      >
                        <Mail className="w-3.5 h-3.5 shrink-0 opacity-60" />
                        <span className="flex-1 text-xs">{tpl.label}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${whenColors[tpl.when] ?? ''}`}>
                          {tpl.when}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Send / Cancel */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowBroadcast(false); setBroadcastDone(false); }}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendBroadcast}
                    disabled={broadcasting || broadcastDone}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 border border-violet-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {broadcasting
                      ? <><span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                      : broadcastDone
                        ? <><CheckCircle2 className="w-3.5 h-3.5" /> Sent!</>
                        : <><Mail className="w-3.5 h-3.5" /> Send now</>
                    }
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trigger button */}
          <button
            onClick={() => { setShowBroadcast((v) => !v); setBroadcastDone(false); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border bg-violet-500/10 border-violet-500/20 text-violet-300 hover:bg-violet-500/20"
          >
            <Mail className="w-3.5 h-3.5" /> Send email
          </button>

          {/* Live indicator */}
          {!loading && !fetchError && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-400" />
              </span>
              <span className="text-emerald-400 text-[11px] font-semibold">Live</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Error banner ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {fetchError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm"
          >
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-red-300 flex-1">{fetchError}</span>
            <button
              onClick={() => fetchAnalytics(false)}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-medium transition-colors shrink-0"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats ─────────────────────────────────────────────────────────────── */}
      <div className="tab-scroll lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible -mx-0.5 px-0.5">
        {statsRow.map((s) => (
          <div key={s.title} className="w-[152px] flex-shrink-0 lg:w-auto">
            <StatsCard {...s} />
          </div>
        ))}
      </div>

      {/* ── Revenue highlight ─────────────────────────────────────────────────── */}
      {!loading && a && a.pendingRevenue > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative glass rounded-2xl border border-amber-500/20 overflow-hidden"
        >
          <div className="h-[3px] bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500" />
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/18 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">
                {formatCurrency(a.pendingRevenue)} pending
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                Revenue awaiting confirmation from active projects
              </p>
            </div>
            <Link href="/dashboard/admin/payments">
              <Button variant="outline" size="sm">
                Review <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── Main content grid ─────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* ── Left col: Recent Activity tabs ──────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Tab header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 bg-white/4 border border-white/6 rounded-xl">
              {(['projects', 'clients', 'payments'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 capitalize',
                    activeTab === tab
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Link href={
              activeTab === 'projects'  ? '/dashboard/admin/projects'  :
              activeTab === 'clients'   ? '/dashboard/admin/clients'   :
              '/dashboard/admin/payments'
            }>
              <button className="text-[11px] text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'projects' && (
                <div className="space-y-3">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="glass rounded-2xl border border-white/5 overflow-hidden">
                        <div className="h-[3px] skeleton-shimmer" />
                        <div className="p-5 space-y-3">
                          <div className="h-4 w-2/3 rounded skeleton-shimmer" />
                          <div className="h-1.5 w-full rounded-full skeleton-shimmer" />
                          <div className="h-3 w-1/3 rounded skeleton-shimmer" />
                        </div>
                      </div>
                    ))
                  ) : (a?.recentProjects ?? []).length === 0 ? (
                    <div className="glass rounded-2xl border border-white/5 py-14 text-center">
                      <FolderOpen className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm font-medium">{t('empty.projects')}</p>
                      <p className="text-slate-600 text-xs mt-1">{t('empty.projects.sub')}</p>
                    </div>
                  ) : (
                    (a?.recentProjects ?? []).map((p, i) => (
                      <ProjectCard
                        key={p._id ?? p.id}
                        project={p}
                        href={`/dashboard/admin/projects/${p._id ?? p.id}`}
                        index={i}
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'clients' && (
                <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                  {loading ? (
                    <div className="divide-y divide-white/5">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-4">
                          <div className="w-9 h-9 rounded-full skeleton-shimmer shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3.5 w-1/3 rounded skeleton-shimmer" />
                            <div className="h-2.5 w-1/4 rounded skeleton-shimmer" />
                          </div>
                          <div className="h-3 w-16 rounded skeleton-shimmer" />
                        </div>
                      ))}
                    </div>
                  ) : (a?.recentClients ?? []).length === 0 ? (
                    <div className="py-14 text-center">
                      <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">{t('empty.clients')}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {(a?.recentClients ?? []).map((c) => (
                        <Link key={c._id ?? c.id} href={`/dashboard/admin/clients`}>
                          <div className="flex items-center gap-3 p-4 hover:bg-white/3 transition-colors">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full
                                            flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {getInitials(c.name).charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-sm font-medium truncate">{c.name}</div>
                              <div className="text-slate-500 text-xs truncate">{c.email}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-slate-600 text-xs">{timeAgo(c.createdAt!)}</div>
                              <ArrowUpRight className="w-3.5 h-3.5 text-slate-700 ml-auto mt-0.5" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="glass rounded-2xl border border-white/5 p-4">
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl skeleton-shimmer shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3.5 w-1/3 rounded skeleton-shimmer" />
                            <div className="h-2.5 w-1/5 rounded skeleton-shimmer" />
                          </div>
                          <div className="text-right space-y-1.5">
                            <div className="h-4 w-16 rounded skeleton-shimmer" />
                            <div className="h-4 w-12 rounded-full skeleton-shimmer ml-auto" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (a?.recentPayments ?? []).length === 0 ? (
                    <div className="py-10 text-center">
                      <CreditCard className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">No payments yet</p>
                    </div>
                  ) : (
                    (a?.recentPayments ?? []).map((pay) => (
                      <PaymentRow key={(pay as any)._id ?? (pay as any).id} payment={pay} />
                    ))
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Right col: Status overview ──────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Status breakdown */}
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-primary-700 via-primary-500 to-violet-500" />
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white mb-4">Project Status</h3>
              <div className="space-y-2.5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-3 w-24 rounded skeleton-shimmer" />
                      <div className="flex-1 h-1.5 rounded-full skeleton-shimmer" />
                      <div className="h-3 w-6 rounded skeleton-shimmer" />
                    </div>
                  ))
                ) : a ? (
                  [
                    { label: 'In Progress', value: a.byStatus.inProgress, max: a.totalProjects, color: 'bg-blue-500' },
                    { label: 'Completed',   value: a.byStatus.completed,  max: a.totalProjects, color: 'bg-emerald-500' },
                    { label: 'Review',      value: a.byStatus.review,     max: a.totalProjects, color: 'bg-orange-500' },
                    { label: 'Pending',     value: a.byStatus.pending,    max: a.totalProjects, color: 'bg-slate-500' },
                    { label: 'Paid',        value: a.byStatus.paid,       max: a.totalProjects, color: 'bg-green-500' },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <span className="text-slate-400 text-xs w-20 shrink-0">{s.label}</span>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.max > 0 ? (s.value / s.max) * 100 : 0}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={cn('h-full rounded-full', s.color)}
                        />
                      </div>
                      <span className="text-slate-500 text-xs tabular-nums w-5 text-right shrink-0">
                        {s.value}
                      </span>
                    </div>
                  ))
                ) : null}
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/dashboard/admin/orders',    icon: ShoppingBag,   label: 'Orders',   color: 'bg-violet-500/18 text-violet-400' },
              { href: '/dashboard/admin/packages',  icon: Package,       label: 'Packages', color: 'bg-blue-500/18 text-blue-400' },
              { href: '/dashboard/admin/analytics', icon: TrendingUp,    label: 'Analytics', color: 'bg-emerald-500/18 text-emerald-400' },
              { href: '/dashboard/admin/clients',   icon: Users,         label: 'Clients',  color: 'bg-amber-500/18 text-amber-400' },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="glass rounded-xl p-3.5 border border-white/5 hover:border-white/12
                                flex flex-col gap-2 transition-all hover:-translate-y-0.5 active:scale-[0.97]">
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', item.color)}>
                    <item.icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                  </div>
                  <span className="text-slate-300 text-xs font-medium">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

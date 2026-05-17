'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FolderOpen, Users, CreditCard, Clock, ArrowRight, TrendingUp, AlertTriangle, RefreshCcw } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { Project, User, Payment } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import StatsCard from '@/components/dashboard/StatsCard';
import ProjectCard from '@/components/dashboard/ProjectCard';
import { formatCurrency, timeAgo } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface Analytics {
  totalProjects: number;
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  pendingRevenue: number;
  byStatus: { pending: number; inProgress: number; completed: number; cancelled: number; review: number; revision: number; paid: number };
  recentProjects: Project[];
  recentClients: User[];
  recentPayments: Payment[];
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

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

  const a = analytics;

  return (
    <div className="space-y-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">{t('admin.dashboard')}</h1>
        <p className="text-slate-400 text-sm mt-1">{t('admin.dashboard.sub')}</p>
      </motion.div>

      {/* Error state */}
      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-300 flex-1">{fetchError}</span>
          <button
            onClick={() => fetchAnalytics(false)}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Stats — scrolls horizontally on mobile, 4-col grid on desktop */}
      <div className="tab-scroll lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible -mx-0.5 px-0.5">
        {[
          { title: t('admin.allProjects'),  value: loading ? '—' : (a?.totalProjects ?? 0),              subtitle: t('admin.allTime'),  icon: FolderOpen, color: 'purple' as const, index: 0 },
          { title: t('status.inProgress'),  value: loading ? '—' : (a?.byStatus.inProgress ?? 0),        subtitle: t('dash.overview'),  icon: Clock,      color: 'blue'   as const, index: 1 },
          { title: t('status.completed'),   value: loading ? '—' : (a?.byStatus.completed ?? 0),         subtitle: t('dash.recent'),    icon: TrendingUp,  color: 'green'  as const, index: 2 },
          { title: t('admin.totalRevenue'), value: loading ? '—' : formatCurrency(a?.totalRevenue ?? 0), subtitle: t('admin.allPaid'),  icon: CreditCard,  color: 'yellow' as const, index: 3 },
        ].map((s) => (
          <div key={s.title} className="w-[152px] flex-shrink-0 lg:w-auto">
            <StatsCard {...s} />
          </div>
        ))}
      </div>

      {/* Projects + Clients */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">{t('admin.recentProjects')}</h2>
            <Link href="/dashboard/admin/projects">
              <Button variant="ghost" size="sm" className="text-primary-400">
                {t('dash.viewAll')} <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl h-20 animate-pulse" />
              ))
            ) : (a?.recentProjects ?? []).length === 0 ? (
              <div className="glass rounded-2xl border border-white/5 p-10 text-center">
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
        </div>

        {/* Recent Clients */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">{t('admin.recentClients')}</h2>
            <Link href="/dashboard/admin/clients">
              <Button variant="ghost" size="sm" className="text-primary-400">
                {t('dash.viewAll')} <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (a?.recentClients ?? []).length === 0 ? (
              <div className="p-10 text-center">
                <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">{t('empty.clients')}</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {(a?.recentClients ?? []).map((c) => (
                  <div key={c._id ?? c.id} className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {c.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{c.name}</div>
                      <div className="text-slate-500 text-xs truncate">{c.email}</div>
                    </div>
                    <div className="text-slate-600 text-xs">{timeAgo(c.createdAt!)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

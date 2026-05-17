'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FolderOpen, MessageSquare, CreditCard, Clock, ArrowRight, Plus,
  Sparkles, CheckCircle2, Package, RotateCcw, Zap, AlertTriangle, RefreshCcw,
} from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { projectAPI, messageAPI } from '@/lib/api';
import { Project } from '@/types';
import StatsCard from '@/components/dashboard/StatsCard';
import ProjectCard from '@/components/dashboard/ProjectCard';
import Button from '@/components/ui/Button';
import PlanBadge from '@/components/ui/PlanBadge';
import OnboardingModal, { useOnboarding } from '@/components/onboarding/OnboardingModal';
import ProjectLifecycle from '@/components/dashboard/ProjectLifecycle';

export default function ClientDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const haptic = useHaptic();
  const [projects, setProjects] = useState<Project[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { show: showOnboarding, dismiss: dismissOnboarding } = useOnboarding();

  const fetchData = useCallback((silent = false) => {
    if (!silent) { setLoading(true); setFetchError(null); }
    Promise.all([projectAPI.getMine(), messageAPI.getUnread()])
      .then(([pRes, mRes]) => {
        setProjects(pRes.data.projects);
        setUnread(mRes.data.count);
      })
      .catch((err) => {
        console.error(err);
        if (!silent) setFetchError('Failed to load your dashboard. Please try again.');
      })
      .finally(() => { if (!silent) setLoading(false); });
  }, []);

  // Initial load
  useEffect(() => { fetchData(); }, [fetchData]);

  // Refresh on SSE events
  // Real-time polling (20 s when tab is visible)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => { timer = setInterval(() => fetchData(true), 20_000); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
    const onVis = () => document.visibilityState === 'visible' ? start() : stop();
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, [fetchData]);

  const inProgress = projects.filter((p) => p.status === 'in-progress').length;
  const completed = projects.filter((p) => p.status === 'completed').length;

  return (
    <div className="space-y-8 max-w-7xl">

      {/* Onboarding modal — shown once on first visit */}
      {showOnboarding && (
        <OnboardingModal userName={user?.name || t('common.there')} onClose={dismissOnboarding} />
      )}
      {/* Error state */}
      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-300 flex-1">{fetchError}</span>
          <button
            onClick={() => fetchData(false)}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold text-white">
              {t('dash.welcome')}, {user?.name?.split(' ')[0]}
            </h1>
            {user?.plan && <PlanBadge plan={user.plan} size="md" />}
          </div>
          <p className="text-slate-400 text-sm">
            {t('dash.overview')}
          </p>
        </div>
        <Link href="/request" className="hidden sm:block">
          <Button size="md">
            <Plus className="w-4 h-4" />
            {t('common.create')}
          </Button>
        </Link>
      </motion.div>

      {/* Stats — scrolls horizontally on mobile, 4-col grid on desktop */}
      <div className="tab-scroll lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible -mx-0.5 px-0.5">
        {[
          { title: t('dash.nav.myProjects'), value: projects.length, subtitle: t('dash.recent'),                icon: FolderOpen,   color: 'purple' as const, index: 0 },
          { title: t('status.inProgress'),   value: inProgress,      subtitle: t('dash.overview'),              icon: Clock,        color: 'blue'   as const, index: 1 },
          { title: t('status.completed'),    value: completed,        subtitle: t('dash.recent'),               icon: CreditCard,   color: 'green'  as const, index: 2 },
          { title: t('dash.nav.messages'),   value: unread,           subtitle: t('empty.notifications.sub'),   icon: MessageSquare, color: 'yellow' as const, index: 3 },
        ].map((s) => (
          <div key={s.title} className="w-[152px] flex-shrink-0 lg:w-auto">
            <StatsCard {...s} />
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{t('dash.nav.myProjects')}</h2>
          <Link href="/dashboard/client/projects">
            <Button variant="ghost" size="sm" className="text-primary-400">
              {t('dash.viewAll')} <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl h-36 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-3xl border border-white/5 overflow-hidden"
          >
            {/* Top gradient accent */}
            <div className="h-[2px] w-full bg-gradient-to-r from-primary-700 via-primary-500 to-violet-500" />

            <div className="p-8 sm:p-10">
              {/* Hero copy */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-primary-500/15 border border-primary-500/25 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-primary-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                    {t('dash.empty.title')}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                    {t('dash.empty.sub')}
                  </p>
                </div>
              </div>

              {/* Project lifecycle visualizer */}
              <div className="mb-8">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                  {t('process.eyebrow')}
                </p>
                <ProjectLifecycle animated />
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {[
                  { icon: CheckCircle2,   label: t('dash.empty.feat1') },
                  { icon: MessageSquare,  label: t('dash.empty.feat2') },
                  { icon: Package,        label: t('dash.empty.feat3') },
                  { icon: RotateCcw,      label: t('dash.empty.feat4') },
                  { icon: Zap,            label: t('dash.empty.feat5') },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/8 px-3 py-1.5 rounded-full"
                  >
                    <Icon className="w-3 h-3 text-primary-400 shrink-0" />
                    {label}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Link href="/request">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-lg shadow-primary-500/25 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    {t('hero.cta.primary')}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
                <span className="text-sm text-slate-600">
                  {t('dash.empty.or')}{' '}
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('mbndev_onboarding_done');
                        window.location.reload();
                      }
                    }}
                    className="text-primary-400 hover:text-primary-300 underline underline-offset-2 transition-colors"
                  >
                    {t('dash.empty.replayTour')}
                  </button>
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((p, i) => (
              <ProjectCard
                key={p._id}
                project={p}
                href={`/dashboard/client/projects/${p._id}`}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
      {/* FAB — mobile only, new project */}
      <Link
        href="/request"
        onClick={() => haptic('medium')}
        aria-label="New project"
        className="sm:hidden fab fixed right-4 z-[100] bg-gradient-to-br from-primary-600 to-primary-500"
        style={{ bottom: 'calc(max(env(safe-area-inset-bottom, 0px), 8px) + 66px)' }}
      >
        <Plus className="w-6 h-6 text-white" />
      </Link>
    </div>
  );
}

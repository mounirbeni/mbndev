'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  FolderOpen, MessageSquare, CreditCard, Clock, ArrowRight, Plus,
  Sparkles, CheckCircle2, Package, RotateCcw, Zap, AlertTriangle,
  RefreshCcw, TrendingUp, Bell, ArrowUpRight,
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
import { cn } from '@/lib/utils';

/* ── Time-aware greeting ──────────────────────────────────────────────────── */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5)  return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good evening';
}

/* ── Quick action tile ────────────────────────────────────────────────────── */
function QuickAction({
  href, icon: Icon, label, sublabel, color,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.96 }}
        className={cn(
          'flex flex-col gap-2.5 p-4 rounded-2xl border border-white/6',
          'hover:border-white/12 transition-all duration-150 cursor-pointer',
          'bg-white/3 hover:bg-white/6 active:bg-white/8',
        )}
      >
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', color)}>
          <Icon className="w-4 h-4" strokeWidth={1.8} />
        </div>
        <div>
          <div className="text-white text-xs font-semibold leading-tight">{label}</div>
          {sublabel && <div className="text-slate-600 text-[10px] mt-0.5">{sublabel}</div>}
        </div>
      </motion.div>
    </Link>
  );
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const haptic = useHaptic();
  const [projects, setProjects] = useState<Project[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { show: showOnboarding, dismiss: dismissOnboarding } = useOnboarding();
  const [greeting] = useState(getGreeting);

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

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => { timer = setInterval(() => fetchData(true), 20_000); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
    const onVis = () => document.visibilityState === 'visible' ? start() : stop();
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, [fetchData]);

  const inProgress  = useMemo(() => projects.filter((p) => p.status === 'in-progress').length, [projects]);
  const completed   = useMemo(() => projects.filter((p) => p.status === 'completed').length, [projects]);
  const activeProj  = useMemo(() => projects.filter((p) =>
    ['in-progress', 'review', 'revision'].includes(p.status)
  ), [projects]);
  const firstName   = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Onboarding modal */}
      {showOnboarding && (
        <OnboardingModal userName={user?.name || t('common.there')} onClose={dismissOnboarding} />
      )}

      {/* Error banner */}
      <AnimatePresence>
        {fetchError && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm"
          >
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-red-300 flex-1">{fetchError}</span>
            <button
              onClick={() => fetchData(false)}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-medium transition-colors shrink-0"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {greeting}, {firstName}
            </h1>
            {user?.plan && <PlanBadge plan={user.plan} size="md" />}
          </div>
          <p className="text-slate-400 text-sm">
            {projects.length === 0
              ? 'Ready to build something great? Start your first project.'
              : inProgress > 0
                ? `You have ${inProgress} active project${inProgress > 1 ? 's' : ''} in progress.`
                : 'All projects are up to date — great work!'}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:shrink-0">
          {unread > 0 && (
            <Link href="/dashboard/client/messages">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-500/15 border border-primary-500/30
                           text-primary-400 text-xs font-semibold hover:bg-primary-500/22 transition-colors"
              >
                <Bell className="w-3.5 h-3.5" />
                {unread} new
              </motion.div>
            </Link>
          )}
          <Link href="/request" className="hidden sm:block">
            <Button size="md">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* ── Stats ─────────────────────────────────────────────────────────────── */}
      <div className="tab-scroll lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible -mx-0.5 px-0.5">
        {[
          {
            title: 'All Projects',
            value: loading ? '—' : projects.length,
            subtitle: 'Total projects',
            icon: FolderOpen,
            color: 'purple' as const,
            index: 0,
          },
          {
            title: 'In Progress',
            value: loading ? '—' : inProgress,
            subtitle: 'Currently active',
            icon: Clock,
            color: 'blue' as const,
            index: 1,
          },
          {
            title: 'Completed',
            value: loading ? '—' : completed,
            subtitle: 'Successfully delivered',
            icon: CheckCircle2,
            color: 'green' as const,
            index: 2,
          },
          {
            title: 'Messages',
            value: loading ? '—' : unread,
            subtitle: 'Unread messages',
            icon: MessageSquare,
            color: 'yellow' as const,
            index: 3,
          },
        ].map((s) => (
          <div key={s.title} className="w-[152px] flex-shrink-0 lg:w-auto">
            <StatsCard {...s} />
          </div>
        ))}
      </div>

      {/* ── Quick Actions (mobile-first horizontal row) ────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Quick actions
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-3">
          <QuickAction
            href="/request"
            icon={Plus}
            label="New Project"
            sublabel="Start building"
            color="bg-primary-500/20 text-primary-400"
          />
          <QuickAction
            href="/dashboard/client/messages"
            icon={MessageSquare}
            label="Messages"
            sublabel={unread > 0 ? `${unread} unread` : 'Chat'}
            color="bg-blue-500/20 text-blue-400"
          />
          <QuickAction
            href="/dashboard/client/payments"
            icon={CreditCard}
            label="Payments"
            sublabel="History"
            color="bg-green-500/20 text-green-400"
          />
          <QuickAction
            href="/dashboard/client/projects"
            icon={FolderOpen}
            label="Projects"
            sublabel="All projects"
            color="bg-violet-500/20 text-violet-400"
          />
        </div>
      </div>

      {/* ── Active Projects ────────────────────────────────────────────────────── */}
      {!loading && activeProj.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-blue-400" />
              </span>
              Active now
            </h2>
            <Link href="/dashboard/client/projects">
              <button className="text-[11px] text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeProj.slice(0, 3).map((p, i) => (
              <ProjectCard
                key={p._id}
                project={p}
                href={`/dashboard/client/projects/${p._id}`}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── All Projects / Empty state ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">
            {projects.length > 0 ? 'Recent Projects' : 'My Projects'}
          </h2>
          {projects.length > 0 && (
            <Link href="/dashboard/client/projects">
              <button className="text-[11px] text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl border border-white/5 overflow-hidden">
                <div className="h-[3px] skeleton-shimmer" />
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                      <div className="h-3 w-1/2 rounded skeleton-shimmer" />
                    </div>
                    <div className="h-5 w-16 rounded-full skeleton-shimmer" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 w-full rounded skeleton-shimmer" />
                    <div className="h-1.5 w-full rounded-full skeleton-shimmer" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 w-24 rounded skeleton-shimmer" />
                    <div className="h-3 w-8 rounded skeleton-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* ── Premium empty state ──────────────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative glass rounded-3xl border border-white/5 overflow-hidden"
          >
            {/* Top gradient bar */}
            <div className="h-[3px] w-full bg-gradient-to-r from-primary-700 via-primary-500 to-violet-500" />

            {/* Dot grid background */}
            <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />

            <div className="relative p-8 sm:p-10">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-primary-500/15 border border-primary-500/25
                                flex items-center justify-center shrink-0 glow-sm">
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
                <p className="eyebrow mb-4">{t('process.eyebrow')}</p>
                <ProjectLifecycle animated />
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {[
                  { icon: CheckCircle2,  label: t('dash.empty.feat1') },
                  { icon: MessageSquare, label: t('dash.empty.feat2') },
                  { icon: Package,       label: t('dash.empty.feat3') },
                  { icon: RotateCcw,     label: t('dash.empty.feat4') },
                  { icon: Zap,           label: t('dash.empty.feat5') },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="pill bg-white/4 border-white/8 text-slate-400"
                  >
                    <Icon className="w-3 h-3 text-primary-400" />
                    {label}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Link href="/request">
                  <Button size="lg">
                    <Plus className="w-4 h-4" />
                    {t('hero.cta.primary')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem('mbndev_onboarding_done');
                    window.location.reload();
                  }}
                  className="text-sm text-slate-600 hover:text-primary-400 underline underline-offset-2 transition-colors"
                >
                  {t('dash.empty.replayTour')}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
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

      {/* FAB — mobile only */}
      <Link
        href="/request"
        onClick={() => haptic('medium')}
        aria-label="New project"
        className="sm:hidden fab fixed right-4 z-[100]"
        style={{
          bottom: 'calc(max(env(safe-area-inset-bottom, 0px), 8px) + 66px)',
          background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
          boxShadow: '0 4px 24px rgba(124,58,237,0.45), 0 0 0 1px rgba(255,255,255,0.1)',
        }}
      >
        <Plus className="w-6 h-6 text-white" />
      </Link>
    </div>
  );
}

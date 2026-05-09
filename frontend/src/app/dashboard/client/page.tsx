'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FolderOpen, MessageSquare, CreditCard, Clock, ArrowRight, Plus,
  Sparkles, CheckCircle2, Package, RotateCcw, Zap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const { show: showOnboarding, dismiss: dismissOnboarding } = useOnboarding();

  const fetchData = (silent = false) => {
    if (!silent) setLoading(true);
    Promise.all([projectAPI.getMine(), messageAPI.getUnread()])
      .then(([pRes, mRes]) => {
        setProjects(pRes.data.projects);
        setUnread(mRes.data.count);
      })
      .catch(console.error)
      .finally(() => { if (!silent) setLoading(false); });
  };

  // Initial load
  useEffect(() => { fetchData(); }, []);

  // Real-time polling (20 s when tab is visible)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => { timer = setInterval(() => fetchData(true), 20_000); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
    const onVis = () => document.visibilityState === 'visible' ? start() : stop();
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inProgress = projects.filter((p) => p.status === 'in-progress').length;
  const completed = projects.filter((p) => p.status === 'completed').length;

  return (
    <div className="space-y-8 max-w-7xl">

      {/* Onboarding modal — shown once on first visit */}
      {showOnboarding && (
        <OnboardingModal userName={user?.name || 'there'} onClose={dismissOnboarding} />
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
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            {user?.plan && <PlanBadge plan={user.plan} size="md" />}
          </div>
          <p className="text-slate-400 text-sm">
            Here&apos;s what&apos;s happening with your projects.
          </p>
        </div>
        <Link href="/request">
          <Button size="md">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Projects" value={projects.length} subtitle="All time" icon={FolderOpen} color="purple" index={0} />
        <StatsCard title="In Progress" value={inProgress} subtitle="Currently" icon={Clock} color="blue" index={1} />
        <StatsCard title="Completed" value={completed} subtitle="All time" icon={CreditCard} color="green" index={2} />
        <StatsCard title="Unread Messages" value={unread} subtitle="New messages" icon={MessageSquare} color="yellow" index={3} />
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">My Projects</h2>
          <Link href="/dashboard/client/projects">
            <Button variant="ghost" size="sm" className="text-primary-400">
              View All <ArrowRight className="w-3 h-3" />
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
                    Your first project is one step away.
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                    Submit a brief and we&apos;ll confirm your scope, timeline, and price
                    within 24 hours — before a single line of code is written.
                    No surprises, ever.
                  </p>
                </div>
              </div>

              {/* Project lifecycle visualizer */}
              <div className="mb-8">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                  How every project works
                </p>
                <ProjectLifecycle animated />
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {[
                  { icon: CheckCircle2,   label: 'Price confirmed upfront'  },
                  { icon: MessageSquare,  label: 'Direct developer access'  },
                  { icon: Package,        label: 'Full source code handover' },
                  { icon: RotateCcw,      label: 'Revision rounds included'  },
                  { icon: Zap,            label: 'Real-time status updates'  },
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
                    Start my first project
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
                <span className="text-sm text-slate-600">
                  or{' '}
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('mbndev_onboarding_done');
                        window.location.reload();
                      }
                    }}
                    className="text-primary-400 hover:text-primary-300 underline underline-offset-2 transition-colors"
                  >
                    replay the guided tour
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
    </div>
  );
}

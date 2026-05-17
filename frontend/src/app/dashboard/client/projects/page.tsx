'use client';

import { useState, useEffect, useCallback } from 'react';
import { FolderOpen, AlertTriangle, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { projectAPI } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { Project } from '@/types';
import ProjectCard from '@/components/dashboard/ProjectCard';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

const statusTabs = ['all', 'pending', 'in-progress', 'review', 'completed'] as const;

export default function ClientProjectsPage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchProjects = useCallback((silent = false) => {
    if (!silent) { setLoading(true); setFetchError(null); }
    projectAPI.getMine()
      .then(({ data }) => setProjects(data.projects))
      .catch((err) => {
        console.error(err);
        if (!silent) setFetchError('Failed to load. Please try again.');
      })
      .finally(() => { if (!silent) setLoading(false); });
  }, []);

  // Initial load
  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // Real-time polling (20 s when tab is visible)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => { timer = setInterval(() => fetchProjects(true), 20_000); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
    const onVis = () => document.visibilityState === 'visible' ? start() : stop();
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, [fetchProjects]);

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  return (
    <div className="space-y-6 max-w-7xl">
      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-300 flex-1">{fetchError}</span>
          <button
            onClick={() => fetchProjects(false)}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('dash.nav.myProjects')}</h1>
          <p className="text-slate-400 text-sm mt-1">{projects.length} {t('dash.nav.projects').toLowerCase()}</p>
        </div>
        <Link href="/request">
          <Button size="md">+ {t('common.create')}</Button>
        </Link>
      </div>

      {/* Filter tabs — horizontally scrollable */}
      <div className="tab-scroll pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-sm capitalize transition-all press-scale ${
              filter === tab
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-slate-400 hover:text-white bg-white/5 border border-transparent hover:bg-white/10'
            }`}
          >
            {tab === 'all' ? t('portfolio.cat.all') : tab === 'in-progress' ? t('status.inProgress') : tab === 'completed' ? t('status.completed') : tab === 'review' ? t('status.review') : t('status.pending')}
            <span className="ml-1.5 text-xs opacity-60">
              {tab === 'all'
                ? projects.length
                : projects.filter((p) => p.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-white/5">
          <FolderOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">{t('empty.projects')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
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
  );
}

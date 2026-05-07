'use client';

import { useState, useEffect } from 'react';
import { FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { projectAPI } from '@/lib/api';
import { Project } from '@/types';
import ProjectCard from '@/components/dashboard/ProjectCard';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

const statusTabs = ['all', 'pending', 'in-progress', 'review', 'completed'] as const;

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectAPI.getMine()
      .then(({ data }) => setProjects(data.projects))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Projects</h1>
          <p className="text-slate-400 text-sm mt-1">{projects.length} total projects</p>
        </div>
        <Link href="/request">
          <Button size="md">+ New Project</Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${
              filter === tab
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
            }`}
          >
            {tab === 'all' ? 'All' : tab.replace('-', ' ')}
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
          <p className="text-slate-400 text-sm">No projects with this status.</p>
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

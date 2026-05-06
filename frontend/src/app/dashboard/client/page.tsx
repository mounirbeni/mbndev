'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FolderOpen, MessageSquare, CreditCard, Clock, ArrowRight, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { projectAPI, messageAPI } from '@/lib/api';
import { Project } from '@/types';
import StatsCard from '@/components/dashboard/StatsCard';
import ProjectCard from '@/components/dashboard/ProjectCard';
import Button from '@/components/ui/Button';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([projectAPI.getMine(), messageAPI.getUnread()])
      .then(([pRes, mRes]) => {
        setProjects(pRes.data.projects);
        setUnread(mRes.data.count);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const inProgress = projects.filter((p) => p.status === 'in-progress').length;
  const completed = projects.filter((p) => p.status === 'completed').length;

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
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
          <div className="glass rounded-2xl p-12 text-center border border-white/5">
            <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-white font-medium mb-1">No projects yet</h3>
            <p className="text-slate-500 text-sm mb-4">Start by requesting your first project.</p>
            <Link href="/request">
              <Button size="md">Start Your Project</Button>
            </Link>
          </div>
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

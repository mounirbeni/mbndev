'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FolderOpen, Users, CreditCard, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { projectAPI, adminAPI, paymentAPI } from '@/lib/api';
import { Project, User, Payment } from '@/types';
import StatsCard from '@/components/dashboard/StatsCard';
import ProjectCard from '@/components/dashboard/ProjectCard';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, timeAgo } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0, pending: 0 });
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      projectAPI.getStats(),
      projectAPI.getAll(),
      adminAPI.getClients(),
      paymentAPI.getAll(),
    ])
      .then(([sRes, pRes, cRes, pyRes]) => {
        setStats(sRes.data.stats);
        setProjects(pRes.data.projects.slice(0, 5));
        setClients(cRes.data.clients.slice(0, 5));
        setPayments(pyRes.data.payments.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = payments
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of all projects and clients.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Projects" value={stats.total} subtitle="All time" icon={FolderOpen} color="purple" index={0} />
        <StatsCard title="In Progress" value={stats.inProgress} subtitle="Active now" icon={Clock} color="blue" index={1} />
        <StatsCard title="Completed" value={stats.completed} subtitle="Delivered" icon={TrendingUp} color="green" index={2} />
        <StatsCard title="Total Revenue" value={formatCurrency(totalRevenue)} subtitle="Paid invoices" icon={CreditCard} color="yellow" index={3} />
      </div>

      {/* Projects + Clients */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
            <Link href="/dashboard/admin/projects">
              <Button variant="ghost" size="sm" className="text-primary-400">
                View All <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="glass rounded-2xl h-20 animate-pulse" />
                ))
              : projects.map((p, i) => (
                  <ProjectCard
                    key={p._id}
                    project={p}
                    href={`/dashboard/admin/projects/${p._id}`}
                    index={i}
                  />
                ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Clients</h2>
            <Link href="/dashboard/admin/clients">
              <Button variant="ghost" size="sm" className="text-primary-400">
                View All <ArrowRight className="w-3 h-3" />
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
            ) : (
              <div className="divide-y divide-white/5">
                {clients.map((c) => (
                  <div key={c._id} className="flex items-center gap-3 p-4">
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

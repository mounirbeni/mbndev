'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { projectAPI, paymentAPI, adminAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import StatsCard from '@/components/dashboard/StatsCard';
import { TrendingUp, FolderOpen, Users, CreditCard, Clock, CheckCircle2, AlertCircle, BarChart2 } from 'lucide-react';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0, pending: 0 });
  const [projects, setProjects] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      projectAPI.getStats(),
      projectAPI.getAll(),
      paymentAPI.getAll(),
      adminAPI.getClients(),
    ])
      .then(([sRes, pRes, payRes, cRes]) => {
        setStats(sRes.data);
        setProjects(pRes.data.projects || []);
        setPayments(payRes.data.payments || []);
        setClients(cRes.data.clients || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingRevenue = payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const activeClients = clients.filter((c) => c.isActive).length;

  // Monthly revenue (mock distribution based on real total)
  const monthlyRevenue = months.map((m, i) => ({
    month: m,
    value: i <= new Date().getMonth() ? Math.round((totalRevenue / (new Date().getMonth() + 1)) * (0.7 + Math.random() * 0.6)) : 0,
  }));
  const maxRev = Math.max(...monthlyRevenue.map((m) => m.value), 1);

  // Project type distribution
  const typeCounts: Record<string, number> = {};
  projects.forEach((p) => { typeCounts[p.type] = (typeCounts[p.type] || 0) + 1; });
  const typeLabels: Record<string, string> = {
    'landing-page': 'Landing Page', 'ecommerce': 'E-Commerce', 'saas': 'SaaS',
    'portfolio': 'Portfolio', 'web-app': 'Web App', 'custom': 'Custom',
  };

  // Status distribution
  const statusData = [
    { label: 'Pending', count: stats.pending, color: 'bg-yellow-500', text: 'text-yellow-400' },
    { label: 'In Progress', count: stats.inProgress, color: 'bg-blue-500', text: 'text-blue-400' },
    { label: 'Completed', count: stats.completed, color: 'bg-green-500', text: 'text-green-400' },
    { label: 'Cancelled', count: projects.filter(p => p.status === 'cancelled').length, color: 'bg-red-500', text: 'text-red-400' },
  ];

  const recentPayments = [...payments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const recentProjects = [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Platform overview and performance metrics</p>
      </motion.div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Revenue" value={formatCurrency(totalRevenue)} subtitle="All time" icon={CreditCard} color="green" index={0} />
        <StatsCard title="Total Projects" value={stats.total} subtitle="All time" icon={FolderOpen} color="purple" index={1} />
        <StatsCard title="Active Clients" value={activeClients} subtitle="Registered" icon={Users} color="blue" index={2} />
        <StatsCard title="Pending Revenue" value={formatCurrency(pendingRevenue)} subtitle="Awaiting payment" icon={Clock} color="yellow" index={3} />
      </div>

      {/* Revenue chart + Status breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue bar chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold">Revenue Overview</h3>
              <p className="text-slate-500 text-xs mt-0.5">Monthly breakdown — {new Date().getFullYear()}</p>
            </div>
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">{formatCurrency(totalRevenue)}</span>
            </div>
          </div>
          <div className="flex items-end gap-2 h-40">
            {monthlyRevenue.map((m, i) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: m.value > 0 ? `${(m.value / maxRev) * 100}%` : '4px' }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className={`w-full rounded-t-sm ${m.value > 0 ? 'bg-primary-500/70 hover:bg-primary-500 transition-colors cursor-pointer' : 'bg-white/5'}`}
                  style={{ minHeight: '4px' }}
                  title={`${m.month}: ${formatCurrency(m.value)}`}
                />
                <span className="text-slate-600 text-[9px]">{m.month.slice(0, 1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-5">Project Status</h3>
          <div className="space-y-3">
            {statusData.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={s.text}>{s.label}</span>
                  <span className="text-slate-400">{s.count}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: stats.total > 0 ? `${(s.count / stats.total) * 100}%` : '0%' }}
                    transition={{ duration: 0.8 }}
                    className={`h-full ${s.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs">Completion rate</span>
              <span className="text-green-400 font-bold text-sm">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Project types + Recent payments */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Project types */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-5">Projects by Type</h3>
          {Object.keys(typeCounts).length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <BarChart2 className="w-3.5 h-3.5 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{typeLabels[type] || type}</span>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / projects.length) * 100}%` }}
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
          <h3 className="text-white font-semibold mb-5">Recent Payments</h3>
          {recentPayments.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No payments yet</p>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((p) => (
                <div key={p._id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    p.status === 'paid' ? 'bg-green-500/10' : 'bg-yellow-500/10'
                  }`}>
                    {p.status === 'paid'
                      ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                      : <AlertCircle className="w-4 h-4 text-yellow-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-300 text-sm truncate">
                      {typeof p.project === 'object' ? p.project?.title : 'Project'}
                    </div>
                    <div className="text-slate-500 text-xs">{p.milestoneTitle || p.description || 'Payment'}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${p.status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {formatCurrency(p.amount)}
                    </div>
                    <div className="text-slate-600 text-[10px] capitalize">{p.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent projects */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-white font-semibold">Recent Projects</h3>
        </div>
        {recentProjects.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No projects yet</p>
        ) : (
          <div className="divide-y divide-white/5">
            {recentProjects.map((p) => (
              <div key={p._id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{p.title}</div>
                  <div className="text-slate-500 text-xs">{typeLabels[p.type] || p.type}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-slate-400 text-xs w-8">{p.progress}%</span>
                </div>
                <div className="text-white text-sm font-semibold w-20 text-right">{formatCurrency(p.budget)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

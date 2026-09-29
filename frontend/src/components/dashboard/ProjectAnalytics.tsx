'use client';

import { motion } from 'framer-motion';
import { Activity, CalendarClock, CheckCircle2, Clock3, TrendingUp } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type Milestone = { id?: string; _id?: string; title: string; amount?: number; status?: string; dueDate?: string | null };
type ActivityLog = { id: string; action?: string; createdAt: string; metadata?: { to?: string; progress?: number } | null };

interface Props {
  project: {
    createdAt: string;
    deadline?: string | null;
    progress: number;
    milestones?: Milestone[];
    activityLogs?: ActivityLog[];
  };
}

const clamp = (value: number) => Math.max(0, Math.min(100, value));

function daysBetween(from: Date, to: Date) {
  return Math.max(0, Math.ceil((to.getTime() - from.getTime()) / 86_400_000));
}

export default function ProjectAnalytics({ project }: Props) {
  const now = new Date();
  const started = new Date(project.createdAt);
  const deadline = project.deadline ? new Date(project.deadline) : null;
  const totalDays = deadline ? Math.max(1, daysBetween(started, deadline)) : null;
  const elapsedDays = daysBetween(started, now);
  const expectedProgress = totalDays ? clamp((elapsedDays / totalDays) * 100) : null;
  const scheduleDelta = expectedProgress === null ? null : Math.round(project.progress - expectedProgress);
  const daysRemaining = deadline ? Math.max(0, daysBetween(now, deadline)) : null;

  const milestones = project.milestones || [];
  const completeMilestones = milestones.filter((m) => m.status === 'paid').length;
  const activity = project.activityLogs || [];
  const progressEvents = activity
    .filter((event) => event.action === 'progress_update')
    .map((event) => ({ date: new Date(event.createdAt), progress: Number(event.metadata?.to ?? event.metadata?.progress) }))
    .filter((event) => Number.isFinite(event.progress))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const points = [{ progress: 0 }, ...progressEvents, { progress: project.progress }]
    .map((event, index, all) => {
      const x = all.length === 1 ? 0 : (index / (all.length - 1)) * 100;
      const y = 100 - clamp(event.progress);
      return `${x},${y}`;
    })
    .join(' ');

  const health = scheduleDelta === null
    ? { label: 'Tracking progress', className: 'text-primary-300 bg-primary-500/10 border-primary-500/20' }
    : scheduleDelta >= -5
      ? { label: 'On schedule', className: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' }
      : { label: 'Needs attention', className: 'text-amber-300 bg-amber-500/10 border-amber-500/20' };

  const metrics = [
    { label: 'Completion', value: `${project.progress}%`, icon: TrendingUp, color: 'text-primary-300' },
    { label: 'Milestones', value: `${completeMilestones}/${milestones.length || 0}`, icon: CheckCircle2, color: 'text-emerald-300' },
    { label: deadline ? 'Time remaining' : 'Time active', value: deadline ? `${daysRemaining}d` : `${elapsedDays}d`, icon: Clock3, color: 'text-amber-300' },
  ];

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5 sm:p-6 border border-white/5 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: 'radial-gradient(circle at 85% 10%, rgba(124,58,237,.22), transparent 35%)' }} />
        <div className="relative flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-white font-semibold"><Activity className="w-4 h-4 text-primary-400" /> Project analytics</div>
            <p className="text-slate-500 text-xs mt-1">Live signals from project progress, milestones and activity.</p>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${health.className}`}>{health.label}</span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {metrics.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl bg-white/[0.035] border border-white/[0.06] p-3">
              <Icon className={`w-4 h-4 mb-2 ${color}`} />
              <div className="text-white font-bold text-lg leading-none">{value}</div>
              <div className="text-slate-500 text-[10px] mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-[#08080d]/60 border border-white/[0.06] px-3 pt-4 pb-3">
          <div className="flex items-center justify-between text-[11px] mb-3">
            <span className="text-slate-400">Progress trend</span>
            {scheduleDelta !== null && <span className={scheduleDelta >= -5 ? 'text-emerald-400' : 'text-amber-400'}>{scheduleDelta >= 0 ? '+' : ''}{scheduleDelta}% vs plan</span>}
          </div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-24 overflow-visible" aria-label="Project progress chart">
            <defs>
              <linearGradient id="project-progress" x1="0" x2="1" y1="0" y2="0"><stop stopColor="#7c3aed" /><stop offset="1" stopColor="#c084fc" /></linearGradient>
            </defs>
            {[25, 50, 75].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(255,255,255,.08)" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
            {expectedProgress !== null && <line x1="0" x2="100" y1="100" y2={100 - expectedProgress} stroke="rgba(52,211,153,.35)" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />}
            <motion.polyline initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .8 }} points={points} fill="none" stroke="url(#project-progress)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex justify-between text-[10px] text-slate-600 mt-1"><span>Started {formatDate(project.createdAt)}</span><span>{deadline ? `Due ${formatDate(deadline.toISOString())}` : 'Flexible timeline'}</span></div>
        </div>
      </div>

      {deadline && (
        <div className="glass rounded-2xl p-4 border border-white/5 flex gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-500/15 flex items-center justify-center shrink-0"><CalendarClock className="w-4 h-4 text-primary-300" /></div>
          <div><p className="text-white text-sm font-medium">Delivery forecast</p><p className="text-slate-400 text-xs mt-0.5">{daysRemaining === 0 ? 'Delivery date is today.' : `${daysRemaining} days remain until the current delivery date.`} {scheduleDelta !== null && (scheduleDelta >= -5 ? 'Current progress supports this timeline.' : 'Progress needs attention to protect this date.')}</p></div>
        </div>
      )}
    </div>
  );
}

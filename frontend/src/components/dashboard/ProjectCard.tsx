'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Project } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, getProjectTypeLabel, getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  href: string;
  index?: number;
  compact?: boolean;
}

/* Deadline urgency — returns label + color classes */
function deadlineUrgency(deadline: string | undefined) {
  if (!deadline) return null;
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  if (diff < 0)  return { label: `${Math.abs(diff)}d overdue`, color: 'text-red-400',    bg: 'bg-red-500/10',    icon: AlertCircle };
  if (diff === 0) return { label: 'Due today',                  color: 'text-red-400',    bg: 'bg-red-500/10',    icon: AlertCircle };
  if (diff <= 3)  return { label: `${diff}d left`,              color: 'text-orange-400', bg: 'bg-orange-500/10', icon: Calendar    };
  if (diff <= 7)  return { label: `${diff}d left`,              color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Calendar    };
  return           { label: formatDate(deadline),               color: 'text-slate-500',  bg: 'transparent',      icon: Calendar    };
}

/* Progress color based on value */
function progressColor(pct: number): string {
  if (pct >= 100) return 'from-emerald-500 to-green-400';
  if (pct >= 60)  return 'from-blue-600 to-blue-400';
  if (pct >= 30)  return 'from-primary-600 to-primary-400';
  return 'from-slate-600 to-slate-400';
}

/* Left accent bar color based on status */
function accentColor(status: string): string {
  const map: Record<string, string> = {
    'in-progress': 'bg-blue-500',
    'review':      'bg-orange-500',
    'revision':    'bg-orange-400',
    'pending':     'bg-slate-500',
    'paid':        'bg-green-500',
    'completed':   'bg-emerald-500',
    'delivered':   'bg-violet-500',
    'cancelled':   'bg-red-500',
  };
  return map[status] || 'bg-slate-600';
}

const ProjectCard = memo(function ProjectCard({ project, href, index = 0, compact = false }: ProjectCardProps) {
  const { t } = useLanguage();
  const client = typeof project.client === 'object' ? project.client : null;

  const completedMilestones = (project.milestones ?? []).filter(
    (m: any) => m.status === 'paid' || m.status === 'completed'
  ).length;
  const totalMilestones = (project.milestones ?? []).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 260, damping: 24 }}
    >
      <Link href={href} className="block group">
        <div className={cn(
          'relative glass rounded-2xl border border-white/6 overflow-hidden',
          'transition-all duration-200',
          'hover:border-primary-500/30 hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)]',
          'active:scale-[0.985]',
          compact ? 'p-4' : 'p-4 sm:p-5'
        )}>
          {/* Left accent bar */}
          <div className={cn(
            'absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full',
            accentColor(project.status)
          )} />

          {/* Content */}
          <div className="pl-3">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm leading-snug truncate
                               group-hover:text-primary-300 transition-colors duration-150">
                  {project.title}
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {getProjectTypeLabel(project.type, t)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={project.status} />
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-primary-400
                                         opacity-0 group-hover:opacity-100 transition-all duration-150
                                         group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-[11px] mb-1.5">
                <span className="text-slate-500">{t('admin.progress')}</span>
                <span className="text-slate-400 font-semibold tabular-nums">
                  {project.progress}%
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 0.9, delay: index * 0.05 + 0.2, ease: 'easeOut' }}
                  className={cn('h-full bg-gradient-to-r rounded-full', progressColor(project.progress))}
                />
              </div>
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                {/* Client avatar */}
                {client && (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-blue-500
                                    flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                      {getInitials(client.name).charAt(0)}
                    </div>
                    <span className="text-slate-500 text-[11px] truncate">{client.name}</span>
                  </div>
                )}
                {/* Deadline urgency badge */}
                {project.deadline && (() => {
                  const d = deadlineUrgency(project.deadline);
                  if (!d) return null;
                  const Icon = d.icon;
                  return (
                    <span className={cn('flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md', d.color, d.bg)}>
                      <Icon className="w-3 h-3 shrink-0" />
                      {d.label}
                    </span>
                  );
                })()}
              </div>

              {/* Milestones */}
              {totalMilestones > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-slate-600 shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-green-500/70" />
                  <span className="tabular-nums">
                    {completedMilestones}/{totalMilestones}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

export default ProjectCard;

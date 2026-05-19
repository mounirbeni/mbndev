'use client';

import { cn, statusColors, getStatusLabel } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface BadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, className, size = 'sm' }: BadgeProps) {
  const { t } = useLanguage();

  /* Map status → dot color for the live indicator */
  const dotColorMap: Record<string, string> = {
    'in-progress': 'bg-blue-400',
    'review':      'bg-orange-400',
    'revision':    'bg-orange-400',
    'pending':     'bg-slate-400',
    'paid':        'bg-green-400',
    'completed':   'bg-green-400',
    'delivered':   'bg-violet-400',
    'cancelled':   'bg-red-400',
  };

  const isPulsing = status === 'in-progress' || status === 'review';
  const dotColor  = dotColorMap[status] || 'bg-slate-400';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border whitespace-nowrap',
        size === 'sm'  && 'px-2.5 py-0.5 text-[11px]',
        size === 'md'  && 'px-3 py-1 text-xs',
        statusColors[status] || 'bg-slate-500/15 text-slate-400 border-slate-500/25',
        className
      )}
    >
      <span className={cn('relative flex shrink-0', size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')}>
        {isPulsing && (
          <span className={cn('absolute inset-0 rounded-full opacity-75 animate-ping', dotColor)} />
        )}
        <span className={cn('relative inline-flex rounded-full w-full h-full', dotColor)} />
      </span>
      {getStatusLabel(status, t)}
    </span>
  );
}

interface GenericBadgeProps {
  children: React.ReactNode;
  color?: 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'cyan' | 'orange';
  className?: string;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const colorMap: Record<string, string> = {
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  blue:   'bg-blue-500/15   text-blue-400   border-blue-500/25',
  green:  'bg-green-500/15  text-green-400  border-green-500/25',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  red:    'bg-red-500/15    text-red-400    border-red-500/25',
  gray:   'bg-slate-500/15  text-slate-400  border-slate-500/25',
  cyan:   'bg-cyan-500/15   text-cyan-400   border-cyan-500/25',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
};

export function Badge({ children, color = 'gray', className, size = 'sm', dot }: GenericBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold border',
        size === 'sm' && 'px-2.5 py-0.5 text-[11px]',
        size === 'md' && 'px-3 py-1 text-xs',
        colorMap[color],
        className
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />}
      {children}
    </span>
  );
}

'use client';

import { cn, statusColors, getStatusLabel } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface BadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  const { t } = useLanguage();
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        statusColors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {getStatusLabel(status, t)}
    </span>
  );
}

interface GenericBadgeProps {
  children: React.ReactNode;
  color?: 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  className?: string;
}

const colorMap: Record<string, string> = {
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  gray: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export function Badge({ children, color = 'gray', className }: GenericBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        colorMap[color],
        className
      )}
    >
      {children}
    </span>
  );
}

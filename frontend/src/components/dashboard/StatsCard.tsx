'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'cyan';
  index?: number;
  trend?: number;        // e.g. +12 means +12%
  trendLabel?: string;   // e.g. "vs last month"
  href?: string;
  onClick?: () => void;
}

const colorMap = {
  purple: {
    icon:     'bg-purple-500/18 text-purple-400',
    iconGlow: 'shadow-[0_0_12px_rgba(168,85,247,0.25)]',
    accent:   'from-purple-600 via-purple-500 to-violet-500',
    border:   'hover:border-purple-500/30',
    bg:       'hover:bg-purple-500/5',
  },
  blue:   {
    icon:     'bg-blue-500/18 text-blue-400',
    iconGlow: 'shadow-[0_0_12px_rgba(59,130,246,0.25)]',
    accent:   'from-blue-600 via-blue-500 to-cyan-500',
    border:   'hover:border-blue-500/30',
    bg:       'hover:bg-blue-500/5',
  },
  green:  {
    icon:     'bg-green-500/18 text-green-400',
    iconGlow: 'shadow-[0_0_12px_rgba(34,197,94,0.25)]',
    accent:   'from-green-600 via-emerald-500 to-teal-500',
    border:   'hover:border-green-500/30',
    bg:       'hover:bg-green-500/5',
  },
  yellow: {
    icon:     'bg-amber-500/18 text-amber-400',
    iconGlow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    accent:   'from-amber-600 via-amber-500 to-yellow-500',
    border:   'hover:border-amber-500/30',
    bg:       'hover:bg-amber-500/5',
  },
  red:    {
    icon:     'bg-red-500/18 text-red-400',
    iconGlow: 'shadow-[0_0_12px_rgba(239,68,68,0.25)]',
    accent:   'from-red-600 via-red-500 to-rose-500',
    border:   'hover:border-red-500/30',
    bg:       'hover:bg-red-500/5',
  },
  cyan:   {
    icon:     'bg-cyan-500/18 text-cyan-400',
    iconGlow: 'shadow-[0_0_12px_rgba(6,182,212,0.25)]',
    accent:   'from-cyan-600 via-cyan-500 to-teal-500',
    border:   'hover:border-cyan-500/30',
    bg:       'hover:bg-cyan-500/5',
  },
};

const StatsCard = memo(function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'purple',
  index = 0,
  trend,
  trendLabel,
  onClick,
}: StatsCardProps) {
  const c = colorMap[color];

  const trendPositive = trend !== undefined && trend > 0;
  const trendNeutral  = trend === undefined || trend === 0;
  const TrendIcon     = trendNeutral ? Minus : trendPositive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 260, damping: 24 }}
      onClick={onClick}
      className={cn(
        'relative glass rounded-2xl border border-white/6 overflow-hidden',
        'transition-all duration-200',
        c.border, c.bg,
        onClick && 'cursor-pointer press-scale',
      )}
    >
      {/* Colored accent top bar */}
      <div className={cn('h-[3px] w-full bg-gradient-to-r', c.accent)} />

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-slate-400 text-xs sm:text-[13px] font-medium leading-tight">
            {title}
          </p>
          <div className={cn(
            'w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0',
            c.icon, c.iconGlow
          )}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.8} />
          </div>
        </div>

        {/* Value */}
        <motion.p
          key={String(value)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="text-2xl sm:text-[28px] font-black text-white leading-none mb-1.5 tabular-nums"
        >
          {value}
        </motion.p>

        {/* Subtitle / trend */}
        <div className="flex items-center justify-between gap-2">
          {subtitle && (
            <p className="text-slate-600 text-[11px] hidden sm:block truncate">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={cn(
              'flex items-center gap-1 text-[11px] font-semibold shrink-0',
              trendNeutral  ? 'text-slate-500' :
              trendPositive ? 'text-emerald-400' : 'text-red-400'
            )}>
              <TrendIcon className="w-3 h-3" />
              {!trendNeutral && `${trendPositive ? '+' : ''}${trend}%`}
              {trendLabel && <span className="text-slate-600 font-normal ml-0.5">{trendLabel}</span>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default StatsCard;

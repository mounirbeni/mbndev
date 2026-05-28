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
  trend?: number;
  trendLabel?: string;
  href?: string;
  onClick?: () => void;
}

const colorMap = {
  purple: {
    icon:      'text-violet-400',
    iconBg:    'rgba(124,58,237,0.15)',
    iconGlow:  '0 0 16px rgba(124,58,237,0.25), 0 0 32px rgba(124,58,237,0.08)',
    accent:    'linear-gradient(90deg, #7c3aed, #a855f7, #8b5cf6)',
    hoverGlow: '0 0 40px rgba(124,58,237,0.08), 0 20px 60px rgba(0,0,0,0.3)',
    hoverBorder: 'rgba(124,58,237,0.25)',
    topLine: 'linear-gradient(90deg, #7c3aed, #a855f7)',
  },
  blue: {
    icon:      'text-blue-400',
    iconBg:    'rgba(59,130,246,0.15)',
    iconGlow:  '0 0 16px rgba(59,130,246,0.25), 0 0 32px rgba(59,130,246,0.08)',
    accent:    'linear-gradient(90deg, #1d4ed8, #3b82f6, #60a5fa)',
    hoverGlow: '0 0 40px rgba(59,130,246,0.08), 0 20px 60px rgba(0,0,0,0.3)',
    hoverBorder: 'rgba(59,130,246,0.25)',
    topLine: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
  },
  green: {
    icon:      'text-emerald-400',
    iconBg:    'rgba(16,185,129,0.12)',
    iconGlow:  '0 0 16px rgba(16,185,129,0.2), 0 0 32px rgba(16,185,129,0.07)',
    accent:    'linear-gradient(90deg, #059669, #10b981, #34d399)',
    hoverGlow: '0 0 40px rgba(16,185,129,0.07), 0 20px 60px rgba(0,0,0,0.3)',
    hoverBorder: 'rgba(16,185,129,0.25)',
    topLine: 'linear-gradient(90deg, #10b981, #34d399)',
  },
  yellow: {
    icon:      'text-amber-400',
    iconBg:    'rgba(245,158,11,0.12)',
    iconGlow:  '0 0 16px rgba(245,158,11,0.2), 0 0 32px rgba(245,158,11,0.07)',
    accent:    'linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)',
    hoverGlow: '0 0 40px rgba(245,158,11,0.07), 0 20px 60px rgba(0,0,0,0.3)',
    hoverBorder: 'rgba(245,158,11,0.25)',
    topLine: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
  },
  red: {
    icon:      'text-red-400',
    iconBg:    'rgba(239,68,68,0.12)',
    iconGlow:  '0 0 16px rgba(239,68,68,0.2), 0 0 32px rgba(239,68,68,0.07)',
    accent:    'linear-gradient(90deg, #dc2626, #ef4444, #f87171)',
    hoverGlow: '0 0 40px rgba(239,68,68,0.07), 0 20px 60px rgba(0,0,0,0.3)',
    hoverBorder: 'rgba(239,68,68,0.25)',
    topLine: 'linear-gradient(90deg, #ef4444, #f87171)',
  },
  cyan: {
    icon:      'text-cyan-400',
    iconBg:    'rgba(6,182,212,0.12)',
    iconGlow:  '0 0 16px rgba(6,182,212,0.2), 0 0 32px rgba(6,182,212,0.07)',
    accent:    'linear-gradient(90deg, #0891b2, #06b6d4, #67e8f9)',
    hoverGlow: '0 0 40px rgba(6,182,212,0.07), 0 20px 60px rgba(0,0,0,0.3)',
    hoverBorder: 'rgba(6,182,212,0.25)',
    topLine: 'linear-gradient(90deg, #06b6d4, #67e8f9)',
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl cursor-default group',
        onClick && 'cursor-pointer press-scale',
      )}
      style={{
        background:   'rgba(10,10,16,0.92)',
        border:       '1px solid rgba(255,255,255,0.065)',
        backdropFilter: 'blur(24px)',
        boxShadow:    '0 1px 0 rgba(255,255,255,0.05) inset, 0 20px 50px rgba(0,0,0,0.35)',
        transition:   'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = c.hoverBorder;
        el.style.boxShadow   = c.hoverGlow;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'rgba(255,255,255,0.065)';
        el.style.boxShadow   = '0 1px 0 rgba(255,255,255,0.05) inset, 0 20px 50px rgba(0,0,0,0.35)';
      }}
    >
      {/* Colored accent bar at top */}
      <div
        className="h-[2px] w-full"
        style={{ background: c.accent }}
      />

      {/* Subtle top-edge internal glow */}
      <div
        className="absolute top-0 left-0 right-0 h-16 pointer-events-none opacity-40"
        style={{ background: `radial-gradient(ellipse 60% 100% at 50% 0%, ${c.iconBg.replace('0.15', '0.5').replace('0.12', '0.4')}, transparent)` }}
      />

      <div className="p-4 sm:p-5 relative z-10">
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="text-slate-400 text-xs sm:text-[13px] font-medium leading-tight mt-0.5">
            {title}
          </p>
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
            style={{
              background: c.iconBg,
              boxShadow:  c.iconGlow,
            }}
          >
            <Icon className={cn('w-[18px] h-[18px] sm:w-5 sm:h-5', c.icon)} strokeWidth={1.8} />
          </div>
        </div>

        {/* Value */}
        <motion.p
          key={String(value)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="text-[26px] sm:text-[30px] font-black text-white leading-none mb-2 tabular-nums"
        >
          {value}
        </motion.p>

        {/* Subtitle / trend row */}
        <div className="flex items-center justify-between gap-2">
          {subtitle && (
            <p className="text-slate-600 text-[11px] hidden sm:block truncate">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={cn(
              'flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0',
              trendNeutral
                ? 'text-slate-500 bg-white/4'
                : trendPositive
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-red-400 bg-red-500/10'
            )}>
              <TrendIcon className="w-3 h-3" />
              {!trendNeutral && `${trendPositive ? '+' : ''}${trend}%`}
              {trendLabel && <span className="text-slate-600 font-normal ml-0.5 hidden sm:inline">{trendLabel}</span>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default StatsCard;

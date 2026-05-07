'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'purple' | 'blue' | 'green' | 'yellow';
  index?: number;
}

const colorMap = {
  purple: { icon: 'bg-purple-500/20 text-purple-400', border: 'hover:border-purple-500/30' },
  blue:   { icon: 'bg-blue-500/20 text-blue-400',     border: 'hover:border-blue-500/30' },
  green:  { icon: 'bg-green-500/20 text-green-400',   border: 'hover:border-green-500/30' },
  yellow: { icon: 'bg-yellow-500/20 text-yellow-400', border: 'hover:border-yellow-500/30' },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'purple',
  index = 0,
}: StatsCardProps) {
  const { icon, border } = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={cn(
        'glass rounded-2xl p-4 sm:p-5 border border-white/6 transition-all duration-300',
        border
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-slate-400 text-xs sm:text-sm mb-1 leading-tight truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-white leading-none">{value}</p>
          {subtitle && (
            <p className="text-slate-500 text-xs mt-1.5 hidden sm:block">{subtitle}</p>
          )}
        </div>
        <div className={cn('w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0', icon)}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </motion.div>
  );
}

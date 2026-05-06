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
  purple: {
    icon: 'bg-purple-500/20 text-purple-400',
    glow: 'hover:border-purple-500/30',
  },
  blue: {
    icon: 'bg-blue-500/20 text-blue-400',
    glow: 'hover:border-blue-500/30',
  },
  green: {
    icon: 'bg-green-500/20 text-green-400',
    glow: 'hover:border-green-500/30',
  },
  yellow: {
    icon: 'bg-yellow-500/20 text-yellow-400',
    glow: 'hover:border-yellow-500/30',
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'purple',
  index = 0,
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'glass rounded-2xl p-6 border border-white/5 transition-all duration-300',
        colors.glow
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colors.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}

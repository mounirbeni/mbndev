import { Zap, Star, Crown, Settings } from 'lucide-react';

const PLAN_CONFIG: Record<string, { label: string; icon: any; className: string }> = {
  starter: {
    label: 'Starter',
    icon: Zap,
    className: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
  pro: {
    label: 'Pro',
    icon: Star,
    className: 'bg-primary-500/15 text-primary-300 border-primary-500/30',
  },
  premium: {
    label: 'Premium',
    icon: Crown,
    className: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  custom: {
    label: 'Custom',
    icon: Settings,
    className: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  },
};

interface PlanBadgeProps {
  plan?: string | null;
  size?: 'sm' | 'md';
}

export default function PlanBadge({ plan, size = 'sm' }: PlanBadgeProps) {
  const key = (plan ?? 'custom').toLowerCase();
  const config = PLAN_CONFIG[key] ?? PLAN_CONFIG.custom;
  const Icon = config.icon;

  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${config.className} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      {config.label}
    </span>
  );
}

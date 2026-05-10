'use client';

import { motion } from 'framer-motion';
import {
  FileText, Zap, Code2, RotateCcw, Package, Trophy, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export type ProjectStatus =
  | 'pending' | 'paid' | 'in-progress' | 'review'
  | 'revision' | 'delivered' | 'completed' | 'cancelled';

interface Stage {
  key:         string[];
  icon:        React.ElementType;
  label:       string;
  shortLabel:  string;
  description: string;
  color:       string;
  bg:          string;
  ring:        string;
}

function buildStages(t: (k: string) => string): Stage[] {
  return [
    {
      key:         ['pending'],
      icon:        FileText,
      label:       t('lifecycle.stage.request'),
      shortLabel:  t('lifecycle.stage.request'),
      description: t('lifecycle.desc.request'),
      color:       'text-slate-300',
      bg:          'bg-slate-800/80',
      ring:        'ring-slate-500/40',
    },
    {
      key:         ['paid'],
      icon:        Zap,
      label:       t('lifecycle.stage.approved'),
      shortLabel:  t('lifecycle.stage.approved'),
      description: t('lifecycle.desc.approved'),
      color:       'text-amber-400',
      bg:          'bg-amber-500/15',
      ring:        'ring-amber-500/40',
    },
    {
      key:         ['in-progress'],
      icon:        Code2,
      label:       t('lifecycle.stage.dev'),
      shortLabel:  t('lifecycle.stage.devShort'),
      description: t('lifecycle.desc.dev'),
      color:       'text-blue-400',
      bg:          'bg-blue-500/15',
      ring:        'ring-blue-500/40',
    },
    {
      key:         ['review', 'revision'],
      icon:        RotateCcw,
      label:       t('lifecycle.stage.review'),
      shortLabel:  t('lifecycle.stage.reviewShort'),
      description: t('lifecycle.desc.review'),
      color:       'text-orange-400',
      bg:          'bg-orange-500/15',
      ring:        'ring-orange-500/40',
    },
    {
      key:         ['delivered'],
      icon:        Package,
      label:       t('lifecycle.stage.delivered'),
      shortLabel:  t('lifecycle.stage.delivered'),
      description: t('lifecycle.desc.delivered'),
      color:       'text-violet-400',
      bg:          'bg-violet-500/15',
      ring:        'ring-violet-500/40',
    },
    {
      key:         ['completed'],
      icon:        Trophy,
      label:       t('lifecycle.stage.complete'),
      shortLabel:  t('lifecycle.stage.complete'),
      description: t('lifecycle.desc.complete'),
      color:       'text-green-400',
      bg:          'bg-green-500/15',
      ring:        'ring-green-500/40',
    },
  ];
}

interface Props {
  status?:   ProjectStatus;
  /** compact = no descriptions, used in dashboard sidebar/cards */
  compact?:  boolean;
  animated?: boolean;
  className?: string;
}

export default function ProjectLifecycle({ status, compact = false, animated = true, className }: Props) {
  const { t } = useLanguage();
  const STAGES = buildStages(t);
  const activeIndex = STAGES.findIndex((s) => s.key.includes(status ?? ''));

  if (compact) {
    // ── Compact horizontal strip (for cards / sidebars) ──────────────────────
    return (
      <div className={cn('flex items-center w-full gap-0', className)}>
        {STAGES.map((stage, i) => {
          const Icon   = stage.icon;
          const done   = activeIndex >= 0 && i < activeIndex;
          const active = i === activeIndex;
          const future = activeIndex < 0 || i > activeIndex;

          return (
            <div key={stage.label} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                <motion.div
                  initial={animated ? { scale: 0.8, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center transition-all',
                    active
                      ? cn(stage.bg, 'ring-2 ring-offset-1 ring-offset-[#111118]', stage.ring)
                      : done
                        ? 'bg-green-500/20'
                        : 'bg-white/5'
                  )}
                >
                  {done
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    : <Icon className={cn('w-3.5 h-3.5', active ? stage.color : 'text-slate-700')} />
                  }
                </motion.div>
                <span className={cn(
                  'text-[9px] font-medium text-center leading-none',
                  active ? 'text-white' : done ? 'text-green-400/60' : 'text-slate-700'
                )}>
                  {stage.shortLabel}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div className={cn(
                  'h-px flex-1 mx-0.5 mb-3.5 transition-colors',
                  done ? 'bg-green-500/30' : active ? 'bg-white/10' : 'bg-white/5'
                )} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── Full expanded view ──────────────────────────────────────────────────────
  return (
    <div className={cn('w-full', className)}>
      {/* Connector row */}
      <div className="flex items-start gap-0 mb-6">
        {STAGES.map((stage, i) => {
          const Icon   = stage.icon;
          const done   = activeIndex >= 0 && i < activeIndex;
          const active = i === activeIndex;

          return (
            <div key={stage.label} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <motion.div
                  initial={animated ? { scale: 0.6, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 20 }}
                  className={cn(
                    'w-11 h-11 rounded-2xl flex items-center justify-center transition-all',
                    active
                      ? cn(stage.bg, 'ring-2 ring-offset-2 ring-offset-[#0f0f16]', stage.ring, 'shadow-lg')
                      : done
                        ? 'bg-green-500/15 ring-1 ring-green-500/30'
                        : 'bg-white/4 ring-1 ring-white/8'
                  )}
                >
                  {done
                    ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                    : <Icon className={cn('w-5 h-5', active ? stage.color : 'text-slate-700')} />
                  }
                </motion.div>
                <span className={cn(
                  'text-[11px] font-semibold text-center leading-tight px-1',
                  active ? 'text-white' : done ? 'text-green-400/70' : 'text-slate-700'
                )}>
                  {stage.shortLabel}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <motion.div
                  initial={animated ? { scaleX: 0 } : false}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                  style={{ transformOrigin: 'left' }}
                  className={cn(
                    'h-px flex-1 mx-1 mb-6 transition-colors',
                    done ? 'bg-green-500/40' : active ? 'bg-primary-500/30' : 'bg-white/6'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Active stage description card */}
      {activeIndex >= 0 && (
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className={cn(
            'rounded-2xl px-4 py-3.5 border',
            STAGES[activeIndex].bg,
            'border-white/10'
          )}
        >
          <div className="flex items-start gap-3">
            {(() => {
              const Icon = STAGES[activeIndex].icon;
              return (
                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-black/20')}>
                  <Icon className={cn('w-4 h-4', STAGES[activeIndex].color)} />
                </div>
              );
            })()}
            <div>
              <p className={cn('text-sm font-semibold mb-0.5', STAGES[activeIndex].color)}>
                {STAGES[activeIndex].label}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {STAGES[activeIndex].description}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* No active stage — show preview description */}
      {activeIndex < 0 && (
        <div className="rounded-2xl px-4 py-3 border border-white/6 bg-white/3 text-center">
          <p className="text-xs text-slate-500">
            {t('lifecycle.noStage')}
          </p>
        </div>
      )}
    </div>
  );
}

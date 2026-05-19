'use client';

import { memo } from 'react';
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
  iconBg:      string;
  ringColor:   string;
  barColor:    string;
  descBg:      string;
  descBorder:  string;
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
      iconBg:      'rgba(148,163,184,0.15)',
      ringColor:   'rgba(148,163,184,0.35)',
      barColor:    'rgba(148,163,184,0.4)',
      descBg:      'rgba(148,163,184,0.06)',
      descBorder:  'rgba(148,163,184,0.15)',
    },
    {
      key:         ['paid'],
      icon:        Zap,
      label:       t('lifecycle.stage.approved'),
      shortLabel:  t('lifecycle.stage.approved'),
      description: t('lifecycle.desc.approved'),
      color:       'text-amber-400',
      iconBg:      'rgba(245,158,11,0.15)',
      ringColor:   'rgba(245,158,11,0.35)',
      barColor:    'rgba(245,158,11,0.5)',
      descBg:      'rgba(245,158,11,0.06)',
      descBorder:  'rgba(245,158,11,0.18)',
    },
    {
      key:         ['in-progress'],
      icon:        Code2,
      label:       t('lifecycle.stage.dev'),
      shortLabel:  t('lifecycle.stage.devShort'),
      description: t('lifecycle.desc.dev'),
      color:       'text-blue-400',
      iconBg:      'rgba(59,130,246,0.15)',
      ringColor:   'rgba(59,130,246,0.35)',
      barColor:    'rgba(59,130,246,0.5)',
      descBg:      'rgba(59,130,246,0.06)',
      descBorder:  'rgba(59,130,246,0.18)',
    },
    {
      key:         ['review', 'revision'],
      icon:        RotateCcw,
      label:       t('lifecycle.stage.review'),
      shortLabel:  t('lifecycle.stage.reviewShort'),
      description: t('lifecycle.desc.review'),
      color:       'text-orange-400',
      iconBg:      'rgba(249,115,22,0.15)',
      ringColor:   'rgba(249,115,22,0.35)',
      barColor:    'rgba(249,115,22,0.5)',
      descBg:      'rgba(249,115,22,0.06)',
      descBorder:  'rgba(249,115,22,0.18)',
    },
    {
      key:         ['delivered'],
      icon:        Package,
      label:       t('lifecycle.stage.delivered'),
      shortLabel:  t('lifecycle.stage.delivered'),
      description: t('lifecycle.desc.delivered'),
      color:       'text-violet-400',
      iconBg:      'rgba(139,92,246,0.15)',
      ringColor:   'rgba(139,92,246,0.35)',
      barColor:    'rgba(139,92,246,0.5)',
      descBg:      'rgba(139,92,246,0.06)',
      descBorder:  'rgba(139,92,246,0.18)',
    },
    {
      key:         ['completed'],
      icon:        Trophy,
      label:       t('lifecycle.stage.complete'),
      shortLabel:  t('lifecycle.stage.complete'),
      description: t('lifecycle.desc.complete'),
      color:       'text-emerald-400',
      iconBg:      'rgba(16,185,129,0.15)',
      ringColor:   'rgba(16,185,129,0.35)',
      barColor:    'rgba(16,185,129,0.5)',
      descBg:      'rgba(16,185,129,0.06)',
      descBorder:  'rgba(16,185,129,0.18)',
    },
  ];
}

interface Props {
  status?:    ProjectStatus;
  compact?:   boolean;
  animated?:  boolean;
  className?: string;
}

const ProjectLifecycle = memo(function ProjectLifecycle({
  status, compact = false, animated = true, className,
}: Props) {
  const { t }       = useLanguage();
  const STAGES      = buildStages(t);
  const activeIndex = STAGES.findIndex((s) => s.key.includes(status ?? ''));

  /* ── Compact horizontal strip ──────────────────────────────────────────── */
  if (compact) {
    return (
      <div className={cn('flex items-center w-full gap-0', className)}>
        {STAGES.map((stage, i) => {
          const Icon   = stage.icon;
          const done   = activeIndex >= 0 && i < activeIndex;
          const active = i === activeIndex;

          return (
            <div key={stage.label} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                <motion.div
                  initial={animated ? { scale: 0.7, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 280, damping: 22 }}
                  className="w-7 h-7 rounded-[10px] flex items-center justify-center transition-all"
                  style={
                    active
                      ? {
                          background: stage.iconBg,
                          boxShadow:  `0 0 0 2px ${stage.ringColor}, 0 0 8px ${stage.iconBg}`,
                        }
                      : done
                        ? { background: 'rgba(16,185,129,0.15)' }
                        : { background: 'rgba(255,255,255,0.04)' }
                  }
                >
                  {done
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    : <Icon className={cn('w-3.5 h-3.5', active ? stage.color : 'text-slate-700')}
                            strokeWidth={active ? 2.2 : 1.8} />
                  }
                </motion.div>
                <span className={cn(
                  'text-[9px] font-semibold text-center leading-none',
                  active ? 'text-white' : done ? 'text-emerald-500/60' : 'text-slate-700'
                )}>
                  {stage.shortLabel}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className="h-px flex-1 mx-0.5 mb-3.5 rounded-full transition-colors"
                  style={{
                    background: done
                      ? 'rgba(16,185,129,0.35)'
                      : active
                        ? stage.barColor
                        : 'rgba(255,255,255,0.05)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  /* ── Full expanded view ─────────────────────────────────────────────────── */
  return (
    <div className={cn('w-full', className)}>
      {/* Icon + connector row */}
      <div className="flex items-start mb-5">
        {STAGES.map((stage, i) => {
          const Icon   = stage.icon;
          const done   = activeIndex >= 0 && i < activeIndex;
          const active = i === activeIndex;

          return (
            <div key={stage.label} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                {/* Icon circle */}
                <motion.div
                  initial={animated ? { scale: 0.5, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.07, type: 'spring', stiffness: 240, damping: 20 }}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all"
                  style={
                    active
                      ? {
                          background: stage.iconBg,
                          boxShadow:  `0 0 0 2px ${stage.ringColor}, 0 4px 16px ${stage.iconBg}`,
                        }
                      : done
                        ? { background: 'rgba(16,185,129,0.15)', boxShadow: '0 0 0 1px rgba(16,185,129,0.25)' }
                        : { background: 'rgba(255,255,255,0.04)', boxShadow: '0 0 0 1px rgba(255,255,255,0.07)' }
                  }
                >
                  {done
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    : <Icon
                        className={cn('w-5 h-5', active ? stage.color : 'text-slate-700')}
                        strokeWidth={active ? 2.2 : 1.8}
                      />
                  }
                </motion.div>

                {/* Label */}
                <span className={cn(
                  'text-[11px] font-semibold text-center leading-tight px-1',
                  active ? 'text-white' : done ? 'text-emerald-400/65' : 'text-slate-700'
                )}>
                  {stage.shortLabel}
                </span>
              </div>

              {/* Connector line */}
              {i < STAGES.length - 1 && (
                <div className="flex-1 mx-1 mb-6">
                  <motion.div
                    initial={animated ? { scaleX: 0 } : false}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.12 + i * 0.07, duration: 0.45, ease: 'easeOut' }}
                    style={{ transformOrigin: 'left' }}
                    className="h-px rounded-full"
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        background: done
                          ? 'linear-gradient(90deg, rgba(16,185,129,0.5), rgba(16,185,129,0.2))'
                          : active
                            ? `linear-gradient(90deg, ${stage.barColor}, rgba(255,255,255,0.06))`
                            : 'rgba(255,255,255,0.06)',
                      }}
                    />
                  </motion.div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active stage description */}
      {activeIndex >= 0 && (
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.32, type: 'spring', stiffness: 260, damping: 22 }}
          className="rounded-2xl px-4 py-4 border"
          style={{
            background:   STAGES[activeIndex].descBg,
            borderColor:  STAGES[activeIndex].descBorder,
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: STAGES[activeIndex].iconBg }}
            >
              {(() => {
                const Icon = STAGES[activeIndex].icon;
                return <Icon className={cn('w-4 h-4', STAGES[activeIndex].color)} strokeWidth={2} />;
              })()}
            </div>
            <div>
              <p className={cn('text-sm font-bold mb-1', STAGES[activeIndex].color)}>
                {STAGES[activeIndex].label}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {STAGES[activeIndex].description}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* No active stage */}
      {activeIndex < 0 && (
        <div
          className="rounded-2xl px-4 py-3.5 text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-xs text-slate-500">{t('lifecycle.noStage')}</p>
        </div>
      )}
    </div>
  );
});

export default ProjectLifecycle;

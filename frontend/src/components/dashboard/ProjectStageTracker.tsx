'use client';

import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProjectStatus =
  | 'pending' | 'paid' | 'in-progress' | 'review'
  | 'revision' | 'completed' | 'cancelled';

interface Stage {
  key: ProjectStatus[];   // which statuses map to this stage
  label: string;
  sublabel: string;
}

const STAGES: Stage[] = [
  { key: ['pending', 'paid'],          label: 'Order Received',   sublabel: 'Confirmed & queued'      },
  { key: ['in-progress'],              label: 'In Development',   sublabel: 'Actively being built'    },
  { key: ['review'],                   label: 'Review',           sublabel: 'Awaiting your feedback'  },
  { key: ['revision'],                 label: 'Revision',         sublabel: 'Applying changes'        },
  { key: ['completed'],                label: 'Delivered',        sublabel: 'Project complete!'       },
];

function getStageIndex(status: ProjectStatus): number {
  if (status === 'cancelled') return -1;
  for (let i = 0; i < STAGES.length; i++) {
    if ((STAGES[i].key as string[]).includes(status)) return i;
  }
  return 0;
}

interface Props {
  status: ProjectStatus;
  className?: string;
}

export default function ProjectStageTracker({ status, className }: Props) {
  const current = getStageIndex(status);
  const cancelled = status === 'cancelled';

  if (cancelled) {
    return (
      <div className={cn('flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20', className)}>
        <Circle className="w-4 h-4 text-red-400 shrink-0" />
        <span className="text-red-300 text-sm font-medium">Project Cancelled</span>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile: vertical list */}
      <div className="flex sm:hidden flex-col gap-2">
        {STAGES.map((stage, i) => {
          const done    = i < current;
          const active  = i === current;
          return (
            <div key={i} className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
              active  ? 'bg-primary-500/12 border border-primary-500/30' : '',
              done    ? 'opacity-60' : '',
              !done && !active ? 'opacity-30' : '',
            )}>
              {done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : active ? (
                <Loader2 className="w-4 h-4 text-primary-400 shrink-0 animate-spin" />
              ) : (
                <Circle className="w-4 h-4 text-slate-600 shrink-0" />
              )}
              <div>
                <p className={cn('text-xs font-semibold', done ? 'text-emerald-400' : active ? 'text-primary-300' : 'text-slate-500')}>
                  {stage.label}
                </p>
                {active && <p className="text-[10px] text-slate-500 mt-0.5">{stage.sublabel}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: horizontal stepper */}
      <div className="hidden sm:flex items-center w-full">
        {STAGES.map((stage, i) => {
          const done   = i < current;
          const active = i === current;
          const last   = i === STAGES.length - 1;
          return (
            <div key={i} className="flex items-center flex-1 min-w-0">
              {/* Node + label */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                  done   ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'      : '',
                  active ? 'bg-primary-500/20 border-primary-500 text-primary-400 shadow-[0_0_12px_rgba(124,58,237,0.5)]' : '',
                  !done && !active ? 'bg-white/4 border-white/10 text-slate-600' : '',
                )}>
                  {done ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : active ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="text-xs font-bold">{i + 1}</span>
                  )}
                </div>
                <div className="text-center" style={{ width: 72 }}>
                  <p className={cn(
                    'text-[10px] font-semibold leading-tight',
                    done ? 'text-emerald-400' : active ? 'text-primary-300' : 'text-slate-600',
                  )}>
                    {stage.label}
                  </p>
                  {active && (
                    <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">{stage.sublabel}</p>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {!last && (
                <div className={cn(
                  'flex-1 h-[2px] mx-1 rounded-full transition-all',
                  i < current ? 'bg-emerald-500/50' : 'bg-white/8',
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

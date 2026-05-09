'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  X, ArrowRight, ArrowLeft, MessageSquare, CreditCard,
  CheckCircle2, Zap, FolderOpen, FileCheck, RotateCcw,
  Package, Trophy, ChevronRight, FileText, Upload, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'mbndev_onboarding_done';

// ─── Lifecycle mini-visual ────────────────────────────────────────────────────

const STAGES = [
  { icon: FileCheck,   label: 'Request',     color: 'text-slate-400',   bg: 'bg-slate-800' },
  { icon: Zap,         label: 'Review',       color: 'text-amber-400',   bg: 'bg-amber-500/15' },
  { icon: FolderOpen,  label: 'Development',  color: 'text-blue-400',    bg: 'bg-blue-500/15' },
  { icon: RotateCcw,   label: 'Revision',     color: 'text-orange-400',  bg: 'bg-orange-500/15' },
  { icon: Package,     label: 'Delivery',     color: 'text-purple-400',  bg: 'bg-purple-500/15' },
  { icon: Trophy,      label: 'Complete',     color: 'text-green-400',   bg: 'bg-green-500/15' },
];

function LifecycleStrip({ activeIndex = -1 }: { activeIndex?: number }) {
  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto pb-1 scrollbar-none">
      {STAGES.map((s, i) => {
        const Icon   = s.icon;
        const done   = i < activeIndex;
        const active = i === activeIndex;
        return (
          <div key={s.label} className="flex items-center gap-0 shrink-0 flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
              <div className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                active ? `${s.bg} ring-2 ring-offset-2 ring-offset-[#111118] ring-white/20` : done ? 'bg-green-500/20' : s.bg,
              )}>
                {done
                  ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                  : <Icon className={cn('w-4 h-4', active ? s.color : 'text-slate-600')} />
                }
              </div>
              <span className={cn(
                'text-[10px] font-medium text-center leading-tight',
                active ? 'text-white' : done ? 'text-green-400/70' : 'text-slate-700'
              )}>
                {s.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={cn(
                'h-px flex-1 mx-1 mb-4 transition-colors',
                done ? 'bg-green-500/40' : 'bg-white/8'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step visuals ─────────────────────────────────────────────────────────────

function WelcomeVisual() {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="relative flex items-center justify-center h-44"
    >
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-32 h-32 rounded-full bg-primary-500/20 blur-3xl" />
      </div>
      {/* Logo mark */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-2xl shadow-primary-500/40"
        >
          <span className="text-white text-4xl font-black tracking-tight">M</span>
        </motion.div>
        <div className="flex items-center gap-1.5">
          {['Your', 'workspace', 'is', 'ready.'].map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="text-sm text-slate-300 font-medium"
            >
              {word}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function WorkflowVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.35 }}
      className="py-6"
    >
      <LifecycleStrip activeIndex={1} />
      <p className="text-center text-xs text-slate-600 mt-4">
        You&apos;ll always see exactly where your project stands.
      </p>
    </motion.div>
  );
}

function MessagesVisual() {
  const msgs = [
    { from: 'dev',    text: "Hey! I've reviewed your brief and have a few clarifying questions.",  delay: 0.1 },
    { from: 'client', text: 'Sure, happy to clarify. What would you like to know?',                delay: 0.3 },
    { from: 'dev',    text: "Perfect. I'll get started right away 🚀",                            delay: 0.5 },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-4 px-2 space-y-3 h-44 overflow-hidden"
    >
      {msgs.map((m) => (
        <motion.div
          key={m.text}
          initial={{ opacity: 0, x: m.from === 'client' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: m.delay, duration: 0.35 }}
          className={cn('flex gap-2', m.from === 'client' && 'flex-row-reverse')}
        >
          <div className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0',
            m.from === 'dev' ? 'bg-gradient-to-br from-violet-600 to-purple-700' : 'bg-primary-500'
          )}>
            {m.from === 'dev' ? 'M' : 'Y'}
          </div>
          <div className={cn(
            'max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed',
            m.from === 'dev' ? 'bg-white/8 text-slate-300' : 'bg-primary-500 text-white'
          )}>
            {m.text}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function PaymentsVisual() {
  const steps = [
    { icon: FileText,    label: 'Order submitted',   color: 'text-slate-400', bg: 'bg-slate-700/40'    },
    { icon: Upload,      label: 'Payment uploaded',  color: 'text-amber-400', bg: 'bg-amber-500/15'   },
    { icon: ShieldCheck, label: 'Admin verifies',    color: 'text-blue-400',  bg: 'bg-blue-500/15'    },
    { icon: Zap,         label: 'Project activates', color: 'text-green-400', bg: 'bg-green-500/15'   },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between gap-1 py-8 px-2"
    >
      {steps.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="flex items-center gap-1 flex-1 min-w-0">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.12, type: 'spring', stiffness: 260, damping: 20 }}
              className="flex flex-col items-center gap-1.5 flex-1 min-w-0"
            >
              <div className={cn('w-10 h-10 border border-white/10 rounded-2xl flex items-center justify-center', s.bg)}>
                <Icon className={cn('w-4 h-4', s.color)} />
              </div>
              <span className={cn('text-[10px] font-medium text-center leading-tight', s.color)}>
                {s.label}
              </span>
            </motion.div>
            {i < steps.length - 1 && (
              <ChevronRight className="w-3 h-3 text-slate-700 shrink-0 mb-4" />
            )}
          </div>
        );
      })}
    </motion.div>
  );
}

function ReadyVisual() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      className="flex flex-col items-center justify-center h-44 gap-4"
    >
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center"
        >
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center"
        >
          <Zap className="w-3 h-3 text-white" />
        </motion.div>
      </div>
      <div className="text-center">
        <p className="text-sm text-slate-300">Everything is set up for you.</p>
        <p className="text-xs text-slate-600 mt-1">Start by submitting your first project brief.</p>
      </div>
    </motion.div>
  );
}

// ─── Step definitions ─────────────────────────────────────────────────────────

interface Step {
  id:          string;
  badge:       string;
  title:       string;
  description: string;
  visual:      React.ReactNode;
}

const buildSteps = (firstName: string): Step[] => [
  {
    id:          'welcome',
    badge:       'Welcome',
    title:       `You're in, ${firstName}.`,
    description: 'MBN DEV is your dedicated workspace for commissioning, tracking, and receiving professional software projects — fully transparent, end-to-end.',
    visual:      <WelcomeVisual />,
  },
  {
    id:          'workflow',
    badge:       'How it works',
    title:       'Every project has a clear journey.',
    description: "Projects move through defined stages — from your initial request all the way to final delivery. You'll always know exactly where things stand.",
    visual:      <WorkflowVisual />,
  },
  {
    id:          'messages',
    badge:       'Communication',
    title:       'Talk directly to the person building your product.',
    description: 'No ticket queues, no support bots. Every project has a dedicated message thread where you can ask questions, give feedback, or request changes — in real time.',
    visual:      <MessagesVisual />,
  },
  {
    id:          'payments',
    badge:       'Billing',
    title:       'Simple, transparent payments.',
    description: "Your price is confirmed in writing before work starts. Submit your payment proof directly on the platform — we verify it and your project activates the same day.",
    visual:      <PaymentsVisual />,
  },
  {
    id:          'ready',
    badge:       "You're all set",
    title:       'Ready to build something great?',
    description: "Submit your first project brief and we'll review it within 24 hours — confirming scope, timeline, and price upfront before any work begins.",
    visual:      <ReadyVisual />,
  },
];

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  userName: string;
  onClose:  () => void;
}

export default function OnboardingModal({ userName, onClose }: Props) {
  const firstName = userName.split(' ')[0];
  const steps     = buildSteps(firstName);
  const [step, setStep] = useState(0);
  const [dir,  setDir]  = useState(1);   // 1 = forward, -1 = back

  const current  = steps[step];
  const isLast   = step === steps.length - 1;
  const isFirst  = step === 0;

  const goTo = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const finish = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, '1');
    }
    onClose();
  };

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !isLast) goTo(step + 1);
      if (e.key === 'ArrowLeft'  && !isFirst) goTo(step - 1);
      if (e.key === 'Escape') finish();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [step, isLast, isFirst]); // eslint-disable-line react-hooks/exhaustive-deps

  const variants = {
    enter:   (d: number) => ({ x: d > 0 ?  40 : -40, opacity: 0 }),
    center:  { x: 0, opacity: 1 },
    exit:    (d: number) => ({ x: d > 0 ? -40 :  40, opacity: 0 }),
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(12px)' }}
        onClick={(e) => e.target === e.currentTarget && finish()}
      >
        <motion.div
          key="card"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative w-full max-w-[520px] rounded-3xl overflow-hidden"
          style={{
            background: '#111118',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(124,58,237,0.15)',
          }}
        >
          {/* Purple top gradient bar */}
          <div className="h-[3px] w-full bg-gradient-to-r from-primary-700 via-primary-500 to-violet-500" />

          {/* Close */}
          <button
            onClick={finish}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 pt-5 pb-1">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  'rounded-full transition-all duration-300',
                  i === step
                    ? 'w-6 h-1.5 bg-primary-400'
                    : i < step
                      ? 'w-1.5 h-1.5 bg-primary-600/60'
                      : 'w-1.5 h-1.5 bg-white/15'
                )}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="px-8 pb-8 pt-2 min-h-[420px] flex flex-col">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={current.id}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex-1 flex flex-col"
              >
                {/* Badge */}
                <div className="mb-3">
                  <span className="inline-block text-xs font-semibold text-primary-400 bg-primary-500/10 border border-primary-500/20 px-3 py-1 rounded-full">
                    {current.badge}
                  </span>
                </div>

                {/* Heading */}
                <h2 className="text-2xl font-bold text-white leading-tight mb-2 tracking-tight">
                  {current.title}
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  {current.description}
                </p>

                {/* Visual */}
                <div className="flex-1 flex items-center">
                  <div className="w-full">{current.visual}</div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Footer navigation */}
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/6">
              <button
                onClick={() => isFirst ? finish() : goTo(step - 1)}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5"
              >
                {isFirst ? (
                  'Skip tour'
                ) : (
                  <><ArrowLeft className="w-3.5 h-3.5" /> Back</>
                )}
              </button>

              <div className="flex items-center gap-2">
                {isLast ? (
                  <Link href="/request" onClick={finish}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-primary-500/25 transition-all"
                    >
                      Start my first project
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => goTo(step + 1)}
                    className="flex items-center gap-2 bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/30 text-primary-300 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Hook: detect first visit ─────────────────────────────────────────────────
export function useOnboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) setShow(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setShow(false);
  };

  return { show, dismiss };
}

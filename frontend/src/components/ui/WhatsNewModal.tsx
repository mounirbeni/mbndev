'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { APP_VERSION, CHANGELOG } from '@/lib/version';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'mbndev_seen_version';

const tagStyles = {
  new:      { bg: 'rgba(124,58,237,0.18)', text: '#a78bfa', border: 'rgba(124,58,237,0.35)', label: 'NEW' },
  fix:      { bg: 'rgba(16,185,129,0.14)', text: '#34d399', border: 'rgba(16,185,129,0.3)',  label: 'FIX' },
  improved: { bg: 'rgba(59,130,246,0.14)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)',  label: 'IMPROVED' },
};

export default function WhatsNewModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen !== APP_VERSION) setOpen(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, APP_VERSION);
    setOpen(false);
  };

  const goTo = (href: string) => {
    dismiss();
    router.push(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="whats-new-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="fixed inset-0 z-[9990]"
            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          />

          {/* Modal — narrow on mobile, wide 2-col on laptop */}
          <motion.div
            key="whats-new-modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320, mass: 0.75 }}
            className="fixed z-[9991] inset-x-4 bottom-[88px]
                       sm:inset-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                       sm:w-full sm:max-w-lg lg:max-w-2xl"
          >
            {/* Outer glow ring */}
            <div
              className="absolute -inset-px rounded-[26px] pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.5) 0%, rgba(168,85,247,0.15) 100%)' }}
            />

            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(8,8,11,0.97)',
                border: '1px solid rgba(124,58,237,0.3)',
                boxShadow: '0 0 80px rgba(124,58,237,0.18), 0 24px 64px rgba(0,0,0,0.8)',
              }}
            >
              {/* Top accent beam */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.8), rgba(124,58,237,0.5), transparent)' }}
              />

              {/* Shimmer */}
              <div className="absolute inset-0 premium-shimmer pointer-events-none" />

              <div className="relative z-10 p-6 lg:p-8">

                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)' }}
                    >
                      <Sparkles className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <h2 className="text-white font-black text-base leading-tight">What's New</h2>
                      <span
                        className="text-[10px] font-bold tracking-widest uppercase mt-0.5 block"
                        style={{ color: '#a78bfa' }}
                      >
                        Version {APP_VERSION}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={dismiss}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-white transition-colors shrink-0"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Divider */}
                <div
                  className="mb-5 h-px"
                  style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.4), transparent)' }}
                />

                {/* Changelog entries — 1 col mobile, 2 col laptop */}
                <div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-y-auto pr-1"
                  style={{ maxHeight: 'min(60vh, 420px)' }}
                >
                  {CHANGELOG.map((entry, i) => {
                    const style = tagStyles[entry.tag];
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.06 + i * 0.05, duration: 0.35 }}
                        className="flex items-start gap-3 p-3 rounded-2xl transition-colors"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.22)' }}
                        >
                          <entry.icon className="w-4 h-4 text-violet-400" strokeWidth={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-white text-sm font-semibold">{entry.title}</span>
                            <span
                              className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded-md"
                              style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
                            >
                              {style.label}
                            </span>
                          </div>
                          <p className="text-slate-500 text-xs leading-relaxed mb-1.5">{entry.desc}</p>
                          {entry.href && (
                            <button
                              onClick={() => goTo(entry.href!)}
                              className="flex items-center gap-1 text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors group/link"
                            >
                              Try it
                              <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform duration-150" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* CTA */}
                <div className="mt-5">
                  <button
                    onClick={dismiss}
                    className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                      boxShadow: '0 6px 24px rgba(124,58,237,0.35)',
                    }}
                  >
                    Got it — let's go
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

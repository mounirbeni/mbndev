'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Code2, Globe2, Layers3, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const SESSION_KEY = 'mbndev-powered-by-dismissed';

/** A one-time-per-tab brand introduction on the public landing page only. */
export default function PoweredByPopup() {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      window.sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      // Storage may be unavailable in private/restricted browsing.
    }
  }, []);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === 'true') return;
    } catch {
      // Still allow visitors to dismiss the popup if storage is unavailable.
    }

    const timer = window.setTimeout(() => setOpen(true), 1400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
        return;
      }
      if (event.key !== 'Tab') return;

      const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])');
      if (!buttons?.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
    };
  }, [open, dismiss]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[#05030c]/80 px-4 py-8 backdrop-blur-[12px] sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.26 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) dismiss();
          }}
        >
          <motion.section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="powered-by-title"
            aria-describedby="powered-by-description"
            className="relative my-auto w-full max-w-[520px] overflow-hidden rounded-[28px] border border-violet-400/40 bg-[#171223]/95 px-5 pb-6 pt-12 text-center text-white shadow-[0_24px_100px_rgba(0,0,0,0.65),0_0_75px_rgba(124,58,237,0.22)] backdrop-blur-[40px] sm:px-10 sm:pb-9 sm:pt-14"
            initial={reducedMotion ? false : { opacity: 0, y: 28, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: reducedMotion ? 0 : 0.48, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Deliberately tinted glass, including a soft purple ambient glow. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_105%,rgba(124,58,237,0.32),transparent_60%)]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/70 to-transparent" />

            <button
              ref={closeRef}
              type="button"
              aria-label="Close introduction"
              onClick={dismiss}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-violet-300/30 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
            >
              <X size={20} aria-hidden="true" />
            </button>

            <div className="relative z-10 mx-auto mb-4 flex h-[76px] w-[76px] items-center justify-center rounded-[22px] bg-violet-500/10 shadow-[0_0_48px_rgba(168,85,247,0.2)]">
              <Image src="/brand-icon-transparent.webp" alt="MBN DEV" width={72} height={72} className="h-[72px] w-[72px] object-contain" />
            </div>

            <p className="relative z-10 text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-200/90">Powered by</p>
            <h2 id="powered-by-title" className="relative z-10 mt-2 text-[clamp(2rem,7vw,2.85rem)] font-extrabold tracking-[-0.055em]">
              <span className="text-white">MBN </span><span className="bg-gradient-to-r from-fuchsia-300 via-violet-400 to-indigo-400 bg-clip-text text-transparent">DEV</span>
            </h2>
            <p id="powered-by-description" className="relative z-10 mx-auto mt-4 max-w-[390px] text-[14px] leading-relaxed text-slate-100 sm:text-[15px]">
              This website is proudly powered by <strong className="font-semibold text-white">MBN DEV</strong>.
            </p>
            <p className="relative z-10 mx-auto mt-2 max-w-[360px] text-[13px] leading-relaxed text-slate-400 sm:text-sm">
              Thoughtful digital experiences, designed and developed in Morocco.
            </p>

            <div className="relative z-10 mt-6 flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 text-xs text-slate-100"><Globe2 size={15} className="text-amber-300" aria-hidden="true" /> Websites</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 text-xs text-slate-100"><Layers3 size={15} className="text-teal-300" aria-hidden="true" /> SaaS Platforms</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 text-xs text-slate-100"><Code2 size={15} className="text-indigo-300" aria-hidden="true" /> Web Apps</span>
            </div>

            <button
              type="button"
              onClick={dismiss}
              className="relative z-10 mt-7 w-full rounded-2xl border border-violet-300/30 bg-gradient-to-r from-violet-700 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(109,40,217,0.3)] transition-[filter,transform] hover:brightness-110 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
            >
              Continue to website
            </button>
            <p className="relative z-10 mt-5 border-t border-white/10 pt-5 text-[10px] font-medium uppercase tracking-[0.17em] text-violet-200/65 sm:text-[11px]">
              Your idea · Our code · A brighter tomorrow
            </p>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

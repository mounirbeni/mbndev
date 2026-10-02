'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { BellRing, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  enablePushNotifications,
  isInstalledApp,
  pushSupported,
  PUSH_RESULT_MESSAGES,
} from '@/lib/pushNotifications';

/**
 * When MBN DEV is opened as an installed app, ask once for notification
 * permission. The browser dialog can only be triggered from a tap (iOS rule),
 * so this card offers the button. Signed-out users are sent to sign in first —
 * notifications belong to an account.
 *
 * Shown only while permission is still undecided; "Not now" snoozes it for
 * a few days on this device.
 */

const SNOOZE_KEY = 'mbndev-push-prompt-snoozed-until';
const SNOOZE_MS = 3 * 24 * 3600 * 1000;
const HIDDEN_ON = ['/login', '/signup', '/forgot-password', '/reset-password'];

export default function PushPrompt() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [eligible, setEligible] = useState(false);
  const [busy, setBusy] = useState(false);

  // Device checks, once on mount.
  useEffect(() => {
    if (!isInstalledApp() || !pushSupported() || Notification.permission !== 'default') return;
    try {
      if (Number(localStorage.getItem(SNOOZE_KEY) || 0) > Date.now()) return;
    } catch { /* storage blocked: still ask */ }
    const t = setTimeout(() => setEligible(true), 2600); // after the splash screen
    return () => clearTimeout(t);
  }, []);

  const hiddenHere = HIDDEN_ON.some((p) => pathname?.startsWith(p));
  const open = eligible && !loading && !hiddenHere;

  const snooze = () => {
    try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS)); } catch { /* ignore */ }
    setEligible(false);
  };

  const allow = async () => {
    setBusy(true);
    const result = await enablePushNotifications();
    setBusy(false);
    setEligible(false);
    if (result === 'enabled') toast.success('Notifications are on — we’ll keep you posted.');
    else toast.error(PUSH_RESULT_MESSAGES[result]);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-label="Turn on notifications"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="fixed inset-x-3 z-[9980] mx-auto max-w-md rounded-3xl border border-violet-400/25 bg-[#0c0a16]/95 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(124,58,237,0.18)] backdrop-blur-xl"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 92px)' }}
        >
          <button
            onClick={snooze}
            aria-label="Not now"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3.5 pr-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/15">
              <BellRing className="h-5 w-5 text-violet-300" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-white">Stay in the loop</p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-400">
                {user
                  ? 'Allow notifications to hear the moment there’s a project update, a new message or a payment confirmation.'
                  : 'Sign in, then allow notifications to hear about project updates, messages and payments.'}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2.5">
            <button
              onClick={snooze}
              className="flex-1 rounded-full border border-white/12 bg-white/[0.04] py-2.5 text-[14px] font-medium text-slate-300"
            >
              Not now
            </button>
            {user ? (
              <button
                onClick={allow}
                disabled={busy}
                className="btn-silk flex-[1.4] py-2.5 text-[14px] font-semibold disabled:opacity-60"
              >
                {busy ? 'Enabling…' : 'Allow notifications'}
              </button>
            ) : (
              <Link href="/login" className="btn-silk flex flex-[1.4] items-center justify-center py-2.5 text-[14px] font-semibold">
                Sign in
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

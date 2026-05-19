'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Bell, Check, CheckCheck, X, Loader2, BellOff } from 'lucide-react';
import { notificationAPI } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn, makeTimeAgo } from '@/lib/utils';
import { useRealtime } from '@/hooks/useRealtime';

interface Notif {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  order_placed:      { bg: 'bg-primary-500/15', text: 'text-primary-400',  dot: 'bg-primary-400' },
  payment_received:  { bg: 'bg-green-500/15',   text: 'text-green-400',    dot: 'bg-green-400' },
  project_created:   { bg: 'bg-blue-500/15',    text: 'text-blue-400',     dot: 'bg-blue-400' },
  status_update:     { bg: 'bg-amber-500/15',   text: 'text-amber-400',    dot: 'bg-amber-400' },
  new_message:       { bg: 'bg-cyan-500/15',    text: 'text-cyan-400',     dot: 'bg-cyan-400' },
  revision_request:  { bg: 'bg-orange-500/15',  text: 'text-orange-400',   dot: 'bg-orange-400' },
  project_delivered: { bg: 'bg-emerald-500/15', text: 'text-emerald-400',  dot: 'bg-emerald-400' },
};

const DEFAULT_TYPE = { bg: 'bg-slate-500/15', text: 'text-slate-400', dot: 'bg-slate-500' };

export default function NotificationBell() {
  const { t } = useLanguage();
  const timeAgo = makeTimeAgo(t);
  const [open,    setOpen]    = useState(false);
  const [notifs,  setNotifs]  = useState<Notif[]>([]);
  const [unread,  setUnread]  = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCount = () =>
      notificationAPI.getUnread()
        .then(({ data }) => setUnread(data.count))
        .catch(() => {});
    fetchCount();
    const onVis = () => { if (document.visibilityState === 'visible') fetchCount(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const realtimeHandlers = useMemo(() => ({
    'notification:new': (n: any) => {
      setUnread((c) => c + 1);
      setNotifs((prev) => [{ ...n, read: false }, ...prev].slice(0, 50));
    },
  }), []);
  useRealtime({ on: realtimeHandlers });

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    notificationAPI.getAll()
      .then(({ data }) => setNotifs(data.notifications || []))
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markOne = async (id: string) => {
    await notificationAPI.markRead(id).catch(() => {});
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnread((c) => Math.max(0, c - 1));
  };

  const markAll = async () => {
    await notificationAPI.markAllRead().catch(() => {});
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('notif.title')}
        className={cn(
          'relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150',
          'text-slate-400 hover:text-white',
          open
            ? 'bg-primary-500/20 border border-primary-500/30 text-primary-400'
            : 'bg-white/5 hover:bg-white/10 border border-transparent'
        )}
      >
        <Bell className="w-4 h-4" strokeWidth={1.8} />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full
                         bg-primary-500 text-white text-[9px] font-bold
                         flex items-center justify-center leading-none"
              style={{ boxShadow: '0 0 0 2px #08080b, 0 0 6px rgba(124,58,237,0.5)' }}
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="absolute right-0 top-11 w-[320px] sm:w-[380px] rounded-2xl overflow-hidden z-50"
            style={{
              background:   'rgba(10, 10, 14, 0.99)',
              border:       '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(32px)',
              boxShadow:    '0 24px 64px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/6">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm">{t('notif.title')}</span>
                {unread > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary-500/20 border border-primary-500/30
                                   text-primary-400 text-[9px] font-bold flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button
                    onClick={markAll}
                    className="text-[11px] text-slate-400 hover:text-primary-400 flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> {t('notif.markAllRead')}
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-600
                             hover:text-slate-300 hover:bg-white/8 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div
              className="max-h-[360px] overflow-y-auto"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
                  <p className="text-slate-600 text-xs">Loading notifications...</p>
                </div>
              ) : notifs.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/6
                                  flex items-center justify-center mx-auto mb-3">
                    <BellOff className="w-5 h-5 text-slate-600" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">{t('empty.notifications')}</p>
                  <p className="text-slate-600 text-xs mt-1">{t('empty.notifications.sub')}</p>
                </div>
              ) : (
                <div>
                  {notifs.map((n) => {
                    const typeStyle = TYPE_COLORS[n.type] || DEFAULT_TYPE;

                    const inner = (
                      <div
                        key={n.id}
                        className={cn(
                          'flex gap-3 px-4 py-3.5 transition-colors cursor-pointer',
                          'border-b border-white/5 last:border-0',
                          !n.read ? 'bg-primary-500/4 hover:bg-primary-500/7' : 'hover:bg-white/3'
                        )}
                        onClick={() => !n.read && markOne(n.id)}
                      >
                        {/* Type dot */}
                        <div className="flex flex-col items-center pt-1 shrink-0 gap-1">
                          <span className={cn(
                            'w-1.5 h-1.5 rounded-full shrink-0',
                            !n.read ? typeStyle.dot : 'bg-white/10'
                          )} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-sm font-semibold leading-snug',
                            n.read ? 'text-slate-400' : 'text-white'
                          )}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-600 mt-1.5 font-medium">
                            {timeAgo(n.createdAt)}
                          </p>
                        </div>

                        {!n.read && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markOne(n.id); }}
                            className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg
                                       text-slate-600 hover:text-primary-400 hover:bg-primary-500/12
                                       transition-all mt-0.5"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );

                    return n.link ? (
                      <Link
                        key={n.id}
                        href={n.link}
                        onClick={() => { markOne(n.id); setOpen(false); }}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div key={n.id}>{inner}</div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifs.length > 0 && (
              <div className="px-4 py-3 border-t border-white/6 flex justify-center">
                <button
                  onClick={() => setOpen(false)}
                  className="text-xs text-slate-500 hover:text-primary-400 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

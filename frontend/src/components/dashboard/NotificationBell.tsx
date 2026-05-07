'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Bell, Check, CheckCheck, X, Loader2 } from 'lucide-react';
import { notificationAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Notif {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  order_placed:      'bg-primary-500/20 text-primary-400',
  payment_received:  'bg-green-500/20 text-green-400',
  project_created:   'bg-blue-500/20 text-blue-400',
  status_update:     'bg-amber-500/20 text-amber-400',
  new_message:       'bg-cyan-500/20 text-cyan-400',
  revision_request:  'bg-orange-500/20 text-orange-400',
  project_delivered: 'bg-emerald-500/20 text-emerald-400',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell() {
  const [open,    setOpen]    = useState(false);
  const [notifs,  setNotifs]  = useState<Notif[]>([]);
  const [unread,  setUnread]  = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Poll unread count every 15 s (paused when tab is hidden)
  useEffect(() => {
    const fetchCount = () =>
      notificationAPI.getUnread()
        .then(({ data }) => setUnread(data.count))
        .catch(() => {});
    fetchCount();
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => { timer = setInterval(fetchCount, 15_000); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
    const onVis = () => document.visibilityState === 'visible' ? start() : stop();
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  // Load notifications when panel opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    notificationAPI.getAll()
      .then(({ data }) => setNotifs(data.notifications || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open]);

  // Close on outside click
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
        aria-label="Notifications"
        className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-400
                   hover:text-white transition-colors"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full
                       bg-primary-500 text-white text-[9px] font-bold flex items-center justify-center"
            style={{ boxShadow: '0 0 0 2px #0a0a0d' }}
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-11 w-80 sm:w-96 rounded-2xl overflow-hidden z-50 shadow-2xl"
            style={{
              background:    'rgba(12,12,16,0.98)',
              border:        '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
              <span className="text-white font-semibold text-sm">Notifications</span>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button
                    onClick={markAll}
                    className="text-xs text-slate-400 hover:text-primary-400 flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="max-h-[380px] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                </div>
              ) : notifs.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No notifications yet</p>
                </div>
              ) : (
                notifs.map((n) => {
                  const dotColor = TYPE_COLORS[n.type] || 'bg-slate-500/20 text-slate-400';
                  const content  = (
                    <div
                      key={n.id}
                      className={cn(
                        'flex gap-3 px-4 py-3 hover:bg-white/3 transition-colors cursor-pointer border-b border-white/5 last:border-0',
                        !n.read && 'bg-primary-500/5'
                      )}
                      onClick={() => !n.read && markOne(n.id)}
                    >
                      {/* Dot */}
                      <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', !n.read ? 'bg-primary-400' : 'bg-white/10')} />
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium leading-snug', n.read ? 'text-slate-400' : 'text-white')}>
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-slate-600 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markOne(n.id); }}
                          className="shrink-0 text-slate-600 hover:text-primary-400 transition-colors mt-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );

                  return n.link ? (
                    <Link key={n.id} href={n.link} onClick={() => { markOne(n.id); setOpen(false); }}>
                      {content}
                    </Link>
                  ) : (
                    <div key={n.id}>{content}</div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

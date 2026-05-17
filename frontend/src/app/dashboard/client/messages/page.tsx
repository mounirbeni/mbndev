'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ArrowLeft, Loader2, Zap, AlertTriangle, RefreshCcw } from 'lucide-react';
import { messageAPI } from '@/lib/api';
import { MessageThread as ThreadType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRealtime } from '@/hooks/useRealtime';
import MessageThread from '@/components/dashboard/MessageThread';
import { StatusBadge } from '@/components/ui/Badge';
import { timeAgo } from '@/lib/utils';

export default function ClientMessagesPage() {
  const { t } = useLanguage();
  const [threads,    setThreads]    = useState<ThreadType[]>([]);
  const [selected,   setSelected]   = useState<ThreadType | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [mobileChat, setMobileChat] = useState(false);
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  // ── Load threads ───────────────────────────────────────────────────────────
  const fetchThreads = useCallback((silent = false) => {
    if (!silent) { setLoading(true); setFetchError(null); }
    messageAPI.getThreads()
      .then(({ data }) => {
        setThreads(data.threads || []);
        if (data.threads?.length > 0 && window.innerWidth >= 1024) {
          setSelected(data.threads[0]);
        }
      })
      .catch((err) => {
        console.error(err);
        if (!silent) setFetchError('Failed to load data. Please try again.');
      })
      .finally(() => { if (!silent) setLoading(false); });
  }, []);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  // ── Real-time: update sidebar unread counts for non-active threads ─────────
  const realtimeHandlers = useMemo(() => ({
    'message:new': (msg: any) => {
      const pid        = msg.projectId || msg.project;
      const isFromSelf = (msg.sender?._id || msg.sender?.id || msg.senderId) === userId;
      const isActive   = selected?.projectId === pid;

      setThreads((prev) => prev.map((t) => {
        if (t.projectId !== pid) return t;
        let text = '';
        if (msg.type === 'system') {
          try { text = JSON.parse(msg.content).title; } catch { text = msg.content; }
        } else {
          text = (msg.content || '').slice(0, 60);
        }
        const updatedThread = {
          ...t,
          lastMessage: { text, type: msg.type || 'user', senderName: msg.sender?.name, createdAt: msg.createdAt },
          updatedAt: msg.createdAt,
        };
        if (!isActive && !isFromSelf) {
          updatedThread.unreadCount = t.unreadCount + 1;
        }
        return updatedThread;
      }));
    },
  }), [selected?.projectId, userId]);

  useRealtime({ on: realtimeHandlers });

  const handleSelect = (thread: ThreadType) => {
    setSelected(thread);
    setMobileChat(true);
    setThreads((prev) =>
      prev.map((t) => t.projectId === thread.projectId ? { ...t, unreadCount: 0 } : t)
    );
  };

  return (
    <div className="max-w-7xl h-[calc(100svh-8rem)] min-h-[400px] flex flex-col">

      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3.5 mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-300 flex-1">{fetchError}</span>
          <button
            onClick={() => fetchThreads(false)}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div className={`mb-4 lg:mb-6 flex items-center gap-3 ${mobileChat ? 'lg:flex hidden' : 'flex'}`}>
        {mobileChat && (
          <button
            onClick={() => setMobileChat(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            aria-label={t('common.back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">
            {mobileChat && selected ? selected.projectTitle : t('messages.title')}
          </h1>
          {!mobileChat && (
            <p className="text-slate-500 text-sm hidden sm:block">
              {t('messages.subtitle')}
            </p>
          )}
        </div>
      </div>

      {/* Layout */}
      <div className="flex gap-4 flex-1 overflow-hidden min-h-0">

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {!mobileChat && (
            <motion.div
              key="sidebar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full lg:w-72 glass rounded-2xl border border-white/5 flex flex-col shrink-0"
            >
              <div className="px-4 pt-4 pb-3 border-b border-white/5 shrink-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  {t('messages.projects')}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto scroll-native p-2 space-y-1">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
                  </div>
                ) : threads.length === 0 ? (
                  <div className="py-10 text-center">
                    <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">{t('messages.noProjects')}</p>
                    <p className="text-slate-600 text-xs mt-1">{t('messages.noProjects.sub')}</p>
                  </div>
                ) : (
                  threads.map((thread) => {
                    const isActive = selected?.projectId === thread.projectId && !mobileChat;
                    return (
                      <button
                        key={thread.projectId}
                        onClick={() => handleSelect(thread)}
                        className={`w-full text-left p-3 rounded-xl transition-all group ${
                          isActive
                            ? 'bg-primary-500/15 border border-primary-500/25'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white truncate leading-tight">
                                {thread.projectTitle}
                              </span>
                              {thread.unreadCount > 0 && (
                                <span className="shrink-0 min-w-[18px] h-[18px] px-1 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                  {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                          <StatusBadge status={thread.projectStatus} />
                        </div>

                        {thread.lastMessage ? (
                          <div className="flex items-end justify-between gap-2">
                            <p className={`text-xs leading-snug truncate flex-1 flex items-center gap-1 ${
                              thread.unreadCount > 0 ? 'text-slate-300 font-medium' : 'text-slate-600'
                            }`}>
                              {thread.lastMessage.type === 'system' && (
                                <Zap className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                              )}
                              {thread.lastMessage.text}
                            </p>
                            <span className="text-[10px] text-slate-700 shrink-0">
                              {timeAgo(thread.lastMessage.createdAt)}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-700">{t('messages.noMessages')}</p>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Thread panel ────────────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {selected ? (
            <motion.div
              key={selected.projectId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex-1 glass rounded-2xl border border-white/5 overflow-hidden min-w-0 ${
                mobileChat ? 'block w-full' : 'hidden lg:block'
              }`}
            >
              <MessageThread
                projectId={selected.projectId}
                projectTitle={selected.projectTitle}
                onUnreadChange={(pid, count) =>
                  setThreads((prev) => prev.map((t) => t.projectId === pid ? { ...t, unreadCount: count } : t))
                }
              />
            </motion.div>
          ) : (
            !mobileChat && (
              <div className="flex-1 glass rounded-2xl border border-white/5 hidden lg:flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-500/8 border border-primary-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-7 h-7 text-primary-400/60" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">{t('messages.selectProject')}</p>
                  <p className="text-slate-600 text-xs mt-1">{t('messages.selectProject.sub')}</p>
                </div>
              </div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

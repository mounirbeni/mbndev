'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, ArrowLeft, Loader2, Zap, AlertTriangle, RefreshCcw } from 'lucide-react';
import { messageAPI } from '@/lib/api';
import { MessageThread as ThreadType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRealtime } from '@/hooks/useRealtime';
import { useHaptic } from '@/hooks/useHaptic';
import MessageThread from '@/components/dashboard/MessageThread';
import { StatusBadge } from '@/components/ui/Badge';
import { timeAgo, getInitials } from '@/lib/utils';

const SLIDE = { type: 'spring' as const, damping: 32, stiffness: 300, mass: 0.85 };

export default function AdminMessagesPage() {
  const { t } = useLanguage();
  const haptic = useHaptic();
  const [threads,    setThreads]    = useState<ThreadType[]>([]);
  const [selected,   setSelected]   = useState<ThreadType | null>(null);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [mobileChat, setMobileChat] = useState(false);
  const [isDesktop,  setIsDesktop]  = useState(false);
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

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
        if (!silent) setFetchError('Failed to load. Please try again.');
      })
      .finally(() => { if (!silent) setLoading(false); });
  }, []);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  const filtered = threads.filter((thread) =>
    thread.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
    thread.client?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = threads.reduce((sum, thread) => sum + thread.unreadCount, 0);

  const realtimeHandlers = useMemo(() => ({
    'message:new': (msg: any) => {
      const pid        = msg.projectId || msg.project;
      const isFromSelf = (msg.sender?._id || msg.sender?.id || msg.senderId) === userId;
      const isActive   = selected?.projectId === pid;

      setThreads((prev) => prev.map((thread) => {
        if (thread.projectId !== pid) return thread;
        let text = '';
        if (msg.type === 'system') {
          try { text = JSON.parse(msg.content).title; } catch { text = msg.content; }
        } else {
          text = (msg.content || '').slice(0, 60);
        }
        const updated: ThreadType = {
          ...thread,
          lastMessage: { text, type: msg.type || 'user', senderName: msg.sender?.name, createdAt: msg.createdAt },
          updatedAt: msg.createdAt,
        };
        if (!isActive && !isFromSelf) {
          updated.unreadCount = thread.unreadCount + 1;
        }
        return updated;
      }));

      if (!isFromSelf) {
        setThreads((prev) => {
          const idx = prev.findIndex((thread) => thread.projectId === pid);
          if (idx <= 0) return prev;
          const copy = [...prev];
          const [moved] = copy.splice(idx, 1);
          return [moved, ...copy];
        });
      }
    },
  }), [selected?.projectId, userId]);

  useRealtime({ on: realtimeHandlers });

  const handleSelect = (thread: ThreadType) => {
    haptic('selection');
    setSelected(thread);
    setMobileChat(true);
    setThreads((prev) =>
      prev.map((t) => t.projectId === thread.projectId ? { ...t, unreadCount: 0 } : t)
    );
  };

  const handleBack = () => {
    haptic('light');
    setMobileChat(false);
  };

  const sidebarX = isDesktop ? 0 : (mobileChat ? '-100%' : 0);
  const threadX  = isDesktop ? 0 : (mobileChat ? 0 : '100%');

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
      <div className="mb-4 lg:mb-6 flex items-center gap-2 min-h-[40px]">
        {mobileChat && !isDesktop && (
          <button
            onClick={handleBack}
            className="flex-shrink-0 flex items-center justify-center w-10 h-10 -ml-1 text-slate-400 hover:text-white rounded-xl press-scale"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-white truncate">
              {mobileChat && selected && !isDesktop ? selected.projectTitle : t('messages.title')}
            </h1>
            {(!mobileChat || isDesktop) && totalUnread > 0 && (
              <span className="px-2 py-0.5 bg-primary-500 text-white text-xs font-bold rounded-full shrink-0">
                {totalUnread} {t('admin.unread')}
              </span>
            )}
          </div>
          {(!mobileChat || isDesktop) && (
            <p className="text-slate-500 text-sm hidden sm:block mt-0.5">{t('admin.conversations')}</p>
          )}
        </div>
      </div>

      {/* Native-slide panel container */}
      <div className="relative overflow-hidden flex-1 min-h-0 lg:flex lg:gap-4">

        {/* Sidebar — slides left on mobile when chat is open */}
        <motion.div
          animate={{ x: sidebarX }}
          transition={SLIDE}
          className="absolute inset-0 lg:relative lg:inset-auto lg:w-80 lg:flex-shrink-0 glass rounded-2xl border border-white/5 flex flex-col"
        >
          {/* Search */}
          <div className="p-3 border-b border-white/5 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('common.search')}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50"
              />
            </div>
          </div>

          {/* Thread list */}
          <div className="flex-1 overflow-y-auto scroll-native p-2 space-y-0.5">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                {search ? t('admin.noMatches') : t('empty.projects')}
              </div>
            ) : (
              filtered.map((thread) => {
                const isActive   = selected?.projectId === thread.projectId;
                const clientName = thread.client?.name || t('common.unknown');

                return (
                  <button
                    key={thread.projectId}
                    onClick={() => handleSelect(thread)}
                    className={`w-full text-left p-3.5 rounded-xl transition-colors tap-highlight press-dim ${
                      isActive
                        ? 'bg-primary-500/15 border border-primary-500/25'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                        {getInitials(clientName)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-sm font-medium text-white truncate leading-tight">
                            {thread.projectTitle}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {thread.unreadCount > 0 && (
                              <span className="min-w-[18px] h-[18px] px-1 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                              </span>
                            )}
                            <StatusBadge status={thread.projectStatus} />
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 mb-1.5">{clientName}</p>

                        {thread.lastMessage ? (
                          <div className="flex items-end justify-between gap-2">
                            <p className={`text-xs leading-snug truncate flex-1 flex items-center gap-1 ${
                              thread.unreadCount > 0 ? 'text-slate-300 font-medium' : 'text-slate-600'
                            }`}>
                              {thread.lastMessage.type === 'system' ? (
                                <>
                                  <Zap className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                  {thread.lastMessage.text}
                                </>
                              ) : thread.lastMessage.senderName
                                ? `${thread.lastMessage.senderName}: ${thread.lastMessage.text}`
                                : thread.lastMessage.text}
                            </p>
                            <span className="text-[10px] text-slate-700 shrink-0">
                              {timeAgo(thread.lastMessage.createdAt)}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-700">{t('messages.noMessages')}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Thread panel — slides in from right on mobile */}
        <motion.div
          animate={{ x: threadX }}
          transition={SLIDE}
          className="absolute inset-0 lg:relative lg:inset-auto flex-1 glass rounded-2xl border border-white/5 overflow-hidden flex flex-col min-w-0"
        >
          {selected ? (
            <MessageThread
              projectId={selected.projectId}
              projectTitle={`${selected.projectTitle}${selected.client?.name ? ` · ${selected.client.name}` : ''}`}
              onUnreadChange={(pid, count) =>
                setThreads((prev) => prev.map((t) => t.projectId === pid ? { ...t, unreadCount: count } : t))
              }
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500/8 border border-primary-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-7 h-7 text-primary-400/60" />
                </div>
                <p className="text-slate-400 text-sm font-medium">{t('admin.selectConv')}</p>
                <p className="text-slate-600 text-xs mt-1">{t('admin.selectConv.sub')}</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

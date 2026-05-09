'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Search, ArrowLeft, Loader2, Zap } from 'lucide-react';
import { messageAPI } from '@/lib/api';
import { MessageThread as ThreadType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtime } from '@/hooks/useRealtime';
import MessageThread from '@/components/dashboard/MessageThread';
import { StatusBadge } from '@/components/ui/Badge';
import { timeAgo, getInitials } from '@/lib/utils';

export default function AdminMessagesPage() {
  const [threads,    setThreads]    = useState<ThreadType[]>([]);
  const [selected,   setSelected]   = useState<ThreadType | null>(null);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [mobileChat, setMobileChat] = useState(false);
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  // ── Load threads ───────────────────────────────────────────────────────────
  useEffect(() => {
    messageAPI.getThreads()
      .then(({ data }) => {
        setThreads(data.threads || []);
        if (data.threads?.length > 0 && window.innerWidth >= 1024) {
          setSelected(data.threads[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = threads.filter((t) =>
    t.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
    t.client?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  // ── Real-time: update sidebar for incoming messages ────────────────────────
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
        const updated: ThreadType = {
          ...t,
          lastMessage: {
            text,
            type: msg.type || 'user',
            senderName: msg.sender?.name,
            createdAt: msg.createdAt,
          },
          updatedAt: msg.createdAt,
        };
        if (!isActive && !isFromSelf) {
          updated.unreadCount = t.unreadCount + 1;
        }
        return updated;
      }));

      // Bubble updated thread to top if it has new activity
      if (!isFromSelf) {
        setThreads((prev) => {
          const idx = prev.findIndex((t) => t.projectId === pid);
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
    setSelected(thread);
    setMobileChat(true);
    setThreads((prev) =>
      prev.map((t) => t.projectId === thread.projectId ? { ...t, unreadCount: 0 } : t)
    );
  };

  return (
    <div className="max-w-7xl h-[calc(100svh-8rem)] min-h-[400px] flex flex-col">

      {/* Header */}
      <div className={`mb-4 lg:mb-6 flex items-center gap-3 ${mobileChat ? 'lg:flex hidden' : 'flex'}`}>
        {mobileChat && (
          <button
            onClick={() => setMobileChat(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-white">
              {mobileChat && selected ? selected.projectTitle : 'Messages'}
            </h1>
            {!mobileChat && totalUnread > 0 && (
              <span className="px-2 py-0.5 bg-primary-500 text-white text-xs font-bold rounded-full">
                {totalUnread} unread
              </span>
            )}
          </div>
          {!mobileChat && (
            <p className="text-slate-500 text-sm hidden sm:block mt-0.5">
              Client conversations across all projects
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-4 flex-1 overflow-hidden min-h-0">

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {!mobileChat && (
            <motion.div
              key="sidebar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full lg:w-80 glass rounded-2xl border border-white/5 flex flex-col shrink-0"
            >
              {/* Search */}
              <div className="p-3 border-b border-white/5 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by project or client…"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50"
                  />
                </div>
              </div>

              {/* Thread list */}
              <div className="flex-1 overflow-y-auto scroll-native p-2 space-y-1">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-sm">
                    {search ? 'No matches found' : 'No projects yet'}
                  </div>
                ) : (
                  filtered.map((t) => {
                    const isActive  = selected?.projectId === t.projectId;
                    const clientName = t.client?.name || 'Unknown';

                    return (
                      <button
                        key={t.projectId}
                        onClick={() => handleSelect(t)}
                        className={`w-full text-left p-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-primary-500/15 border border-primary-500/25'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Client avatar */}
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                            {getInitials(clientName)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="text-sm font-medium text-white truncate leading-tight">
                                {t.projectTitle}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {t.unreadCount > 0 && (
                                  <span className="min-w-[18px] h-[18px] px-1 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {t.unreadCount > 9 ? '9+' : t.unreadCount}
                                  </span>
                                )}
                                <StatusBadge status={t.projectStatus} />
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 mb-1.5">{clientName}</p>

                            {t.lastMessage ? (
                              <div className="flex items-end justify-between gap-2">
                                <p className={`text-xs leading-snug truncate flex-1 flex items-center gap-1 ${
                                  t.unreadCount > 0 ? 'text-slate-300 font-medium' : 'text-slate-600'
                                }`}>
                                  {t.lastMessage.type === 'system' ? (
                                    <>
                                      <Zap className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                      {t.lastMessage.text}
                                    </>
                                  ) : t.lastMessage.senderName
                                    ? `${t.lastMessage.senderName}: ${t.lastMessage.text}`
                                    : t.lastMessage.text}
                                </p>
                                <span className="text-[10px] text-slate-700 shrink-0">
                                  {timeAgo(t.lastMessage.createdAt)}
                                </span>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-700">No messages yet</p>
                            )}
                          </div>
                        </div>
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
                projectTitle={`${selected.projectTitle}${selected.client?.name ? ` · ${selected.client.name}` : ''}`}
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
                  <p className="text-slate-400 text-sm font-medium">Select a conversation</p>
                  <p className="text-slate-600 text-xs mt-1">to view and reply to messages</p>
                </div>
              </div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

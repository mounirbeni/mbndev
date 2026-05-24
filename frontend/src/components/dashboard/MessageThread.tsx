'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { Message } from '@/types';
import { messageAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRealtime } from '@/hooks/useRealtime';
import { makeTimeAgo, getInitials, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props {
  projectId:       string;
  projectTitle?:   string;
  /** Called with (projectId, count) when unread state changes */
  onUnreadChange?: (projectId: string, count: number) => void;
}

// ─── System message card ─────────────────────────────────────────────────────

type TimeAgoFn = (date: string) => string;

function SystemMessage({ msg, timeAgo }: { msg: Message; timeAgo: TimeAgoFn }) {
  let icon  = '⚡';
  let title = '';
  let body  = '';
  try {
    const p = JSON.parse(msg.content);
    icon  = p.icon  || '⚡';
    title = p.title || '';
    body  = p.body  || '';
  } catch {
    body = msg.content;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25, type: 'spring', damping: 20, stiffness: 280 }}
      className="flex justify-center py-2 px-2"
    >
      <div
        className="w-full max-w-[320px] rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(59,130,246,0.08) 100%)',
          border: '1px solid rgba(124,58,237,0.25)',
          boxShadow: '0 4px 24px rgba(124,58,237,0.1)',
        }}
      >
        {/* Top accent line */}
        <div
          className="h-[2px] w-full"
          style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.8), rgba(59,130,246,0.4), transparent)' }}
        />

        <div className="px-4 py-3.5 flex items-start gap-3">
          {/* Emoji icon badge */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 mt-0.5"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}
          >
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <p className="text-sm font-semibold text-white leading-snug mb-1">
                {title}
              </p>
            )}
            {body && (
              <p className="text-xs text-slate-400 leading-relaxed">
                {body}
              </p>
            )}
            <p className="text-[10px] text-slate-600 mt-1.5">{timeAgo(msg.createdAt)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── User message bubble ─────────────────────────────────────────────────────

function UserMessage({ msg, isOwn, youLabel, adminLabel, timeAgo }: { msg: Message; isOwn: boolean; youLabel: string; adminLabel: string; timeAgo: TimeAgoFn }) {
  const name = msg.sender?.name || (isOwn ? youLabel : adminLabel);
  const role = msg.sender?.role;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      className={cn('flex gap-2.5 sm:gap-3', isOwn && 'flex-row-reverse')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-auto',
          isOwn
            ? 'bg-gradient-to-br from-primary-500 to-primary-700'
            : role === 'admin'
              ? 'bg-gradient-to-br from-violet-600 to-purple-700'
              : 'bg-gradient-to-br from-blue-500 to-cyan-600'
        )}
      >
        {getInitials(name)}
      </div>

      <div className={cn('max-w-[76%] sm:max-w-[68%] flex flex-col gap-1', isOwn && 'items-end')}>
        {/* Sender label (only for non-own messages) */}
        {!isOwn && (
          <span className="text-[10px] text-slate-500 px-1 font-medium">
            {role === 'admin' ? 'MBN DEV' : name}
          </span>
        )}
        <div
          className={cn(
            'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words',
            isOwn
              ? 'bg-primary-500 text-white rounded-tr-sm shadow-lg shadow-primary-500/20'
              : 'bg-white/8 text-slate-200 rounded-tl-sm border border-white/5'
          )}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-slate-600 px-1">{timeAgo(msg.createdAt)}</span>
      </div>
    </motion.div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function MessageThread({ projectId, projectTitle, onUnreadChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content,  setContent]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [sending,  setSending]  = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { t } = useLanguage();

  const msgId = (m: any) => m?._id || m?.id || '';

  const isNearBottom = () => {
    const el = containerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  // ── Load messages ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setMessages([]);
    messageAPI
      .get(projectId)
      .then(({ data }) => {
        setMessages(data.messages || []);
        onUnreadChange?.(projectId, 0);
      })
      .catch(() => toast.error(t('client.failedLoad')))
      .finally(() => setLoading(false));
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom('instant');
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Real-time: append incoming messages for this thread ────────────────────
  const realtimeHandlers = useMemo(() => ({
    'message:new': (msg: any) => {
      if ((msg.projectId || msg.project) !== projectId) return;
      const near = isNearBottom();
      setMessages((prev) => {
        if (prev.some((m) => msgId(m) === msgId(msg))) return prev;
        return [...prev, msg];
      });
      if (near) setTimeout(() => scrollToBottom('smooth'), 50);
    },
  }), [projectId, scrollToBottom]);

  useRealtime({ on: realtimeHandlers });

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = content.trim();
    if (!text || !projectId || sending) return;
    setContent('');
    setSending(true);
    try {
      const { data } = await messageAPI.send(projectId, { content: text });
      setMessages((prev) => {
        if (prev.some((m) => msgId(m) === msgId(data.message))) return prev;
        return [...prev, data.message];
      });
      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch {
      toast.error(t('client.failedMessage'));
      setContent(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as any);
    }
  };

  const userId  = user?._id || user?.id;
  const timeAgo = makeTimeAgo(t);

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      {projectTitle && (
        <div className="px-4 py-3.5 border-b border-white/6 shrink-0 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)] shrink-0" />
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm leading-tight truncate">{projectTitle}</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {loading ? t('common.loading') : `${messages.length} ${t('client.messages').toLowerCase()}`}
            </p>
          </div>
        </div>
      )}

      {/* ── Messages area ──────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scroll-native px-3 sm:px-4 py-5 space-y-4"
      >
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-4">
              <Send className="w-5 h-5 text-primary-400" />
            </div>
            <p className="text-slate-300 text-sm font-semibold">{t('client.noMessages')}</p>
            <p className="text-slate-600 text-xs mt-1.5 max-w-[200px]">
              {t('client.noMessages.sub')}
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const id = msgId(msg);
            if (msg.type === 'system') {
              return <SystemMessage key={id} msg={msg} timeAgo={timeAgo} />;
            }
            const isOwn = (msg.sender?._id || msg.sender?.id || msg.senderId) === userId;
            return <UserMessage key={id} msg={msg} isOwn={isOwn} youLabel={t('common.you')} adminLabel={t('common.admin')} timeAgo={timeAgo} />;
          })}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ──────────────────────────────────────────────────── */}
      <form
        onSubmit={sendMessage}
        className="shrink-0 px-3 sm:px-4 pt-3 border-t border-white/6"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('client.typeMessage')}
            inputMode="text"
            enterKeyHint="send"
            autoComplete="off"
            disabled={sending || loading}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50 focus:bg-white/7 transition-all min-h-[44px] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!content.trim() || sending || loading}
            className={cn(
              'w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0',
              content.trim() && !sending
                ? 'bg-primary-500 hover:bg-primary-600 active:scale-95 shadow-lg shadow-primary-500/25'
                : 'bg-white/6 opacity-40 cursor-not-allowed'
            )}
            aria-label={t('client.sendMessage')}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className={cn('w-4 h-4', content.trim() ? 'text-white' : 'text-slate-500')} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

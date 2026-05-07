'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { Message } from '@/types';
import { messageAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { timeAgo, getInitials, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface MessageThreadProps {
  projectId: string;
  projectTitle?: string;
}

export default function MessageThread({ projectId, projectTitle }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [sending, setSending]   = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    messageAPI
      .get(projectId)
      .then(({ data }) => setMessages(data.messages))
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !projectId) return;
    const text = content.trim();
    setContent('');
    setSending(true);
    try {
      const { data } = await messageAPI.send(projectId, { content: text });
      setMessages((prev) => [...prev, data.message]);
    } catch {
      toast.error('Failed to send message');
      setContent(text); // restore on failure
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {projectTitle && (
        <div className="px-4 py-3.5 border-b border-white/6 glass-strong shrink-0">
          <h3 className="text-white font-semibold text-sm">{projectTitle}</h3>
          <p className="text-slate-500 text-xs mt-0.5">{messages.length} messages</p>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto scroll-native px-3 sm:px-4 py-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-3">
              <Send className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-slate-400 text-sm font-medium">No messages yet</p>
            <p className="text-slate-600 text-xs mt-1">Start the conversation below</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isOwn = msg.sender?._id === user?._id;
            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.18 }}
                className={cn('flex gap-2.5 sm:gap-3', isOwn && 'flex-row-reverse')}
              >
                {/* Avatar */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-auto">
                  {msg.sender ? getInitials(msg.sender.name) : '?'}
                </div>

                <div className={cn('max-w-[78%] sm:max-w-[70%] flex flex-col', isOwn && 'items-end')}>
                  <div
                    className={cn(
                      'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                      isOwn
                        ? 'bg-primary-500 text-white rounded-tr-sm shadow-lg shadow-primary-500/20'
                        : 'bg-white/8 text-slate-200 rounded-tl-sm'
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[11px] text-slate-600 mt-1 px-1">
                    {timeAgo(msg.createdAt)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ─────────────────────────────────────────────────── */}
      <form
        onSubmit={sendMessage}
        className="shrink-0 px-3 sm:px-4 pt-3 border-t border-white/6 glass-strong"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            inputMode="text"
            enterKeyHint="send"
            autoComplete="off"
            disabled={sending}
            className="flex-1 bg-white/6 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500/60 focus:bg-white/8 transition-all min-h-[44px]"
          />
          <button
            type="submit"
            disabled={!content.trim() || sending}
            className={cn(
              'w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0',
              content.trim() && !sending
                ? 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 active:scale-95 shadow-lg shadow-primary-500/25'
                : 'bg-white/8 opacity-40 cursor-not-allowed'
            )}
            aria-label="Send message"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className={cn('w-4 h-4', content.trim() ? 'text-white' : 'text-slate-400')} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

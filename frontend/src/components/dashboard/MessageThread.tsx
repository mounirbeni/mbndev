'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip } from 'lucide-react';
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
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
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

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !projectId) return;
    setSending(true);
    try {
      const { data } = await messageAPI.send(projectId, { content: content.trim() });
      setMessages((prev) => [...prev, data.message]);
      setContent('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {projectTitle && (
        <div className="p-4 border-b border-white/5">
          <h3 className="text-white font-medium text-sm">{projectTitle}</h3>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p className="text-sm">No messages yet.</p>
            <p className="text-xs mt-1">Start the conversation below.</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => {
            const isOwn = msg.sender?._id === user?._id;
            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex gap-3', isOwn && 'flex-row-reverse')}
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {msg.sender ? getInitials(msg.sender.name) : '?'}
                </div>

                <div className={cn('max-w-[70%]', isOwn && 'items-end flex flex-col')}>
                  <div
                    className={cn(
                      'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                      isOwn
                        ? 'bg-primary-500 text-white rounded-tr-sm'
                        : 'bg-white/5 text-slate-200 rounded-tl-sm'
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="text-xs text-slate-600 mt-1 px-1">
                    {msg.sender?.name} · {timeAgo(msg.createdAt)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-white/5">
        <div className="flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!content.trim() || sending}
            className="w-10 h-10 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 rounded-xl flex items-center justify-center transition-colors shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}

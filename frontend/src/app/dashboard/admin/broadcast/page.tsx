'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Users, Send, CheckCircle2, Clock, Zap, Gift,
  Calendar, AlertTriangle, ChevronRight, Sparkles, RefreshCcw,
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

/* ── Template definitions ─────────────────────────────────────────────────── */

const TEMPLATES = [
  {
    key:         'platformUpdate',
    label:       'May 2026 — Platform Update',
    description: 'Announce new features: edit orders, pay later, and platform improvements.',
    when:        'Now',
    icon:        Sparkles,
    color:       'violet',
    gradient:    'from-violet-600/20 to-purple-600/10',
    border:      'border-violet-500/30',
    iconBg:      'bg-violet-500/15 text-violet-400',
    badge:       'bg-violet-500/20 text-violet-300 border-violet-500/30',
    subject:     '{name}, here\'s what\'s new in your dashboard',
  },
  {
    key:         'getStarted',
    label:       'Week 1 — Get started nudge',
    description: 'Encourage new users to explore the platform and start their first project.',
    when:        'Week 1',
    icon:        Zap,
    color:       'blue',
    gradient:    'from-blue-600/20 to-cyan-600/10',
    border:      'border-blue-500/30',
    iconBg:      'bg-blue-500/15 text-blue-400',
    badge:       'bg-blue-500/20 text-blue-300 border-blue-500/30',
    subject:     '{name}, your workspace is ready — let\'s build something',
  },
  {
    key:         'checkIn',
    label:       'Week 1 — Personal check-in',
    description: 'A warm, personal message checking in on how things are going.',
    when:        'Week 1',
    icon:        Mail,
    color:       'cyan',
    gradient:    'from-cyan-600/20 to-teal-600/10',
    border:      'border-cyan-500/30',
    iconBg:      'bg-cyan-500/15 text-cyan-400',
    badge:       'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    subject:     'Checking in — how\'s everything going, {name}?',
  },
  {
    key:         'comingSoon',
    label:       'Week 2 — What\'s coming next',
    description: 'Preview upcoming features and keep users excited about the roadmap.',
    when:        'Week 2',
    icon:        Calendar,
    color:       'amber',
    gradient:    'from-amber-600/20 to-yellow-600/10',
    border:      'border-amber-500/30',
    iconBg:      'bg-amber-500/15 text-amber-400',
    badge:       'bg-amber-500/20 text-amber-300 border-amber-500/30',
    subject:     '{name}, a quick update on what we\'re building',
  },
  {
    key:         'specialOffer',
    label:       'Week 2 — 10% discount offer',
    description: 'Time-limited exclusive discount to convert hesitant users into paying clients.',
    when:        'Week 2',
    icon:        Gift,
    color:       'rose',
    gradient:    'from-rose-600/20 to-pink-600/10',
    border:      'border-rose-500/30',
    iconBg:      'bg-rose-500/15 text-rose-400',
    badge:       'bg-rose-500/20 text-rose-300 border-rose-500/30',
    subject:     '{name}, I wanted to reach out personally',
  },
];

/* ── History item shape ───────────────────────────────────────────────────── */
interface SentItem {
  key:      string;
  label:    string;
  sentAt:   string;
  count:    number;
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function BroadcastPage() {
  const [selected,       setSelected]       = useState<string | null>(null);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [sending,        setSending]        = useState(false);
  const [confirm,        setConfirm]        = useState(false);
  const [history,        setHistory]        = useState<SentItem[]>([]);

  useEffect(() => {
    adminAPI.broadcastCount()
      .then(({ data }) => setRecipientCount(data.count))
      .catch(() => {});

    const stored = localStorage.getItem('mbndev_broadcast_history');
    if (stored) {
      try { setHistory(JSON.parse(stored)); } catch {}
    }
  }, []);

  const selectedTpl = TEMPLATES.find((t) => t.key === selected);

  const handleSend = async () => {
    if (!selected || sending) return;
    setSending(true);
    try {
      const { data } = await adminAPI.broadcast(selected);
      toast.success(data.message || `Email sent to ${recipientCount} users!`);

      const item: SentItem = {
        key:    selected,
        label:  selectedTpl?.label ?? selected,
        sentAt: new Date().toISOString(),
        count:  recipientCount ?? 0,
      };
      const updated = [item, ...history].slice(0, 10);
      setHistory(updated);
      localStorage.setItem('mbndev_broadcast_history', JSON.stringify(updated));

      setConfirm(false);
      setSelected(null);
    } catch {
      toast.error('Failed to send broadcast. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-2xl overflow-hidden p-5 sm:p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(59,130,246,0.04) 50%, rgba(6,182,212,0.03) 100%)',
          border: '1px solid rgba(124,58,237,0.12)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(168,85,247,0.3), transparent)' }} />

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <Mail className="w-4 h-4 text-violet-400" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Send Email to All Users</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1.5">
              Choose a template and broadcast it to all registered clients.
            </p>
          </div>

          {recipientCount !== null && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 shrink-0">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-white text-sm font-bold">{recipientCount}</span>
              <span className="text-slate-500 text-xs">recipients</span>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-5">

        {/* ── Template grid ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-0.5">Choose a template</p>

          {TEMPLATES.map((tpl, i) => {
            const Icon     = tpl.icon;
            const isActive = selected === tpl.key;
            return (
              <motion.button
                key={tpl.key}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => { setSelected(tpl.key); setConfirm(false); }}
                className={cn(
                  'w-full text-left rounded-2xl border p-4 transition-all duration-200 group',
                  isActive
                    ? `bg-gradient-to-r ${tpl.gradient} ${tpl.border}`
                    : 'bg-white/3 border-white/6 hover:bg-white/6 hover:border-white/12'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors', tpl.iconBg)}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        'text-sm font-semibold transition-colors',
                        isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                      )}>
                        {tpl.label}
                      </span>
                      <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0', tpl.badge)}>
                        {tpl.when}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">{tpl.description}</p>
                    <p className="text-slate-600 text-[11px] mt-1.5 font-mono truncate">Subject: {tpl.subject}</p>
                  </div>

                  <ChevronRight className={cn(
                    'w-4 h-4 shrink-0 mt-1 transition-all',
                    isActive ? 'text-white rotate-90' : 'text-slate-600 group-hover:text-slate-400'
                  )} />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* ── Right panel: send + history ────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Send panel */}
          <div className="glass rounded-2xl border border-white/8 overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-violet-600 via-purple-500 to-blue-500" />
            <div className="p-5">
              <AnimatePresence mode="wait">
                {!selectedTpl ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-8 text-center"
                  >
                    <Mail className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Select a template to preview and send</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={selectedTpl.key}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Preview */}
                    <div className={cn('rounded-xl p-3.5 bg-gradient-to-br border', selectedTpl.gradient, selectedTpl.border)}>
                      <div className="flex items-center gap-2 mb-2">
                        <selectedTpl.icon className={cn('w-3.5 h-3.5', `text-${selectedTpl.color}-400`)} />
                        <span className="text-xs font-semibold text-white">{selectedTpl.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                        {selectedTpl.subject}
                      </p>
                    </div>

                    {/* Recipient count */}
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-400">Will be sent to</span>
                      <span className="text-white font-bold">{recipientCount ?? '…'} users</span>
                    </div>

                    {/* Confirm step */}
                    {!confirm ? (
                      <button
                        onClick={() => setConfirm(true)}
                        className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all border border-violet-500/30"
                      >
                        <Send className="w-4 h-4" /> Review & Send
                      </button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-amber-300 text-xs leading-relaxed">
                            This will send <strong>{recipientCount} emails</strong> immediately. This action cannot be undone.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirm(false)}
                            className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/8 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSend}
                            disabled={sending}
                            className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-violet-500/30 transition-all disabled:opacity-60"
                          >
                            {sending
                              ? <><span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                              : <><CheckCircle2 className="w-3.5 h-3.5" /> Confirm Send</>
                            }
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="glass rounded-2xl border border-white/8 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Sent history</p>
                <button
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem('mbndev_broadcast_history');
                  }}
                  className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1"
                >
                  <RefreshCcw className="w-3 h-3" /> Clear
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {history.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 text-xs font-medium truncate">{item.label}</p>
                      <p className="text-slate-600 text-[11px] mt-0.5 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(item.sentAt).toLocaleString('en-GB', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className="text-emerald-400 text-[11px] font-bold shrink-0">{item.count} sent</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

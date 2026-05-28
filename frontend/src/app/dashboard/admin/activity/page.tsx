'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, FolderOpen, User, ChevronLeft, ChevronRight,
  RefreshCw, Filter, Upload, MessageSquare, CreditCard,
  CheckCircle2, RotateCcw, Zap, Edit3,
} from 'lucide-react';
import { searchAPI } from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LogEntry {
  id:          string;
  action:      string;
  description: string;
  metadata:    Record<string, any> | null;
  createdAt:   string;
  project:     { id: string; title: string };
  user:        { id: string; name: string; email: string; role: string };
}

// ─── Action metadata ──────────────────────────────────────────────────────────

const ACTION_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  status_change:       { label: 'Status Changed',    icon: Zap,           color: 'text-purple-400 bg-purple-500/10' },
  file_upload:         { label: 'File Uploaded',     icon: Upload,        color: 'text-blue-400 bg-blue-500/10' },
  message_sent:        { label: 'Message Sent',      icon: MessageSquare, color: 'text-cyan-400 bg-cyan-500/10' },
  payment_received:    { label: 'Payment Received',  icon: CreditCard,    color: 'text-green-400 bg-green-500/10' },
  milestone_updated:   { label: 'Milestone Updated', icon: CheckCircle2,  color: 'text-emerald-400 bg-emerald-500/10' },
  revision_requested:  { label: 'Revision Requested',icon: RotateCcw,     color: 'text-orange-400 bg-orange-500/10' },
  project_delivered:   { label: 'Project Delivered', icon: CheckCircle2,  color: 'text-yellow-400 bg-yellow-500/10' },
  project_created:     { label: 'Project Created',   icon: FolderOpen,    color: 'text-indigo-400 bg-indigo-500/10' },
  profile_updated:     { label: 'Profile Updated',   icon: Edit3,         color: 'text-slate-400 bg-white/5' },
};

function ActionBadge({ action }: { action: string }) {
  const meta = ACTION_META[action] ?? { label: action, icon: Activity, color: 'text-slate-400 bg-white/5' };
  const Icon = meta.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium', meta.color)}>
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ActivityLogPage() {
  const [logs,    setLogs]    = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [total,   setTotal]   = useState(0);

  const fetchLogs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await searchAPI.activity({ page: p, limit: 50 });
      setLogs(data.logs);
      setTotal(data.total);
      setPages(data.pages);
      setPage(data.page);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Activity Log</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total.toLocaleString()} events recorded</p>
        </div>
        <button
          onClick={() => fetchLogs(page)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400
                     border border-white/8 hover:border-white/14 hover:text-white
                     transition-colors bg-white/3"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Log entries */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.025)' }}
      >
        {loading ? (
          <div className="divide-y divide-white/5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex gap-4 animate-pulse">
                <div className="w-8 h-8 rounded-xl skeleton-shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-40 h-3.5 rounded skeleton-shimmer" />
                  <div className="w-64 h-3 rounded skeleton-shimmer" />
                </div>
                <div className="w-16 h-3 rounded skeleton-shimmer mt-1" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <Activity className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No activity recorded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.01 }}
                className="px-5 py-4 flex items-start gap-4 hover:bg-white/3 transition-colors"
              >
                {/* Action icon */}
                <div className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                  ACTION_META[log.action]?.color ?? 'text-slate-400 bg-white/5',
                )}>
                  {(() => {
                    const Icon = ACTION_META[log.action]?.icon ?? Activity;
                    return <Icon className="w-3.5 h-3.5" />;
                  })()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <ActionBadge action={log.action} />
                    <span className="text-slate-500 text-xs">
                      by{' '}
                      <span className={log.user.role === 'admin' ? 'text-purple-400' : 'text-slate-300'}>
                        {log.user.name}
                      </span>
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 truncate">{log.description}</p>
                  <Link
                    href={`/dashboard/admin/projects/${log.project.id}`}
                    className="inline-flex items-center gap-1 mt-1 text-xs text-slate-600 hover:text-purple-400 transition-colors"
                  >
                    <FolderOpen className="w-3 h-3" />
                    {log.project.title}
                  </Link>
                </div>

                {/* Timestamp */}
                <time className="text-xs text-slate-600 shrink-0 pt-1" title={new Date(log.createdAt).toLocaleString()}>
                  {timeAgo(log.createdAt)}
                </time>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600">Page {page} of {pages}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLogs(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-xl border border-white/8 text-slate-400 hover:text-white
                         disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:border-white/14"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchLogs(page + 1)}
              disabled={page >= pages}
              className="p-2 rounded-xl border border-white/8 text-slate-400 hover:text-white
                         disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:border-white/14"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

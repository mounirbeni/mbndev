'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { projectAPI, messageAPI, paymentAPI } from '@/lib/api';
import { Project, Message, Payment } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import ProjectStageTracker from '@/components/dashboard/ProjectStageTracker';
import MessageThread from '@/components/dashboard/MessageThread';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePolling } from '@/hooks/usePolling';
import toast from 'react-hot-toast';
import {
  ArrowLeft, LayoutDashboard, MessageSquare, Paperclip, CreditCard,
  Send, Check, Clock, AlertCircle, Download, Upload, Calendar,
  Zap, Target, CheckCircle2, Circle, FileText, DollarSign,
  Activity, GitBranch, RefreshCw, TrendingUp, Package, Star, Edit3,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import PlanBadge from '@/components/ui/PlanBadge';

const TAB_DEFS = [
  { id: 'overview',  labelKey: 'dash.tab.overview',  icon: LayoutDashboard },
  { id: 'messages',  labelKey: 'dash.nav.messages',  icon: MessageSquare   },
  { id: 'files',     labelKey: 'dash.tab.files',     icon: Paperclip       },
  { id: 'payments',  labelKey: 'dash.nav.payments',  icon: CreditCard      },
  { id: 'activity',  labelKey: 'dash.tab.activity',  icon: Activity        },
];

const STATUS_STEP_DEFS = [
  { key: 'pending',     labelKey: 'status.submitted'  },
  { key: 'paid',        labelKey: 'status.paid'        },
  { key: 'in-progress', labelKey: 'status.inProgress'  },
  { key: 'review',      labelKey: 'status.review'      },
  { key: 'revision',    labelKey: 'status.revision'    },
  { key: 'completed',   labelKey: 'status.completed'   },
];

const ACTION_ICONS: Record<string, React.ElementType> = {
  status_change:     RefreshCw,
  progress_update:   TrendingUp,
  file_upload:       Paperclip,
  message_sent:      MessageSquare,
  payment_received:  CreditCard,
  milestone_updated: Target,
  project_delivered: Package,
  revision_requested:Edit3,
};

export default function ClientProjectWorkspace() {
  const { id }     = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const { t }      = useLanguage();
  const router     = useRouter();

  const TABS = TAB_DEFS.map((tabItem) => ({ ...tabItem, label: t(tabItem.labelKey) }));
  const STATUS_STEPS = STATUS_STEP_DEFS.map((step) => ({ ...step, label: t(step.labelKey) }));

  const [project,  setProject]  = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tab,      setTab]      = useState('overview');
  const [loading,  setLoading]  = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef   = useRef<HTMLInputElement>(null);

  const fetchAll = async () => {
    try {
      const [pRes, mRes, payRes] = await Promise.all([
        projectAPI.getOne(id),
        messageAPI.get(id),
        paymentAPI.getAll(),
      ]);
      setProject(pRes.data.project);
      setMessages(mRes.data.messages || []);
      const allPay: Payment[] = payRes.data.payments || [];
      setPayments(allPay.filter((p) => {
        const projId = typeof p.project === 'object' ? (p.project as any)._id || (p.project as any).id : p.project;
        return projId === id;
      }));
    } catch {
      toast.error(t('client.failedLoad'));
      router.push('/dashboard/client/projects');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => { fetchAll(); }, [id]);

  // Real-time polling: project status + messages every 10 s (when tab visible)
  const silentRefresh = useCallback(async () => {
    try {
      const [pRes, mRes] = await Promise.all([
        projectAPI.getOne(id),
        messageAPI.get(id),
      ]);
      setProject(pRes.data.project);
      setMessages(mRes.data.messages || []);
    } catch {}
  }, [id]);
  usePolling(silentRefresh, { interval: 10_000, immediate: false, disabled: !id });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Kept in sync with the actual server-side limit (middleware/upload.js) —
    // that limit itself sits under Vercel's ~4.5MB platform request-body
    // ceiling, so this check must not advertise a size the backend can't
    // actually accept.
    if (file.size > 4 * 1024 * 1024) { toast.error('File too large. Maximum size is 4MB.'); return; }
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      await projectAPI.uploadFile(id, fd);
      toast.success(t('client.fileUploaded'));
      const pRes = await projectAPI.getOne(id);
      setProject(pRes.data.project);
    } catch { toast.error(t('client.uploadFailed')); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (!project) return null;

  const paidTotal = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const remaining = project.budget - paidTotal;

  // Status progress bar
  const statusIdx   = STATUS_STEPS.findIndex((s) => s.key === project.status);
  const activeLogs  = (project as any).activityLogs || [];

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Back */}
      <Link
        href="/dashboard/client/projects"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {t('client.allProjects')}
      </Link>

      {/* Project header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5 sm:p-6 border border-white/5"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{project.title}</h1>
              <StatusBadge status={project.status} />
              {project.package && <PlanBadge plan={project.package} size="sm" />}
            </div>
            <p className="text-slate-400 text-sm capitalize">
              {project.type?.replace('-', ' ')}
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-slate-400 text-xs mb-0.5">{t('client.budget')}</div>
              <div className="text-white font-bold">{formatCurrency(project.budget)}</div>
            </div>
            {project.deadline && (
              <div className="text-right">
                <div className="text-slate-400 text-xs mb-0.5">{t('client.deadline')}</div>
                <div className="text-white font-medium text-sm">{formatDate(project.deadline)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>{t('client.progress')}</span>
            <span className="text-primary-400 font-semibold">{project.progress}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full"
            />
          </div>
        </div>

        {/* Stage tracker */}
        <ProjectStageTracker status={project.status as any} className="mt-5" />
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 overflow-x-auto scrollbar-none">
        {TABS.map((tabDef) => {
          const Icon = tabDef.icon;
          return (
            <button
              key={tabDef.id}
              onClick={() => setTab(tabDef.id)}
              className={`flex-shrink-0 sm:flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap press-scale ${
                tab === tabDef.id
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{tabDef.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}
        >

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-5">
                {/* Description */}
                <div className="glass rounded-2xl p-5 sm:p-6 border border-white/5">
                  <h3 className="text-white font-semibold mb-3">{t('client.projectDescription')}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{project.description}</p>
                </div>

                {/* Features */}
                {project.features && project.features.length > 0 && (
                  <div className="glass rounded-2xl p-5 sm:p-6 border border-white/5">
                    <h3 className="text-white font-semibold mb-4">{t('client.requestedFeatures')}</h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {project.features.map((f: string) => (
                        <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-primary-400 shrink-0" /> {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Milestones */}
                {project.milestones && project.milestones.length > 0 && (
                  <div className="glass rounded-2xl p-5 sm:p-6 border border-white/5">
                    <h3 className="text-white font-semibold mb-4">{t('client.milestones')}</h3>
                    <div className="space-y-3">
                      {project.milestones.map((m: any) => (
                        <div key={m.id ?? m._id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            m.status === 'paid' ? 'bg-green-500/20' : 'bg-white/10'
                          }`}>
                            {m.status === 'paid'
                              ? <Check className="w-4 h-4 text-green-400" />
                              : <Circle className="w-4 h-4 text-slate-500" />}
                          </div>
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">{m.title}</div>
                            {m.description && <div className="text-slate-500 text-xs mt-0.5">{m.description}</div>}
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-white font-semibold text-sm">{formatCurrency(m.amount)}</div>
                            <div className={`text-xs capitalize ${m.status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                              {m.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right sidebar */}
              <div className="space-y-4">
                <div className="glass rounded-2xl p-5 border border-white/5 space-y-3.5">
                  <h3 className="text-white font-semibold text-sm">{t('client.projectDetails')}</h3>
                  {[
                    { label: t('client.status'),    value: <StatusBadge status={project.status} /> },
                    { label: t('client.type'),       value: project.type?.replace(/-/g, ' ') },
                    { label: t('client.budget'),     value: formatCurrency(project.budget) },
                    { label: t('client.deadline'),   value: project.deadline ? formatDate(project.deadline) : t('client.flexible') },
                    { label: t('client.revisions'),  value: `${(project as any).revisions ?? 0} / ${(project as any).maxRevisions ?? 3}` },
                    { label: t('client.created'),    value: formatDate(project.createdAt) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center gap-2">
                      <span className="text-slate-500 text-xs">{label}</span>
                      <span className="text-white text-xs font-medium capitalize text-right">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Payment summary */}
                <div className="glass rounded-2xl p-5 border border-white/5">
                  <h3 className="text-white font-semibold text-sm mb-4">{t('client.paymentSummary')}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t('client.totalBudget')}</span>
                      <span className="text-white font-medium">{formatCurrency(project.budget)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t('status.paid')}</span>
                      <span className="text-green-400 font-medium">{formatCurrency(paidTotal)}</span>
                    </div>
                    <div className="h-px bg-white/10 my-1" />
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t('client.remaining')}</span>
                      <span className="text-yellow-400 font-bold">{formatCurrency(remaining)}</span>
                    </div>
                  </div>
                  {remaining > 0 && (
                    <button
                      onClick={() => setTab('payments')}
                      className="w-full mt-4 py-2 text-xs text-primary-400 border border-primary-500/30 rounded-xl hover:bg-primary-500/10 transition-colors"
                    >
                      {t('client.viewPayments')}
                    </button>
                  )}
                </div>

                {/* Quick message */}
                <button
                  onClick={() => setTab('messages')}
                  className="w-full glass rounded-2xl p-4 border border-white/5 hover:border-primary-500/30 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-primary-400" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{t('client.messages')}</div>
                      <div className="text-slate-500 text-xs">{messages.length} {t('client.messages').toLowerCase()}</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── MESSAGES ── */}
          {/* Uses the shared MessageThread component (also used on the admin
              side and the dedicated /messages page) instead of a hand-rolled
              bubble list — that hand-rolled version rendered system messages
              (payment verified, status changed, etc.) as raw JSON, since it
              never checked msg.type === 'system' the way MessageThread does. */}
          {tab === 'messages' && (
            <div
              className="glass rounded-2xl border border-white/5 flex flex-col overflow-hidden"
              style={{ height: 'calc(100svh - 320px)', minHeight: '360px', maxHeight: '600px' }}
            >
              <MessageThread projectId={id} />
            </div>
          )}

          {/* ── FILES ── */}
          {tab === 'files' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="glass rounded-2xl border-2 border-dashed border-white/10 hover:border-primary-500/40 p-10 text-center cursor-pointer transition-colors group"
              >
                <Upload className="w-8 h-8 text-slate-600 group-hover:text-primary-400 mx-auto mb-3 transition-colors" />
                <p className="text-slate-400 text-sm">{t('client.uploadFile')}</p>
                <p className="text-slate-600 text-xs mt-1">{t('client.uploadHint')}</p>
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.zip,.rar,.png,.jpg,.jpeg,.gif,.svg,.webp,.mp4,.txt,.csv,.xlsx,.xls" onChange={handleUpload} />
              </div>
              {uploading && (
                <div className="glass rounded-xl p-3 border border-primary-500/20 text-primary-400 text-sm text-center animate-pulse">
                  {t('client.uploading')}
                </div>
              )}

              {!project.files || project.files.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center border border-white/5">
                  <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">{t('client.noFiles')}</p>
                </div>
              ) : (
                <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                  <div className="divide-y divide-white/5">
                    {project.files.map((f: any, i: number) => (
                      <div key={i} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                        <div className="w-9 h-9 bg-primary-500/10 rounded-xl flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">{f.name}</div>
                          {f.uploadedAt && <div className="text-slate-500 text-xs">{formatDate(f.uploadedAt)}</div>}
                        </div>
                        <a
                          href={`/api/projects/${project.id}/files/${f._id || f.id}?token=${encodeURIComponent(token || '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PAYMENTS ── */}
          {tab === 'payments' && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: t('client.totalBudget'), value: formatCurrency(project.budget),  color: 'text-white'      },
                  { label: t('client.amountPaid'),  value: formatCurrency(paidTotal),        color: 'text-green-400'  },
                  { label: t('client.remaining'),   value: formatCurrency(remaining),        color: 'text-yellow-400' },
                ].map((s) => (
                  <div key={s.label} className="glass rounded-xl p-4 border border-white/5 text-center">
                    <div className={`text-2xl font-black ${s.color} mb-1`}>{s.value}</div>
                    <div className="text-slate-500 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>

              {remaining > 0 && (
                <div className="glass rounded-xl p-5 border border-primary-500/20 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-white font-semibold text-sm">{t('client.makePayment')}</div>
                    <div className="text-slate-400 text-xs mt-0.5">
                      {t('client.depositLabel')} {formatCurrency(project.budget * 0.5)}
                    </div>
                  </div>
                  <Link href="/dashboard/client/messages">
                    <Button size="md">
                      <DollarSign className="w-4 h-4" /> {t('client.payDeposit')}
                    </Button>
                  </Link>
                </div>
              )}

              {payments.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center border border-white/5">
                  <CreditCard className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">{t('client.noPayments')}</p>
                </div>
              ) : (
                <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5">
                    <h3 className="text-white font-semibold text-sm">{t('client.paymentHistory')}</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {payments.map((p: any) => (
                      <div key={p.id || p._id} className="flex items-center gap-4 p-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          p.status === 'paid' ? 'bg-green-500/10' : p.status === 'failed' ? 'bg-red-500/10' : 'bg-yellow-500/10'
                        }`}>
                          {p.status === 'paid'   ? <Check        className="w-4 h-4 text-green-400"  /> :
                           p.status === 'failed' ? <AlertCircle  className="w-4 h-4 text-red-400"    /> :
                                                   <Clock        className="w-4 h-4 text-yellow-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-white text-sm font-medium">
                            {p.milestoneTitle || p.description || t('client.payment')}
                          </div>
                          <div className="text-slate-500 text-xs">{formatDate(p.createdAt)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{formatCurrency(p.amount)}</div>
                          <div className={`text-xs capitalize ${
                            p.status === 'paid' ? 'text-green-400' : p.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                          }`}>{p.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ACTIVITY ── */}
          {tab === 'activity' && (
            <div className="space-y-4">
              {activeLogs.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center border border-white/5">
                  <Activity className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">{t('client.noActivity')}</p>
                </div>
              ) : (
                <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5">
                    <h3 className="text-white font-semibold text-sm">{t('client.projectTimeline')}</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {activeLogs.map((log: any, i: number) => (
                      <div key={log.id} className="flex gap-4 p-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                            {(() => { const Icon = ACTION_ICONS[log.action] || Activity; return <Icon className="w-3.5 h-3.5 text-slate-400" />; })()}
                          </div>
                          {i < activeLogs.length - 1 && (
                            <div className="w-px flex-1 bg-white/5 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-slate-200 text-sm">{log.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-slate-600 text-xs">
                              {log.user?.name || t('common.system')} · {formatDate(log.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}

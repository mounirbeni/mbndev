'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { projectAPI, messageAPI, paymentAPI } from '@/lib/api';
import { Project, Message, Payment, ProjectStatus } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import PlanBadge from '@/components/ui/PlanBadge';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';
import {
  ArrowLeft, LayoutDashboard, MessageSquare, Paperclip, CreditCard,
  Send, Check, Clock, AlertCircle, Download, Upload, FileText,
  DollarSign, Edit2, Save, Users, Activity,
  RefreshCw, TrendingUp, Target, Package, Star, Edit3,
  Share2, Copy, CheckCheck,
} from 'lucide-react';

const TAB_DEFS = [
  { id: 'overview',  labelKey: 'dash.tab.overview',  icon: LayoutDashboard },
  { id: 'messages',  labelKey: 'dash.nav.messages',  icon: MessageSquare   },
  { id: 'files',     labelKey: 'dash.tab.files',     icon: Paperclip       },
  { id: 'payments',  labelKey: 'dash.nav.payments',  icon: CreditCard      },
  { id: 'activity',  labelKey: 'dash.tab.activity',  icon: Activity        },
];

const STATUS_OPTIONS: ProjectStatus[] = [
  'pending', 'paid', 'in-progress', 'review', 'revision', 'completed', 'cancelled',
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

export default function AdminProjectWorkspace() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // Tabs built inside component so labels re-evaluate on locale change
  const TABS = TAB_DEFS.map((tab) => ({ ...tab, label: t(tab.labelKey) }));

  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ status: '', progress: 0, notes: '', budget: 0, deadline: '' });
  const [saving, setSaving] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAll = async () => {
    try {
      const [pRes, mRes, payRes] = await Promise.all([
        projectAPI.getOne(id),
        messageAPI.get(id),
        paymentAPI.getAll(),
      ]);
      const p = pRes.data.project;
      setProject(p);
      setEditForm({ status: p.status, progress: p.progress, notes: p.notes || '', budget: p.budget, deadline: p.deadline?.split('T')[0] || '' });
      setMessages(mRes.data.messages || []);
      const allPay: Payment[] = payRes.data.payments || [];
      setPayments(allPay.filter((pay) => {
        const pid = typeof pay.project === 'object' ? pay.project._id : pay.project;
        return pid === id;
      }));
    } catch {
      toast.error(t('toast.error'));
      router.push('/dashboard/admin/projects');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => { fetchAll(); }, [id]);

  // Real-time polling: messages + project updates every 10 s (tab visible only)
  useEffect(() => {
    if (!id) return;
    const silentRefresh = async () => {
      try {
        const [pRes, mRes] = await Promise.all([
          projectAPI.getOne(id),
          messageAPI.get(id),
        ]);
        setProject(pRes.data.project);
        setMessages(mRes.data.messages || []);
      } catch {}
    };
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => { timer = setInterval(silentRefresh, 10_000); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
    const onVis = () => document.visibilityState === 'visible' ? start() : stop();
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, [id]);

  useEffect(() => {
    if (tab === 'messages') setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [tab, messages]);

  const saveEdits = async () => {
    setSaving(true);
    try {
      await projectAPI.update(id, editForm);
      toast.success(t('toast.saved'));
      setEditing(false);
      fetchAll();
    } catch { toast.error(t('toast.error')); }
    finally { setSaving(false); }
  };

  const sendMessage = async () => {
    if (!msgText.trim()) return;
    setSending(true);
    try {
      await messageAPI.send(id, { content: msgText.trim() });
      setMsgText('');
      const mRes = await messageAPI.get(id);
      setMessages(mRes.data.messages || []);
    } catch { toast.error(t('toast.error')); }
    finally { setSending(false); }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const { data } = await projectAPI.generateShare(id);
      await navigator.clipboard.writeText(data.shareUrl);
      setCopied(true);
      toast.success(t('toast.copied'));
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error(t('toast.error'));
    } finally {
      setSharing(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      await projectAPI.uploadFile(id, fd);
      toast.success(t('toast.saved'));
      fetchAll();
    } catch { toast.error(t('toast.error')); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <div className="h-24 glass rounded-2xl animate-pulse" />
        <div className="h-12 glass rounded-xl animate-pulse" />
        <div className="h-96 glass rounded-2xl animate-pulse" />
      </div>
    );
  }
  if (!project) return null;

  const client = typeof project.client === 'object' ? project.client : null;
  const paidTotal = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/admin/projects" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t('admin.allProjects')}
        </Link>
        {!editing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              disabled={sharing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all disabled:opacity-50"
            >
              {copied
                ? <><CheckCheck className="w-3.5 h-3.5 text-green-400" /> {t('common.copied')}</>
                : sharing
                  ? <><span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> {t('common.loading')}</>
                  : <><Share2 className="w-3.5 h-3.5" /> {t('common.share')}</>
              }
            </button>
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Edit2 className="w-3.5 h-3.5" /> {t('common.edit')}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>{t('common.cancel')}</Button>
            <Button size="sm" onClick={saveEdits} loading={saving}>
              <Save className="w-3.5 h-3.5" /> {t('common.save')}
            </Button>
          </div>
        )}
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 border border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{project.title}</h1>
              <StatusBadge status={project.status} />
              {project.package && <PlanBadge plan={project.package} size="sm" />}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-slate-400 text-sm capitalize">{project.type?.replace('-', ' ')}</span>
              {client && (
                <span className="flex items-center gap-1.5 text-slate-500 text-sm">
                  <Users className="w-3 h-3" /> {client.name} {client.company ? `· ${client.company}` : ''}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-slate-400 text-xs mb-0.5">{t('request.field.budget')}</div>
              <div className="text-white font-bold">{formatCurrency(project.budget)}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-xs mb-0.5">{t('status.paid')}</div>
              <div className="text-green-400 font-bold">{formatCurrency(paidTotal)}</div>
            </div>
          </div>
        </div>

        {/* Edit form inline */}
        {editing ? (
          <div className="mt-5 pt-5 border-t border-white/5 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">{t('admin.status')}</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-primary-500"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">{t('admin.progress')}: {editForm.progress}%</label>
              <input type="range" min={0} max={100} value={editForm.progress}
                onChange={(e) => setEditForm((f) => ({ ...f, progress: +e.target.value }))}
                className="w-full accent-primary-500 mt-2" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Budget ($)</label>
              <input type="number" value={editForm.budget}
                onChange={(e) => setEditForm((f) => ({ ...f, budget: +e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Deadline</label>
              <input type="date" value={editForm.deadline}
                onChange={(e) => setEditForm((f) => ({ ...f, deadline: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-primary-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">{t('admin.notes')}</label>
              <textarea value={editForm.notes}
                onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-primary-500 resize-none"
                placeholder={t('admin.notes.hint')} />
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>{t('admin.progress')}</span><span>{project.progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${project.progress}%` }} transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full" />
            </div>
            {project.notes && (
              <div className="mt-3 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                <p className="text-yellow-400 text-xs">{project.notes}</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        {TABS.map((tabItem) => {
          const Icon = tabItem.icon;
          return (
            <button key={tabItem.id} onClick={() => setTab(tabItem.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === tabItem.id ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-slate-400 hover:text-white'
              }`}>
              <Icon className="w-4 h-4" /><span className="hidden sm:inline">{tabItem.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-5">
                <div className="glass rounded-2xl p-6 border border-white/5">
                  <h3 className="text-white font-semibold mb-3">{t('request.field.description')}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{project.description}</p>
                </div>
                {project.features && project.features.length > 0 && (
                  <div className="glass rounded-2xl p-6 border border-white/5">
                    <h3 className="text-white font-semibold mb-4">{t('admin.features')}</h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {project.features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                          <Check className="w-4 h-4 text-primary-400 shrink-0" /> {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {project.designPreferences && (
                  <div className="glass rounded-2xl p-6 border border-white/5">
                    <h3 className="text-white font-semibold mb-4">{t('admin.design')}</h3>
                    <div className="space-y-2 text-sm">
                      {project.designPreferences.style && <div className="flex gap-3"><span className="text-slate-500 w-24">Style</span><span className="text-white">{project.designPreferences.style}</span></div>}
                      {project.designPreferences.colors?.length ? <div className="flex gap-3"><span className="text-slate-500 w-24">Colors</span><span className="text-white">{project.designPreferences.colors.join(', ')}</span></div> : null}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {/* Client info */}
                {client && (
                  <div className="glass rounded-2xl p-5 border border-white/5">
                    <h3 className="text-white font-semibold text-sm mb-4">{t('admin.clients')}</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {client.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{client.name}</div>
                        <div className="text-slate-500 text-xs">{client.email}</div>
                      </div>
                    </div>
                    {client.company && <div className="text-slate-400 text-xs">Company: {client.company}</div>}
                    {client.phone && <div className="text-slate-400 text-xs mt-1">Phone: {client.phone}</div>}
                  </div>
                )}
                <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
                  <h3 className="text-white font-semibold text-sm">{t('admin.projectInfo')}</h3>
                  {[
                    { label: t('request.field.budget'), value: formatCurrency(project.budget) },
                    { label: t('status.paid'),          value: formatCurrency(paidTotal) },
                    { label: t('admin.deadline'),       value: project.deadline ? formatDate(project.deadline) : t('admin.flexible') },
                    { label: t('admin.revisions'),      value: `${project.revisions} / ${project.maxRevisions}` },
                    { label: t('dash.recent'),          value: formatDate(project.createdAt) },
                    { label: t('admin.lastUpdate'),     value: formatDate(project.updatedAt) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {tab === 'messages' && (
            <div className="glass rounded-2xl border border-white/5 flex flex-col" style={{ height: '60vh' }}>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="w-10 h-10 text-slate-700 mb-3" />
                    <p className="text-slate-500 text-sm">{t('empty.messages')}</p>
                  </div>
                ) : messages.map((m) => {
                  const isSystem = m.type === 'system';
                  const isMe = !isSystem && (m.sender?._id ?? m.sender?.id ?? m.senderId) === (user?._id ?? user?.id);
                  if (isSystem) {
                    let icon = '🔔', title = '', body = '';
                    try { const p = JSON.parse(m.content); icon = p.icon || icon; title = p.title || ''; body = p.body || ''; } catch { body = m.content; }
                    return (
                      <div key={m._id ?? m.id} className="flex justify-center py-1">
                        <div className="max-w-xs text-center bg-primary-500/8 border border-primary-500/20 rounded-2xl px-4 py-3">
                          <div className="text-lg mb-1">{icon}</div>
                          {title && <div className="text-xs font-semibold text-primary-300 mb-1">{title}</div>}
                          {body && <div className="text-xs text-slate-400 leading-relaxed">{body}</div>}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={m._id ?? m.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? 'bg-primary-500' : 'bg-white/10'}`}>
                        {m.sender?.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-primary-500/20 text-white rounded-tr-sm' : 'bg-white/5 text-slate-200 rounded-tl-sm'}`}>
                          {m.content}
                        </div>
                        <span className="text-slate-600 text-xs px-1">
                          {m.sender?.name ?? 'Unknown'} · {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-white/5">
                <div className="flex gap-3">
                  <input value={msgText} onChange={(e) => setMsgText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder={t('admin.replyClient')}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500" />
                  <Button onClick={sendMessage} loading={sending} size="md"><Send className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          )}

          {/* FILES */}
          {tab === 'files' && (
            <div className="space-y-4">
              <div onClick={() => fileInputRef.current?.click()}
                className="glass rounded-2xl border-2 border-dashed border-white/10 hover:border-primary-500/40 p-10 text-center cursor-pointer transition-colors group">
                <Upload className="w-8 h-8 text-slate-600 group-hover:text-primary-400 mx-auto mb-3 transition-colors" />
                <p className="text-slate-400 text-sm">{t('admin.uploadFile')}</p>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
              </div>
              {uploading && <div className="glass rounded-xl p-3 border border-primary-500/20 text-primary-400 text-sm text-center animate-pulse">Uploading...</div>}
              {!project.files || project.files.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center border border-white/5">
                  <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">{t('admin.noFiles')}</p>
                </div>
              ) : (
                <div className="glass rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
                  {project.files.map((f, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 hover:bg-white/[0.02]">
                      <div className="w-9 h-9 bg-primary-500/10 rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{f.name}</div>
                        {f.uploadedAt && <div className="text-slate-500 text-xs">{formatDate(f.uploadedAt)}</div>}
                      </div>
                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PAYMENTS */}
          {tab === 'payments' && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: t('request.field.budget'), value: formatCurrency(project.budget), color: 'text-white' },
                  { label: t('admin.collected'),      value: formatCurrency(paidTotal), color: 'text-green-400' },
                  { label: t('admin.outstanding'),    value: formatCurrency(project.budget - paidTotal), color: 'text-yellow-400' },
                ].map((s) => (
                  <div key={s.label} className="glass rounded-xl p-4 border border-white/5 text-center">
                    <div className={`text-2xl font-black ${s.color} mb-1`}>{s.value}</div>
                    <div className="text-slate-500 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
              {payments.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center border border-white/5">
                  <CreditCard className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">{t('empty.payments')}</p>
                </div>
              ) : (
                <div className="glass rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
                  {payments.map((p) => (
                    <div key={p._id} className="flex items-center gap-4 p-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${p.status === 'paid' ? 'bg-green-500/10' : p.status === 'failed' ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
                        {p.status === 'paid' ? <Check className="w-4 h-4 text-green-400" /> : p.status === 'failed' ? <AlertCircle className="w-4 h-4 text-red-400" /> : <Clock className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{p.milestoneTitle || p.description || 'Payment'}</div>
                        <div className="text-slate-500 text-xs">{formatDate(p.createdAt)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{formatCurrency(p.amount)}</div>
                        <div className={`text-xs capitalize ${p.status === 'paid' ? 'text-green-400' : p.status === 'failed' ? 'text-red-400' : 'text-yellow-400'}`}>{p.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ACTIVITY ── */}
          {tab === 'activity' && (() => {
            const logs = (project as any).activityLogs || [];
            return (
              <div className="space-y-4">
                {logs.length === 0 ? (
                  <div className="glass rounded-2xl p-12 text-center border border-white/5">
                    <Activity className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">{t('admin.noActivity')}</p>
                  </div>
                ) : (
                  <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-4 border-b border-white/5">
                      <h3 className="text-white font-semibold text-sm">{t('admin.timeline')}</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                      {logs.map((log: any, i: number) => (
                        <div key={log.id} className="flex gap-4 p-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                              {(() => { const Icon = ACTION_ICONS[log.action] || Activity; return <Icon className="w-3.5 h-3.5 text-slate-400" />; })()}
                            </div>
                            {i < logs.length - 1 && <div className="w-px flex-1 bg-white/5 mt-1" />}
                          </div>
                          <div className="flex-1 pb-2">
                            <p className="text-slate-200 text-sm">{log.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-slate-600 text-xs">
                                {log.user?.name || 'System'} · {formatDate(log.createdAt)}
                              </span>
                              <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-slate-500 capitalize">
                                {log.action?.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}

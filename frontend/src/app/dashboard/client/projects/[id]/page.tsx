'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { projectAPI, messageAPI, paymentAPI } from '@/lib/api';
import { Project, Message, Payment } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  ArrowLeft, LayoutDashboard, MessageSquare, Paperclip, CreditCard,
  Send, Check, Clock, AlertCircle, Download, Upload, Calendar,
  Zap, Target, CheckCircle2, Circle, FileText, DollarSign
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'files', label: 'Files', icon: Paperclip },
  { id: 'payments', label: 'Payments', icon: CreditCard },
];

export default function ClientProjectWorkspace() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const projId = typeof p.project === 'object' ? p.project._id : p.project;
        return projId === id;
      }));
    } catch {
      toast.error('Failed to load project');
      router.push('/dashboard/client/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  useEffect(() => {
    if (tab === 'messages') {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [tab, messages]);

  const sendMessage = async () => {
    if (!msgText.trim()) return;
    setSending(true);
    try {
      await messageAPI.send(id, { content: msgText.trim() });
      setMsgText('');
      const mRes = await messageAPI.get(id);
      setMessages(mRes.data.messages || []);
    } catch { toast.error('Failed to send message'); }
    finally { setSending(false); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      await projectAPI.uploadFile(id, fd);
      toast.success('File uploaded');
      const pRes = await projectAPI.getOne(id);
      setProject(pRes.data.project);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handlePayment = async (amount: number, description: string) => {
    try {
      await paymentAPI.mock({ projectId: id, amount, description });
      toast.success('Payment recorded');
      const payRes = await paymentAPI.getAll();
      const allPay: Payment[] = payRes.data.payments || [];
      setPayments(allPay.filter((p) => {
        const projId = typeof p.project === 'object' ? p.project._id : p.project;
        return projId === id;
      }));
    } catch { toast.error('Payment failed'); }
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

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Back */}
      <Link href="/dashboard/client/projects" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> All Projects
      </Link>

      {/* Project header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 border border-white/5"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{project.title}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-slate-400 text-sm capitalize">{project.type?.replace('-', ' ')} — {project.package && `${project.package} package`}</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-slate-400 text-xs mb-0.5">Budget</div>
              <div className="text-white font-bold">{formatCurrency(project.budget)}</div>
            </div>
            {project.deadline && (
              <div className="text-right">
                <div className="text-slate-400 text-xs mb-0.5">Deadline</div>
                <div className="text-white font-medium text-sm">{formatDate(project.deadline)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
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
          transition={{ duration: 0.2 }}
        >
          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-5">
              {/* Left: details */}
              <div className="lg:col-span-2 space-y-5">
                {/* Description */}
                <div className="glass rounded-2xl p-6 border border-white/5">
                  <h3 className="text-white font-semibold mb-3">Project Description</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{project.description}</p>
                </div>

                {/* Features */}
                {project.features && project.features.length > 0 && (
                  <div className="glass rounded-2xl p-6 border border-white/5">
                    <h3 className="text-white font-semibold mb-4">Requested Features</h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {project.features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-primary-400 shrink-0" /> {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Design preferences */}
                {project.designPreferences && (
                  <div className="glass rounded-2xl p-6 border border-white/5">
                    <h3 className="text-white font-semibold mb-4">Design Preferences</h3>
                    <div className="space-y-3">
                      {project.designPreferences.style && (
                        <div className="flex gap-3 text-sm">
                          <span className="text-slate-500 w-24 shrink-0">Style</span>
                          <span className="text-white">{project.designPreferences.style}</span>
                        </div>
                      )}
                      {project.designPreferences.colors && project.designPreferences.colors.length > 0 && (
                        <div className="flex gap-3 text-sm">
                          <span className="text-slate-500 w-24 shrink-0">Colors</span>
                          <div className="flex flex-wrap gap-2">
                            {project.designPreferences.colors.map((c) => (
                              <span key={c} className="bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 text-xs text-slate-300">{c}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {project.designPreferences.references && project.designPreferences.references.length > 0 && (
                        <div className="flex gap-3 text-sm">
                          <span className="text-slate-500 w-24 shrink-0">References</span>
                          <div className="space-y-1">
                            {project.designPreferences.references.map((r) => (
                              <a key={r} href={r} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline block text-xs truncate max-w-xs">{r}</a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Milestones */}
                {project.milestones && project.milestones.length > 0 && (
                  <div className="glass rounded-2xl p-6 border border-white/5">
                    <h3 className="text-white font-semibold mb-4">Milestones</h3>
                    <div className="space-y-3">
                      {project.milestones.map((m, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.status === 'paid' ? 'bg-green-500/20' : 'bg-white/10'}`}>
                            {m.status === 'paid' ? <Check className="w-4 h-4 text-green-400" /> : <Circle className="w-4 h-4 text-slate-500" />}
                          </div>
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">{m.title}</div>
                            {m.description && <div className="text-slate-500 text-xs mt-0.5">{m.description}</div>}
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold text-sm">{formatCurrency(m.amount)}</div>
                            <div className={`text-xs capitalize ${m.status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>{m.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: sidebar stats */}
              <div className="space-y-4">
                <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
                  <h3 className="text-white font-semibold text-sm">Project Details</h3>
                  {[
                    { label: 'Status', value: <StatusBadge status={project.status} /> },
                    { label: 'Type', value: project.type?.replace(/-/g, ' ') },
                    { label: 'Budget', value: formatCurrency(project.budget) },
                    { label: 'Deadline', value: project.deadline ? formatDate(project.deadline) : 'Flexible' },
                    { label: 'Revisions', value: `${project.revisions} / ${project.maxRevisions}` },
                    { label: 'Created', value: formatDate(project.createdAt) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center gap-2">
                      <span className="text-slate-500 text-xs">{label}</span>
                      <span className="text-white text-xs font-medium capitalize text-right">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Payment summary */}
                <div className="glass rounded-2xl p-5 border border-white/5">
                  <h3 className="text-white font-semibold text-sm mb-4">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Budget</span>
                      <span className="text-white font-medium">{formatCurrency(project.budget)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Paid</span>
                      <span className="text-green-400 font-medium">{formatCurrency(paidTotal)}</span>
                    </div>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Remaining</span>
                      <span className="text-yellow-400 font-bold">{formatCurrency(remaining)}</span>
                    </div>
                  </div>
                  {remaining > 0 && (
                    <button
                      onClick={() => setTab('payments')}
                      className="w-full mt-4 py-2 text-xs text-primary-400 border border-primary-500/30 rounded-xl hover:bg-primary-500/10 transition-colors"
                    >
                      View Payments
                    </button>
                  )}
                </div>

                {/* Quick message */}
                <button
                  onClick={() => setTab('messages')}
                  className="w-full glass rounded-2xl p-5 border border-white/5 hover:border-primary-500/30 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-500/20 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-primary-400" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">Messages</div>
                      <div className="text-slate-500 text-xs">{messages.length} message{messages.length !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── MESSAGES ── */}
          {tab === 'messages' && (
            <div
              className="glass rounded-2xl border border-white/5 flex flex-col overflow-hidden"
              style={{ height: 'calc(100svh - 320px)', minHeight: '360px', maxHeight: '600px' }}
            >
              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scroll-native">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="w-10 h-10 text-slate-700 mb-3" />
                    <p className="text-slate-500 text-sm">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender._id === user?._id;
                    return (
                      <div key={m._id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? 'bg-primary-500' : 'bg-white/10'}`}>
                          {m.sender.name?.[0]?.toUpperCase()}
                        </div>
                        <div className={`max-w-[78%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                          <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-primary-500/25 text-white rounded-tr-sm' : 'bg-white/8 text-slate-200 rounded-tl-sm'}`}>
                            {m.content}
                          </div>
                          <span className="text-slate-600 text-[11px] px-1">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input — keyboard-safe */}
              <div className="shrink-0 p-3 sm:p-4 border-t border-white/5 bg-dark-100/50">
                <div className="flex gap-2">
                  <input
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Type a message..."
                    inputMode="text"
                    enterKeyHint="send"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !msgText.trim()}
                    className="w-10 h-10 shrink-0 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 rounded-xl flex items-center justify-center text-white transition-all active:scale-95"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── FILES ── */}
          {tab === 'files' && (
            <div className="space-y-4">
              {/* Upload area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="glass rounded-2xl border-2 border-dashed border-white/10 hover:border-primary-500/40 p-10 text-center cursor-pointer transition-colors group"
              >
                <Upload className="w-8 h-8 text-slate-600 group-hover:text-primary-400 mx-auto mb-3 transition-colors" />
                <p className="text-slate-400 text-sm">Click to upload a file</p>
                <p className="text-slate-600 text-xs mt-1">Any file type, max 10MB</p>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
              </div>
              {uploading && <div className="glass rounded-xl p-3 border border-primary-500/20 text-primary-400 text-sm text-center animate-pulse">Uploading...</div>}

              {/* Files list */}
              {!project.files || project.files.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center border border-white/5">
                  <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No files yet.</p>
                </div>
              ) : (
                <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                  <div className="divide-y divide-white/5">
                    {project.files.map((f, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                        <div className="w-9 h-9 bg-primary-500/10 rounded-xl flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">{f.name}</div>
                          {f.uploadedAt && (
                            <div className="text-slate-500 text-xs">{formatDate(f.uploadedAt)}</div>
                          )}
                        </div>
                        <a href={f.url} target="_blank" rel="noopener noreferrer"
                          className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
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
              {/* Summary */}
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total Budget', value: formatCurrency(project.budget), color: 'text-white' },
                  { label: 'Amount Paid', value: formatCurrency(paidTotal), color: 'text-green-400' },
                  { label: 'Remaining', value: formatCurrency(remaining), color: 'text-yellow-400' },
                ].map((s) => (
                  <div key={s.label} className="glass rounded-xl p-4 border border-white/5 text-center">
                    <div className={`text-2xl font-black ${s.color} mb-1`}>{s.value}</div>
                    <div className="text-slate-500 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Pay deposit button */}
              {remaining > 0 && (
                <div className="glass rounded-xl p-5 border border-primary-500/20 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-white font-semibold text-sm">Make a Payment</div>
                    <div className="text-slate-400 text-xs mt-0.5">50% deposit to start: {formatCurrency(project.budget * 0.5)}</div>
                  </div>
                  <Button
                    size="md"
                    onClick={() => handlePayment(Math.round(project.budget * 0.5), '50% Project Deposit')}
                  >
                    <DollarSign className="w-4 h-4" /> Pay Deposit
                  </Button>
                </div>
              )}

              {/* Payment history */}
              {payments.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center border border-white/5">
                  <CreditCard className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No payments yet.</p>
                </div>
              ) : (
                <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5">
                    <h3 className="text-white font-semibold text-sm">Payment History</h3>
                  </div>
                  <div className="divide-y divide-white/5">
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
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

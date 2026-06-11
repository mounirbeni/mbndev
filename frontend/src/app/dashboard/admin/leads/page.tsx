'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { leadsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Target, Mail, Phone, Instagram, Globe, Download, Plus,
  Flame, Star, X, Send, Copy, ExternalLink, Trash2, RefreshCcw,
  ChevronDown, MessageCircle, Check, Building2, Utensils, ShoppingBag,
  Map, Zap, type LucideIcon,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Lead {
  id:            string;
  name:          string;
  type:          string;
  city:          string;
  phone?:        string;
  email?:        string;
  instagram?:    string;
  website?:      string;
  priority:      'hot' | 'warm';
  outreachAngle?: string;
  source?:       string;
  status:        string;
  notes?:        string;
  emailSentAt?:  string;
  createdAt:     string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:            { label: 'New',            color: '#6366f1' },
  emailed:        { label: 'Emailed',        color: '#f59e0b' },
  dm_sent:        { label: 'DM Sent',        color: '#8b5cf6' },
  replied:        { label: 'Replied',        color: '#06b6d4' },
  converted:      { label: 'Converted',      color: '#10b981' },
  not_interested: { label: 'Not interested', color: '#6b7280' },
};

const TYPE_ICONS: Record<string, LucideIcon> = {
  riad:       Building2,
  restaurant: Utensils,
  boutique:   ShoppingBag,
  tour_guide: Map,
};

const DM_TEMPLATE = (name: string, type: string) => {
  const portfolioRef = type === 'riad'
    ? 'RiadConnect — https://www.riadconnect.com\nDémo riad : https://riaddemo.vercel.app'
    : type === 'boutique'
    ? 'TyyMaroc'
    : 'Emll';
  return `Bonjour ${name},

Je suis Mounir, développeur web spécialisé dans les entreprises marocaines. J'ai vu votre page et j'ai adoré votre travail.

Beaucoup de vos clients potentiels cherchent votre business sur Google — sans site web, vous perdez des réservations chaque jour.

J'ai récemment créé des sites pour des riads similaires :
${portfolioRef}

Je vous propose un site professionnel à partir de 799$ — devis gratuit en 24h. Intéressé(e) ?

mbndev.ma`;
};

// ── Main component ─────────────────────────────────────────────────────────────
export default function AdminLeadsPage() {
  const [leads,       setLeads]       = useState<Lead[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filterPri,   setFilterPri]   = useState<string>('all');
  const [filterType,  setFilterType]  = useState<string>('all');
  const [filterStatus,setFilterStatus]= useState<string>('all');
  const [emailTarget, setEmailTarget] = useState<Lead | null>(null);
  const [dmTarget,    setDmTarget]    = useState<Lead | null>(null);
  const [emailSubject,setEmailSubject]= useState('');
  const [emailBody,   setEmailBody]   = useState('');
  const [sending,     setSending]     = useState(false);
  const [importing,   setImporting]   = useState(false);
  const [syncing,     setSyncing]     = useState(false);
  const [bulkSending,   setBulkSending]   = useState(false);
  const [bulkResetting, setBulkResetting] = useState(false);
  const [copied,        setCopied]        = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchLeads = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    leadsAPI.getAll()
      .then(({ data }) => setLeads(data.leads ?? []))
      .catch(() => toast.error('Failed to load leads.'))
      .finally(() => { if (!silent) setLoading(false); });
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // ── Bulk email all new leads ──────────────────────────────────────────────
  const handleBulkEmail = async () => {
    const eligible = leads.filter(l => l.email && l.status === 'new').length;
    if (eligible === 0) { toast.error('No new leads with email addresses to contact.'); return; }
    if (!confirm(`Send outreach emails to ${eligible} new lead${eligible !== 1 ? 's' : ''}? This cannot be undone.`)) return;
    setBulkSending(true);
    try {
      const { data } = await leadsAPI.bulkEmail();
      toast.success(`Sent ${data.sent} email${data.sent !== 1 ? 's' : ''}${data.failed > 0 ? ` — ${data.failed} failed` : ''}.`);
      fetchLeads();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Bulk email failed.');
    } finally {
      setBulkSending(false);
    }
  };

  // ── Reset all emailed leads back to new ──────────────────────────────────
  const handleResetAll = async () => {
    const emailed = leads.filter(l => l.status === 'emailed').length;
    if (emailed === 0) { toast('No emailed leads to reset — all already new.'); return; }
    if (!confirm(`Reset ${emailed} emailed lead${emailed !== 1 ? 's' : ''} back to "new"? This lets you send bulk emails to them again.`)) return;
    setBulkResetting(true);
    try {
      const { data } = await leadsAPI.resetAll();
      toast.success(data.message || 'Leads reset to new.');
      fetchLeads();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Reset failed.');
    } finally {
      setBulkResetting(false);
    }
  };

  // ── Import defaults ───────────────────────────────────────────────────────
  const handleImport = async () => {
    setImporting(true);
    try {
      const { data } = await leadsAPI.importDefaults();
      toast.success(data.message || 'Leads imported!');
      fetchLeads();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  // ── Sync contacts from DEFAULT_LEADS ─────────────────────────────────────
  const handleSyncContacts = async () => {
    setSyncing(true);
    try {
      const { data } = await leadsAPI.syncContacts();
      toast.success(data.message || 'Contacts synced!');
      fetchLeads(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  // ── Status update ─────────────────────────────────────────────────────────
  const updateStatus = async (id: string, status: string) => {
    try {
      const { data } = await leadsAPI.update(id, { status });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: data.lead.status } : l));
    } catch {
      toast.error('Failed to update status.');
    }
  };

  // ── Delete lead ───────────────────────────────────────────────────────────
  const deleteLead = async (id: string) => {
    try {
      await leadsAPI.delete(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      toast.success('Lead removed.');
    } catch {
      toast.error('Failed to delete lead.');
    }
  };

  // ── Open email modal ──────────────────────────────────────────────────────
  const openEmail = async (lead: Lead) => {
    setEmailTarget(lead);
    setSending(false);
    // Pre-fetch template
    try {
      const { data } = await leadsAPI.getTemplate(lead.type, lead.name);
      setEmailSubject(data.subject);
      setEmailBody(data.html);
    } catch {
      setEmailSubject(`Site web professionnel pour ${lead.name} — devis en 24h`);
      setEmailBody('');
    }
  };

  // ── Send email ────────────────────────────────────────────────────────────
  const sendEmail = async () => {
    if (!emailTarget) return;
    setSending(true);
    try {
      await leadsAPI.sendEmail(emailTarget.id, { subject: emailSubject, body: emailBody });
      setLeads(prev => prev.map(l => l.id === emailTarget.id ? { ...l, status: 'emailed' } : l));
      toast.success(`Email sent to ${emailTarget.name}!`);
      setEmailTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Email failed.');
    } finally {
      setSending(false);
    }
  };

  // ── Copy DM ───────────────────────────────────────────────────────────────
  const copyDm = async (lead: Lead) => {
    const text = DM_TEMPLATE(lead.name, lead.type);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('DM template copied!');
    } catch {
      toast.error('Could not copy to clipboard.');
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = leads.filter(l => {
    if (filterPri    !== 'all' && l.priority !== filterPri)    return false;
    if (filterType   !== 'all' && l.type     !== filterType)   return false;
    if (filterStatus !== 'all' && l.status   !== filterStatus) return false;
    return true;
  });

  const hotCount  = leads.filter(l => l.priority === 'hot').length;
  const newCount  = leads.filter(l => l.status   === 'new').length;
  const convCount = leads.filter(l => l.status   === 'converted').length;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.25)' }}>
            <Target className="w-5 h-5 text-primary-400" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg leading-tight">Lead Outreach</h1>
            <p className="text-slate-500 text-xs">{leads.length} prospects · {hotCount} hot · {convCount} converted</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => fetchLeads(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white text-sm transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <RefreshCcw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={handleSyncContacts} disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
            <Phone className="w-3.5 h-3.5" />
            {syncing ? 'Syncing…' : 'Sync Contacts'}
          </button>
          <button onClick={handleImport} disabled={importing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 0 16px rgba(124,58,237,0.35)' }}>
            <Download className="w-3.5 h-3.5" />
            {importing ? 'Importing…' : 'Import Leads'}
          </button>
          <button onClick={handleResetAll} disabled={bulkResetting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
            <RefreshCcw className="w-3.5 h-3.5" />
            {bulkResetting ? 'Resetting…' : 'Reset All'}
          </button>
          <button onClick={handleBulkEmail} disabled={bulkSending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-60"
            style={{ background: bulkSending ? 'rgba(239,68,68,0.3)' : 'linear-gradient(135deg,#dc2626,#b91c1c)', boxShadow: '0 0 16px rgba(220,38,38,0.3)' }}>
            <Send className="w-3.5 h-3.5" />
            {bulkSending ? 'Sending…' : 'Send All Emails'}
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Leads',  value: leads.length,  color: '#6366f1' },
          { label: 'Hot',       icon: Flame,  value: hotCount,      color: '#ef4444' },
          { label: 'Contacted', icon: Mail,   value: leads.filter(l => ['emailed','dm_sent'].includes(l.status)).length, color: '#f59e0b' },
          { label: 'Converted', icon: Check,  value: convCount,     color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-2xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
              {s.icon && <s.icon className="w-3 h-3" style={{ color: s.color }} />}
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2">
        {/* Priority */}
        <div className="flex gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {['all','hot','warm'].map(v => (
            <button key={v} onClick={() => setFilterPri(v)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={filterPri === v
                ? { background: 'rgba(124,58,237,0.25)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.35)' }
                : { color: '#94a3b8', border: '1px solid transparent' }}>
              {v === 'all' ? 'All priorities' : (
                <span className="flex items-center gap-1">
                  {v === 'hot' ? <Flame className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                  {v === 'hot' ? 'Hot' : 'Warm'}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Type */}
        <div className="flex gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {['all','riad','restaurant','boutique','tour_guide'].map(v => (
            <button key={v} onClick={() => setFilterType(v)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={filterType === v
                ? { background: 'rgba(124,58,237,0.25)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.35)' }
                : { color: '#94a3b8', border: '1px solid transparent' }}>
              {v === 'all' ? 'All types' : (() => { const I = TYPE_ICONS[v]; return <span className="flex items-center gap-1.5">{I && <I className="w-3.5 h-3.5" />}{v.replace('_',' ')}</span>; })()}
            </button>
          ))}
        </div>
        {/* Status */}
        <div className="flex gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {['all','new','emailed','dm_sent','replied','converted'].map(v => (
            <button key={v} onClick={() => setFilterStatus(v)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={filterStatus === v
                ? { background: 'rgba(124,58,237,0.25)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.35)' }
                : { color: '#94a3b8', border: '1px solid transparent' }}>
              {v === 'all' ? 'All statuses' : STATUS_LABELS[v]?.label ?? v}
            </button>
          ))}
        </div>
      </div>

      {/* ── Empty state ── */}
      {leads.length === 0 && (
        <div className="rounded-2xl p-12 text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Target className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No leads yet</p>
          <p className="text-slate-600 text-sm mt-1">Import the 22 Moroccan prospects found for you</p>
          <button onClick={handleImport} disabled={importing}
            className="mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-medium"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
            {importing ? 'Importing…' : <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" />Import 22 Leads</span>}
          </button>
        </div>
      )}

      {/* ── Leads table ── */}
      {filtered.length > 0 && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Lead','Type','Contact','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <motion.tr key={lead.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    className="hover:bg-white/[0.02] transition-colors group">

                    {/* Lead name + priority + angle */}
                    <td className="px-4 py-3 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        {(() => { const I = TYPE_ICONS[lead.type] ?? Building2; return <I className="w-4 h-4 text-slate-400 shrink-0" />; })()}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-white font-medium leading-tight">{lead.name}</span>
                            {lead.priority === 'hot'
                              ? <Flame className="w-3.5 h-3.5 text-red-400 shrink-0" />
                              : <Star  className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          </div>
                          <div className="text-slate-500 text-xs mt-0.5">{lead.city}</div>
                          {lead.outreachAngle && (
                            <div className="text-slate-600 text-[10px] mt-0.5 max-w-[240px] truncate" title={lead.outreachAngle}>
                              {lead.outreachAngle}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Type badge */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-lg text-[11px] font-medium capitalize"
                        style={{ background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}>
                        {lead.type.replace('_',' ')}
                      </span>
                    </td>

                    {/* Contact info */}
                    <td className="px-4 py-3 min-w-[160px]">
                      <div className="space-y-1">
                        {lead.email && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                            <Mail className="w-3 h-3 text-slate-600 shrink-0" />
                            <span className="truncate max-w-[140px]">{lead.email}</span>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Phone className="w-3 h-3 text-slate-600 shrink-0" />
                            <a href={`https://wa.me/${lead.phone.replace(/\s+/g,'').replace('+','')}`}
                              target="_blank" rel="noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-0.5">
                              {lead.phone} <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                        {lead.instagram && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Instagram className="w-3 h-3 text-slate-600 shrink-0" />
                            <a href={`https://instagram.com/${lead.instagram.replace('@','')}`}
                              target="_blank" rel="noreferrer"
                              className="text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-0.5">
                              {lead.instagram} <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                        {!lead.email && !lead.phone && !lead.instagram && (
                          <span className="text-slate-700 text-xs">No contact info</span>
                        )}
                      </div>
                    </td>

                    {/* Status dropdown */}
                    <td className="px-4 py-3">
                      <StatusDropdown
                        status={lead.status}
                        onChange={s => updateStatus(lead.id, s)}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">

                        {/* ⚡ Quick Send — WhatsApp with pre-filled message (priority) or Email modal */}
                        {(lead.phone || lead.email) && (
                          lead.phone ? (
                            <a
                              href={`https://wa.me/${lead.phone.replace(/\s+/g,'').replace('+','')}?text=${encodeURIComponent(DM_TEMPLATE(lead.name, lead.type))}`}
                              target="_blank" rel="noreferrer"
                              onClick={() => updateStatus(lead.id, 'emailed')}
                              title="⚡ Quick Send via WhatsApp"
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                              style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.25),rgba(5,150,105,0.2))', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399' }}>
                              <Zap className="w-3 h-3" /> WhatsApp
                            </a>
                          ) : (
                            <button onClick={() => openEmail(lead)}
                              title="⚡ Quick Send via Email"
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                              style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(79,70,229,0.2))', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8' }}>
                              <Zap className="w-3 h-3" /> Email
                            </button>
                          )
                        )}

                        {/* Email icon — always shown if has email */}
                        {lead.email && (
                          <button onClick={() => openEmail(lead)}
                            title="Send email"
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                            <Mail className="w-3.5 h-3.5 text-indigo-400" />
                          </button>
                        )}

                        {/* WhatsApp icon — always shown if has phone */}
                        {lead.phone && (
                          <a href={`https://wa.me/${lead.phone.replace(/\s+/g,'').replace('+','')}`}
                            target="_blank" rel="noreferrer"
                            title="WhatsApp (no pre-fill)"
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.22)' }}>
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          </a>
                        )}
                        <button onClick={() => deleteLead(lead.id)}
                          title="Delete lead"
                          className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── No results after filter ── */}
      {leads.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12 text-slate-600">No leads match your filters.</div>
      )}

      {/* ── Email Modal (portal) ── */}
      {emailTarget && typeof document !== 'undefined' && createPortal(
        <EmailModal
          lead={emailTarget}
          subject={emailSubject}
          body={emailBody}
          sending={sending}
          onSubjectChange={setEmailSubject}
          onBodyChange={setEmailBody}
          onSend={sendEmail}
          onClose={() => setEmailTarget(null)}
        />,
        document.body
      )}
    </div>
  );
}

// ── Status dropdown ────────────────────────────────────────────────────────────
function StatusDropdown({ status, onChange }: { status: string; onChange: (s: string) => void }) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_LABELS[status] ?? { label: status, color: '#6b7280' };

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
        style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}35`, color: meta.color }}>
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.color }} />
        {meta.label}
        <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 left-0 top-9 min-w-[160px] rounded-xl overflow-hidden shadow-2xl"
            style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.1)' }}
            onMouseLeave={() => setOpen(false)}>
            {Object.entries(STATUS_LABELS).map(([val, { label, color }]) => (
              <button key={val} onClick={() => { onChange(val); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left hover:bg-white/5 transition-colors"
                style={{ color }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                {label}
                {val === status && <Check className="w-3 h-3 ml-auto opacity-60" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Email Modal ────────────────────────────────────────────────────────────────
function EmailModal({
  lead, subject, body, sending,
  onSubjectChange, onBodyChange, onSend, onClose,
}: {
  lead:            Lead;
  subject:         string;
  body:            string;
  sending:         boolean;
  onSubjectChange: (s: string) => void;
  onBodyChange:    (b: string) => void;
  onSend:          () => void;
  onClose:         () => void;
}) {
  const [tab, setTab] = useState<'compose'|'preview'>('compose');

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#0e0e16', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <Mail className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">{lead.name}</div>
              <div className="text-slate-500 text-xs">{lead.email}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/8 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {(['compose','preview'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
              style={tab === t
                ? { background: 'rgba(124,58,237,0.2)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }
                : { color: '#64748b', border: '1px solid transparent' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {tab === 'compose' ? (
            <>
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1.5">Subject</label>
                <input
                  value={subject}
                  onChange={e => onSubjectChange(e.target.value)}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="Email subject…"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1.5">HTML Body</label>
                <textarea
                  value={body}
                  onChange={e => onBodyChange(e.target.value)}
                  rows={14}
                  className="w-full rounded-xl px-3.5 py-2.5 text-xs text-slate-300 font-mono outline-none resize-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  placeholder="Email HTML…"
                />
              </div>
            </>
          ) : (
            <div className="rounded-xl overflow-auto"
              style={{ background: '#fff', minHeight: '300px' }}>
              <iframe
                srcDoc={body}
                className="w-full"
                style={{ height: '480px', border: 'none' }}
                title="Email preview"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-slate-600 text-xs">From: contact@mbndev.ma</p>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              Cancel
            </button>
            <button onClick={onSend} disabled={sending || !subject || !body}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 0 14px rgba(99,102,241,0.35)' }}>
              <Send className="w-3.5 h-3.5" />
              {sending ? 'Sending…' : 'Send Email'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

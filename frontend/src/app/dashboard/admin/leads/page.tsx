'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { m as motion } from 'framer-motion';
import { leadsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Target, Mail, Phone, Instagram, Globe, Download, Plus,
  Flame, Star, X, Send, Copy, ExternalLink, Trash2, RefreshCcw,
  ChevronDown, MessageCircle, Check, Zap, AlertTriangle, MapPin, FileSpreadsheet,
} from 'lucide-react';
import { LEAD_GROUPS, LEAD_TYPES, leadType, type LeadGroupId } from '@/lib/leadTypes';
import AccentText from '@/components/ui/AccentText';
import { buildXlsx, downloadXlsx } from '@/lib/xlsx';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Lead {
  id:            string;
  name:          string;
  type:          string;
  city:          string;
  country?:      string | null;
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

const PAGE_SIZE = 30;

// null = the original Moroccan list.
const COUNTRIES: Record<string, { flag: string; label: string }> = {
  MA: { flag: '🇲🇦', label: 'Morocco' }, ES: { flag: '🇪🇸', label: 'Spain' }, FR: { flag: '🇫🇷', label: 'France' },
  PT: { flag: '🇵🇹', label: 'Portugal' }, IT: { flag: '🇮🇹', label: 'Italy' },
};
const countryOf = (l: { country?: string | null }) => l.country || 'MA';
const place = (l: { city: string; country?: string | null }) => `${COUNTRIES[countryOf(l)]?.flag ?? ''} ${l.city}`.trim();

// Phones get the card list only; the table (with per-row animation) is built
// only on wider screens so a phone never renders both.
const WIDE_QUERY = '(min-width: 768px)';
const subscribeWide = (cb: () => void) => {
  const mq = window.matchMedia(WIDE_QUERY);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const useWideScreen = () => useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE_QUERY).matches, () => false);

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:            { label: 'New',            color: '#6366f1' },
  emailed:        { label: 'Emailed',        color: '#f59e0b' },
  dm_sent:        { label: 'DM Sent',        color: '#8b5cf6' },
  replied:        { label: 'Replied',        color: '#06b6d4' },
  converted:      { label: 'Converted',      color: '#10b981' },
  not_interested: { label: 'Not interested', color: '#6b7280' },
};

const DM_TEMPLATE = (name: string, type: string) => {
  const portfolioRef = leadType(type).group === 'stay'
    ? '• Riad Dar Kader : https://mbndemo.vercel.app/fr\n• Emll : https://emll.vercel.app'
    : type === 'boutique'
    ? '• TyyMaroc\n• Emll : https://emll.vercel.app'
    : '• Emll : https://emll.vercel.app';
  return `Bonjour ${name},

Je suis Mounir, développeur web spécialisé dans les entreprises marocaines. J'ai vu votre page et j'ai adoré votre travail.

Beaucoup de vos clients potentiels cherchent votre business sur Google — sans site web, vous perdez des réservations chaque jour.

Quelques exemples de sites que j'ai réalisés :
${portfolioRef}

Je vous propose un site professionnel à partir de 1 290$ — devis gratuit en 24h. Intéressé(e) ?

mbndev.ma`;
};

// ── Main component ─────────────────────────────────────────────────────────────
export default function AdminLeadsPage() {
  const [leads,       setLeads]       = useState<Lead[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filterPri,   setFilterPri]   = useState<string>('all');
  const [filterGroup, setFilterGroup] = useState<'all' | LeadGroupId>('all');
  const [filterType,  setFilterType]  = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterStatus,setFilterStatus]= useState<string>('all');
  const [shownFor,    setShownFor]    = useState<{ key: string; n: number }>({ key: '', n: PAGE_SIZE });
  const wide = useWideScreen();
  const [emailTarget, setEmailTarget] = useState<Lead | null>(null);
  const [dmTarget,    setDmTarget]    = useState<Lead | null>(null);
  const [emailSubject,setEmailSubject]= useState('');
  const [emailBody,   setEmailBody]   = useState('');
  const [sending,     setSending]     = useState(false);
  const [importing,   setImporting]   = useState(false);
  const [syncing,     setSyncing]     = useState(false);
  const [bulkSending,   setBulkSending]   = useState(false);
  const [bulkResetting, setBulkResetting] = useState(false);
  const [testSending,   setTestSending]   = useState(false);
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
    const eligible = leads.filter(l => l.email && l.status === 'new' && !l.country).length; // Moroccan list only (see the API)
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

  // ── Test email delivery ───────────────────────────────────────────────────
  const handleTestEmail = async () => {
    setTestSending(true);
    try {
      const { data } = await leadsAPI.testEmail('mobanunir@gmail.com');
      if (data.success) {
        toast.success('Test email sent! Check mobanunir@gmail.com (and spam folder).');
      } else {
        const reason = data.result?.reason || 'unknown';
        if (!data.brevoConfigured) {
          toast.error('BREVO_API_KEY is not set in Vercel environment variables — emails cannot be sent.');
        } else {
          toast.error(`Brevo rejected the send: ${reason}`);
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Test failed.');
    } finally {
      setTestSending(false);
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

  // ── Export every lead (all filters ignored) to Excel ──────────────────────
  const handleExport = () => {
    if (!leads.length) { toast.error('No leads to export yet.'); return; }
    const day = (iso?: string) => (iso ? iso.slice(0, 10) : '');
    const rows = [
      ['Name', 'Type', 'City', 'Country', 'Phone / WhatsApp', 'Email', 'Instagram', 'Website', 'Priority', 'Status', 'Outreach angle', 'Notes', 'Source', 'Email sent', 'Added'],
      ...leads.map((l) => [
        l.name, leadType(l.type).label, l.city, l.country ?? '', l.phone ?? '', l.email ?? '', l.instagram ?? '',
        l.website ?? '', l.priority, l.status, l.outreachAngle ?? '', l.notes ?? '', l.source ?? '', day(l.emailSentAt), day(l.createdAt),
      ]),
    ];
    downloadXlsx(`mbndev-leads-${new Date().toISOString().slice(0, 10)}.xlsx`,
      buildXlsx(rows, { sheetName: 'Leads', widths: [32, 16, 16, 12, 18, 30, 22, 26, 9, 12, 60, 40, 20, 12, 12] }));
    toast.success(`Exported ${leads.length} leads.`);
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

  // ── Category update ───────────────────────────────────────────────────────
  const updateType = async (id: string, type: string) => {
    const prev = leads.find(l => l.id === id)?.type;
    setLeads(list => list.map(l => l.id === id ? { ...l, type } : l));
    try {
      await leadsAPI.update(id, { type });
      toast.success(`Moved to ${leadType(type).label}`);
    } catch {
      setLeads(list => list.map(l => l.id === id ? { ...l, type: prev ?? l.type } : l));
      toast.error('Failed to change the category.');
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
      const { data } = await leadsAPI.sendEmail(emailTarget.id, { subject: emailSubject, body: emailBody });
      if (data.success) {
        setLeads(prev => prev.map(l => l.id === emailTarget.id ? { ...l, status: 'emailed' } : l));
        toast.success(`Email sent to ${emailTarget.name}!`);
        setEmailTarget(null);
      } else {
        toast.error(`Send failed: ${data.result?.reason || 'Brevo not configured — check BREVO_API_KEY in Vercel env vars.'}`);
      }
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
    if (filterCountry !== 'all' && countryOf(l) !== filterCountry) return false;
    if (filterGroup  !== 'all' && leadType(l.type).group !== filterGroup) return false;
    if (filterType   !== 'all' && l.type     !== filterType)   return false;
    if (filterStatus !== 'all' && l.status   !== filterStatus) return false;
    return true;
  });

  // Render in batches: hundreds of rows at once froze phones. The batch size
  // resets whenever a filter changes.
  const filterKey = `${filterCountry}|${filterPri}|${filterGroup}|${filterType}|${filterStatus}`;
  const limit = shownFor.key === filterKey ? shownFor.n : PAGE_SIZE;
  const shown = filtered.slice(0, limit);
  const showMore = () => setShownFor({ key: filterKey, n: limit + PAGE_SIZE });

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
    <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.25)' }}>
            <Target className="w-5 h-5 text-primary-400" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg leading-tight"><AccentText text="Lead Outreach" /></h1>
            <p className="text-slate-500 text-xs">{leads.length} prospects · {hotCount} hot · {convCount} converted</p>
          </div>
        </div>
        {/* Phones: an even 2-column grid of actions; sm+: one wrapping row */}
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:flex-wrap [&>button]:justify-center [&>button]:h-10 [&>button]:whitespace-nowrap">
          <button onClick={() => fetchLeads(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white text-sm transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <RefreshCcw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(132,204,22,0.14)', border: '1px solid rgba(132,204,22,0.3)', color: '#a3e635' }}>
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
          </button>
          <button onClick={handleTestEmail} disabled={testSending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
            style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa' }}>
            <Zap className="w-3.5 h-3.5" />
            {testSending ? 'Testing…' : 'Test Email'}
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

      {/* ── Categories ── */}
      <div className="space-y-2">
        {new Set(leads.map(countryOf)).size > 1 && (
          <div className="flex gap-1 rounded-xl p-1 max-w-full w-fit overflow-x-auto scrollbar-none sm:flex-wrap [&>*]:shrink-0 [&>*]:whitespace-nowrap" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {['all', ...Object.keys(COUNTRIES)].map(c => {
              const count = c === 'all' ? leads.length : leads.filter(l => countryOf(l) === c).length;
              if (c !== 'all' && count === 0) return null;
              return (
                <button key={c} onClick={() => setFilterCountry(c)}
                  className="h-8 px-3 rounded-lg text-xs font-medium transition-all"
                  style={filterCountry === c
                    ? { background: 'rgba(124,58,237,0.25)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.35)' }
                    : { color: '#94a3b8', border: '1px solid transparent' }}>
                  {c === 'all' ? 'All countries' : `${COUNTRIES[c].flag} ${COUNTRIES[c].label}`} <span className="text-slate-500">{count}</span>
                </button>
              );
            })}
          </div>
        )}
        <div className="chip-row">
          {[{ id: 'all' as const, label: 'All leads' }, ...LEAD_GROUPS].map(g => {
            const inCountry = leads.filter(l => filterCountry === 'all' || countryOf(l) === filterCountry);
            const count = g.id === 'all' ? inCountry.length : inCountry.filter(l => leadType(l.type).group === g.id).length;
            if (g.id !== 'all' && count === 0) return null;
            const on = filterGroup === g.id;
            return (
              <button key={g.id} onClick={() => { setFilterGroup(g.id); setFilterType('all'); }}
                className="flex items-center gap-2 h-10 px-3.5 rounded-xl text-sm font-medium transition-all"
                style={on
                  ? { background: 'rgba(124,58,237,0.25)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.45)' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)' }}>
                {g.label}
                <span className="rounded-md px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: 'rgba(255,255,255,0.08)' }}>{count}</span>
              </button>
            );
          })}
        </div>
        {filterGroup !== 'all' && LEAD_TYPES.filter(t => t.group === filterGroup).length > 1 && (
          <div className="flex gap-1 rounded-xl p-1 max-w-full w-fit overflow-x-auto scrollbar-none sm:flex-wrap [&>*]:shrink-0 [&>*]:whitespace-nowrap" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {[{ id: 'all', label: 'All', icon: null }, ...LEAD_TYPES.filter(t => t.group === filterGroup)].map(t => {
              const count = t.id === 'all' ? leads.filter(l => leadType(l.type).group === filterGroup).length : leads.filter(l => l.type === t.id).length;
              if (t.id !== 'all' && count === 0) return null;
              const I = t.icon;
              return (
                <button key={t.id} onClick={() => setFilterType(t.id)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-all"
                  style={filterType === t.id
                    ? { background: 'rgba(124,58,237,0.25)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.35)' }
                    : { color: '#94a3b8', border: '1px solid transparent' }}>
                  {I && <I className="w-3.5 h-3.5" />}{t.label} <span className="text-slate-500">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
        {/* Priority */}
        <div className="flex gap-1 rounded-xl p-1 max-w-full overflow-x-auto scrollbar-none sm:flex-wrap [&>*]:shrink-0 [&>*]:whitespace-nowrap" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {['all','hot','warm'].map(v => (
            <button key={v} onClick={() => setFilterPri(v)}
              className="h-8 px-3 rounded-lg text-xs font-medium transition-all"
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
        {/* Status */}
        <div className="flex gap-1 rounded-xl p-1 max-w-full overflow-x-auto scrollbar-none sm:flex-wrap [&>*]:shrink-0 [&>*]:whitespace-nowrap" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {['all','new','emailed','dm_sent','replied','converted'].map(v => (
            <button key={v} onClick={() => setFilterStatus(v)}
              className="h-8 px-3 rounded-lg text-xs font-medium transition-all"
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

      {/* ── Leads: cards on phones ── */}
      {!wide && filtered.length > 0 && (
        <div className="space-y-3">
          {shown.map((lead) => (
            <LeadCard key={lead.id} lead={lead}
              onStatus={(s) => updateStatus(lead.id, s)}
              onType={(t) => updateType(lead.id, t)}
              onEmail={() => openEmail(lead)}
              onDelete={() => deleteLead(lead.id)} />
          ))}
        </div>
      )}

      {/* ── Leads table ── */}
      {wide && filtered.length > 0 && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Lead','Category','Contact','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((lead, i) => (
                  <motion.tr key={lead.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 15) * 0.03 }}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    className="hover:bg-white/[0.02] transition-colors group">

                    {/* Lead name + priority + angle */}
                    <td className="px-4 py-3 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        {(() => { const I = leadType(lead.type).icon; return <I className="w-4 h-4 text-slate-400 shrink-0" />; })()}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-white font-medium leading-tight">{lead.name}</span>
                            {lead.priority === 'hot'
                              ? <Flame className="w-3.5 h-3.5 text-red-400 shrink-0" />
                              : <Star  className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          </div>
                          <div className="text-slate-500 text-xs mt-0.5">{place(lead)}</div>
                          {lead.outreachAngle && (
                            <div className="text-slate-600 text-[10px] mt-0.5 max-w-[240px] truncate" title={lead.outreachAngle}>
                              {lead.outreachAngle}
                            </div>
                          )}
                          <LeadNotes notes={lead.notes} compact />
                        </div>
                      </div>
                    </td>

                    {/* Category (change it from here) */}
                    <td className="px-4 py-3">
                      <TypeSelect type={lead.type} onChange={(t) => updateType(lead.id, t)} />
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
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                            <Mail className="w-3.5 h-3.5 text-indigo-400" />
                          </button>
                        )}

                        {/* WhatsApp icon — always shown if has phone */}
                        {lead.phone && (
                          <a href={`https://wa.me/${lead.phone.replace(/\s+/g,'').replace('+','')}`}
                            target="_blank" rel="noreferrer"
                            title="WhatsApp (no pre-fill)"
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.22)' }}>
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          </a>
                        )}
                        <button onClick={() => deleteLead(lead.id)}
                          title="Delete lead"
                          className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
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

      {filtered.length > shown.length && (
        <button onClick={showMore}
          className="w-full rounded-xl py-3 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          Show more · {filtered.length - shown.length} left
        </button>
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
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number } | null>(null);
  const meta = STATUS_LABELS[status] ?? { label: status, color: '#6b7280' };

  // Fixed-position menu in a portal: table scroll areas and the dashboard's
  // transformed layout can't clip it. Opens upward near the bottom of the screen.
  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (pos) { setPos(null); return; }
    const r = e.currentTarget.getBoundingClientRect();
    const menuH = Object.keys(STATUS_LABELS).length * 38 + 8;
    const left = Math.min(r.left, window.innerWidth - 176);
    setPos(window.innerHeight - r.bottom < menuH + 12 ? { left, bottom: window.innerHeight - r.top + 4 } : { left, top: r.bottom + 4 });
  };

  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
  }, [pos]);

  return (
    <>
      <button onClick={toggle} aria-haspopup="menu" aria-expanded={Boolean(pos)}
        className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all"
        style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}35`, color: meta.color }}>
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.color }} />
        {meta.label}
        <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
      </button>
      {pos && typeof document !== 'undefined' && createPortal(
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setPos(null)} aria-hidden="true" />
          <div role="menu"
            className="fixed z-[91] w-40 rounded-xl overflow-hidden shadow-2xl"
            style={{ ...pos, background: '#111118', border: '1px solid rgba(255,255,255,0.1)' }}>
            {Object.entries(STATUS_LABELS).map(([val, { label, color }]) => (
              <button key={val} role="menuitem" onClick={() => { onChange(val); setPos(null); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left hover:bg-white/5 transition-colors"
                style={{ color }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                {label}
                {val === status && <Check className="w-3 h-3 ml-auto opacity-60" />}
              </button>
            ))}
          </div>
        </>,
        document.body,
      )}
    </>
  );
}

// ── Category picker ────────────────────────────────────────────────────────────
function TypeSelect({ type, onChange }: { type: string; onChange: (t: string) => void }) {
  return (
    <select value={type} onChange={(e) => onChange(e.target.value)} aria-label="Category"
      className="h-8 max-w-[150px] shrink-0 rounded-lg px-2 text-[11px] font-medium outline-none cursor-pointer"
      style={{ background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}>
      {LEAD_GROUPS.map(g => (
        <optgroup key={g.id} label={g.label}>
          {LEAD_TYPES.filter(t => t.group === g.id).map(t => <option key={t.id} value={t.id} style={{ background: '#0e0e16' }}>{t.label}</option>)}
        </optgroup>
      ))}
      {!LEAD_TYPES.some(t => t.id === type) && <option value={type}>{leadType(type).label}</option>}
    </select>
  );
}

// ── Notes (research notes; "⚠ …" lines are warnings, e.g. an unverified email) ──
function LeadNotes({ notes, compact = false }: { notes?: string; compact?: boolean }) {
  if (!notes?.trim()) return null;
  return (
    <div className={compact ? 'mt-1 space-y-1 max-w-[280px]' : 'mt-3 space-y-1.5'}>
      {notes.split('\n').filter((l) => l.trim()).map((line, i) => {
        if (line.startsWith('⚠')) {
          return (
            <p key={i} className="flex gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] leading-snug text-amber-300"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
              <span>{line.replace(/^⚠\s*/, '')}</span>
            </p>
          );
        }
        const map = line.match(/(.*?)(?:\s*·\s*)?Map:\s*(https?:\/\/\S+)/);
        return (
          <p key={i} className="text-[11px] leading-snug text-slate-500 break-words">
            {map ? map[1] : line}
            {map && (
              <a href={map[2]} target="_blank" rel="noreferrer" className="ml-1.5 inline-flex items-center gap-0.5 text-violet-300 hover:text-violet-200 py-1">
                <MapPin className="w-3 h-3" /> Map
              </a>
            )}
          </p>
        );
      })}
    </div>
  );
}

// ── Lead card (phones) ─────────────────────────────────────────────────────────
function LeadCard({ lead, onStatus, onType, onEmail, onDelete }: {
  lead: Lead; onStatus: (s: string) => void; onType: (t: string) => void; onEmail: () => void; onDelete: () => void;
}) {
  const Icon = leadType(lead.type).icon;
  const wa = lead.phone ? lead.phone.replace(/\s+/g, '').replace('+', '') : '';
  return (
    <article className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start gap-3">
        <Icon className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-white font-medium truncate">{lead.name}</span>
            {lead.priority === 'hot' ? <Flame className="w-3.5 h-3.5 text-red-400 shrink-0" /> : <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-slate-500 text-xs min-w-0"><TypeSelect type={lead.type} onChange={onType} /><span className="truncate">{place(lead)}</span></div>
        </div>
        <StatusDropdown status={lead.status} onChange={onStatus} />
      </div>

      {lead.outreachAngle && <p className="mt-2 text-slate-500 text-xs leading-relaxed">{lead.outreachAngle}</p>}

      <LeadNotes notes={lead.notes} />

      <div className="mt-2 text-xs">
        {lead.email && <p className="flex items-center gap-2 min-h-8 text-slate-400 min-w-0"><Mail className="w-3.5 h-3.5 text-slate-600 shrink-0" /><span className="truncate">{lead.email}</span></p>}
        {lead.phone && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="flex w-fit items-center gap-2 min-h-8 text-emerald-400"><Phone className="w-3.5 h-3.5 text-slate-600 shrink-0" />{lead.phone}<ExternalLink className="w-3 h-3" /></a>}
        {lead.instagram && <a href={`https://instagram.com/${lead.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex w-fit items-center gap-2 min-h-8 text-pink-400"><Instagram className="w-3.5 h-3.5 text-slate-600 shrink-0" />{lead.instagram}<ExternalLink className="w-3 h-3" /></a>}
        {!lead.email && !lead.phone && !lead.instagram && <p className="min-h-8 flex items-center text-slate-600">No contact info</p>}
      </div>

      <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {lead.phone ? (
          <a href={`https://wa.me/${wa}?text=${encodeURIComponent(DM_TEMPLATE(lead.name, lead.type))}`} target="_blank" rel="noreferrer"
            onClick={() => onStatus('emailed')}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold"
            style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.25),rgba(5,150,105,0.2))', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399' }}>
            <Zap className="w-3 h-3" /> WhatsApp
          </a>
        ) : null}
        {lead.email && (
          <button onClick={onEmail} className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}>
            <Mail className="w-3 h-3" /> Email
          </button>
        )}
        <button onClick={onDelete} aria-label={`Delete ${lead.name}`} className="ml-auto w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
        </button>
      </div>
    </article>
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

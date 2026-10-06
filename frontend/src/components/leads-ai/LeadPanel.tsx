'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { X, Copy, Mail, MessageCircle, Star, MapPin, Globe, Phone, Check, AlertTriangle, Sparkles, Bookmark } from 'lucide-react';
import Button from '@/components/ui/Button';
import ScoreBadge from './ScoreBadge';
import { useLeadsAi } from './LeadsAiShell';
import { leadsAiAPI, type LeadsAiAnalysis, type LeadsAiBusiness } from '@/lib/api';

const LANG_NAMES: Record<string, string> = { en: 'English', fr: 'Français', es: 'Español', ar: 'العربية' };
const PREFS_KEY = 'mbn_leads_ai_prefs';

interface Prefs { lang: string; tone: string; senderName: string; service: string }

function loadPrefs(): Prefs {
  const base = { lang: 'en', tone: 'friendly', senderName: '', service: '' };
  try { return { ...base, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }; } catch { return base; }
}

const host = (url: string | null) => (url ? url.replace(/^https?:\/\//, '').replace(/\/$/, '') : null);

interface Props {
  business: LeadsAiBusiness;
  analysis?: LeadsAiAnalysis;
  query?: string;
  initialMessage?: string | null;
  onClose: () => void;
  onSaved?: (placeId: string) => void;
}

export default function LeadPanel({ business, analysis, query, initialMessage, onClose, onSaved }: Props) {
  const { languages } = useLeadsAi();
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [message, setMessage] = useState(initialMessage || '');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch { /* private mode */ }
  }, [prefs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const audit = analysis?.audit;
  const email = audit?.emails?.[0] || null;

  const generate = async () => {
    if (!audit) return;
    setGenerating(true);
    try {
      const { data } = await leadsAiAPI.message({ business, audit, ...prefs });
      setMessage(data.message);
      if (data.warning) toast(data.warning, { icon: '⚠️' });
    } catch {
      toast.error('Could not generate the message.');
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await leadsAiAPI.save({ ...business, audit, message: message || undefined, query });
      toast.success('Lead saved');
      onSaved?.(business.placeId);
    } catch {
      toast.error('Could not save the lead.');
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(message); toast.success('Copied'); } catch { toast.error('Copy failed'); }
  };

  const subject = `Quick idea for ${business.name}`;
  const mailto = `mailto:${email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  const waNumber = (business.phone || '').replace(/[^\d]/g, '');
  const whatsapp = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}` : null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={business.name}
        className="h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-[#0d0b18] p-5 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <ScoreBadge score={analysis?.score} loading={!analysis} />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-white">{business.name}</h2>
            {business.address && <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400"><MapPin className="h-3 w-3 shrink-0" />{business.address}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {business.website
            ? <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 truncate text-violet-300 hover:underline"><Globe className="h-3.5 w-3.5 shrink-0" />{host(business.website)}</a>
            : <span className="flex items-center gap-1.5 text-rose-300"><Globe className="h-3.5 w-3.5" />No website</span>}
          {business.phone && <a href={`tel:${business.phone}`} className="flex items-center gap-1.5 text-slate-300"><Phone className="h-3.5 w-3.5" />{business.phone}</a>}
          {email && <a href={`mailto:${email}`} className="flex items-center gap-1.5 truncate text-slate-300"><Mail className="h-3.5 w-3.5 shrink-0" />{email}</a>}
          {business.rating != null && <span className="flex items-center gap-1.5 text-slate-300"><Star className="h-3.5 w-3.5 text-amber-400" />{business.rating} ({business.reviews ?? 0} reviews)</span>}
          {business.mapsUrl && <a href={business.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-slate-300 hover:text-white"><MapPin className="h-3.5 w-3.5" />Google Maps</a>}
        </div>

        <section className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Opportunities found</h3>
          {!analysis ? (
            <p className="mt-2 text-sm text-slate-500">Analyzing the website…</p>
          ) : analysis.issues.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">No major issues — this website is in good shape.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {analysis.issues.map((i) => (
                <li key={i.key} className="flex items-start gap-2 text-sm text-slate-200">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <span className="flex-1">{i.label}</span>
                  <span className="text-xs text-slate-500">+{i.points}</span>
                </li>
              ))}
            </ul>
          )}
          {audit?.reachable && (
            <ul className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-slate-400">
              {audit.platform && <li className="rounded-md bg-white/5 px-2 py-1">{audit.platform}</li>}
              {audit.responseMs != null && <li className="rounded-md bg-white/5 px-2 py-1">{(audit.responseMs / 1000).toFixed(1)}s load</li>}
              {audit.hasBooking && <li className="rounded-md bg-emerald-500/10 px-2 py-1 text-emerald-300"><Check className="mr-1 inline h-3 w-3" />Online booking</li>}
              {Object.keys(audit.social || {}).map((s) => <li key={s} className="rounded-md bg-white/5 px-2 py-1 capitalize">{s}</li>)}
            </ul>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-white"><Sparkles className="h-4 w-4 text-violet-300" />Outreach message</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <select value={prefs.lang} onChange={(e) => setPrefs({ ...prefs, lang: e.target.value })} aria-label="Language" className="rounded-lg border border-white/10 bg-[#07060f] px-2 py-2 text-sm">
              {languages.map((l) => <option key={l} value={l}>{LANG_NAMES[l] || l}</option>)}
            </select>
            <select value={prefs.tone} onChange={(e) => setPrefs({ ...prefs, tone: e.target.value })} aria-label="Tone" className="rounded-lg border border-white/10 bg-[#07060f] px-2 py-2 text-sm">
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
              <option value="direct">Direct</option>
            </select>
            <input value={prefs.senderName} onChange={(e) => setPrefs({ ...prefs, senderName: e.target.value })} placeholder="Your name" aria-label="Your name" className="rounded-lg border border-white/10 bg-[#07060f] px-3 py-2 text-sm" />
            <input value={prefs.service} onChange={(e) => setPrefs({ ...prefs, service: e.target.value })} placeholder="Your service (e.g. website redesign)" aria-label="Your service" className="rounded-lg border border-white/10 bg-[#07060f] px-3 py-2 text-sm" />
          </div>
          <Button className="mt-3" size="sm" onClick={generate} loading={generating} disabled={!analysis}>
            {message ? 'Regenerate' : 'Generate message'}
          </Button>
          {message && (
            <>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={10} aria-label="Message" className="mt-3 w-full rounded-xl border border-white/10 bg-[#07060f] p-3 text-sm leading-relaxed text-slate-200" />
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={copy}><Copy className="h-3.5 w-3.5" />Copy</Button>
                <a href={mailto} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/5"><Mail className="h-3.5 w-3.5" />Email</a>
                {whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/5"><MessageCircle className="h-3.5 w-3.5" />WhatsApp</a>}
              </div>
            </>
          )}
        </section>

        {onSaved && (
          <Button className="mt-5" fullWidth onClick={save} loading={saving} disabled={!analysis}>
            <Bookmark className="h-4 w-4" />{business.saved ? 'Update saved lead' : 'Save lead'}
          </Button>
        )}
      </aside>
    </div>,
    document.body,
  );
}

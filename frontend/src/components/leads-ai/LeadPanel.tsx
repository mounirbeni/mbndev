'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { X, Copy, Mail, MessageCircle, Star, MapPin, Globe, Phone, Check, AlertTriangle, Sparkles, Bookmark, ArrowLeft } from 'lucide-react';
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
  // Emails: read from the business's own website (homepage + contact page),
  // or listed on OpenStreetMap. Google Places never returns emails.
  const siteEmails = audit?.emails ?? [];
  const emails = [...new Set([...siteEmails, ...(business.email ? [business.email] : [])])];
  const email = emails[0] || null;
  const fromMap = business.mapsUrl?.includes('openstreetmap.org') ? 'map listing' : 'Google listing';
  const searchEmail = `https://www.google.com/search?q=${encodeURIComponent(`"${business.name}" ${business.address?.split(',').pop()?.trim() || ''} email`)}`;
  const copyText = async (t: string) => {
    try { await navigator.clipboard.writeText(t); toast.success('Copied'); } catch { toast.error('Copy failed'); }
  };

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
        className="h-[100dvh] w-full max-w-xl overflow-y-auto overscroll-contain border-l border-white/10 bg-[#0d0b18] px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-[calc(env(safe-area-inset-top)+1.25rem)] sm:px-7 sm:pb-7 sm:pt-7"
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
          {business.rating != null && <span className="flex items-center gap-1.5 text-slate-300"><Star className="h-3.5 w-3.5 text-amber-400" />{business.rating} ({business.reviews ?? 0} reviews)</span>}
          {business.mapsUrl && <a href={business.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-slate-300 hover:text-white"><MapPin className="h-3.5 w-3.5" />{business.mapsUrl.includes('openstreetmap.org') ? 'Map' : 'Google Maps'}</a>}
        </div>

        <section className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Contact</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {emails.map((e) => (
              <li key={e} className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <a href={`mailto:${e}`} className="min-w-0 truncate text-slate-200 hover:underline">{e}</a>
                <span className="shrink-0 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500">{siteEmails.includes(e) ? 'from their website' : `from ${fromMap}`}</span>
                <button onClick={() => copyText(e)} aria-label={`Copy ${e}`} className="ml-auto shrink-0 rounded p-1 text-slate-500 hover:bg-white/10 hover:text-white"><Copy className="h-3.5 w-3.5" /></button>
              </li>
            ))}
            {!analysis && !emails.length && <li className="text-slate-500">Looking for an email on their website…</li>}
            {analysis && !emails.length && (
              <li className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[13px] text-amber-100/90">
                No email found{business.website ? ' on their website' : ' — they have no website to read it from'}. Reach them by phone or WhatsApp, or:
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {Object.entries(audit?.social || {}).map(([k, url]) => (
                    <a key={k} href={url} target="_blank" rel="noopener noreferrer" className="rounded-md bg-white/10 px-2 py-1 text-xs capitalize text-white hover:bg-white/15">{k}</a>
                  ))}
                  <a href={searchEmail} target="_blank" rel="noopener noreferrer" className="rounded-md bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/15">Search Google for their email</a>
                </span>
              </li>
            )}
            {business.phone && (
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <a href={`tel:${business.phone}`} className="text-slate-200 hover:underline">{business.phone}</a>
                <span className="shrink-0 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500">from {fromMap}</span>
              </li>
            )}
          </ul>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            Contact details come from public listings and the business’s own website — they’re not verified. Check them before you send, and use WhatsApp only for mobile numbers.
          </p>
        </section>

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
            <select value={prefs.lang} onChange={(e) => setPrefs({ ...prefs, lang: e.target.value })} aria-label="Language" className="min-w-0 rounded-lg border border-white/10 bg-[#07060f] px-2 py-2 text-sm text-white">
              {languages.map((l) => <option key={l} value={l}>{LANG_NAMES[l] || l}</option>)}
            </select>
            <select value={prefs.tone} onChange={(e) => setPrefs({ ...prefs, tone: e.target.value })} aria-label="Tone" className="min-w-0 rounded-lg border border-white/10 bg-[#07060f] px-2 py-2 text-sm text-white">
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
              <option value="direct">Direct</option>
            </select>
            <input value={prefs.senderName} onChange={(e) => setPrefs({ ...prefs, senderName: e.target.value })} placeholder="Your name" aria-label="Your name" autoComplete="name" className="min-w-0 rounded-lg border border-white/10 bg-[#07060f] px-3 py-2 text-sm text-white placeholder:text-slate-500" />
            <input value={prefs.service} onChange={(e) => setPrefs({ ...prefs, service: e.target.value })} placeholder="Your service (e.g. website redesign)" aria-label="Your service" autoComplete="off" className="min-w-0 rounded-lg border border-white/10 bg-[#07060f] px-3 py-2 text-sm text-white placeholder:text-slate-500" />
          </div>
          <Button className="mt-3" size="sm" onClick={generate} loading={generating} disabled={!analysis}>
            {message ? 'Regenerate' : 'Generate message'}
          </Button>
          {message && (
            <>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={14} aria-label="Message" className="mt-3 w-full resize-y rounded-xl border border-white/10 bg-[#07060f] p-3 text-sm leading-relaxed text-slate-200" />
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
        <Button className={onSaved ? 'mt-2' : 'mt-5'} variant="secondary" fullWidth onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />Back
        </Button>
      </aside>
    </div>,
    document.body,
  );
}

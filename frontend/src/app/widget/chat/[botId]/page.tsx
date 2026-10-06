'use client';

import { use, useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Loader2, Phone } from 'lucide-react';

interface Config { name: string; welcome: string; color: string; whatsapp: string | null; branding: boolean }
interface Msg { role: 'user' | 'assistant'; content: string }

const api = (botId: string, path: string, body?: unknown) =>
  fetch(`/api/support-ai/widget/${encodeURIComponent(botId)}/${path}`, body === undefined ? undefined : {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

function storage(kind: 'local' | 'session') {
  try { return kind === 'local' ? window.localStorage : window.sessionStorage; } catch { return null; }
}

/**
 * MBN Support AI chat — rendered inside the iframe that support-widget.js
 * adds to a customer's website. Tells the parent page when to resize.
 */
export default function SupportWidget({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = use(params);
  const [config, setConfig] = useState<Config | null>(null);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [lead, setLead] = useState({ name: '', email: '', phone: '', message: '' });
  const [leadError, setLeadError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const origin = useRef('');

  // Transparent page so only the bubble / panel shows on the host site.
  useEffect(() => {
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
    origin.current = new URLSearchParams(window.location.search).get('origin') || '';
    api(botId, 'config')
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.bot) setConfig(d.bot); })
      .catch(() => {});
  }, [botId]);

  useEffect(() => {
    window.parent?.postMessage({ type: 'mbn-support-ai', open }, '*');
  }, [open]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, showLead]);

  if (!config) return null;

  const visitorId = () => {
    const s = storage('local');
    let id = s?.getItem('mbn_sa_visitor');
    if (!id) {
      id = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
      s?.setItem('mbn_sa_visitor', id);
    }
    return id;
  };
  const convKey = `mbn_sa_conv_${botId}`;

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setMsgs((m) => [...m, { role: 'user', content: text }]);
    setSending(true);
    try {
      const res = await api(botId, 'chat', {
        message: text, visitorId: visitorId(), origin: origin.current,
        conversationId: storage('session')?.getItem(convKey) || undefined,
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.message || 'error');
      if (d.conversationId) storage('session')?.setItem(convKey, d.conversationId);
      setMsgs((m) => [...m, { role: 'assistant', content: d.reply }]);
      if (d.wantsLead && !leadSent) setShowLead(true);
    } catch (err) {
      setMsgs((m) => [...m, { role: 'assistant', content: (err as Error).message !== 'error' ? (err as Error).message : 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  const sendLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError('');
    if (!lead.email.trim() && !lead.phone.trim()) { setLeadError('Please leave an email or a phone number.'); return; }
    const res = await api(botId, 'lead', { ...lead, conversationId: storage('session')?.getItem(convKey) || undefined });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setLeadError(d.message || 'Could not send.'); return; }
    setLeadSent(true);
    setShowLead(false);
    setMsgs((m) => [...m, { role: 'assistant', content: 'Thank you! The team will get back to you very soon.' }]);
  };

  const color = config.color;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label={`Chat with ${config.name}`}
        className="fixed bottom-2 right-2 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105"
        style={{ background: color }}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400';

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-white text-slate-900 sm:inset-2 sm:rounded-2xl sm:shadow-2xl" role="dialog" aria-label={`Chat with ${config.name}`}>
      <header className="flex items-center gap-3 px-4 py-3 text-white" style={{ background: color }}>
        <MessageCircle className="h-5 w-5 shrink-0" />
        <p className="flex-1 truncate font-semibold">{config.name}</p>
        {config.whatsapp && (
          <a href={`https://wa.me/${config.whatsapp.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="rounded-full p-1.5 hover:bg-white/20"><Phone className="h-4 w-4" /></a>
        )}
        <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full p-1.5 hover:bg-white/20"><X className="h-5 w-5" /></button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4" aria-live="polite">
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-sm shadow-sm">{config.welcome}</div>
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : ''}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap px-3.5 py-2.5 text-sm shadow-sm ${m.role === 'user' ? 'rounded-2xl rounded-tr-sm text-white' : 'rounded-2xl rounded-tl-sm bg-white'}`}
              style={m.role === 'user' ? { background: color } : undefined}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && <div className="flex items-center gap-2 text-xs text-slate-500"><Loader2 className="h-3.5 w-3.5 animate-spin" />Typing…</div>}

        {showLead && (
          <form onSubmit={sendLead} className="space-y-2 rounded-2xl bg-white p-3.5 shadow-sm">
            <p className="text-sm font-semibold">Leave your details and we&apos;ll get back to you</p>
            <input className={inputCls} placeholder="Name" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} maxLength={100} />
            <input className={inputCls} placeholder="Email" type="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} maxLength={160} />
            <input className={inputCls} placeholder="Phone / WhatsApp" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} maxLength={30} />
            <textarea className={inputCls} placeholder="Message (optional)" rows={2} value={lead.message} onChange={(e) => setLead({ ...lead, message: e.target.value })} maxLength={1000} />
            {leadError && <p className="text-xs text-rose-600">{leadError}</p>}
            <div className="flex gap-2">
              <button type="submit" className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white" style={{ background: color }}>Send</button>
              <button type="button" onClick={() => setShowLead(false)} className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100">Not now</button>
            </div>
          </form>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message…"
          aria-label="Your message"
          maxLength={1000}
          className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400"
        />
        <button type="submit" disabled={!input.trim() || sending} aria-label="Send" className="flex h-9 w-9 items-center justify-center rounded-full text-white disabled:opacity-40" style={{ background: color }}>
          <Send className="h-4 w-4" />
        </button>
      </form>
      {config.branding && (
        <a href="https://mbndev.ma/products/support-ai" target="_blank" rel="noopener noreferrer" className="bg-white pb-2 text-center text-[10px] text-slate-400 hover:text-slate-600">
          Powered by MBN Support AI
        </a>
      )}
    </div>
  );
}

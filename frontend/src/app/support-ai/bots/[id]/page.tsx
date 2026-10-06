'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Copy, RefreshCw, Trash2, Loader2, Mail, Phone } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useSupportAi } from '@/components/support-ai/SupportAiShell';
import { supportAiAPI, type SupportBot, type SupportConversation, type SupportLead } from '@/lib/api';

type Tab = 'setup' | 'install' | 'conversations' | 'leads' | 'preview';
const TABS: [Tab, string][] = [['setup', 'Setup'], ['install', 'Install'], ['conversations', 'Conversations'], ['leads', 'Leads'], ['preview', 'Preview']];
const errMsg = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;
const fieldCls = 'mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none';

export default function SupportBotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { refresh } = useSupportAi();
  const [bot, setBot] = useState<SupportBot | null>(null);
  const [form, setForm] = useState<Partial<SupportBot> & { domains?: string }>({});
  const [tab, setTab] = useState<Tab>('setup');
  const [saving, setSaving] = useState(false);
  const [training, setTraining] = useState(false);
  const [conversations, setConversations] = useState<SupportConversation[] | null>(null);
  const [leads, setLeads] = useState<SupportLead[] | null>(null);
  const [missing, setMissing] = useState(false);

  const fill = (b: SupportBot) => {
    setBot(b);
    setForm({ ...b, domains: b.allowedDomains.join(', '), handoffWhatsapp: b.handoffWhatsapp ?? '', handoffEmail: b.handoffEmail ?? '', notes: b.notes ?? '' });
  };

  useEffect(() => {
    supportAiAPI.bot(id).then(({ data }) => fill(data.bot), () => setMissing(true));
  }, [id]);

  const loadTab = useCallback((t: Tab) => {
    if (t === 'conversations') supportAiAPI.conversations(id).then(({ data }) => setConversations(data.conversations), () => setConversations([]));
    if (t === 'leads') supportAiAPI.leads(id).then(({ data }) => setLeads(data.leads), () => setLeads([]));
  }, [id]);

  const switchTab = (t: Tab) => { setTab(t); loadTab(t); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await supportAiAPI.updateBot(id, {
        name: form.name, welcome: form.welcome, color: form.color, notes: form.notes ?? '',
        handoffWhatsapp: form.handoffWhatsapp ?? '', handoffEmail: form.handoffEmail ?? '',
        allowedDomains: (form.domains || '').split(/[\s,]+/).filter(Boolean), active: form.active,
      });
      fill(data.bot);
      toast.success('Saved');
    } catch (err) {
      toast.error(errMsg(err, 'Could not save.'));
    } finally {
      setSaving(false);
    }
  };

  const retrain = async () => {
    setTraining(true);
    try {
      const { data } = await supportAiAPI.retrain(id);
      fill(data.bot);
      toast.success(`Learned ${data.training.pages} page${data.training.pages === 1 ? '' : 's'}`);
    } catch (err) {
      toast.error(errMsg(err, 'Could not read the website.'));
    } finally {
      setTraining(false);
    }
  };

  const remove = async () => {
    if (!bot || !window.confirm(`Delete ${bot.name}? Its conversations and leads are deleted too, and the widget stops working.`)) return;
    try { await supportAiAPI.deleteBot(id); await refresh(); router.push('/support-ai'); } catch { toast.error('Could not delete.'); }
  };

  if (missing) return <p className="py-20 text-center text-slate-400">Assistant not found. <Link href="/support-ai" className="underline">Back</Link></p>;
  if (!bot) return <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mbndev.ma';
  const snippet = `<script src="${origin}/support-widget.js" data-bot="${bot.id}" defer></script>`;

  return (
    <div>
      <Link href="/support-ai" className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" />Assistants</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{bot.name}</h1>
        {!bot.active && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs uppercase text-slate-400">Paused</span>}
      </div>
      <p className="mt-1 text-sm text-slate-400">
        {bot.pageCount} page{bot.pageCount === 1 ? '' : 's'} learned from {bot.websiteUrl.replace(/^https?:\/\//, '')}
        {bot.trainedAt ? ` · ${new Date(bot.trainedAt).toLocaleString()}` : ''}
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5" role="tablist">
        {TABS.map(([t, label]) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => switchTab(t)}
            className={`rounded-full px-3.5 py-1.5 text-sm ${tab === t ? 'bg-white text-[#14092b]' : 'border border-white/10 text-slate-400 hover:text-white'}`}>{label}</button>
        ))}
      </div>

      {tab === 'setup' && (
        <form onSubmit={save} className="mt-5 grid max-w-3xl gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:grid-cols-2">
          <label className="block"><span className="text-sm font-medium text-white">Name</span>
            <input className={fieldCls} value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={80} /></label>
          <label className="block"><span className="text-sm font-medium text-white">Colour</span>
            <span className="mt-1.5 flex items-center gap-2">
              <input type="color" value={form.color ?? '#7c3aed'} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent" aria-label="Colour" />
              <input className={`${fieldCls} mt-0`} value={form.color ?? ''} onChange={(e) => setForm({ ...form, color: e.target.value })} maxLength={7} />
            </span></label>
          <label className="block sm:col-span-2"><span className="text-sm font-medium text-white">Welcome message</span>
            <input className={fieldCls} value={form.welcome ?? ''} onChange={(e) => setForm({ ...form, welcome: e.target.value })} maxLength={300} /></label>
          <label className="block sm:col-span-2"><span className="text-sm font-medium text-white">Extra knowledge (FAQ, prices, policies…)</span>
            <textarea className={fieldCls} rows={6} value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={6000}
              placeholder={'Check-in from 2pm, check-out until 11am.\nAirport transfer: 200 MAD per car.\nBreakfast included.'} />
            <span className="mt-1 block text-xs text-slate-500">Always given to the assistant, on top of what it learned from the website.</span></label>
          <label className="block"><span className="text-sm font-medium text-white">WhatsApp for hand-off</span>
            <input className={fieldCls} value={form.handoffWhatsapp ?? ''} onChange={(e) => setForm({ ...form, handoffWhatsapp: e.target.value })} placeholder="+212 6…" /></label>
          <label className="block"><span className="text-sm font-medium text-white">Email for hand-off</span>
            <input className={fieldCls} value={form.handoffEmail ?? ''} onChange={(e) => setForm({ ...form, handoffEmail: e.target.value })} placeholder="hello@yourbusiness.com" /></label>
          <label className="block sm:col-span-2"><span className="text-sm font-medium text-white">Websites allowed to show the assistant</span>
            <input className={fieldCls} value={form.domains ?? ''} onChange={(e) => setForm({ ...form, domains: e.target.value })} placeholder="riad-yasmine.com, booking.riad-yasmine.com" />
            <span className="mt-1 block text-xs text-slate-500">Sub-domains are included. Leave empty to allow any site.</span></label>
          <label className="flex items-center gap-2 text-sm text-white sm:col-span-2">
            <input type="checkbox" checked={form.active ?? true} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Assistant is live
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button type="submit" loading={saving}>Save</Button>
            <Button type="button" variant="secondary" onClick={retrain} loading={training}><RefreshCw className="h-4 w-4" />Re-read website</Button>
            <Button type="button" variant="ghost" onClick={remove}><Trash2 className="h-4 w-4" />Delete</Button>
          </div>
        </form>
      )}

      {tab === 'install' && (
        <section className="mt-5 max-w-3xl rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="font-semibold text-white">Add the assistant to your website</h2>
          <p className="mt-1 text-sm text-slate-400">Paste this line just before <code className="text-slate-300">&lt;/body&gt;</code> on every page (or in your site builder&apos;s “custom code” / footer settings).</p>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-sky-200">{snippet}</pre>
          <Button className="mt-3" size="sm" variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(snippet); toast.success('Copied'); } catch { toast.error('Copy failed'); } }}>
            <Copy className="h-4 w-4" />Copy code
          </Button>
          <ul className="mt-5 list-disc space-y-1 pl-5 text-sm text-slate-400">
            <li>WordPress: Appearance → Theme File Editor → footer.php, or a “header &amp; footer scripts” plugin.</li>
            <li>Wix / Squarespace / Shopify: Settings → Custom code → add to the body end.</li>
          </ul>
        </section>
      )}

      {tab === 'conversations' && (
        <section className="mt-5 space-y-3">
          {conversations === null ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-500" /> : conversations.length === 0 ? (
            <p className="text-slate-400">No conversations yet.</p>
          ) : conversations.map((c) => (
            <details key={c.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <summary className="cursor-pointer text-sm text-white">
                {c.messages.find((m) => m.role === 'user')?.content.slice(0, 90) || 'Conversation'}
                <span className="ml-2 text-xs text-slate-500">{new Date(c.updatedAt).toLocaleString()} · {c.messages.length} messages</span>
              </summary>
              <div className="mt-3 space-y-2">
                {c.messages.map((m, i) => (
                  <p key={i} className={`whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${m.role === 'user' ? 'ml-8 bg-sky-500/10 text-sky-100' : 'mr-8 bg-white/5 text-slate-200'}`}>{m.content}</p>
                ))}
              </div>
            </details>
          ))}
        </section>
      )}

      {tab === 'leads' && (
        <section className="mt-5">
          {leads === null ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-500" /> : leads.length === 0 ? (
            <p className="text-slate-400">No leads yet. When a visitor wants to book, buy or be contacted, the assistant asks for their details and they appear here (you also get a notification and an email).</p>
          ) : (
            <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.06]">
              {leads.map((l) => (
                <li key={l.id} className="px-4 py-3 text-sm">
                  <p className="font-medium text-white">{l.name || 'Visitor'} <span className="ml-2 text-xs font-normal text-slate-500">{new Date(l.createdAt).toLocaleString()}</span></p>
                  <p className="mt-1 flex flex-wrap gap-4 text-slate-300">
                    {l.email && <a href={`mailto:${l.email}`} className="flex items-center gap-1 hover:underline"><Mail className="h-3.5 w-3.5" />{l.email}</a>}
                    {l.phone && <a href={`https://wa.me/${l.phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline"><Phone className="h-3.5 w-3.5" />{l.phone}</a>}
                  </p>
                  {l.message && <p className="mt-1 text-slate-400">“{l.message}”</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'preview' && (
        <section className="mt-5">
          <p className="text-sm text-slate-400">This is exactly what visitors see. Messages you send here count towards your monthly total.</p>
          <div className="relative mt-4 h-[660px] max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-100 to-slate-300">
            <iframe title="Assistant preview" src={`/widget/chat/${bot.id}?origin=mbndev.ma`} className="absolute bottom-0 right-0 h-full w-full border-0" />
          </div>
        </section>
      )}
    </div>
  );
}

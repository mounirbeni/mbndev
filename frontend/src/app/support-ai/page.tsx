'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Bot, Globe, Loader2, KeyRound, Users, MessagesSquare } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useSupportAi } from '@/components/support-ai/SupportAiShell';
import { supportAiAPI, type SupportBot } from '@/lib/api';

const errMsg = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

export default function SupportAiBotsPage() {
  const router = useRouter();
  const { account, refresh } = useSupportAi();
  const [bots, setBots] = useState<SupportBot[] | null>(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => supportAiAPI.bots().then(
    ({ data }) => setBots(data.bots),
    () => { toast.error('Could not load your assistants.'); setBots([]); },
  ), []);
  useEffect(() => { load(); }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await supportAiAPI.createBot(name.trim(), url.trim());
      toast.success(`Assistant created — learned ${data.training.pages} page${data.training.pages === 1 ? '' : 's'}`);
      refresh();
      router.push(`/support-ai/bots/${data.bot.id}`);
    } catch (err) {
      toast.error(errMsg(err, 'Could not create the assistant.'));
      setCreating(false);
    }
  };

  const full = account.bots.used >= account.bots.limit;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Your assistants</h1>
      <p className="mt-1 text-slate-400">Each assistant learns one website and answers its visitors 24/7.</p>

      {!account.hasOpenaiKey && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Add your OpenAI API key so your assistants can answer. <Link href="/support-ai/settings" className="font-semibold underline">Open Settings</Link></p>
        </div>
      )}

      {!full && (
        <form onSubmit={create} className="mt-6 grid gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:grid-cols-[1fr_1.4fr_auto]">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Business name" aria-label="Business name" maxLength={80} required
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Website, e.g. riad-yasmine.com" aria-label="Website" required
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none" />
          <Button type="submit" loading={creating}>Create assistant</Button>
          {creating && <p className="flex items-center gap-2 text-sm text-slate-400 sm:col-span-3"><Loader2 className="h-4 w-4 animate-spin" />Reading the website… this can take up to a minute.</p>}
        </form>
      )}
      <p className="mt-2 text-xs text-slate-500">{account.bots.used} of {account.bots.limit} assistant{account.bots.limit === 1 ? '' : 's'} used on your {account.plan} plan.</p>

      {bots === null ? (
        <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>
      ) : bots.length > 0 && (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {bots.map((b) => (
            <li key={b.id}>
              <Link href={`/support-ai/bots/${b.id}`} className="block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/15">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: b.color }}><Bot className="h-5 w-5" /></span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{b.name}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-slate-500"><Globe className="h-3 w-3" />{b.websiteUrl.replace(/^https?:\/\//, '')}</p>
                  </div>
                  {!b.active && <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase text-slate-400">Paused</span>}
                </div>
                <p className="mt-4 flex gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><MessagesSquare className="h-3.5 w-3.5" />{b._count?.conversations ?? 0} chats</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{b._count?.leads ?? 0} leads</span>
                  <span>{b.pageCount} pages learned</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

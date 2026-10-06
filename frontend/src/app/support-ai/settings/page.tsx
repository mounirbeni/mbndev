'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Circle, ExternalLink, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useSupportAi } from '@/components/support-ai/SupportAiShell';
import { supportAiAPI } from '@/lib/api';

export default function SupportAiSettingsPage() {
  const { account, refresh } = useSupportAi();
  const [key, setKey] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async (value: string) => {
    setSaving(true);
    try {
      await supportAiAPI.saveSettings(value);
      setKey('');
      await refresh();
      toast.success('Saved');
    } catch (err) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Settings</h1>

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="font-semibold text-white">Your plan</h2>
        <p className="mt-1 text-sm text-slate-400">
          <span className="font-semibold capitalize text-white">{account.plan}</span>
          {` · ${account.bots.used}/${account.bots.limit} assistants · ${account.messages.used}/${account.messages.limit} messages this month`}
        </p>
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="flex items-center gap-1.5 font-semibold text-white">
          {account.hasOpenaiKey ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-slate-600" />}
          OpenAI API key
        </h2>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-400">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          Your assistants answer with your own key — you pay OpenAI directly (a few cents per hundred chats). Encrypted at rest. A key saved in Leads AI or Local Growth is used automatically.
        </p>
        <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); if (key.trim()) save(key.trim()); }}>
          <input type="password" autoComplete="off" value={key} onChange={(e) => setKey(e.target.value)} placeholder={account.hasOpenaiKey ? 'Saved — paste a new key to replace it' : 'sk-…'}
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-sm text-white placeholder:font-sans placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none" />
          <Button type="submit" loading={saving} disabled={!key.trim()}>Save key</Button>
        </form>
        <p className="mt-3 text-xs text-slate-500">
          Create one at <a className="text-sky-300 underline" href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com/api-keys <ExternalLink className="inline h-3 w-3" /></a>.
        </p>
      </section>
    </div>
  );
}

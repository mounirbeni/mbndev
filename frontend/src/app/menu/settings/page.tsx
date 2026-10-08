'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Circle, ExternalLink, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useMenuApp } from '@/components/menu/MenuShell';
import { menuAPI } from '@/lib/api';

export default function MenuSettingsPage() {
  const { account, refresh } = useMenuApp();
  const [key, setKey] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async (value: string) => {
    setSaving(true);
    try {
      await menuAPI.saveSettings(value.trim());
      setKey('');
      await refresh();
      toast.success(value ? 'Saved' : 'Key removed');
    } catch (err) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Settings</h1>
      <p className="flex items-start gap-1.5 text-sm text-slate-400">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        MBN Menu works without any key. The optional OpenAI key turns on one-click translation of your whole menu into other languages — you pay OpenAI directly (a full menu costs a few cents). Encrypted at rest. A key saved in another MBN product is used automatically.
      </p>
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="flex items-center gap-1.5 font-semibold text-white">
          {account.hasOpenaiKey ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-slate-600" />}
          OpenAI API key
        </h2>
        <p className="mt-1 text-sm text-slate-400">Used only when you press “Translate with AI” in the menu editor.</p>
        <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); if (key.trim()) save(key); }}>
          <input type="password" autoComplete="off" value={key} onChange={(e) => setKey(e.target.value)}
            placeholder={account.hasOpenaiKey ? 'Saved — paste a new key to replace it' : 'sk-…'} aria-label="OpenAI API key"
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-sm text-white placeholder:font-sans placeholder:text-slate-500 focus:border-violet-400/50 focus:outline-none" />
          <Button type="submit" loading={saving} disabled={!key.trim()}>Save key</Button>
        </form>
        <p className="mt-3 text-xs text-slate-500">
          Get one at <a className="text-violet-300 underline" href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com/api-keys <ExternalLink className="inline h-3 w-3" /></a>.
        </p>
      </section>
    </div>
  );
}

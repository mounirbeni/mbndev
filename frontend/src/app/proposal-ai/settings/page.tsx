'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Circle, ExternalLink, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useProposalAi } from '@/components/proposal-ai/ProposalShell';
import { proposalAPI } from '@/lib/api';
import { CURRENCIES } from '@/lib/proposals';

const fieldCls = 'mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-400/50 focus:outline-none';
const errMsg = (err: unknown) => (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Could not save.';

export default function ProposalSettingsPage() {
  const { account, refresh } = useProposalAi();
  const [brand, setBrand] = useState({
    brandName: account.brandName, brandColor: account.brandColor, brandEmail: account.brandEmail, brandWebsite: account.brandWebsite, currency: account.currency,
  });
  const [key, setKey] = useState('');
  const [saving, setSaving] = useState<'brand' | 'key' | null>(null);

  const saveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving('brand');
    try { await proposalAPI.saveSettings(brand); await refresh(); toast.success('Saved'); } catch (err) { toast.error(errMsg(err)); } finally { setSaving(null); }
  };
  const saveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    setSaving('key');
    try { await proposalAPI.saveSettings({ openaiKey: key.trim() }); setKey(''); await refresh(); toast.success('Saved'); } catch (err) { toast.error(errMsg(err)); } finally { setSaving(null); }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Settings</h1>

      <form onSubmit={saveBrand} className="grid gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h2 className="font-semibold text-white">Your brand</h2>
          <p className="mt-1 text-sm text-slate-400">Shown at the top of every proposal you send.</p>
        </div>
        <label className="block"><span className="text-sm font-medium text-white">Business / your name</span>
          <input className={fieldCls} value={brand.brandName} onChange={(e) => setBrand({ ...brand, brandName: e.target.value })} maxLength={80} placeholder="Atlas Web Studio" />
        </label>
        <label className="block"><span className="text-sm font-medium text-white">Default currency</span>
          <select className={`${fieldCls} bg-[#0b0a14]`} value={brand.currency} onChange={(e) => setBrand({ ...brand, currency: e.target.value })}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="block"><span className="text-sm font-medium text-white">Contact email</span>
          <input className={fieldCls} type="email" value={brand.brandEmail} onChange={(e) => setBrand({ ...brand, brandEmail: e.target.value })} maxLength={160} placeholder="hello@yourstudio.com" />
        </label>
        <label className="block"><span className="text-sm font-medium text-white">Website</span>
          <input className={fieldCls} value={brand.brandWebsite} onChange={(e) => setBrand({ ...brand, brandWebsite: e.target.value })} maxLength={200} placeholder="https://yourstudio.com" />
        </label>
        <div className="flex items-end justify-between gap-3 sm:col-span-2">
          <label className="block"><span className="text-sm font-medium text-white">Brand colour</span>
            <input type="color" value={brand.brandColor} onChange={(e) => setBrand({ ...brand, brandColor: e.target.value })} className="mt-1.5 block h-10 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent" aria-label="Brand colour" />
          </label>
          <Button type="submit" loading={saving === 'brand'}>Save brand</Button>
        </div>
      </form>

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="flex items-center gap-1.5 font-semibold text-white">
          {account.hasOpenaiKey ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-slate-600" />}
          OpenAI API key
        </h2>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-400">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          Proposals are written with your own key — about a cent each. Encrypted at rest. A key saved in another MBN product is used automatically.
        </p>
        <form onSubmit={saveKey} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input type="password" autoComplete="off" value={key} onChange={(e) => setKey(e.target.value)} aria-label="OpenAI API key"
            placeholder={account.hasOpenaiKey ? 'Saved — paste a new key to replace it' : 'sk-…'}
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-sm text-white placeholder:font-sans placeholder:text-slate-500 focus:border-fuchsia-400/50 focus:outline-none" />
          <Button type="submit" loading={saving === 'key'} disabled={!key.trim()}>Save key</Button>
        </form>
        <p className="mt-3 text-xs text-slate-500">
          Create one at <a className="text-fuchsia-300 underline" href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com/api-keys <ExternalLink className="inline h-3 w-3" /></a>.
        </p>
      </section>
    </div>
  );
}

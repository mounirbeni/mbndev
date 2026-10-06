'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Circle, ExternalLink, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useLocalGrowth } from '@/components/local-growth/LocalGrowthShell';
import { localGrowthAPI } from '@/lib/api';

const errMsg = (err: unknown) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Could not save.';

const inputCls = 'mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400/50 focus:outline-none';

function KeyState({ has }: { has: boolean }) {
  return has ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-slate-600" />;
}

export default function LocalGrowthSettingsPage() {
  const { account, setAccount } = useLocalGrowth();
  const [googleKey, setGoogleKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [brandName, setBrandName] = useState(account.brandName);
  const [brandUrl, setBrandUrl] = useState(account.brandUrl);
  const [saving, setSaving] = useState<string | null>(null);

  const save = async (what: string, payload: Parameters<typeof localGrowthAPI.saveSettings>[0]) => {
    setSaving(what);
    try {
      const { data } = await localGrowthAPI.saveSettings(payload);
      setAccount(data.account);
      setGoogleKey('');
      setOpenaiKey('');
      toast.success('Saved');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(null);
    }
  };

  const r = account.reports;

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Settings</h1>

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="font-semibold text-white">Your plan</h2>
        <p className="mt-1 text-sm text-slate-400">
          <span className="font-semibold capitalize text-white">{account.plan}</span>{' · '}
          {r.limit === null ? 'Unlimited reports' : `${r.used} of ${r.limit} reports used this month`}
        </p>
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="font-semibold text-white">Your API keys</h2>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-400">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          Encrypted and only used for your reports. Keys saved in MBN Leads AI are used automatically.
        </p>
        <form className="mt-4 space-y-4" onSubmit={(e) => {
          e.preventDefault();
          const p: { googleKey?: string; openaiKey?: string } = {};
          if (googleKey.trim()) p.googleKey = googleKey.trim();
          if (openaiKey.trim()) p.openaiKey = openaiKey.trim();
          if (Object.keys(p).length) save('keys', p);
        }}>
          <label className="block">
            <span className="flex items-center gap-1.5 text-sm font-medium text-white"><KeyState has={account.hasGoogleKey} />Google Places API key (required)</span>
            <input type="password" autoComplete="off" value={googleKey} onChange={(e) => setGoogleKey(e.target.value)} placeholder={account.hasGoogleKey ? 'Saved — paste a new key to replace it' : 'AIza…'} className={`${inputCls} font-mono`} />
          </label>
          <label className="block">
            <span className="flex items-center gap-1.5 text-sm font-medium text-white"><KeyState has={account.hasOpenaiKey} />OpenAI API key (optional — AI summary)</span>
            <input type="password" autoComplete="off" value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} placeholder={account.hasOpenaiKey ? 'Saved — paste a new key to replace it' : 'sk-…'} className={`${inputCls} font-mono`} />
          </label>
          <Button type="submit" loading={saving === 'keys'} disabled={!googleKey.trim() && !openaiKey.trim()}>Save keys</Button>
        </form>
        <p className="mt-4 text-xs text-slate-500">
          Google key: create a project in the <a className="text-emerald-300 underline" href="https://console.cloud.google.com/apis/library/places.googleapis.com" target="_blank" rel="noopener noreferrer">Google Cloud console <ExternalLink className="inline h-3 w-3" /></a>, enable <em>Places API (New)</em>, then <em>Credentials → Create API key</em>.
        </p>
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="font-semibold text-white">Report branding <span className="ml-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-300">Agency</span></h2>
        <p className="mt-1 text-sm text-slate-400">
          {account.plan === 'agency' ? 'Reports and shared links show “Prepared by” your business.' : 'Available on the Agency plan — reports show your business name instead of MBN Local Growth.'}
        </p>
        <form className="mt-4 space-y-4" onSubmit={(e) => { e.preventDefault(); save('brand', { brandName, brandUrl }); }}>
          <label className="block">
            <span className="text-sm font-medium text-white">Business name</span>
            <input value={brandName} onChange={(e) => setBrandName(e.target.value)} maxLength={80} placeholder="Your agency" disabled={account.plan !== 'agency'} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-white">Website (optional)</span>
            <input value={brandUrl} onChange={(e) => setBrandUrl(e.target.value)} maxLength={200} placeholder="https://youragency.com" disabled={account.plan !== 'agency'} className={inputCls} />
          </label>
          <Button type="submit" loading={saving === 'brand'} disabled={account.plan !== 'agency'}>Save branding</Button>
        </form>
      </section>
    </div>
  );
}

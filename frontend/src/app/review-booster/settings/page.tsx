'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Circle, ExternalLink, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useReviewBooster } from '@/components/review-booster/ReviewBoosterShell';
import { reviewBoosterAPI } from '@/lib/api';

const KEYS = [
  {
    field: 'googleKey' as const, flag: 'hasGoogleKey' as const, title: 'Google Places API key', placeholder: 'AIza…',
    text: 'Used to watch your Google rating and new reviews every day. Google gives a free monthly allowance that usually covers this.',
    help: { label: 'Google Cloud console', href: 'https://console.cloud.google.com/apis/library/places.googleapis.com' },
  },
  {
    field: 'openaiKey' as const, flag: 'hasOpenaiKey' as const, title: 'OpenAI API key', placeholder: 'sk-…',
    text: 'Used to draft replies to your reviews — about a cent per hundred replies.',
    help: { label: 'platform.openai.com/api-keys', href: 'https://platform.openai.com/api-keys' },
  },
];

export default function ReviewBoosterSettingsPage() {
  const { account, refresh } = useReviewBooster();
  const [values, setValues] = useState({ googleKey: '', openaiKey: '' });
  const [saving, setSaving] = useState<string | null>(null);

  const save = async (field: 'googleKey' | 'openaiKey') => {
    setSaving(field);
    try {
      await reviewBoosterAPI.saveSettings({ [field]: values[field].trim() });
      setValues((v) => ({ ...v, [field]: '' }));
      await refresh();
      toast.success('Saved');
    } catch (err) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Could not save.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Settings</h1>
      <p className="flex items-start gap-1.5 text-sm text-slate-400">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        Collecting reviews needs no keys. These optional keys turn on review monitoring and AI replies — you pay Google and OpenAI directly. Encrypted at rest. Keys saved in MBN Local Growth, Leads AI or Support AI are used automatically.
      </p>

      {KEYS.map((k) => (
        <section key={k.field} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="flex items-center gap-1.5 font-semibold text-white">
            {account[k.flag] ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-slate-600" />}
            {k.title}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{k.text}</p>
          <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); if (values[k.field].trim()) save(k.field); }}>
            <input type="password" autoComplete="off" value={values[k.field]} onChange={(e) => setValues({ ...values, [k.field]: e.target.value })}
              placeholder={account[k.flag] ? 'Saved — paste a new key to replace it' : k.placeholder} aria-label={k.title}
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-sm text-white placeholder:font-sans placeholder:text-slate-500 focus:border-amber-400/50 focus:outline-none" />
            <Button type="submit" loading={saving === k.field} disabled={!values[k.field].trim()}>Save key</Button>
          </form>
          <p className="mt-3 text-xs text-slate-500">
            Get one at <a className="text-amber-300 underline" href={k.help.href} target="_blank" rel="noopener noreferrer">{k.help.label} <ExternalLink className="inline h-3 w-3" /></a>.
          </p>
        </section>
      ))}
    </div>
  );
}

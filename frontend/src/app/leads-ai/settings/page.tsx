'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Circle, ExternalLink, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useLeadsAi } from '@/components/leads-ai/LeadsAiShell';
import { leadsAiAPI } from '@/lib/api';

const errMsg = (err: unknown) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Could not save.';

function KeyField({ label, has, placeholder, value, onChange }: { label: string; has: boolean; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-sm font-medium text-white">
        {has ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-slate-600" />}
        {label}
        <span className="text-xs font-normal text-slate-500">{has ? '— saved (hidden)' : '— not set'}</span>
      </span>
      <input
        type="password"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={has ? 'Paste a new key to replace it' : placeholder}
        className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-sm text-white placeholder:font-sans placeholder:text-slate-500 focus:border-violet-400/50 focus:outline-none"
      />
    </label>
  );
}

export default function LeadsAiSettingsPage() {
  const { account, setAccount } = useLeadsAi();
  const [googleKey, setGoogleKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async (payload: { googleKey?: string; openaiKey?: string }) => {
    setSaving(true);
    try {
      const { data } = await leadsAiAPI.saveKeys(payload);
      setAccount(data.account);
      setGoogleKey('');
      setOpenaiKey('');
      toast.success('Saved');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  if (!account) return null;
  const s = account.searches;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Settings</h1>

      <section className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="font-semibold text-white">Your plan</h2>
        <p className="mt-1 text-sm text-slate-400">
          <span className="font-semibold capitalize text-white">{account.plan}</span>
          {' · '}
          {s.limit === null ? 'Unlimited searches' : `${s.used} of ${s.limit} searches used this month`}
        </p>
      </section>

      <section className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="font-semibold text-white">Your API keys</h2>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-400">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          Your keys are encrypted and only used for your own searches. You pay Google and OpenAI directly — usually little or nothing at normal volumes.
        </p>
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const payload: { googleKey?: string; openaiKey?: string } = {};
            if (googleKey.trim()) payload.googleKey = googleKey.trim();
            if (openaiKey.trim()) payload.openaiKey = openaiKey.trim();
            if (Object.keys(payload).length) save(payload);
          }}
        >
          <KeyField label="Google Places API key (required)" has={account.hasGoogleKey} placeholder="AIza…" value={googleKey} onChange={setGoogleKey} />
          <KeyField label="OpenAI API key (optional — AI-written messages)" has={account.hasOpenaiKey} placeholder="sk-…" value={openaiKey} onChange={setOpenaiKey} />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={saving} disabled={!googleKey.trim() && !openaiKey.trim()}>Save keys</Button>
            {account.hasOpenaiKey && <Button type="button" variant="ghost" onClick={() => save({ openaiKey: '' })}>Remove OpenAI key</Button>}
          </div>
        </form>
      </section>

      <section className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-sm text-slate-300">
        <h2 className="font-semibold text-white">How to get your Google key (≈3 minutes)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Open the <a className="text-violet-300 underline" href="https://console.cloud.google.com/projectcreate" target="_blank" rel="noopener noreferrer">Google Cloud console <ExternalLink className="inline h-3 w-3" /></a> and create a project.</li>
          <li>Enable <a className="text-violet-300 underline" href="https://console.cloud.google.com/apis/library/places.googleapis.com" target="_blank" rel="noopener noreferrer">Places API (New) <ExternalLink className="inline h-3 w-3" /></a> (billing must be enabled on the project).</li>
          <li>Go to <em>APIs &amp; Services → Credentials → Create credentials → API key</em>, copy it and paste it above.</li>
          <li>Recommended: restrict the key to <em>Places API (New)</em>.</li>
        </ol>
        <h2 className="mt-5 font-semibold text-white">Optional: OpenAI key</h2>
        <p className="mt-2">Create one at <a className="text-violet-300 underline" href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com/api-keys <ExternalLink className="inline h-3 w-3" /></a>. Without it you still get ready-to-send template messages built from each audit.</p>
      </section>
    </div>
  );
}

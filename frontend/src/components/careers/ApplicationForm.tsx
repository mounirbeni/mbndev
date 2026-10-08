'use client';

import { useRef, useState } from 'react';
import { CheckCircle2, FileText, Loader2, Send, UploadCloud, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { careersAPI } from '@/lib/api';
import {
  AVAILABILITY_OPTIONS, CV_ACCEPT, CV_MAX_BYTES, EXPERIENCE_OPTIONS, HOURS_OPTIONS,
  LANGUAGE_OPTIONS, ROLE_QUESTIONS, ROLE_TITLES, type CareerRole,
} from '@/lib/careers';

const inputCls = 'w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 transition-colors focus:border-violet-400/50 focus:outline-none';
const selectCls = `${inputCls} bg-[#0b0a14]`;
const labelCls = 'mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400';

const errMsg = (err: unknown) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message
  || 'Something went wrong. Please try again in a moment.';

const EMPTY = {
  fullName: '', email: '', phone: '', location: '',
  experienceYears: '', availability: '', weeklyHours: '', expectedRate: '',
  portfolioUrl: '', linkedinUrl: '', message: '',
};

interface Props {
  role: CareerRole | '';
  onRoleChange: (role: CareerRole) => void;
}

export default function ApplicationForm({ role, onRoleChange }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [languages, setLanguages] = useState<string[]>([]);
  const [cv, setCv] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const pickFile = (file: File | undefined) => {
    setError('');
    if (!file) return;
    if (!/\.(pdf|docx?)$/i.test(file.name)) { setError('Your CV must be a PDF or Word file.'); return; }
    if (file.size > CV_MAX_BYTES) { setError('Your CV must be under 4 MB.'); return; }
    setCv(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!role) { setError('Please choose a role.'); return; }
    if (form.fullName.trim().length < 2) { setError('Please enter your full name.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) { setError('Please enter a valid email address.'); return; }
    if (!form.experienceYears) { setError('Please choose your years of experience.'); return; }
    if (!form.availability) { setError('Please choose when you can start.'); return; }
    if (ROLE_QUESTIONS[role].some((q) => q.required && !answers[q.key]?.trim())) { setError('Please answer all the required questions.'); return; }
    if (!cv) { setError('Please attach your CV (PDF or Word).'); return; }
    if (!consent) { setError('Please accept that we store your application.'); return; }

    const body = new FormData();
    body.append('role', role);
    Object.entries(form).forEach(([k, v]) => body.append(k, v));
    body.append('languages', JSON.stringify(languages));
    body.append('answers', JSON.stringify(answers));
    body.append('cv', cv);

    setProgress(0);
    try {
      await careersAPI.apply(body, setProgress);
      setDone(form.fullName.split(' ')[0] || 'there');
      // The form collapses into a short thank-you card — bring it into view.
      requestAnimationFrame(() => document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setProgress(null);
    }
  };

  if (done) {
    return (
      <div className="glass rounded-3xl border border-emerald-500/25 p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
        <h3 className="mt-5 text-2xl font-black text-white">Thanks, {done}!</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
          Your application for <span className="text-white">{role ? ROLE_TITLES[role] : 'MBN DEV'}</span> has been received.
          We review every application and will reply by email if your profile is a fit.
        </p>
      </div>
    );
  }

  const questions = role ? ROLE_QUESTIONS[role] : [];
  const sending = progress !== null;

  return (
    <form onSubmit={submit} noValidate className="glass space-y-6 rounded-3xl border border-white/8 p-6 sm:p-8">
      <div>
        <label htmlFor="ap-role" className={labelCls}>Role *</label>
        <select id="ap-role" className={selectCls} value={role} onChange={(e) => { onRoleChange(e.target.value as CareerRole); setAnswers({}); }} required>
          <option value="" disabled>Choose the role you are applying for</option>
          {(Object.keys(ROLE_TITLES) as CareerRole[]).map((r) => <option key={r} value={r}>{ROLE_TITLES[r]}</option>)}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ap-name" className={labelCls}>Full name *</label>
          <input id="ap-name" className={inputCls} value={form.fullName} onChange={set('fullName')} maxLength={100} autoComplete="name" required />
        </div>
        <div>
          <label htmlFor="ap-email" className={labelCls}>Email *</label>
          <input id="ap-email" type="email" className={inputCls} value={form.email} onChange={set('email')} maxLength={160} autoComplete="email" required />
        </div>
        <div>
          <label htmlFor="ap-phone" className={labelCls}>Phone (optional)</label>
          <input id="ap-phone" type="tel" className={inputCls} value={form.phone} onChange={set('phone')} maxLength={30} autoComplete="tel" placeholder="+212 6…" />
        </div>
        <div>
          <label htmlFor="ap-location" className={labelCls}>City & country</label>
          <input id="ap-location" className={inputCls} value={form.location} onChange={set('location')} maxLength={100} placeholder="e.g. Casablanca, Morocco" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="ap-exp" className={labelCls}>Experience *</label>
          <select id="ap-exp" className={selectCls} value={form.experienceYears} onChange={set('experienceYears')} required>
            <option value="" disabled>Years of experience</option>
            {EXPERIENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="ap-start" className={labelCls}>Can start *</label>
          <select id="ap-start" className={selectCls} value={form.availability} onChange={set('availability')} required>
            <option value="" disabled>When can you start?</option>
            {AVAILABILITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="ap-hours" className={labelCls}>Weekly time</label>
          <select id="ap-hours" className={selectCls} value={form.weeklyHours} onChange={set('weeklyHours')}>
            <option value="">Hours per week</option>
            {HOURS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {questions.length > 0 && (
        <div className="space-y-5 rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">About your work as {ROLE_TITLES[role as CareerRole]}</p>
          <div className="grid gap-5 sm:grid-cols-2">
            {questions.map((q) => (
              <div key={q.key} className={questions.length === 1 ? 'sm:col-span-2' : ''}>
                <label htmlFor={`ap-q-${q.key}`} className={labelCls}>{q.label}{q.required ? ' *' : ''}</label>
                <input
                  id={`ap-q-${q.key}`} className={inputCls} placeholder={q.placeholder} maxLength={q.type === 'url' ? 300 : 500}
                  inputMode={q.type === 'url' ? 'url' : undefined} required={q.required}
                  value={answers[q.key] ?? ''} onChange={(e) => setAnswers((a) => ({ ...a, [q.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ap-portfolio" className={labelCls}>Portfolio / website</label>
          <input id="ap-portfolio" inputMode="url" className={inputCls} value={form.portfolioUrl} onChange={set('portfolioUrl')} maxLength={300} placeholder="https://" />
        </div>
        <div>
          <label htmlFor="ap-linkedin" className={labelCls}>LinkedIn</label>
          <input id="ap-linkedin" inputMode="url" className={inputCls} value={form.linkedinUrl} onChange={set('linkedinUrl')} maxLength={300} placeholder="linkedin.com/in/…" />
        </div>
        <div>
          <label htmlFor="ap-rate" className={labelCls}>Expected rate</label>
          <input id="ap-rate" className={inputCls} value={form.expectedRate} onChange={set('expectedRate')} maxLength={80} placeholder="e.g. $20/hour or per project" />
        </div>
        <div>
          <span className={labelCls}>Languages</span>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((l) => {
              const on = languages.includes(l);
              return (
                <button
                  key={l} type="button" aria-pressed={on}
                  onClick={() => setLanguages((ls) => (on ? ls.filter((x) => x !== l) : [...ls, l]))}
                  className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${on ? 'border-violet-400/60 bg-violet-500/20 text-white' : 'border-white/10 text-slate-400 hover:border-white/25'}`}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="ap-message" className={labelCls}>Tell us about yourself</label>
        <textarea id="ap-message" rows={4} className={inputCls} value={form.message} onChange={set('message')} maxLength={2000}
          placeholder="What kind of projects do you enjoy? Anything we should know?" />
      </div>

      <div>
        <span className={labelCls}>CV *</span>
        <input ref={fileRef} type="file" accept={CV_ACCEPT} className="sr-only" aria-label="Upload your CV" onChange={(e) => pickFile(e.target.files?.[0])} />
        {cv ? (
          <div className="flex items-center gap-3 rounded-xl border border-violet-500/30 bg-violet-500/[0.08] px-4 py-3">
            <FileText className="h-5 w-5 shrink-0 text-violet-300" />
            <span className="min-w-0 flex-1 truncate text-sm text-white">{cv.name}</span>
            <span className="text-xs text-slate-500">{(cv.size / 1024 / 1024).toFixed(1)} MB</span>
            <button type="button" aria-label="Remove CV" onClick={() => { setCv(null); if (fileRef.current) fileRef.current.value = ''; }} className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button" onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files?.[0]); }}
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-white/12 px-4 py-8 text-center transition-colors hover:border-violet-400/50 hover:bg-white/[0.02]"
          >
            <UploadCloud className="h-7 w-7 text-violet-300" />
            <span className="text-sm font-medium text-white">Upload your CV</span>
            <span className="text-xs text-slate-500">PDF or Word · max 4 MB</span>
          </button>
        )}
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-slate-400">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-violet-500" />
        I agree that MBN DEV stores my application and CV to review it for this and future roles. I can ask for it to be deleted at any time.
      </label>

      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

      <Button type="submit" size="lg" fullWidth disabled={sending}>
        {sending
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending… {progress ? `${progress}%` : ''}</>
          : <><Send className="h-4 w-4" /> Submit application</>}
      </Button>
    </form>
  );
}

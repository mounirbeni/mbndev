import type { Metadata } from 'next';
import Link from 'next/link';
import { PenLine, Send, Eye, FileSignature, Check, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';
import { productQuestionWA } from '@/lib/products';

export const metadata: Metadata = {
  title: 'MBN Proposal AI — AI-written proposals clients sign online',
  description: 'Turn a short brief into a complete, branded proposal with phases, pricing and optional extras. Send a link, know when it’s opened, get it signed online. One-time price.',
  alternates: { canonical: 'https://mbndev.ma/products/proposal-ai' },
  openGraph: {
    title: 'MBN Proposal AI',
    description: 'Win more clients — AI-written proposals they can open, customise and sign online.',
    url: 'https://mbndev.ma/products/proposal-ai',
    type: 'website',
  },
};

const STEPS = [
  { icon: PenLine, title: 'Describe the project', text: 'A few lines about the client and what they need. Budget optional.' },
  { icon: FileSignature, title: 'Get a full proposal', text: 'Overview, solution, phases with timing, priced items with optional extras, and terms — in 4 languages. Edit anything.' },
  { icon: Send, title: 'Send a link', text: 'A branded page in your colours, sent by WhatsApp or email in one click.' },
  { icon: Eye, title: 'Know & close', text: 'Alerts when it’s opened and when it’s signed, plus a reminder to follow up after 3 days.' },
];

const ITEMS = [
  { name: 'Website design & development (6 pages, FR/EN)', price: '1,400 €' },
  { name: 'Direct booking engine + payment', price: '450 €' },
  { name: 'Professional photo shoot', price: '250 €', optional: true },
];

const PLANS = [
  { id: 'starter', name: 'Starter', price: 37, features: ['10 AI proposals / month', 'Unlimited edits & blank proposals', 'Branded proposal pages', 'Online signature', 'Opened / accepted alerts + follow-up reminders'] },
  { id: 'pro', name: 'Pro', price: 67, featured: true, features: ['Everything in Starter', 'Unlimited AI proposals'] },
  { id: 'agency', name: 'Agency', price: 97, features: ['Everything in Pro', 'Reusable templates for your services', 'No “Made with” branding'] },
];

const FAQ = [
  { q: 'Why not just ask ChatGPT?', a: 'ChatGPT gives you text to copy into a document. Proposal AI gives you a finished, branded proposal page with a live pricing table, optional extras the client can tick, online acceptance with their name and date, and alerts when it’s opened or signed — so you know exactly when to follow up.' },
  { q: 'Is the online acceptance legally binding?', a: 'The client types their full name and ticks “I accept”, and the date and time are recorded — a simple electronic acceptance that is usually enough for quotes and service agreements. For high-value contracts, add your own contract as well.' },
  { q: 'Do I need an OpenAI key?', a: 'Yes, for AI writing — you pay OpenAI directly, about one cent per proposal. You can also start from a blank proposal without any key. A key saved in another MBN product is reused.' },
  { q: 'Can my client choose options?', a: 'Yes. Mark any item as optional and the client ticks the extras they want — the total updates live and the accepted total is recorded.' },
];

export default function ProposalAiProductPage() {
  const wa = productQuestionWA('MBN Proposal AI');
  return (
    <PublicLayout>
      <section className="relative px-4 pb-16 pt-32 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="hero-enter">
            <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-300">
              <FileSignature className="h-3 w-3" /> MBN Proposal AI
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Proposals that <span className="gradient-text">close the deal</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
              Describe the project in a few lines. Get a complete, branded proposal your client can open, customise and sign online — and know the moment they do.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#pricing" className="inline-flex items-center gap-2 rounded-full bg-[#ede6ff] px-6 py-3 text-sm font-semibold text-[#14092b] hover:bg-white">
                See plans &amp; buy <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/proposal-ai" className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-slate-200 hover:border-white/30">
                I have access — open the app
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-14 max-w-xl overflow-hidden rounded-3xl bg-white text-left text-slate-800 shadow-[0_30px_80px_rgba(217,70,239,0.15)]">
            <div className="bg-[#7c3aed] px-7 py-6 text-white">
              <p className="text-xs opacity-80">Atlas Web Studio</p>
              <p className="mt-3 text-2xl font-bold">New website & direct bookings</p>
              <p className="mt-2 text-sm opacity-80">Prepared for Riad Example · Valid until 30 June</p>
            </div>
            <ul className="divide-y divide-slate-100 px-7 py-3 text-sm">
              {ITEMS.map((it) => (
                <li key={it.name} className="flex items-center gap-3 py-3">
                  <span className={`h-4 w-4 shrink-0 rounded border ${it.optional ? 'border-slate-300' : 'border-transparent'}`} />
                  <span className="flex-1">{it.name}{it.optional && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">Optional</span>}</span>
                  <span className="font-semibold">{it.price}</span>
                </li>
              ))}
              <li className="flex justify-between py-3 font-bold"><span>Total</span><span className="text-[#7c3aed]">1,850 €</span></li>
            </ul>
            <div className="border-t border-slate-100 px-7 py-5">
              <p className="rounded-xl border border-slate-300 px-4 py-2.5 font-serif italic text-slate-400">Your full name</p>
              <p className="mt-3 w-fit rounded-full bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white">Accept & sign · 1,850 €</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">From brief to signature</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <span className="font-mono text-xs text-slate-600">0{i + 1}</span>
                <Icon className="mt-2 h-6 w-6 text-fuchsia-400" />
                <h3 className="mt-3 font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.02] p-7 sm:flex-row sm:items-center">
          <KeyRound className="h-10 w-10 shrink-0 text-fuchsia-300" />
          <div>
            <h2 className="text-xl font-bold text-white">Pay once — not every month</h2>
            <p className="mt-1.5 text-slate-400">Proposal tools usually cost $19–49 a month. Proposal AI is a one-time purchase that runs on your own OpenAI key — about a cent per proposal.</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24" id="pricing">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">Simple, one-time pricing</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <div key={p.id} className={`flex flex-col rounded-3xl border p-7 ${p.featured ? 'border-fuchsia-400/40 bg-fuchsia-500/[0.06]' : 'border-white/10 bg-white/[0.02]'}`}>
                {p.featured && <span className="mb-3 w-fit rounded-full bg-fuchsia-500/20 px-2.5 py-1 text-xs font-semibold text-fuchsia-200">Most popular</span>}
                <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                <p className="mt-3"><span className="text-5xl font-black text-white">${p.price}</span> <span className="text-sm text-slate-500">one-time</span></p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-slate-300"><Check className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-400" />{f}</li>)}
                </ul>
                <Link href={`/products/proposal-ai/buy?plan=${p.id}`} className={`mt-7 rounded-full px-5 py-3 text-center text-sm font-semibold ${p.featured ? 'bg-[#ede6ff] text-[#14092b] hover:bg-white' : 'border border-white/15 text-slate-200 hover:border-white/30'}`}>
                  Buy {p.name} — ${p.price}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 flex flex-wrap items-center justify-center gap-1.5 text-center text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5" /> Pay by bank transfer, PayPal or TapTapSend — activated as soon as the payment is verified. Questions? <a href={wa} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-300">Chat on WhatsApp</a>
          </p>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold text-white">Questions</h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <summary className="cursor-pointer list-none font-medium text-white">{f.q}</summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

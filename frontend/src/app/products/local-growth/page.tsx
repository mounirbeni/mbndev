import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, BarChart3, ListChecks, Share2, Check, ArrowRight, TrendingUp, KeyRound, ShieldCheck } from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';
import { productQuestionWA } from '@/lib/products';

export const metadata: Metadata = {
  title: 'MBN Local Growth — Online presence reports for local businesses',
  description: 'Compare any local business with its nearest competitors on Google, check its website and profile, and get a prioritised action plan — shareable and printable.',
  alternates: { canonical: 'https://mbndev.ma/products/local-growth' },
  openGraph: {
    title: 'MBN Local Growth',
    description: 'See exactly how a local business compares to its competitors online — and what to fix first.',
    url: 'https://mbndev.ma/products/local-growth',
    type: 'website',
  },
};

const STEPS = [
  { icon: Search, title: 'Find the business', text: 'Type its name and city. Pick the right one from Google.' },
  { icon: BarChart3, title: 'Get the benchmark', text: 'Rating, reviews, website and profile compared with the 5 closest competitors.' },
  { icon: ListChecks, title: 'Follow the plan', text: 'A prioritised action plan with real numbers: “+120 reviews in 90 days”, “add direct booking”…' },
  { icon: Share2, title: 'Share or print', text: 'Send a private link or save a PDF. Agency plan: under your own name.' },
];

const EXAMPLE = [
  { p: 'high', t: 'Collect more Google reviews', d: 'You have 30 reviews; nearby competitors have about 150. Aim for +120 in the next 90 days.' },
  { p: 'high', t: 'Take direct bookings', d: 'Bookings go through third-party platforms that take a commission on every reservation.' },
  { p: 'medium', t: 'Get fresh reviews', d: 'Your latest review is 7 months old.' },
  { p: 'low', t: 'Add more photos to Google', d: 'Only 2 photos visible.' },
];
const PCLS: Record<string, string> = {
  high: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  medium: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  low: 'border-white/10 bg-white/5 text-slate-300',
};

const PLANS = [
  { id: 'starter', name: 'Starter', price: 37, features: ['20 reports / month', 'Competitor benchmark', 'Website & profile check', 'Action plan', 'Share links + PDF'] },
  { id: 'pro', name: 'Pro', price: 67, featured: true, features: ['Everything in Starter', 'Unlimited reports', 'AI summary in 4 languages (your OpenAI key)'] },
  { id: 'agency', name: 'Agency', price: 97, features: ['Everything in Pro', 'Reports under your own brand', 'Use for your clients'] },
];

const FAQ = [
  { q: 'Who is it for?', a: 'Agencies and freelancers who sell to local businesses (a powerful sales opener), and owners who want to know where they stand.' },
  { q: 'Do I need API keys?', a: 'A Google Places API key (required) and optionally an OpenAI key for the AI summary. You pay Google and OpenAI directly — usually little or nothing — so there is no monthly fee. Keys already saved in MBN Leads AI are reused.' },
  { q: 'Where does the data come from?', a: 'Google Places through your own key, plus the business\'s public website. Nothing is scraped from Google Maps.' },
  { q: 'Can my client see the report?', a: 'Yes — every report has a private share link that works without an account, and can be printed or saved as a PDF.' },
];

export default function LocalGrowthProductPage() {
  const wa = productQuestionWA('MBN Local Growth');
  return (
    <PublicLayout>
      <section className="relative px-4 pb-16 pt-32 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="hero-enter">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <TrendingUp className="h-3 w-3" /> MBN Local Growth
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              See how any local business <span className="gradient-text">stacks up online</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
              Google reputation vs nearby competitors, website and profile check, and a prioritised action plan — in one shareable report.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#pricing" className="inline-flex items-center gap-2 rounded-full bg-[#ede6ff] px-6 py-3 text-sm font-semibold text-[#14092b] hover:bg-white">
                See plans &amp; buy <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/local-growth" className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-slate-200 hover:border-white/30">
                I have access — open the app
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-14 max-w-3xl rounded-3xl border border-white/10 bg-[#0d0b18] p-6 text-left shadow-[0_30px_80px_rgba(16,185,129,0.12)]">
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-[6px] border-amber-400/80">
                <span className="text-3xl font-black text-amber-300">54</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">Example report</p>
                <p className="text-xl font-bold text-white">Riad Example Medina</p>
                <p className="mt-1 text-sm text-slate-400">Reputation 38 · Website 53 · Google profile 75</p>
              </div>
            </div>
            <ol className="mt-6 space-y-3">
              {EXAMPLE.map((a) => (
                <li key={a.t} className="flex gap-3">
                  <span className={`mt-0.5 h-fit shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${PCLS[a.p]}`}>{a.p}</span>
                  <div><p className="font-medium text-white">{a.t}</p><p className="text-sm text-slate-400">{a.d}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">A growth report in four steps</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <span className="font-mono text-xs text-slate-600">0{i + 1}</span>
                <Icon className="mt-2 h-6 w-6 text-emerald-400" />
                <h3 className="mt-3 font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.02] p-7 sm:flex-row sm:items-center">
          <KeyRound className="h-10 w-10 shrink-0 text-emerald-300" />
          <div>
            <h2 className="text-xl font-bold text-white">Pay once, no monthly fee</h2>
            <p className="mt-1.5 text-slate-400">Runs on your own Google (and optional OpenAI) key — you pay the providers directly for what you use. Already using MBN Leads AI? Your keys work here too.</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24" id="pricing">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">Simple, one-time pricing</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <div key={p.id} className={`flex flex-col rounded-3xl border p-7 ${p.featured ? 'border-emerald-400/40 bg-emerald-500/[0.06]' : 'border-white/10 bg-white/[0.02]'}`}>
                {p.featured && <span className="mb-3 w-fit rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-200">Most popular</span>}
                <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                <p className="mt-3"><span className="text-5xl font-black text-white">${p.price}</span> <span className="text-sm text-slate-500">one-time</span></p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-slate-300"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{f}</li>)}
                </ul>
                <Link href={`/products/local-growth/buy?plan=${p.id}`} className={`mt-7 rounded-full px-5 py-3 text-center text-sm font-semibold ${p.featured ? 'bg-[#ede6ff] text-[#14092b] hover:bg-white' : 'border border-white/15 text-slate-200 hover:border-white/30'}`}>
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

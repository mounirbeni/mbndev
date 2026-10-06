import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Search, Gauge, Target, MessageSquareText, Bookmark, Check, ArrowRight,
  KeyRound, Globe, Star, Sparkles, ShieldCheck,
} from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';
import ScoreBadge from '@/components/leads-ai/ScoreBadge';
import { productQuestionWA } from '@/lib/products';

export const metadata: Metadata = {
  title: 'MBN Leads AI — Find clients who need your services',
  description: 'Search businesses in any city, audit their websites automatically, score every opportunity and send a personalised message in one click. Built for web designers, freelancers and agencies.',
  alternates: { canonical: 'https://mbndev.ma/products/leads-ai' },
  openGraph: {
    title: 'MBN Leads AI',
    description: 'Find businesses that need your service — and know exactly what to say to them.',
    url: 'https://mbndev.ma/products/leads-ai',
    type: 'website',
  },
};

const STEPS = [
  { icon: Search, title: 'Search', text: 'Type a niche and a place — "dentists in London", "riads in Marrakech". Up to 60 businesses per search.' },
  { icon: Gauge, title: 'Analyze', text: 'Every website is audited automatically: mobile, speed, HTTPS, outdated design, booking, SEO basics, contact details.' },
  { icon: Target, title: 'Score', text: 'Each business gets an opportunity score from 0 to 100, with the exact reasons behind it.' },
  { icon: MessageSquareText, title: 'Message', text: 'Get a personalised message built on the real problems found — in English, French, Spanish or Arabic.' },
  { icon: Bookmark, title: 'Track', text: 'Save leads, move them from new to won, keep notes and export everything to CSV.' },
];

const DEMO = [
  { name: 'Riad Example Medina', site: 'No website', rating: 4.6, reviews: 212, score: 95, issues: ['No website'] },
  { name: 'Example Dental Studio', site: 'example-dental.co.uk', rating: 4.8, reviews: 96, score: 82, issues: ['Not mobile-friendly', 'Slow to load (4.2s)', 'No online booking'] },
  { name: 'Casa Example Restaurant', site: 'casa-example.pt', rating: 4.4, reviews: 540, score: 57, issues: ['Relies on third-party booking', 'Outdated design signals'] },
  { name: 'Example Fitness Club', site: 'example-fitness.ae', rating: 4.7, reviews: 1310, score: 12, issues: ['Missing SEO meta description'] },
];

const PLANS = [
  { name: 'Starter', price: 37, note: 'one-time', features: ['50 searches / month', 'Automatic website audits', 'Opportunity score', 'Template messages in 4 languages', 'Lead tracker + CSV export'] },
  { name: 'Pro', price: 67, note: 'one-time', featured: true, features: ['Everything in Starter', 'Unlimited searches', 'AI-written messages (your OpenAI key)', 'Priority updates'] },
  { name: 'Agency', price: 97, note: 'one-time', features: ['Everything in Pro', 'Branded PDF audit reports for prospects (rolling out)', 'Use for your clients'] },
];

const FAQ = [
  { q: 'Do I need my own API keys?', a: 'Yes — a Google Places API key (required) and optionally an OpenAI key. That is why there is no monthly fee: you pay Google and OpenAI directly, usually little or nothing at normal volumes. A step-by-step guide is included.' },
  { q: 'Where does the business data come from?', a: 'From Google Places, through your own key, plus each business\'s public website. Nothing is scraped from Google Maps.' },
  { q: 'Does it send emails for me?', a: 'No — and that is on purpose. Messages open in your own email or WhatsApp, so they come from you and your sender reputation stays clean.' },
  { q: 'Is cold outreach legal?', a: 'Business-to-business outreach is allowed in most countries when it is relevant and easy to opt out of. Every message includes an opt-out line; you remain responsible for following the rules where you and your prospects are.' },
  { q: 'Which countries does it work in?', a: 'Anywhere Google Maps has businesses.' },
];

export default function LeadsAiProductPage() {
  const wa = productQuestionWA('MBN Leads AI');
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative px-4 pb-16 pt-32 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="hero-enter">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
              <Sparkles className="h-3 w-3" /> MBN Leads AI
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Find businesses that <span className="gradient-text">need your service</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
              …and know exactly what to say to them. Search any niche in any city, get every website audited, see who needs you most and send a personalised message in one click.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#pricing" className="inline-flex items-center gap-2 rounded-full bg-[#ede6ff] px-6 py-3 text-sm font-semibold text-[#14092b] hover:bg-white">
                See plans &amp; buy <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/leads-ai" className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-slate-200 hover:border-white/30">
                I have access — open the app
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-500">For web designers, freelancers, agencies and marketers.</p>
          </div>

          {/* Example results */}
          <div className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0d0b18] text-left shadow-[0_30px_80px_rgba(124,58,237,0.15)]">
            <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3 text-sm text-slate-400">
              <Search className="h-4 w-4" /> businesses that need a better website
              <span className="ml-auto text-xs text-slate-600">Example results</span>
            </div>
            <ul className="divide-y divide-white/[0.06]">
              {DEMO.map((d) => (
                <li key={d.name} className="flex items-center gap-3 px-5 py-3">
                  <ScoreBadge score={d.score} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{d.name}</p>
                    <p className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                      <span className={`flex items-center gap-1 ${d.site === 'No website' ? 'text-rose-300' : ''}`}><Globe className="h-3 w-3" />{d.site}</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400" />{d.rating} ({d.reviews})</span>
                    </p>
                    <p className="mt-1.5 flex flex-wrap gap-1">
                      {d.issues.map((i) => <span key={i} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] text-slate-300">{i}</span>)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">From search to signed client</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <span className="text-xs font-mono text-slate-600">0{i + 1}</span>
                <Icon className="mt-2 h-6 w-6 text-primary-400" />
                <h3 className="mt-3 font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your keys */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.02] p-7 sm:flex-row sm:items-center">
          <KeyRound className="h-10 w-10 shrink-0 text-violet-300" />
          <div>
            <h2 className="text-xl font-bold text-white">No monthly fee — you use your own keys</h2>
            <p className="mt-1.5 text-slate-400">MBN Leads AI runs on your own Google and OpenAI keys, so you pay once for the tool and the providers directly for what you use. Your keys are encrypted and never shared.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-16 sm:px-6 sm:py-24" id="pricing">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">Simple, one-time pricing</h2>
          <p className="mt-3 text-center text-slate-400">Pay once. Keep it.</p>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <div key={p.name} className={`flex flex-col rounded-3xl border p-7 ${p.featured ? 'border-violet-400/40 bg-violet-500/[0.06]' : 'border-white/10 bg-white/[0.02]'}`}>
                {p.featured && <span className="mb-3 w-fit rounded-full bg-violet-500/20 px-2.5 py-1 text-xs font-semibold text-violet-200">Most popular</span>}
                <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                <p className="mt-3"><span className="text-5xl font-black text-white">${p.price}</span> <span className="text-sm text-slate-500">{p.note}</span></p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-slate-300"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" />{f}</li>)}
                </ul>
                <Link href={`/products/leads-ai/buy?plan=${p.name.toLowerCase()}`} className={`mt-7 rounded-full px-5 py-3 text-center text-sm font-semibold ${p.featured ? 'bg-[#ede6ff] text-[#14092b] hover:bg-white' : 'border border-white/15 text-slate-200 hover:border-white/30'}`}>
                  Buy {p.name} — ${p.price}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5" /> Pay by bank transfer, PayPal or TapTapSend — your tool is activated as soon as the payment is verified. Questions? <a href={wa} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-300">Chat on WhatsApp</a>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold text-white">Questions</h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5">
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

import type { Metadata } from 'next';
import Link from 'next/link';
import { QrCode, BellRing, Sparkles, LineChart, Check, ArrowRight, Star, ShieldCheck, BadgeCheck } from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';
import { productQuestionWA } from '@/lib/products';

export const metadata: Metadata = {
  title: 'MBN Review Booster — Google review monitoring, AI replies & review collection',
  description: 'Get an alert for every new Google review, reply with AI-written drafts, track your rating weekly — and collect more reviews with a QR poster and WhatsApp requests. One-time price.',
  alternates: { canonical: 'https://mbndev.ma/products/review-booster' },
  openGraph: {
    title: 'MBN Review Booster',
    description: 'Your Google reputation on autopilot — more reviews, instant alerts, AI replies.',
    url: 'https://mbndev.ma/products/review-booster',
    type: 'website',
  },
};

const STEPS = [
  { icon: BellRing, title: 'Know about every review', text: 'Your Google profile is checked every day. New review? You get an alert — and an email right away when it’s 3★ or less.' },
  { icon: Sparkles, title: 'Reply in seconds', text: 'An AI-written reply in the reviewer’s language, specific to what they said. Edit, copy, post on Google.' },
  { icon: LineChart, title: 'See the trend', text: 'Rating and review count over 7 and 30 days, plus a weekly summary by email every Monday.' },
  { icon: QrCode, title: 'Get more reviews', text: 'QR poster for the counter, one-tap WhatsApp & email requests in 4 languages, and private feedback before a bad review.' },
];

const PLANS = [
  { id: 'starter', name: 'Starter', price: 37, features: ['1 business', 'New-review alerts + weekly summary', 'AI-written replies', 'QR poster + WhatsApp & email requests', 'Private feedback alerts'] },
  { id: 'pro', name: 'Pro', price: 67, featured: true, features: ['Everything in Starter', '5 businesses'] },
  { id: 'agency', name: 'Agency', price: 97, features: ['Everything in Pro', '25 businesses — one per client', 'No “Powered by” branding'] },
];

const FAQ = [
  { q: 'Why not just use Google\'s own review link?', a: 'Google gives you a link. Review Booster tells you the moment a new review lands, drafts the reply for you, shows whether your rating is going up or down, gets you more reviews with ready-to-send requests — and lets unhappy customers reach you privately first.' },
  { q: 'Do I need API keys?', a: 'Collecting reviews needs none. Monitoring uses your own Google Places key (Google\'s free monthly allowance usually covers it) and AI replies use your OpenAI key (about a cent per hundred replies). Keys already saved in our other products are reused. No monthly fee to us.' },
  { q: 'Is it allowed by Google?', a: 'Yes. Every customer sees the same “Leave a review on Google” button — we never hide it from unhappy customers or filter who can review (“review gating”), which Google does not allow. Private feedback is just an extra option.' },
  { q: 'Can I use it for my clients?', a: 'Yes. The Agency plan covers 25 businesses without our branding — a simple service to sell to restaurants, riads, clinics and salons.' },
  { q: 'Does it send messages automatically?', a: 'You stay in control: one tap opens WhatsApp or your email with the message ready, so requests come from your own number or address — which customers trust more.' },
];

export default function ReviewBoosterProductPage() {
  const wa = productQuestionWA('MBN Review Booster');
  return (
    <PublicLayout>
      <section className="relative px-4 pb-16 pt-32 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="hero-enter">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
              <Star className="h-3 w-3" /> MBN Review Booster
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Your Google reputation, <span className="gradient-text">on autopilot</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
              Know about every new Google review, reply in seconds with AI, and turn happy customers into more 5★ reviews — for one business or all your clients.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#pricing" className="inline-flex items-center gap-2 rounded-full bg-[#ede6ff] px-6 py-3 text-sm font-semibold text-[#14092b] hover:bg-white">
                See plans &amp; buy <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/review-booster" className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-slate-200 hover:border-white/30">
                I have access — open the app
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-14 max-w-sm rounded-3xl bg-white p-7 text-center text-slate-900 shadow-[0_30px_80px_rgba(251,191,36,0.15)]">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7c3aed] text-lg font-bold text-white">R</span>
            <p className="mt-4 text-xl font-bold">How was your experience at Riad Example?</p>
            <p className="mt-1.5 text-sm text-slate-500">Your review helps others discover us — it only takes a minute.</p>
            <div className="mt-4 flex justify-center gap-1">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />)}</div>
            <p className="mt-5 rounded-2xl bg-[#7c3aed] px-4 py-3.5 font-semibold text-white">Leave a review on Google</p>
            <p className="mt-4 text-sm text-slate-500">Something not right? Tell us privately</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">What it does for you</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <span className="font-mono text-xs text-slate-600">0{i + 1}</span>
                <Icon className="mt-2 h-6 w-6 text-amber-400" />
                <h3 className="mt-3 font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.02] p-7 sm:flex-row sm:items-center">
          <BadgeCheck className="h-10 w-10 shrink-0 text-amber-300" />
          <div>
            <h2 className="text-xl font-bold text-white">Follows Google&apos;s rules</h2>
            <p className="mt-1.5 text-slate-400">Every customer gets the same Google review button — nothing is filtered or hidden. Replies are drafted for you, but you approve and post them yourself. Pay once, no monthly fee.</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24" id="pricing">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">Simple, one-time pricing</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <div key={p.id} className={`flex flex-col rounded-3xl border p-7 ${p.featured ? 'border-amber-400/40 bg-amber-500/[0.06]' : 'border-white/10 bg-white/[0.02]'}`}>
                {p.featured && <span className="mb-3 w-fit rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-200">Most popular</span>}
                <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                <p className="mt-3"><span className="text-5xl font-black text-white">${p.price}</span> <span className="text-sm text-slate-500">one-time</span></p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-slate-300"><Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />{f}</li>)}
                </ul>
                <Link href={`/products/review-booster/buy?plan=${p.id}`} className={`mt-7 rounded-full px-5 py-3 text-center text-sm font-semibold ${p.featured ? 'bg-[#ede6ff] text-[#14092b] hover:bg-white' : 'border border-white/15 text-slate-200 hover:border-white/30'}`}>
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

import type { Metadata } from 'next';
import Link from 'next/link';
import { Globe, MessagesSquare, UserPlus, Code2, Check, ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';
import { productQuestionWA } from '@/lib/products';

export const metadata: Metadata = {
  title: 'MBN Support AI — An AI assistant for your website',
  description: 'An AI chat assistant that learns your website, answers visitors 24/7 in their language and turns them into leads. One-line install, one-time price.',
  alternates: { canonical: 'https://mbndev.ma/products/support-ai' },
  openGraph: {
    title: 'MBN Support AI',
    description: 'An AI assistant that answers your website visitors 24/7 — and turns them into leads.',
    url: 'https://mbndev.ma/products/support-ai',
    type: 'website',
  },
};

const STEPS = [
  { icon: Globe, title: 'Paste your website', text: 'The assistant reads your pages — services, prices, hours, FAQ — in about a minute.' },
  { icon: Code2, title: 'Add one line', text: 'Copy one script tag into your site. Works with WordPress, Wix, Shopify or custom code.' },
  { icon: MessagesSquare, title: 'Visitors get answers', text: 'Accurate replies from your own content, in English, French, Arabic or Spanish, day and night.' },
  { icon: UserPlus, title: 'You get the leads', text: 'Interested visitors leave their email or phone — you are notified instantly, or they jump to WhatsApp.' },
];

const CHAT = [
  { from: 'visitor', text: 'Bonjour, vous avez une chambre pour 2 personnes ce week-end ?' },
  { from: 'bot', text: 'Bonjour ! Oui, nos chambres doubles sont à partir de 90 € la nuit, petit-déjeuner inclus. Voulez-vous que l’équipe vous confirme la disponibilité ?' },
  { from: 'visitor', text: 'Oui merci' },
];

const PLANS = [
  { id: 'starter', name: 'Starter', price: 37, features: ['1 assistant (1 website)', '1,000 messages / month', 'Lead capture + email alerts', 'WhatsApp hand-off', 'Conversation history'] },
  { id: 'pro', name: 'Pro', price: 67, featured: true, features: ['Everything in Starter', '5 assistants', '5,000 messages / month'] },
  { id: 'agency', name: 'Agency', price: 97, features: ['Everything in Pro', '25 assistants — one per client', '20,000 messages / month', 'No “Powered by” branding'] },
];

const FAQ = [
  { q: 'Do I need an OpenAI key?', a: 'Yes — the assistant answers with your own OpenAI key, so there is no monthly fee. You pay OpenAI directly, typically a few cents per hundred conversations. A key saved in MBN Leads AI or Local Growth is reused automatically.' },
  { q: 'Will it make things up?', a: 'It is instructed to answer only from your website and the notes you add. When it does not know, it says so and offers to put the visitor in touch with you.' },
  { q: 'What happens to visitor conversations?', a: 'They are stored in your account only, so you can read them and improve your notes. They are never used to train any model and are not shared with other customers.' },
  { q: 'Can I use it on my clients\' websites?', a: 'Yes. The Agency plan gives you 25 assistants without our branding — set one up for each client.' },
  { q: 'What if I update my website?', a: 'Press “Re-read website” in the dashboard and the assistant reads it again.' },
];

export default function SupportAiProductPage() {
  const wa = productQuestionWA('MBN Support AI');
  return (
    <PublicLayout>
      <section className="relative px-4 pb-16 pt-32 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="hero-enter">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-300">
              <MessagesSquare className="h-3 w-3" /> MBN Support AI
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              An AI assistant that <span className="gradient-text">answers your visitors 24/7</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
              It learns your website in a minute, replies in your visitor&apos;s language and turns questions into leads — while you sleep.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#pricing" className="inline-flex items-center gap-2 rounded-full bg-[#ede6ff] px-6 py-3 text-sm font-semibold text-[#14092b] hover:bg-white">
                See plans &amp; buy <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/support-ai" className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-slate-200 hover:border-white/30">
                I have access — open the app
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-14 max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white text-left text-slate-900 shadow-[0_30px_80px_rgba(56,189,248,0.15)]">
            <div className="flex items-center gap-2 bg-[#7c3aed] px-4 py-3 text-white">
              <MessagesSquare className="h-4 w-4" /><span className="font-semibold">Riad Example</span>
            </div>
            <div className="space-y-2.5 bg-slate-50 p-4">
              {CHAT.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'visitor' ? 'justify-end' : ''}`}>
                  <p className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${m.from === 'visitor' ? 'rounded-tr-sm bg-[#7c3aed] text-white' : 'rounded-tl-sm bg-white'}`}>{m.text}</p>
                </div>
              ))}
              <div className="rounded-2xl bg-white p-3 text-sm shadow-sm">
                <p className="font-semibold">Leave your details and we&apos;ll get back to you</p>
                <div className="mt-2 rounded-lg border border-slate-200 px-3 py-1.5 text-slate-400">Email</div>
                <div className="mt-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-slate-400">Phone / WhatsApp</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">Live on your site in four steps</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <span className="font-mono text-xs text-slate-600">0{i + 1}</span>
                <Icon className="mt-2 h-6 w-6 text-sky-400" />
                <h3 className="mt-3 font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.02] p-7 sm:flex-row sm:items-center">
          <KeyRound className="h-10 w-10 shrink-0 text-sky-300" />
          <div>
            <h2 className="text-xl font-bold text-white">Pay once, no monthly fee</h2>
            <p className="mt-1.5 text-slate-400">Runs on your own OpenAI key — you pay OpenAI directly for what you use, usually a few cents per hundred chats. Already using MBN Leads AI or Local Growth? Your key works here too.</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24" id="pricing">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">Simple, one-time pricing</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <div key={p.id} className={`flex flex-col rounded-3xl border p-7 ${p.featured ? 'border-sky-400/40 bg-sky-500/[0.06]' : 'border-white/10 bg-white/[0.02]'}`}>
                {p.featured && <span className="mb-3 w-fit rounded-full bg-sky-500/20 px-2.5 py-1 text-xs font-semibold text-sky-200">Most popular</span>}
                <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                <p className="mt-3"><span className="text-5xl font-black text-white">${p.price}</span> <span className="text-sm text-slate-500">one-time</span></p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-slate-300"><Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />{f}</li>)}
                </ul>
                <Link href={`/products/support-ai/buy?plan=${p.id}`} className={`mt-7 rounded-full px-5 py-3 text-center text-sm font-semibold ${p.featured ? 'bg-[#ede6ff] text-[#14092b] hover:bg-white' : 'border border-white/15 text-slate-200 hover:border-white/30'}`}>
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

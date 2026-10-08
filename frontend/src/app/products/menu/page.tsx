import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Languages, ShieldAlert, ShoppingBag, BellRing, CalendarDays, MonitorSmartphone, QrCode, Pencil, Check, ArrowRight, ShieldCheck, UtensilsCrossed, Smartphone,
} from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';
import { productQuestionWA } from '@/lib/products';

export const metadata: Metadata = {
  title: 'MBN Menu — digital QR menu with allergens, table ordering and bookings',
  description: 'A digital restaurant menu in 7 languages with the 14 EU allergens, table ordering, waiter calls and table bookings — one QR code per table, a live orders screen, prices you change in seconds. One-time price.',
  alternates: { canonical: 'https://mbndev.ma/products/menu' },
  openGraph: {
    title: 'MBN Menu',
    description: 'Your menu in every guest’s language — allergens, table ordering and bookings from one QR code.',
    url: 'https://mbndev.ma/products/menu',
    type: 'website',
  },
};

const FEATURES = [
  { icon: Languages, title: 'Every guest’s language', text: 'Portuguese, Spanish, French, Italian, English, German and Arabic. Write the menu once — AI translates the rest in a minute.' },
  { icon: ShieldAlert, title: 'The 14 allergens, done right', text: 'Each dish shows its allergens (EU Regulation 1169/2011). Guests hide everything they can’t eat with one tap.' },
  { icon: ShoppingBag, title: 'Order from the table', text: 'Guests choose options and extras, add a note for the kitchen and send the order. They follow it: received, preparing, on its way.' },
  { icon: BellRing, title: 'Call the waiter, ask for the bill', text: 'One tap from the table, with the table number and how they want to pay. No more waving.' },
  { icon: CalendarDays, title: 'Bookings that fit your hours', text: 'Guests pick a free time inside your opening hours. You confirm or decline — they see it on their phone, and you get an email.' },
  { icon: MonitorSmartphone, title: 'A live screen for the team', text: 'Orders, calls and bookings arrive on a tablet or phone with a sound. Mark dishes sold out or change a price in seconds.' },
];

const STEPS = [
  { icon: Pencil, title: 'Create the menu', text: 'Start from our sample or a blank page. Add dishes, photos, options, allergens and hours.' },
  { icon: QrCode, title: 'Print the table codes', text: 'One QR code per table, ready to print on cards or stickers — plus a poster for the window.' },
  { icon: Smartphone, title: 'Guests scan and order', text: 'No app to install. It opens in the phone’s browser, in the guest’s language.' },
];

const PLANS = [
  { id: 'starter', name: 'Starter', price: 37, features: ['1 restaurant', 'Menu in up to 7 languages', 'Allergens, photos, options & extras', 'Table ordering, waiter calls, bookings', 'Live orders screen + table QR codes'] },
  { id: 'pro', name: 'Pro', price: 67, featured: true, features: ['Everything in Starter', '3 restaurants'] },
  { id: 'agency', name: 'Agency', price: 97, features: ['Everything in Pro', '25 restaurants — one per client', 'No “Digital menu by MBN DEV” line'] },
];

const FAQ = [
  { q: 'Do guests need to install an app?', a: 'No. The QR code opens the menu in the phone’s browser, already in the guest’s language when it’s one of yours.' },
  { q: 'Is the allergen information legally enough?', a: 'In the EU, restaurants must make the 14 allergens of Regulation 1169/2011 available for every dish. MBN Menu shows them on every dish and lets guests filter by them. You stay responsible for the information you enter, so check it with your kitchen.' },
  { q: 'Do guests pay through the menu?', a: 'Not in this version: guests order and ask for the bill from the table, and pay your staff as usual (card, cash, MB Way, Bizum…). No commission on any order.' },
  { q: 'How does the AI translation work?', a: 'Write in your main language and press “Translate with AI”. It uses your own OpenAI key (a whole menu costs a few cents) and never overwrites text you wrote yourself. You can edit every translation.' },
  { q: 'Can I sell it to my restaurant clients?', a: 'Yes. The Agency plan covers 25 restaurants without our branding — a simple monthly service to offer restaurants, cafés and hotels.' },
  { q: 'What if a dish runs out?', a: 'Tap the eye icon next to the dish: it shows “Sold out” right away and can’t be ordered.' },
];

export default function MenuProductPage() {
  const wa = productQuestionWA('MBN Menu');
  return (
    <PublicLayout>
      <section className="relative px-4 pb-16 pt-32 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hero-enter text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
              <UtensilsCrossed className="h-3 w-3" /> MBN Menu
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Your menu in <span className="gradient-text">every guest’s language</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400 lg:mx-0">
              A digital QR menu with the 14 allergens, ordering from the table, waiter calls and bookings — and a live screen for your team. No app, no commission.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <a href="/m/demo" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#ede6ff] px-6 py-3 text-sm font-semibold text-[#14092b] hover:bg-white">
                Try the live demo <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#pricing" className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-slate-200 hover:border-white/30">See plans</a>
              <Link href="/menu" className="text-sm text-slate-400 underline-offset-4 hover:text-white hover:underline">I have access — open the app</Link>
            </div>
          </div>

          <a href="/m/demo" target="_blank" rel="noopener noreferrer" aria-label="Open the live demo" className="mx-auto block w-full max-w-[300px] rounded-[2.4rem] border-[10px] border-[#1a1726] bg-[#f4f6fa] text-left text-slate-900 shadow-[0_30px_80px_rgba(59,130,246,0.25)] transition-transform hover:-translate-y-1">
            <div className="rounded-t-[1.6rem] bg-[#1f4fd1] px-5 pb-5 pt-6 text-white">
              <div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white font-serif text-xl text-[#1f4fd1]">M</span><span className="rounded-full border border-white/30 px-2.5 py-1 text-[11px] font-bold">PT · EN · ES · FR · IT</span></div>
              <p className="mt-4 font-serif text-3xl leading-none">MBN Restaurant</p>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-semibold"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Open now · closes 23:00</p>
            </div>
            <div className="space-y-2.5 p-3.5">
              {[['Burrata & tomatoes', '€11.50', ['7', '8'], 'Vegetarian'], ['Garlic prawns', '€12.90', ['2'], 'Spicy'], ['Paella', 'from €16.50', ['2', '4', '9', '14'], '★ Chef']].map(([n, p, al, tag]) => (
                <div key={n as string} className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="text-sm font-bold">{n}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs"><b>{p}</b><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{tag}</span>{(al as string[]).map((a) => <span key={a} className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">{a}</span>)}</p>
                </div>
              ))}
              <p className="rounded-full bg-[#1f4fd1] py-2.5 text-center text-xs font-bold text-white">Send to the kitchen · €24.40</p>
            </div>
          </a>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">Everything a modern menu should do</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <Icon className="h-6 w-6 text-blue-300" />
                <h3 className="mt-3 font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">Live in an afternoon</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <span className="font-mono text-xs text-slate-600">Step {i + 1}</span>
                <Icon className="mt-2 h-6 w-6 text-violet-300" />
                <h3 className="mt-3 font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24" id="pricing">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">Simple, one-time pricing</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">Pay once — no monthly fee, no commission on orders. Delivery apps take 25–35% of every order.</p>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <div key={p.id} className={`flex flex-col rounded-3xl border p-7 ${p.featured ? 'border-blue-400/40 bg-blue-500/[0.06]' : 'border-white/10 bg-white/[0.02]'}`}>
                {p.featured && <span className="mb-3 w-fit rounded-full bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-200">Most popular</span>}
                <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                <p className="mt-3"><span className="text-5xl font-black text-white">${p.price}</span> <span className="text-sm text-slate-500">one-time</span></p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-slate-300"><Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />{f}</li>)}
                </ul>
                <Link href={`/products/menu/buy?plan=${p.id}`} className={`mt-7 rounded-full px-5 py-3 text-center text-sm font-semibold ${p.featured ? 'bg-[#ede6ff] text-[#14092b] hover:bg-white' : 'border border-white/15 text-slate-200 hover:border-white/30'}`}>
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

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, FileSignature, MessagesSquare, Sparkles, Star, TrendingUp } from 'lucide-react';
import PublicLayout from '@/components/landing/PublicLayout';
import { PRODUCTS, STATUS_LABEL } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Software products built by MBN DEV — tools that help freelancers, agencies and small businesses win more clients.',
  alternates: { canonical: 'https://mbndev.ma/products' },
  openGraph: {
    title: 'Products — MBN DEV',
    description: 'Software products built by MBN DEV.',
    url: 'https://mbndev.ma/products',
    type: 'website',
  },
};

export default function ProductsPage() {
  return (
    <PublicLayout>
      <section className="relative px-4 pb-24 pt-32 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="hero-enter text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">
              <Sparkles className="h-3 w-3 text-primary-400" /> Built by MBN DEV
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Products that <span className="gradient-text">win you clients</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
              The tools we use in our own studio, packaged for freelancers, agencies and growing businesses.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {PRODUCTS.map((p) => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className="group flex flex-col rounded-3xl border border-white/10 bg-white/[0.02] p-7 transition-colors hover:border-violet-400/40 hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${p.slug === 'local-growth' ? 'from-emerald-500 to-cyan-500' : p.slug === 'support-ai' ? 'from-sky-500 to-indigo-500' : p.slug === 'review-booster' ? 'from-amber-400 to-orange-500' : p.slug === 'proposal-ai' ? 'from-fuchsia-500 to-violet-600' : 'from-violet-500 to-blue-500'}`}>
                    {p.slug === 'local-growth' ? <TrendingUp className="h-5 w-5 text-white" /> : p.slug === 'support-ai' ? <MessagesSquare className="h-5 w-5 text-white" /> : p.slug === 'review-booster' ? <Star className="h-5 w-5 text-white" /> : p.slug === 'proposal-ai' ? <FileSignature className="h-5 w-5 text-white" /> : <Sparkles className="h-5 w-5 text-white" />}
                  </span>
                  <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-300">
                    {STATUS_LABEL[p.status]}
                  </span>
                </div>
                <h2 className="mt-5 text-2xl font-bold text-white">{p.name}</h2>
                <p className="mt-2 text-slate-400">{p.tagline}</p>
                <ul className="mt-5 space-y-2">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="h-4 w-4 shrink-0 text-primary-400" /> {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="text-white"><span className="text-sm text-slate-500">From </span><span className="text-xl font-bold">${p.priceFrom}</span></span>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-primary-400 transition-all group-hover:gap-2.5">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}

            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 p-7 text-center">
              <p className="font-semibold text-white">More products on the way</p>
              <p className="mt-2 max-w-xs text-sm text-slate-500">AI agents and automation.</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

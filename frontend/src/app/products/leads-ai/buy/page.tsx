'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const PLANS: Record<string, { label: string; price: number }> = {
  starter: { label: 'Starter', price: 37 },
  pro:     { label: 'Pro', price: 67 },
  agency:  { label: 'Agency', price: 97 },
};

/**
 * Buy MBN Leads AI: signed-in buyers get an order and go straight to the
 * normal checkout; everyone else signs up / in first and comes back here.
 */
function BuyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const plan = PLANS[params.get('plan') || ''] ? (params.get('plan') as string) : 'pro';
  const [error, setError] = useState('');
  const started = useRef(false);
  const here = `/products/leads-ai/buy?plan=${plan}`;

  useEffect(() => {
    if (loading || !user || started.current) return;
    started.current = true;
    import('@/lib/api')
      .then(({ orderAPI }) => orderAPI.buyProduct(`leads-ai:${plan}`))
      .then(({ data }) => router.replace(`/checkout/${data.order.id || data.order._id}`))
      .catch((err) => {
        started.current = false;
        setError(err?.response?.data?.message || 'Could not start your order. Please try again.');
      });
  }, [loading, user, plan, router]);

  const p = PLANS[plan];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07060f] px-4">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.03] p-7 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500">
          <Sparkles className="h-5 w-5 text-white" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-white">MBN Leads AI — {p.label}</h1>
        <p className="mt-1 text-slate-400">${p.price} · one-time</p>

        {error ? (
          <p className="mt-6 text-sm text-rose-300">{error}</p>
        ) : loading || user ? (
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Preparing your checkout…
          </p>
        ) : (
          <>
            <p className="mt-6 text-sm text-slate-400">Create your account (or sign in) — your tool is activated on it as soon as your payment is verified.</p>
            <Link href={`/signup?next=${encodeURIComponent(here)}`} className="mt-5 block rounded-full bg-[#ede6ff] px-5 py-3 text-sm font-semibold text-[#14092b] hover:bg-white">
              Create my account
            </Link>
            <Link href={`/login?next=${encodeURIComponent(here)}`} className="mt-2 block rounded-full border border-white/15 px-5 py-3 text-sm text-slate-200 hover:border-white/30">
              I already have an account
            </Link>
          </>
        )}
        <Link href="/products/leads-ai#pricing" className="mt-6 inline-block text-xs text-slate-500 hover:text-slate-300">← Back to plans</Link>
      </div>
    </div>
  );
}

export default function BuyLeadsAiPage() {
  return (
    <Suspense>
      <BuyContent />
    </Suspense>
  );
}

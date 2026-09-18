'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { packageAPI } from '@/lib/api';
import type { Package } from '@/types';
import { formatCurrency } from '@/lib/utils';
import AuthModal from '@/components/ui/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

export default function Pricing() {
  const { user } = useAuth();
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    packageAPI.getAll()
      .then(({ data }) => {
        if (active) setPackages(Array.isArray(data.packages) ? data.packages : []);
      })
      .catch(() => { if (active) setPackages([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const choosePlan = (pkg: Package) => {
    // No checkout with an invalid / zero backend price. Ask for a quote instead.
    if (!Number.isFinite(pkg.price) || pkg.price <= 0) {
      router.push('/contact');
      return;
    }
    localStorage.setItem('mbndev_selected_plan', pkg.slug);
    if (user) router.push(`/request?package=${encodeURIComponent(pkg.slug)}`);
    else {
      setPendingPlan(pkg.slug);
      setAuthOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    const plan = pendingPlan || localStorage.getItem('mbndev_selected_plan');
    router.push(plan ? `/request?package=${encodeURIComponent(plan)}` : '/request');
  };

  return (
    <section id="pricing" className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 pointer-events-none ambient-grid opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-violet-600/5 blur-[100px] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="section-label">Transparent Pricing</span>
          <h2 className="text-4xl sm:text-6xl font-black text-white mt-6 tracking-tight">
            Find your <span className="gradient-text">fit.</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mt-5 leading-relaxed">
            Explore the scope of each package. Final pricing and delivery dates are confirmed in your project proposal.
          </p>
        </motion.div>

        {loading ? (
          <div role="status" className="text-center text-slate-400 py-16">Loading current packages…</div>
        ) : packages.length === 0 ? (
          <div className="premium-surface rounded-3xl max-w-xl mx-auto p-9 text-center">
            <h3 className="text-xl font-semibold text-white">Get a tailored quote</h3>
            <p className="text-slate-400 mt-3 mb-6">Live package prices are temporarily unavailable. We will confirm the scope and price with you directly.</p>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold">Contact us <ArrowRight className="w-4 h-4" /></Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5 lg:gap-6 items-stretch">
            {packages.map((pkg, index) => {
              const featured = Boolean(pkg.popular);
              const hasPrice = Number.isFinite(pkg.price) && pkg.price > 0;
              return (
                <motion.article key={pkg.id ?? pkg._id ?? pkg.slug} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.08 }} className="relative flex flex-col">
                  {featured && <div className="absolute -inset-px rounded-[28px] bg-gradient-to-br from-violet-500/50 via-violet-500/10 to-blue-500/30 pointer-events-none" />}
                  <div className={`relative flex flex-col h-full rounded-3xl overflow-hidden p-7 sm:p-8 ${featured ? 'premium-surface-featured' : 'premium-surface'}`}>
                    <div className="flex items-center justify-between gap-2 mb-6">
                      <h3 className="text-2xl text-white font-bold">{pkg.name}</h3>
                      {featured && <span className="text-xs text-violet-200 border border-violet-500/30 bg-violet-500/10 rounded-full px-3 py-1">Featured</span>}
                    </div>
                    <p className="text-slate-400 text-sm min-h-12 leading-relaxed mb-6">{pkg.description}</p>
                    <div className="pb-7 mb-7 border-b border-white/10">
                      <span className={`${hasPrice ? 'text-4xl sm:text-5xl' : 'text-2xl'} font-black text-white tracking-tight tabular-nums`}>
                        {hasPrice ? formatCurrency(pkg.price) : 'Request a quote'}
                      </span>
                      {hasPrice && <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">Per project · scope confirmed before payment</p>}
                    </div>
                    <ul className="space-y-3.5 mb-9 flex-1">
                      {pkg.features?.map((feature, i) => (
                        <li key={`${feature}-${i}`} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                          <Check aria-hidden="true" className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />{feature}
                        </li>
                      ))}
                    </ul>
                    <button type="button" onClick={() => choosePlan(pkg)} className={`w-full flex items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400 ${featured ? 'bg-violet-600 hover:bg-violet-500 text-white' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
                      {hasPrice ? `Choose ${pkg.name}` : 'Get a quote'} <ArrowRight aria-hidden="true" className="w-4 h-4" />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        <p className="text-center mt-10 text-sm text-slate-400">
          Need something custom? <Link href="/contact" className="text-violet-400 hover:text-violet-300 font-semibold">Tell us about your project →</Link>
          <span className="mx-2 text-slate-700">·</span>
          <Link href="/pricing" className="text-violet-400 hover:text-violet-300 font-semibold">Compare all packages</Link>
        </p>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} plan={pendingPlan ?? undefined} contextMessage="Sign in to save your request and track your project in your workspace." />
    </section>
  );
}

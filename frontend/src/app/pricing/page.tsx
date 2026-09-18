'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, HelpCircle, Zap } from 'lucide-react';
import { packageAPI } from '@/lib/api';
import type { Package } from '@/types';
import { formatCurrency } from '@/lib/utils';
import PublicLayout from '@/components/landing/PublicLayout';
import AuthModal from '@/components/ui/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const hasFeature = (pkg: Package, text: string) =>
  Boolean(pkg.features?.some((feature) => feature.toLowerCase().includes(text.toLowerCase())));

function featureNumber(pkg: Package, text: string): number | undefined {
  const feature = pkg.features?.find((item) => item.toLowerCase().includes(text.toLowerCase()));
  const number = feature?.match(/\d+/)?.[0];
  return number ? Number(number) : undefined;
}

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    packageAPI.getAll()
      .then(({ data }) => { if (active) setPackages(Array.isArray(data.packages) ? data.packages : []); })
      .catch(() => { if (active) setPackages([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const choosePlan = (pkg: Package) => {
    if (!Number.isFinite(pkg.price) || pkg.price <= 0) {
      router.push('/contact');
      return;
    }
    localStorage.setItem('mbndev_selected_plan', pkg.slug);
    if (user) router.push(`/request?package=${encodeURIComponent(pkg.slug)}`);
    else { setPendingPlan(pkg.slug); setAuthOpen(true); }
  };

  const handleAuthSuccess = () => {
    const plan = pendingPlan || localStorage.getItem('mbndev_selected_plan');
    router.push(plan ? `/request?package=${encodeURIComponent(plan)}` : '/request');
  };

  const comparison: { label: string; get: (pkg: Package) => string | boolean }[] = [
    { label: t('pricing.compare.pages'), get: (pkg) => hasFeature(pkg, 'Unlimited Pages') || pkg.pages === 0 || pkg.pages === 999 ? t('pricing.compare.unlimited') : ((pkg.pages ?? featureNumber(pkg, 'Pages')) ? `Up to ${pkg.pages ?? featureNumber(pkg, 'Pages')}` : '—') },
    { label: t('pricing.compare.responsive'), get: (pkg) => hasFeature(pkg, 'Responsive Design') },
    { label: t('pricing.compare.seo'), get: (pkg) => hasFeature(pkg, 'Advanced SEO') ? t('pricing.compare.advanced') : hasFeature(pkg, 'Basic SEO') ? t('pricing.compare.basic') : '—' },
    { label: t('pricing.compare.cms'), get: (pkg) => hasFeature(pkg, 'CMS') },
    { label: t('pricing.compare.customFeat'), get: (pkg) => hasFeature(pkg, 'Custom Features') },
    { label: t('pricing.compare.revisions'), get: (pkg) => String(pkg.revisions ?? featureNumber(pkg, 'Revisions') ?? '—') },
    { label: t('pricing.compare.support'), get: (pkg) => hasFeature(pkg, 'Priority Support') },
    { label: t('pricing.compare.source'), get: (pkg) => hasFeature(pkg, 'Source Code') },
    { label: t('pricing.compare.maint'), get: (pkg) => hasFeature(pkg, 'Maintenance') },
    { label: t('pricing.compare.delivery'), get: (pkg) => { const days = pkg.deliveryDays ?? featureNumber(pkg, 'Delivery'); return days ? `${days} days` : '—'; } },
  ];

  const faqs = [1, 2, 3, 4].map((n) => ({ question: t(`pricing.faq.q${n}`), answer: t(`pricing.faq.a${n}`) }));

  return (
    <PublicLayout>
      <section className="pt-32 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 mb-6"><Zap className="w-3 h-3 text-primary-400" /> Transparent packages</span>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">Pricing built around <span className="gradient-text">your project.</span></h1>
            <p className="text-xl text-slate-400 max-w-xl mx-auto">Explore available packages. Your proposal confirms the exact scope, price and delivery schedule before work starts.</p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="text-center text-slate-400 py-16" role="status">Loading current packages…</div>
          ) : packages.length === 0 ? (
            <div className="glass rounded-2xl border border-white/10 p-10 text-center">
              <h2 className="text-white text-2xl font-semibold">Request an individual quote</h2>
              <p className="text-slate-400 mt-3 mb-6">Current package information is unavailable. We will confirm the price and scope with you directly.</p>
              <Link className="inline-flex items-center gap-2 text-violet-300 hover:text-white font-semibold" href="/contact">Contact us <ArrowRight className="w-4 h-4" /></Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {packages.map((pkg, index) => {
                const hasPrice = Number.isFinite(pkg.price) && pkg.price > 0;
                return (
                  <motion.article key={pkg.id ?? pkg._id ?? pkg.slug} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className={`glass rounded-2xl p-8 border flex flex-col relative ${pkg.popular ? 'border-primary-500/50 shadow-[0_0_40px_rgba(124,58,237,0.12)]' : 'border-white/10'}`}>
                    {pkg.popular && <span className="text-violet-300 text-xs font-semibold border border-violet-500/30 bg-violet-500/10 rounded-full px-3 py-1 w-fit mb-4">Featured</span>}
                    <h2 className="text-white font-bold text-xl mb-1">{pkg.name}</h2>
                    <p className="text-slate-400 text-sm min-h-12">{pkg.description}</p>
                    <div className="mt-7 mb-8">
                      <span className={`${hasPrice ? 'text-4xl' : 'text-2xl'} font-black text-white tabular-nums`}>{hasPrice ? formatCurrency(pkg.price) : 'Request a quote'}</span>
                      {hasPrice && <p className="text-slate-500 text-xs mt-2">Per project · final quote confirmed in writing</p>}
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {pkg.features?.map((feature, n) => <li key={`${feature}-${n}`} className="flex items-start gap-2.5 text-sm text-slate-300"><Check className="w-4 h-4 mt-0.5 shrink-0 text-violet-400" aria-hidden="true" />{feature}</li>)}
                    </ul>
                    <button type="button" onClick={() => choosePlan(pkg)} className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400 ${pkg.popular ? 'bg-violet-600 hover:bg-violet-500 text-white' : 'border border-white/20 hover:bg-white/10 text-white'}`}>
                      {hasPrice ? `Choose ${pkg.name}` : 'Get a quote'} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {packages.length > 0 && !loading && (
        <section className="pb-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-center text-white text-3xl font-bold mb-3">{t('pricing.compare.title')}</h2>
            <p className="text-center text-slate-400 mb-8">Package details reflect the current listings. Your proposal specifies the final scope.</p>
            <div className="glass rounded-2xl border border-white/10 overflow-x-auto" role="region" aria-label="Package comparison" tabIndex={0}>
              <table className="w-full min-w-[680px]">
                <thead><tr className="border-b border-white/10"><th scope="col" className="text-left p-4 text-slate-400 font-medium text-sm">Feature</th>{packages.map((pkg) => <th scope="col" key={pkg.id ?? pkg.slug} className="p-4 text-center text-sm font-semibold text-white">{pkg.name}</th>)}</tr></thead>
                <tbody>{comparison.map((row, i) => (
                  <tr key={row.label} className={`border-b border-white/5 ${i % 2 ? 'bg-white/[0.02]' : ''}`}>
                    <th scope="row" className="p-4 text-left text-slate-400 text-sm font-normal">{row.label}</th>
                    {packages.map((pkg) => {
                      const value = row.get(pkg);
                      return <td key={pkg.id ?? pkg.slug} className="p-4 text-center text-sm text-slate-300">{typeof value === 'boolean' ? (value ? <Check aria-label="Included" className="w-4 h-4 text-violet-400 mx-auto" /> : <span aria-label="Not included">—</span>) : value}</td>;
                    })}
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-10">{t('pricing.faq.title')}</h2>
          <div className="space-y-3">{faqs.map((faq) => <div key={faq.question} className="glass rounded-xl p-5 border border-white/10"><div className="flex items-start gap-3"><HelpCircle className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" /><div><h3 className="text-white font-medium text-sm mb-1">{faq.question}</h3><p className="text-slate-400 text-sm">{faq.answer}</p></div></div></div>)}</div>
        </div>
      </section>
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-10 border border-primary-500/20">
          <h2 className="text-3xl font-bold text-white mb-3">Need a custom solution?</h2>
          <p className="text-slate-400 mb-7">Tell us your goals and requirements. We will discuss the scope and prepare a quote.</p>
          <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold">Contact us <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} plan={pendingPlan ?? undefined} contextMessage="Create your account to save your request and access your client dashboard." />
    </PublicLayout>
  );
}

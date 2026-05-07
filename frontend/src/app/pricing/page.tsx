'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, ArrowRight, Zap, Star, HelpCircle } from 'lucide-react';
import { packageAPI } from '@/lib/api';
import { Package } from '@/types';
import { formatCurrency } from '@/lib/utils';
import PublicLayout from '@/components/landing/PublicLayout';
import Button from '@/components/ui/Button';

const fallbackPackages = [
  {
    _id: '1', name: 'Starter', slug: 'starter', price: 799, popular: false,
    description: 'Perfect for small businesses and personal projects.',
    features: ['Up to 5 Pages', 'Responsive Design', 'Contact Form', 'Basic SEO', '2 Revisions', 'Delivery in 14 days'],
    pages: 5, revisions: 2, deliveryDays: 14,
  },
  {
    _id: '2', name: 'Pro', slug: 'pro', price: 1799, popular: true,
    description: 'Best for growing businesses who need more.',
    features: ['Up to 10 Pages', 'Responsive Design', 'CMS Integration', 'Advanced SEO', '3 Revisions', 'Priority Support', 'Analytics Setup', 'Delivery in 21 days'],
    pages: 10, revisions: 3, deliveryDays: 21,
  },
  {
    _id: '3', name: 'Premium', slug: 'premium', price: 3499, popular: false,
    description: 'For complex projects with custom requirements.',
    features: ['Unlimited Pages', 'Custom Features', 'Full-Stack Development', 'Advanced SEO', '6 Revisions', 'Priority Support', 'Source Code', '1 Month Maintenance', 'Delivery in 30 days'],
    pages: 0, revisions: 6, deliveryDays: 30,
  },
];

const comparison = [
  { feature: 'Pages', starter: 'Up to 5', pro: 'Up to 10', premium: 'Unlimited' },
  { feature: 'Responsive Design', starter: true, pro: true, premium: true },
  { feature: 'SEO Optimization', starter: 'Basic', pro: 'Advanced', premium: 'Advanced' },
  { feature: 'CMS Integration', starter: false, pro: true, premium: true },
  { feature: 'Custom Features', starter: false, pro: false, premium: true },
  { feature: 'Revisions', starter: '1', pro: '3', premium: '6' },
  { feature: 'Priority Support', starter: false, pro: true, premium: true },
  { feature: 'Source Code', starter: false, pro: false, premium: true },
  { feature: 'Maintenance (1 mo)', starter: false, pro: false, premium: true },
  { feature: 'Delivery Time', starter: '7 days', pro: '14 days', premium: '21 days' },
];

const faqs = [
  { q: 'Can I upgrade my package later?', a: 'Yes! You can always upgrade your package at any time. We\'ll credit the amount already paid.' },
  { q: 'Is a deposit required?', a: 'Yes, a 50% deposit is required to start the project. The remaining 50% is due upon delivery.' },
  { q: 'What if I need something not in the packages?', a: 'We handle custom projects too. Use the contact page to describe your needs and we\'ll send a tailored proposal.' },
  { q: 'Do prices include hosting?', a: 'Prices cover development only. Hosting, domain, and third-party services are separate costs.' },
];

export default function PricingPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnnual, setShowAnnual] = useState(false);

  useEffect(() => {
    packageAPI.getAll()
      .then(({ data }) => setPackages(data.packages?.length ? data.packages : fallbackPackages))
      .catch(() => setPackages(fallbackPackages as any))
      .finally(() => setLoading(false));
  }, []);

  const displayed = loading ? fallbackPackages : packages;

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 mb-6">
              <Zap className="w-3 h-3 text-primary-400" /> Simple, Transparent Pricing
            </span>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
              The perfect plan<br />for your <span className="gradient-text">next project</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-xl mx-auto">
              No hidden fees. No surprises. Choose a package and let's build something great.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {displayed.map((pkg, i) => (
              <motion.div
                key={pkg._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass rounded-2xl p-8 border flex flex-col relative ${
                  pkg.popular
                    ? 'border-primary-500/50 shadow-[0_0_40px_rgba(124,58,237,0.15)]'
                    : 'border-white/10'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-primary-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                    <Star className="w-3 h-3" /> Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-white font-bold text-xl mb-1">{pkg.name}</h3>
                  <p className="text-slate-400 text-sm">{pkg.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-black text-white">{formatCurrency(pkg.price)}</span>
                  <span className="text-slate-500 text-sm ml-1">/ project</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {pkg.features?.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${pkg.popular ? 'bg-primary-500' : 'bg-white/10'}`}>
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/request?package=${pkg.slug}`}>
                  <Button
                    size="md"
                    variant={pkg.popular ? 'primary' : 'outline'}
                    className="w-full group"
                  >
                    Choose {pkg.name}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Compare Plans</h2>
            <p className="text-slate-400">See exactly what's included in each package.</p>
          </div>
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-slate-400 font-medium text-sm w-1/2">Feature</th>
                  {['Starter', 'Pro', 'Premium'].map((n) => (
                    <th key={n} className="p-4 text-center text-sm font-semibold text-white">{n}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-white/5 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                    <td className="p-4 text-slate-400 text-sm">{row.feature}</td>
                    {['starter', 'pro', 'premium'].map((key) => {
                      const val = row[key as keyof typeof row];
                      return (
                        <td key={key} className="p-4 text-center">
                          {typeof val === 'boolean' ? (
                            val
                              ? <Check className="w-4 h-4 text-primary-400 mx-auto" />
                              : <span className="text-slate-700 text-lg">—</span>
                          ) : (
                            <span className="text-slate-300 text-sm">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Pricing FAQ</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="glass rounded-xl p-5 border border-white/5"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-white font-medium text-sm mb-1">{faq.q}</div>
                    <div className="text-slate-400 text-sm">{faq.a}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom project CTA */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 border border-primary-500/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-blue-500/5 pointer-events-none" />
            <h2 className="text-3xl font-bold text-white mb-3 relative z-10">Need something custom?</h2>
            <p className="text-slate-400 mb-8 relative z-10">Enterprise projects, complex SaaS, or multi-phase builds — let's discuss a tailored proposal.</p>
            <Link href="/contact" className="relative z-10 inline-block">
              <Button size="lg" className="group">
                Get Custom Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}

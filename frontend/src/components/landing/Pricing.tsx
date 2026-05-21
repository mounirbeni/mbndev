'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/ui/AuthModal';
import { packageAPI } from '@/lib/api';
import { Package } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const defaultPackages: Package[] = [
  {
    _id: '1', name: 'Starter', slug: 'starter', price: 799, originalPrice: 1499, badge: 'Limited Offer',
    description: 'The perfect entry point for startups and personal brands seeking a refined online presence.',
    features: ['Up to 5 Pages', 'Responsive Design', 'Contact Form', 'Basic SEO', '2 Revisions', 'Delivery in 14 days'],
    popular: false,
  },
  {
    _id: '2', name: 'Pro', slug: 'pro', price: 1799, originalPrice: 2999, badge: 'Best Deal',
    description: 'For ambitious businesses demanding excellence — full-featured and built to scale.',
    features: ['Up to 10 Pages', 'Responsive Design', 'CMS Integration', 'Advanced SEO', '3 Revisions', 'Priority Support', 'Analytics Setup', 'Delivery in 21 days'],
    popular: true,
  },
  {
    _id: '3', name: 'Premium', slug: 'premium', price: 3499, originalPrice: 5499, badge: 'Best Value',
    description: 'An uncompromising, bespoke digital experience crafted to your exact vision.',
    features: ['Unlimited Pages', 'Custom Features', 'Full-Stack Development', 'Advanced SEO', '6 Revisions', 'Priority Support', 'Source Code', '1 Month Maintenance'],
    popular: false,
  },
];

function discountPct(original: number, current: number) {
  return Math.round((1 - current / original) * 100);
}

const TIER_LABELS = ['I', 'II', 'III'];

export default function Pricing() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>(defaultPackages);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' });

  useEffect(() => {
    packageAPI.getAll()
      .then(({ data }) => { if (data.packages?.length) setPackages(data.packages); })
      .catch(() => {});
  }, []);

  const choosePlan = (pkg: Package) => {
    localStorage.setItem('mbndev_selected_plan', pkg.slug);
    if (user) {
      router.push(`/request?package=${pkg.slug}`);
    } else {
      setPendingPlan(pkg.slug);
      setAuthOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    router.push(`/request?package=${pendingPlan || localStorage.getItem('mbndev_selected_plan') || ''}`);
  };

  return (
    <section id="pricing" className="py-32 relative overflow-hidden">

      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(201,168,76,0.04) 0%, transparent 70%)' }} />
        <div className="absolute top-2/3 left-1/4 w-[400px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.05) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 ambient-grid opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">

        {/* ── Section header ── */}
        <div ref={headerRef} className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center mb-8"
          >
            <span className="section-label">{t('pricing.eyebrow')}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.04]"
          >
            {t('pricing.title.simple')}{' '}
            <span className="gold-text-gradient font-display italic">{t('pricing.title.bold')}</span>
            <br className="hidden sm:block" />{' '}
            <span className="text-slate-400 font-display">{t('pricing.title.end')}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed"
          >
            {t('pricing.subtitle').replace('{pct}', '47%')}
          </motion.p>
        </div>

        {/* ── Cards ── */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {packages.map((pkg, i) => {
            const pct = pkg.originalPrice ? discountPct(pkg.originalPrice, pkg.price) : 0;
            const savings = pkg.originalPrice ? pkg.originalPrice - pkg.price : 0;
            const isFeatured = pkg.popular;

            return (
              <motion.div
                key={pkg._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col"
              >
                {isFeatured && (
                  <div className="absolute -inset-px rounded-3xl pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(201,168,76,0.3) 0%, rgba(201,168,76,0.08) 50%, rgba(124,58,237,0.2) 100%)',
                    }}
                  />
                )}

                <div
                  className={`relative flex flex-col h-full rounded-3xl overflow-hidden ${
                    isFeatured ? 'luxury-card-featured' : 'luxury-card'
                  }`}
                >
                  {/* Gold shimmer for featured */}
                  {isFeatured && <div className="absolute inset-0 gold-shimmer pointer-events-none" />}

                  {/* Top accent beam */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                      background: isFeatured
                        ? 'linear-gradient(90deg, transparent, rgba(201,168,76,0.7), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
                    }}
                  />

                  <div className="relative z-10 p-8 lg:p-10 flex flex-col h-full">

                    {/* Tier header */}
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        {/* Roman numeral */}
                        <p className={`font-display text-xs font-semibold tracking-[0.25em] uppercase mb-1 ${
                          isFeatured ? 'text-gold' : 'text-slate-600'
                        }`}>
                          Tier {TIER_LABELS[i]}
                        </p>
                        <h3 className={`font-display text-2xl font-bold tracking-tight ${
                          isFeatured ? 'text-white' : 'text-slate-200'
                        }`}>
                          {pkg.name}
                        </h3>
                      </div>

                      {/* Save badge */}
                      {pct > 0 && (
                        <div
                          className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{
                            background: isFeatured ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.06)',
                            border: isFeatured ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(255,255,255,0.08)',
                            color: isFeatured ? '#d4b86a' : '#94a3b8',
                          }}
                        >
                          -{pct}%
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      {pkg.originalPrice && (
                        <p className="text-slate-600 text-sm line-through mb-1">
                          ${pkg.originalPrice.toLocaleString()}
                        </p>
                      )}
                      <div className="flex items-end gap-2">
                        <span
                          className={`font-display text-6xl lg:text-7xl font-bold leading-none tracking-tight ${
                            isFeatured ? 'gold-text-gradient' : 'text-white'
                          }`}
                        >
                          ${pkg.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">{t('pricing.perProject')}</p>
                      {savings > 0 && (
                        <p className={`text-xs font-semibold mt-1.5 ${isFeatured ? 'text-gold' : 'text-slate-400'}`}>
                          You save ${savings.toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="luxury-divider mb-6" style={{
                      background: isFeatured
                        ? 'linear-gradient(90deg, transparent, rgba(201,168,76,0.35), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
                    }} />

                    {/* Description */}
                    <p className="text-slate-400 text-sm leading-relaxed mb-8">
                      {pkg.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-3.5 mb-10 flex-1">
                      {pkg.features?.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-sm">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              background: isFeatured ? 'rgba(201,168,76,0.15)' : 'rgba(124,58,237,0.12)',
                              border: isFeatured ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(124,58,237,0.25)',
                            }}
                          >
                            <Check
                              className="w-2.5 h-2.5"
                              style={{ color: isFeatured ? '#d4b86a' : '#a855f7' }}
                              strokeWidth={2.5}
                            />
                          </div>
                          <span className={isFeatured ? 'text-slate-200' : 'text-slate-400'}>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={() => choosePlan(pkg)}
                      className={`group w-full relative rounded-2xl py-4 px-6 text-sm font-semibold transition-all duration-300 overflow-hidden ${
                        isFeatured
                          ? 'text-[#0a0808]'
                          : 'text-white border border-white/10 hover:border-white/20 bg-white/4 hover:bg-white/7'
                      }`}
                      style={isFeatured ? {
                        background: 'linear-gradient(135deg, #d4a843 0%, #c9984a 50%, #b8882e 100%)',
                        boxShadow: '0 8px 32px rgba(201,168,76,0.3), 0 0 0 1px rgba(201,168,76,0.4) inset',
                      } : {}}
                    >
                      {isFeatured && (
                        <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {t('pricing.choose')}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </div>
                </div>

                {/* Featured label below card */}
                {isFeatured && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="text-center text-[11px] font-semibold tracking-[0.2em] uppercase mt-3"
                    style={{ color: '#d4b86a' }}
                  >
                    ✦ Most Selected
                  </motion.p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom quote ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-center mt-20"
        >
          <div className="luxury-divider max-w-xs mx-auto mb-8" />
          <p className="font-display italic text-slate-500 text-lg mb-3">
            "Every great business deserves a great digital presence."
          </p>
          <p className="text-slate-600 text-sm">
            {t('pricing.custom')}{' '}
            <a href="#contact" className="transition-colors duration-200 font-medium" style={{ color: '#d4b86a' }}>
              {t('pricing.letstalk')} →
            </a>
          </p>
        </motion.div>
      </div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        plan={pendingPlan ?? undefined}
        contextMessage={t('pricing.authPrompt')}
      />
    </section>
  );
}

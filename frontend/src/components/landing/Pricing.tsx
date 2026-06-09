'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/ui/AuthModal';
import { packageAPI } from '@/lib/api';
import { Package } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const defaultPackages: Package[] = [
  {
    _id: '1', name: 'Starter', slug: 'starter', price: 799, originalPrice: 1499, badge: 'Limited Offer',
    description: 'A refined online presence for startups and personal brands.',
    features: ['Up to 5 Pages', 'Responsive Design', 'Contact Form', 'Basic SEO', '2 Revisions', 'Delivery in 14 days'],
    popular: false,
  },
  {
    _id: '2', name: 'Pro', slug: 'pro', price: 1799, originalPrice: 2999, badge: 'Best Deal',
    description: 'Full-featured and built to scale — the choice of ambitious businesses.',
    features: ['Up to 10 Pages', 'Responsive Design', 'CMS Integration', 'Advanced SEO', '3 Revisions', 'Priority Support', 'Analytics Setup', 'Delivery in 21 days'],
    popular: true,
  },
  {
    _id: '3', name: 'Premium', slug: 'premium', price: 3499, originalPrice: 5499, badge: 'Best Value',
    description: 'A bespoke digital experience crafted without compromise.',
    features: ['Unlimited Pages', 'Custom Features', 'Full-Stack Development', 'Advanced SEO', '6 Revisions', 'Priority Support', 'Source Code', '1 Month Maintenance'],
    popular: false,
  },
];

function discountPct(original: number, current: number) {
  return Math.round((1 - current / original) * 100);
}

function AnimatedPrice({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return <span ref={ref}>${display.toLocaleString()}</span>;
}

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

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 ambient-grid opacity-25" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">

        {/* ── Header ── */}
        <div ref={headerRef} className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center mb-7"
          >
            <span className="section-label">{t('pricing.eyebrow')}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-5 tracking-tight leading-[1.04]"
          >
            {t('pricing.title.simple')}{' '}
            <span className="gradient-text">{t('pricing.title.bold')}</span>
            <br className="hidden sm:block" />
            <span className="text-slate-500 font-semibold text-4xl sm:text-5xl lg:text-6xl">{t('pricing.title.end')}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-slate-500 max-w-lg mx-auto text-lg leading-relaxed"
          >
            {t('pricing.subtitle')}
          </motion.p>
        </div>

        {/* ── Cards ── */}
        <div className="grid md:grid-cols-3 gap-5 lg:gap-6 items-stretch">
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
                transition={{ duration: 0.75, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: isFeatured ? -8 : -4 }}
                className="relative flex flex-col"
              >
                {/* Featured outer glow ring — slow animated beam */}
                {isFeatured && (
                  <div
                    className="absolute -inset-px rounded-[28px] pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.5) 0%, rgba(168,85,247,0.2) 35%, rgba(59,130,246,0.4) 65%, rgba(124,58,237,0.5) 100%)',
                      backgroundSize: '300% 300%',
                      animation: 'borderBeam 6s ease infinite',
                    }}
                  />
                )}

                <div className={`relative flex flex-col h-full rounded-3xl overflow-hidden ${
                  isFeatured ? 'premium-surface-featured' : 'premium-surface'
                }`}>

                  {/* Shimmer on featured */}
                  {isFeatured && <div className="absolute inset-0 premium-shimmer pointer-events-none" />}

                  {/* Top accent beam */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                      background: isFeatured
                        ? 'linear-gradient(90deg, transparent, rgba(168,85,247,0.8), rgba(124,58,237,0.5), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)',
                    }}
                  />

                  <div className="relative z-10 p-8 lg:p-10 flex flex-col h-full">

                    {/* Header row */}
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <p className={`text-[10px] font-semibold tracking-[0.22em] uppercase mb-1.5 ${
                          isFeatured ? 'text-violet-400' : 'text-slate-600'
                        }`}>
                          {isFeatured ? 'Most Selected' : 'Package'}
                        </p>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{pkg.name}</h3>
                      </div>

                      {pct > 0 && (
                        <span
                          className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full"
                          style={{
                            background: isFeatured ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                            border: isFeatured ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.08)',
                            color: isFeatured ? '#c4b5fd' : '#64748b',
                          }}
                        >
                          -{pct}%
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-7">
                      {pkg.originalPrice && (
                        <p className="text-slate-700 text-sm line-through mb-1.5 tabular-nums">
                          ${pkg.originalPrice.toLocaleString()}
                        </p>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className={`text-6xl lg:text-7xl font-black leading-none tracking-tight tabular-nums ${
                          isFeatured ? 'text-white' : 'text-white'
                        }`}>
                          <AnimatedPrice value={pkg.price} />
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] tracking-widest uppercase mt-2">per project</p>
                      {savings > 0 && (
                        <p className={`text-xs font-semibold mt-2 ${
                          isFeatured ? 'text-violet-400' : 'text-slate-500'
                        }`}>
                          Save ${savings.toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Divider */}
                    <div
                      className="mb-7 h-px"
                      style={{
                        background: isFeatured
                          ? 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)'
                          : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
                      }}
                    />

                    {/* Description */}
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                      {pkg.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-3.5 mb-10 flex-1">
                      {pkg.features?.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <div
                            className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0"
                            style={{
                              background: isFeatured ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.05)',
                              border: isFeatured ? '1px solid rgba(124,58,237,0.35)' : '1px solid rgba(255,255,255,0.08)',
                            }}
                          >
                            <Check
                              className="w-2.5 h-2.5"
                              style={{ color: isFeatured ? '#a78bfa' : '#475569' }}
                              strokeWidth={2.5}
                            />
                          </div>
                          <span className={`text-sm ${isFeatured ? 'text-slate-300' : 'text-slate-500'}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={() => choosePlan(pkg)}
                      className="group relative w-full rounded-2xl py-4 text-sm font-semibold transition-all duration-300 overflow-hidden"
                      style={isFeatured ? {
                        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
                        color: '#fff',
                        boxShadow: '0 8px 32px rgba(124,58,237,0.35), 0 0 0 1px rgba(168,85,247,0.3) inset',
                      } : {
                        background: 'rgba(255,255,255,0.04)',
                        color: '#94a3b8',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isFeatured) {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.08)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,58,237,0.3)';
                          (e.currentTarget as HTMLButtonElement).style.color = '#e2e8f0';
                        } else {
                          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 40px rgba(124,58,237,0.5), 0 0 0 1px rgba(168,85,247,0.4) inset';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isFeatured) {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
                          (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
                        } else {
                          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(124,58,237,0.35), 0 0 0 1px rgba(168,85,247,0.3) inset';
                        }
                      }}
                    >
                      {isFeatured && (
                        <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {t('pricing.choose')}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom line ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-slate-600 mt-14 text-sm"
        >
          {t('pricing.custom')}{' '}
          <a href="#contact" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            {t('pricing.letstalk')} →
          </a>
        </motion.p>
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

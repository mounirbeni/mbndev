'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Tag, Flame, Trophy, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import AuthModal from '@/components/ui/AuthModal';
import { packageAPI } from '@/lib/api';
import { Package } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const defaultPackages: Package[] = [
  {
    _id: '1', name: 'Starter', slug: 'starter', price: 799, originalPrice: 1499, badge: 'Limited Offer',
    description: 'Perfect for small businesses and personal projects',
    features: ['Up to 5 Pages', 'Responsive Design', 'Contact Form', 'Basic SEO', '2 Revisions', 'Delivery in 14 days'],
    popular: false,
  },
  {
    _id: '2', name: 'Pro', slug: 'pro', price: 1799, originalPrice: 2999, badge: 'Best Deal',
    description: 'Best for growing businesses who need more',
    features: ['Up to 10 Pages', 'Responsive Design', 'CMS Integration', 'Advanced SEO', '3 Revisions', 'Priority Support', 'Analytics Setup', 'Delivery in 21 days'],
    popular: true,
  },
  {
    _id: '3', name: 'Premium', slug: 'premium', price: 3499, originalPrice: 5499, badge: 'Best Value',
    description: 'For complex projects with custom requirements',
    features: ['Unlimited Pages', 'Custom Features', 'Full-Stack Development', 'Advanced SEO', '6 Revisions', 'Priority Support', 'Source Code', '1 Month Maintenance'],
    popular: false,
  },
];

const BADGE_STYLES: Record<string, { icon: any; className: string }> = {
  'Limited Offer': { icon: Flame,  className: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  'Best Deal':     { icon: Tag,    className: 'bg-primary-500/20 text-primary-300 border-primary-500/30' },
  'Best Value':    { icon: Trophy, className: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
};

function discountPct(original: number, current: number) {
  return Math.round((1 - current / original) * 100);
}

export default function Pricing() {
  const { user } = useAuth();
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>(defaultPackages);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);

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
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary-400 text-sm font-medium uppercase tracking-widest mb-3 block">
            Transparent Pricing
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Compare to market rates — you save up to <span className="text-green-400 font-semibold">47%</span> vs average freelancer pricing.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {packages.map((pkg, i) => {
            const pct = pkg.originalPrice ? discountPct(pkg.originalPrice, pkg.price) : 0;
            const badgeConfig = pkg.badge ? BADGE_STYLES[pkg.badge] : null;
            const BadgeIcon = badgeConfig?.icon ?? Tag;

            return (
              <motion.div
                key={pkg._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative glass rounded-2xl p-8 border transition-all ${
                  pkg.popular
                    ? 'border-primary-500 scale-105 shadow-xl shadow-primary-500/20'
                    : 'border-white/5 hover:border-primary-500/30'
                }`}
              >
                {/* Popular badge */}
                {pkg.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Discount % pill — top right */}
                {pct > 0 && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold px-2 py-0.5 rounded-full">
                      -{pct}%
                    </span>
                  </div>
                )}

                {/* Promo badge */}
                {badgeConfig && pkg.badge && (
                  <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border mb-4 ${badgeConfig.className}`}>
                    <BadgeIcon className="w-3 h-3" />
                    {pkg.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-white font-bold text-xl mb-1">{pkg.name}</h3>
                  <p className="text-slate-400 text-sm">{pkg.description}</p>
                </div>

                {/* Price block */}
                <div className="mb-6">
                  {pkg.originalPrice && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-500 text-sm line-through">${pkg.originalPrice.toLocaleString()}</span>
                      <span className="text-green-400 text-xs font-medium">Market avg</span>
                    </div>
                  )}
                  <div className="flex items-end gap-1.5">
                    <span className="text-5xl font-bold text-white">${pkg.price.toLocaleString()}</span>
                    <span className="text-slate-400 text-sm mb-1.5">/ project</span>
                  </div>
                  {pkg.originalPrice && (
                    <p className="text-green-400 text-xs font-semibold mt-1">
                      You save ${(pkg.originalPrice - pkg.price).toLocaleString()} vs market
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features?.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-primary-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={pkg.popular ? 'primary' : 'outline'}
                  size="md"
                  className="w-full"
                  onClick={() => choosePlan(pkg)}
                >
                  Choose Plan
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-slate-500 mt-8 text-sm"
        >
          Need something custom?{' '}
          <a href="#contact" className="text-primary-400 hover:text-primary-300 transition-colors">
            Let&apos;s talk
          </a>{' '}
          about your project.
        </motion.p>
      </div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        plan={pendingPlan ?? undefined}
        contextMessage="Sign up to start your project request and track everything in your dashboard."
      />
    </section>
  );
}

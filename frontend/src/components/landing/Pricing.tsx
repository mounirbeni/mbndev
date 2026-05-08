'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import AuthModal from '@/components/ui/AuthModal';
import { packageAPI } from '@/lib/api';
import { Package } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const defaultPackages: Package[] = [
  {
    _id: '1',
    name: 'Starter',
    slug: 'starter',
    price: 799,
    description: 'Perfect for small businesses and personal projects',
    features: ['Up to 5 Pages', 'Responsive Design', 'Contact Form', 'Basic SEO', '2 Revisions', 'Delivery in 14 days'],
    popular: false,
  },
  {
    _id: '2',
    name: 'Pro',
    slug: 'pro',
    price: 1799,
    description: 'Best for growing businesses who need more',
    features: ['Up to 10 Pages', 'Responsive Design', 'CMS Integration', 'Advanced SEO', '3 Revisions', 'Priority Support', 'Analytics Setup', 'Delivery in 21 days'],
    popular: true,
  },
  {
    _id: '3',
    name: 'Premium',
    slug: 'premium',
    price: 3499,
    description: 'For complex projects with custom requirements',
    features: ['Unlimited Pages', 'Custom Features', 'Full-Stack Development', 'Advanced SEO', '6 Revisions', 'Priority Support', 'Source Code', '1 Month Maintenance'],
    popular: false,
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>(defaultPackages);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);

  useEffect(() => {
    packageAPI.getAll()
      .then(({ data }) => { if (data.packages?.length) setPackages(data.packages); })
      .catch(() => {}); // silently fall back to defaults
  }, []);

  const choosePlan = (pkg: Package) => {
    // Save selected plan so it survives auth
    localStorage.setItem('mbndev_selected_plan', pkg.slug);
    if (user) {
      router.push(`/request?package=${pkg.slug}`);
    } else {
      setPendingPlan(pkg.slug);
      setAuthOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    const plan = pendingPlan || localStorage.getItem('mbndev_selected_plan') || '';
    router.push(`/request?package=${plan}`);
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
            Choose the perfect plan for your project. No hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {packages.map((pkg, i) => (
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
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-white font-bold text-xl mb-1">{pkg.name}</h3>
                <p className="text-slate-400 text-sm">{pkg.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-bold text-white">${pkg.price}</span>
                <span className="text-slate-400 text-sm ml-1">/ project</span>
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
          ))}
        </div>

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

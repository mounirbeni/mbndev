'use client';

import { useState, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  ArrowLeft, ArrowRight, Check, Zap, Target, ShoppingCart,
  BarChart3, Palette, Settings, Lightbulb, Smartphone,
  type LucideIcon,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { orderAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Service Type', 'Configuration', 'Design', 'Summary'];

const serviceTypes: { value: string; label: string; desc: string; icon: LucideIcon; base: number }[] = [
  { value: 'website',   label: 'Website',        desc: 'Landing page / brochure site',      icon: Target,       base: 499  },
  { value: 'ecommerce', label: 'E-Commerce',      desc: 'Online store with payments',        icon: ShoppingCart, base: 999  },
  { value: 'dashboard', label: 'SaaS Dashboard',  desc: 'Complex web application',           icon: BarChart3,    base: 1299 },
  { value: 'mobile',    label: 'Mobile App',      desc: 'iOS & Android (React Native/PWA)',  icon: Smartphone,   base: 1799 },
  { value: 'custom',    label: 'Custom Project',  desc: 'Something unique — let\'s talk',   icon: Lightbulb,    base: 699  },
];

const FEATURES: { key: string; label: string; price: number; desc: string }[] = [
  { key: 'auth',       label: 'User Authentication',  price: 150, desc: 'Login, register, profiles' },
  { key: 'payment',    label: 'Payment Integration',  price: 200, desc: 'Stripe, PayPal checkout' },
  { key: 'dashboard',  label: 'Admin Dashboard',      price: 300, desc: 'Backend control panel' },
  { key: 'multilang',  label: 'Multi-language',       price: 120, desc: 'i18n / localization' },
  { key: 'seo',        label: 'SEO Optimization',     price: 80,  desc: 'Meta, sitemap, schema' },
  { key: 'api',        label: 'API Integration',      price: 200, desc: 'Third-party REST APIs' },
  { key: 'hosting',    label: 'Hosting Setup',        price: 50,  desc: 'Deployment & config' },
];

const BASE_PRICES: Record<string, number> = {
  website: 499, ecommerce: 999, dashboard: 1299, mobile: 1799, custom: 699,
};
const BASE_DELIVERY: Record<string, number> = {
  website: 14, ecommerce: 21, dashboard: 28, mobile: 35, custom: 21,
};
const FEATURE_PRICES: Record<string, number> = {
  auth: 150, payment: 200, dashboard: 300, multilang: 120, seo: 80, api: 200, hosting: 50,
};

function calcPrice(serviceType: string, pages: number, features: string[], addons: string[]) {
  const base      = BASE_PRICES[serviceType] || 699;
  const pageExtra = Math.max(0, pages - 5) * 30;
  const feat      = features.reduce((s, k) => s + (FEATURE_PRICES[k] || 0), 0);
  const addon     = addons.includes('fastDelivery') ? 200 : 0;
  let   days      = BASE_DELIVERY[serviceType] || 21;
  if (addons.includes('fastDelivery')) days = Math.ceil(days * 0.6);
  return { total: base + pageExtra + feat + addon, days, base, pageExtra, feat, addon };
}

const designStyles = ['Minimalist', 'Corporate', 'Creative', 'Tech/Dark', 'Luxury', 'Colorful'];

// ─── Page ─────────────────────────────────────────────────────────────────────

function RequestPageContent() {
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const { user }              = useAuth();
  const router                = useRouter();
  const params                = useSearchParams();

  const [form, setForm] = useState({
    serviceType:  'website',
    title:        '',
    description:  '',
    pages:        5,
    features:     [] as string[],
    addons:       [] as string[],
    notes:        '',
    designStyle:  '',
    colors:       '',
    references:   '',
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const toggleArr = (k: 'features' | 'addons', val: string) =>
    setForm((f) => ({
      ...f,
      [k]: f[k].includes(val) ? f[k].filter((x) => x !== val) : [...f[k], val],
    }));

  const pricing = calcPrice(form.serviceType, form.pages, form.features, form.addons);

  const canNext = () => {
    if (step === 0) return !!form.serviceType;
    if (step === 1) return form.title.length >= 3 && form.description.length >= 10;
    return true;
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to place an order');
      router.push('/login?redirect=/request');
      return;
    }

    setLoading(true);
    try {
      const { data } = await orderAPI.create({
        serviceType:  form.serviceType,
        title:        form.title,
        description:  form.description,
        pages:        form.pages,
        features:     form.features,
        addons:       form.addons,
        notes:        form.notes || undefined,
        designStyle:  form.designStyle || undefined,
        designColors: form.colors ? form.colors.split(',').map((c) => c.trim()) : [],
        designRefs:   form.references ? form.references.split('\n').filter(Boolean) : [],
      });

      toast.success('Order created! Redirecting to checkout…');
      router.push(`/checkout/${data.order.id}`);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        toast.error('Please sign in first');
        router.push('/login?redirect=/request');
      } else {
        toast.error(err?.response?.data?.message || 'Failed to create order');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/5 px-4 sm:px-6 py-4 flex items-center gap-4 shrink-0">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-sm sm:text-base">MBN DEV — Request Service</span>
        </div>

        {/* Live price pill */}
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-primary-300"
             style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
          <span className="text-slate-500 font-normal text-xs">Total</span>
          ${pricing.total.toLocaleString()}
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center p-4 sm:p-6 py-6 sm:py-10">
        <div className="w-full max-w-2xl">

          {/* Progress bar */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                      i < step
                        ? 'bg-primary-500 text-white'
                        : i === step
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500'
                        : 'bg-white/5 text-slate-600'
                    }`}
                  >
                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-1 transition-colors ${i < step ? 'bg-primary-500' : 'bg-white/10'}`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-slate-500 text-sm">
              Step {step + 1} of {STEPS.length} — <span className="text-slate-300">{STEPS[step]}</span>
            </p>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="glass rounded-2xl p-5 sm:p-8 border border-white/10"
            >

              {/* Step 0: Service Type */}
              {step === 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">What do you need?</h2>
                  <p className="text-slate-400 text-sm mb-5">Select the service type for your project.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {serviceTypes.map((t) => {
                      const Icon   = t.icon;
                      const active = form.serviceType === t.value;
                      return (
                        <button
                          key={t.value}
                          onClick={() => set('serviceType', t.value)}
                          className={`p-4 rounded-xl text-left border transition-all ${
                            active
                              ? 'bg-primary-500/15 border-primary-500 text-white'
                              : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                 style={{ background: active ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.07)' }}>
                              <Icon className={`w-4 h-4 ${active ? 'text-primary-400' : 'text-slate-400'}`} />
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                              active ? 'bg-primary-500/20 text-primary-300' : 'bg-white/5 text-slate-500'
                            }`}>
                              from ${t.base.toLocaleString()}
                            </span>
                          </div>
                          <div className="font-semibold text-sm mt-2.5">{t.label}</div>
                          <div className="text-xs opacity-60 mt-0.5">{t.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 1: Configuration */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Configure Your Project</h2>
                    <p className="text-slate-400 text-sm">Set up details and select features.</p>
                  </div>

                  <Input
                    label="Project Title *"
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="e.g. My Brand's E-Commerce Store"
                    required
                  />

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Description *</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500/60 resize-none"
                      placeholder="Describe what you need — target audience, goals, key requirements…"
                    />
                  </div>

                  {/* Pages slider */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      Number of Pages <span className="text-primary-400 font-bold ml-1">{form.pages}</span>
                      {form.pages > 5 && (
                        <span className="text-slate-500 ml-1.5">(+${(form.pages - 5) * 30} for extra pages)</span>
                      )}
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      value={form.pages}
                      onChange={(e) => set('pages', Number(e.target.value))}
                      className="w-full accent-primary-500"
                    />
                    <div className="flex justify-between text-xs text-slate-600 mt-1">
                      <span>1 page</span>
                      <span>5 pages (base)</span>
                      <span>20 pages</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      Features <span className="text-slate-600">({form.features.length} selected)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {FEATURES.map((f) => {
                        const on = form.features.includes(f.key);
                        return (
                          <button
                            key={f.key}
                            onClick={() => toggleArr('features', f.key)}
                            className={`flex items-center gap-2.5 p-3 rounded-xl text-left border transition-all text-sm ${
                              on
                                ? 'bg-primary-500/15 border-primary-500/60 text-white'
                                : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              on ? 'bg-primary-500 border-primary-500' : 'border-white/30'
                            }`}>
                              {on && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-xs leading-tight">{f.label}</div>
                              <div className="text-slate-500 text-[10px]">{f.desc}</div>
                            </div>
                            <span className={`text-xs shrink-0 ${on ? 'text-primary-400' : 'text-slate-600'}`}>
                              +${f.price}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fast delivery add-on */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Add-ons</label>
                    <button
                      onClick={() => toggleArr('addons', 'fastDelivery')}
                      className={`flex items-center gap-2.5 p-3 rounded-xl text-left border transition-all w-full ${
                        form.addons.includes('fastDelivery')
                          ? 'bg-amber-500/15 border-amber-500/60 text-white'
                          : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        form.addons.includes('fastDelivery') ? 'bg-amber-500 border-amber-500' : 'border-white/30'
                      }`}>
                        {form.addons.includes('fastDelivery') && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <div className="flex-1 text-sm font-medium">⚡ Fast Delivery</div>
                      <span className="text-xs text-amber-400">+$200 · 40% faster</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Additional Notes (optional)</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => set('notes', e.target.value)}
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500/60 resize-none"
                      placeholder="Anything else we should know…"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Design */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Design Preferences</h2>
                    <p className="text-slate-400 text-sm">Help us understand your visual style. (optional)</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Design Style</label>
                    <div className="flex flex-wrap gap-2">
                      {designStyles.map((s) => (
                        <button
                          key={s}
                          onClick={() => set('designStyle', form.designStyle === s ? '' : s)}
                          className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                            form.designStyle === s
                              ? 'bg-primary-500/20 border-primary-500 text-primary-300'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Input
                    label="Brand Colors (optional)"
                    value={form.colors}
                    onChange={(e) => set('colors', e.target.value)}
                    placeholder="e.g. #7c3aed, #3b82f6, white"
                  />
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Reference Websites (optional)
                    </label>
                    <textarea
                      value={form.references}
                      onChange={(e) => set('references', e.target.value)}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500/60 resize-none"
                      placeholder="https://example.com&#10;https://another-site.com"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Summary */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Order Summary</h2>
                  <p className="text-slate-400 text-sm mb-5">Review your configuration before proceeding to payment.</p>

                  {/* Price breakdown */}
                  <div className="rounded-xl p-4 mb-4 space-y-2"
                       style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Base price ({serviceTypes.find(s => s.value === form.serviceType)?.label})</span>
                      <span className="text-white">${pricing.base}</span>
                    </div>
                    {pricing.pageExtra > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Extra pages ({form.pages - 5} × $30)</span>
                        <span className="text-white">+${pricing.pageExtra}</span>
                      </div>
                    )}
                    {pricing.feat > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Features ({form.features.length})</span>
                        <span className="text-white">+${pricing.feat}</span>
                      </div>
                    )}
                    {pricing.addon > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Fast Delivery add-on</span>
                        <span className="text-amber-400">+${pricing.addon}</span>
                      </div>
                    )}
                    <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-primary-400 text-lg">${pricing.total.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-slate-500 text-center pt-1">
                      🗓️ Estimated delivery: <span className="text-slate-300">{pricing.days} business days</span>
                    </div>
                  </div>

                  {/* Summary rows */}
                  <div className="space-y-2 mb-4">
                    {[
                      { label: 'Service',   value: serviceTypes.find(s => s.value === form.serviceType)?.label || form.serviceType },
                      { label: 'Title',     value: form.title },
                      { label: 'Pages',     value: `${form.pages}` },
                      { label: 'Features',  value: form.features.length > 0 ? form.features.join(', ') : 'None' },
                      { label: 'Add-ons',   value: form.addons.length > 0 ? form.addons.join(', ') : 'None' },
                      { label: 'Style',     value: form.designStyle || 'Not specified' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex gap-3 py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-slate-500 text-sm w-20 sm:w-24 shrink-0">{label}</span>
                        <span className="text-slate-200 text-sm capitalize break-all">{value}</span>
                      </div>
                    ))}
                  </div>

                  {!user && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <p className="text-yellow-400 text-sm">
                        You need to{' '}
                        <Link href="/login" className="underline font-medium">sign in</Link>{' '}
                        to proceed to payment.
                      </p>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-5">
            <Button variant="outline" onClick={back} disabled={step === 0}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={next} disabled={!canNext()}>
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading}>
                Proceed to Checkout →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RequestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-300 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RequestPageContent />
    </Suspense>
  );
}

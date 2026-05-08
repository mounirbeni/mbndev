'use client';

import { useState, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  ArrowLeft, ArrowRight, Check, Zap, Target, ShoppingCart,
  BarChart3, Palette, Settings, Lightbulb, Smartphone,
  Minus, Briefcase, Wand2, Terminal, Crown, Layers,
  Feather, Smile, Type, BookOpen, Calendar, Lock,
  type LucideIcon,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AuthModal from '@/components/ui/AuthModal';
import PlanBadge from '@/components/ui/PlanBadge';
import { orderAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Service Type', 'Configuration', 'Design', 'Summary'];

const serviceTypes: { value: string; label: string; desc: string; icon: LucideIcon; base: number; marketValue: string }[] = [
  { value: 'website',   label: 'Website',        desc: 'Landing page / brochure site',      icon: Target,       base: 799,  marketValue: '$1,500+' },
  { value: 'ecommerce', label: 'E-Commerce',      desc: 'Online store with payments',        icon: ShoppingCart, base: 1499, marketValue: '$3,000+' },
  { value: 'dashboard', label: 'SaaS Dashboard',  desc: 'Complex web application',           icon: BarChart3,    base: 2499, marketValue: '$8,000+' },
  { value: 'mobile',    label: 'Mobile App',      desc: 'iOS & Android (React Native/PWA)',  icon: Smartphone,   base: 3999, marketValue: '$12,000+' },
  { value: 'custom',    label: 'Custom Project',  desc: 'Something unique — let\'s talk',   icon: Lightbulb,    base: 1199, marketValue: '$2,500+' },
];

const FEATURES: { key: string; label: string; price: number; marketValue: number; desc: string }[] = [
  { key: 'auth',       label: 'User Authentication',  price: 400, marketValue: 800,  desc: 'Login, register, profiles' },
  { key: 'payment',    label: 'Payment Integration',  price: 500, marketValue: 950,  desc: 'Stripe, PayPal checkout' },
  { key: 'dashboard',  label: 'Admin Dashboard',      price: 800, marketValue: 1500, desc: 'Backend control panel' },
  { key: 'multilang',  label: 'Multi-language',       price: 300, marketValue: 550,  desc: 'i18n / localization' },
  { key: 'seo',        label: 'SEO Optimization',     price: 250, marketValue: 450,  desc: 'Meta, sitemap, schema' },
  { key: 'api',        label: 'API Integration',      price: 400, marketValue: 750,  desc: 'Third-party REST APIs' },
  { key: 'hosting',    label: 'Hosting Setup',        price: 150, marketValue: 280,  desc: 'Deployment & config' },
];

const BASE_PRICES: Record<string, number> = {
  website: 799, ecommerce: 1499, dashboard: 2499, mobile: 3999, custom: 1199,
};
const BASE_DELIVERY: Record<string, number> = {
  website: 14, ecommerce: 21, dashboard: 30, mobile: 45, custom: 21,
};
const FEATURE_PRICES: Record<string, number> = {
  auth: 400, payment: 500, dashboard: 800, multilang: 300, seo: 250, api: 400, hosting: 150,
};

// ─── Package Inclusions ───────────────────────────────────────────────────────
// Defines what each pricing package includes for FREE

const PACKAGE_INCLUSIONS: Record<string, {
  label: string;
  price: number;
  includedPages: number; // 99 = unlimited
  includedFeatures: string[];
  summary: string;
}> = {
  starter: {
    label:            'Starter',
    price:            799,
    includedPages:    5,
    includedFeatures: ['seo', 'hosting'],
    summary:          '5 pages · SEO optimization · Hosting setup',
  },
  pro: {
    label:            'Pro',
    price:            1799,
    includedPages:    10,
    includedFeatures: ['seo', 'hosting', 'auth', 'api'],
    summary:          '10 pages · SEO · Hosting · Authentication · API integration',
  },
  premium: {
    label:            'Premium',
    price:            3499,
    includedPages:    99, // effectively unlimited
    includedFeatures: ['seo', 'hosting', 'auth', 'api', 'payment', 'dashboard', 'multilang'],
    summary:          'Unlimited pages · All features included',
  },
};

// ─── Pricing Calculator ───────────────────────────────────────────────────────

function calcPrice(
  serviceType: string,
  pages: number,
  features: string[],
  addons: string[],
  plan?: string | null,
) {
  const pkg          = plan ? PACKAGE_INCLUSIONS[plan] : null;
  const base         = pkg ? pkg.price : (BASE_PRICES[serviceType] || 1199);
  const includedPages = pkg ? pkg.includedPages : 5;
  const includedFeats = pkg ? pkg.includedFeatures : [];

  const pageExtra   = Math.max(0, pages - includedPages) * 50;
  const paidFeats   = features.filter((k) => !includedFeats.includes(k));
  const feat        = paidFeats.reduce((s, k) => s + (FEATURE_PRICES[k] || 0), 0);
  const addon       = addons.includes('fastDelivery') ? Math.round(base * 0.3) : 0;
  let   days        = BASE_DELIVERY[serviceType] || 21;
  if (addons.includes('fastDelivery')) days = Math.ceil(days * 0.6);

  return { total: base + pageExtra + feat + addon, days, base, pageExtra, feat, addon, pkg, includedFeats, includedPages };
}

// ─── Design Styles ────────────────────────────────────────────────────────────

const designStyles: { value: string; label: string; icon: LucideIcon; desc: string }[] = [
  { value: 'Minimalist', label: 'Minimalist', icon: Minus,     desc: 'Clean & spacious'        },
  { value: 'Corporate',  label: 'Corporate',  icon: Briefcase, desc: 'Professional & formal'   },
  { value: 'Creative',   label: 'Creative',   icon: Wand2,     desc: 'Unique & artistic'       },
  { value: 'Tech / Dark',label: 'Tech / Dark',icon: Terminal,  desc: 'Dark UI, futuristic'     },
  { value: 'Luxury',     label: 'Luxury',     icon: Crown,     desc: 'Premium & high-end'      },
  { value: 'Colorful',   label: 'Colorful',   icon: Palette,   desc: 'Vibrant & energetic'     },
  { value: 'Modern',     label: 'Modern',     icon: Layers,    desc: 'Sleek & contemporary'    },
  { value: 'Elegant',    label: 'Elegant',    icon: Feather,   desc: 'Refined & sophisticated' },
  { value: 'Playful',    label: 'Playful',    icon: Smile,     desc: 'Fun & friendly'          },
  { value: 'Classic',    label: 'Classic',    icon: BookOpen,  desc: 'Timeless & trustworthy'  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

function RequestPageContent() {
  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user }                = useAuth();
  const router                  = useRouter();
  const params                  = useSearchParams();
  const selectedPlan            = params.get('package') || (typeof window !== 'undefined' ? localStorage.getItem('mbndev_selected_plan') : null);
  const planData                = selectedPlan ? PACKAGE_INCLUSIONS[selectedPlan] : null;

  const [form, setForm] = useState({
    serviceType:  'website',
    title:        '',
    description:  '',
    pages:        5,
    features:     [] as string[],
    addons:       [] as string[],
    notes:        '',
    designStyle:  [] as string[],
    colors:       '',
    references:   '',
  });

  // ── Draft persistence ─────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem('mbndev_request_draft');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setForm((prev) => ({ ...prev, ...parsed }));
      const savedStep = localStorage.getItem('mbndev_request_step');
      if (savedStep) setStep(Math.min(parseInt(savedStep, 10), STEPS.length - 1));
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Pre-populate plan-included features & set plan pages ──────────────────
  useEffect(() => {
    if (!selectedPlan || !planData) return;
    setForm((f) => ({
      ...f,
      // Merge included features without removing user-selected extras
      features: Array.from(new Set([...f.features, ...planData.includedFeatures])),
      // Set pages to plan limit if currently below it (but don't shrink if user set more)
      pages: planData.includedPages < 99
        ? Math.max(f.pages, planData.includedPages)
        : f.pages,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlan]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mbndev_request_draft', JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mbndev_request_step', String(step));
  }, [step]);
  // ──────────────────────────────────────────────────────────────────────────

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  // Prevent deselecting plan-included features
  const toggleArr = (k: 'features' | 'addons', val: string) => {
    if (k === 'features' && selectedPlan && planData?.includedFeatures.includes(val)) return;
    setForm((f) => ({
      ...f,
      [k]: f[k].includes(val) ? f[k].filter((x) => x !== val) : [...f[k], val],
    }));
  };

  const toggleStyle = (val: string) =>
    setForm((f) => {
      if (f.designStyle.includes(val))
        return { ...f, designStyle: f.designStyle.filter((s) => s !== val) };
      if (f.designStyle.length >= 3) {
        toast.error('You can select up to 3 styles');
        return f;
      }
      return { ...f, designStyle: [...f.designStyle, val] };
    });

  const pricing = calcPrice(form.serviceType, form.pages, form.features, form.addons, selectedPlan);

  const canNext = () => {
    if (step === 0) return !!form.serviceType;
    if (step === 1) return form.title.length >= 3 && form.description.length >= 10;
    return true;
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submitOrder = async () => {
    setLoading(true);
    try {
      const plan = params.get('package') || localStorage.getItem('mbndev_selected_plan') || undefined;
      const { data } = await orderAPI.create({
        serviceType:  form.serviceType,
        title:        form.title,
        description:  form.description,
        pages:        form.pages,
        features:     form.features,
        addons:       form.addons,
        notes:        form.notes || undefined,
        designStyle:  form.designStyle.length > 0 ? form.designStyle.join(', ') : undefined,
        designColors: form.colors ? form.colors.split(',').map((c) => c.trim()) : [],
        designRefs:   form.references ? form.references.split('\n').filter(Boolean) : [],
        plan,
      });

      toast.success('Order created! Redirecting to checkout…');
      localStorage.removeItem('mbndev_request_draft');
      localStorage.removeItem('mbndev_request_step');
      localStorage.removeItem('mbndev_selected_plan');
      router.push(`/checkout/${data.order.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) { setAuthOpen(true); return; }
    await submitOrder();
  };

  // Extra features = selected features NOT in plan
  const extraFeatures = form.features.filter((k) => !pricing.includedFeats.includes(k));

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
          {selectedPlan && <PlanBadge plan={selectedPlan} size="sm" />}
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

              {/* ── Step 0: Service Type ─────────────────────────────────── */}
              {step === 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">What do you need?</h2>
                  <p className="text-slate-400 text-sm mb-4">Select the service type for your project.</p>

                  {/* Plan inclusion banner */}
                  {planData && (
                    <div className="mb-5 p-3.5 rounded-xl border border-green-500/25 bg-green-500/8">
                      <div className="flex items-center gap-2 mb-1.5">
                        <PlanBadge plan={selectedPlan!} size="sm" />
                        <span className="text-white text-sm font-semibold">Package Active</span>
                        <span className="ml-auto text-green-400 text-xs font-bold">
                          ${planData.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-green-400/80 text-xs leading-relaxed">{planData.summary}</p>
                      <p className="text-slate-400 text-[10px] mt-1.5">
                        ✓ Included items are free — only extras beyond your plan are charged
                      </p>
                    </div>
                  )}

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
                            <div className="flex flex-col items-end gap-0.5">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                                active ? 'bg-primary-500/20 text-primary-300' : 'bg-white/5 text-slate-500'
                              }`}>
                                {planData ? 'included' : `from $${t.base.toLocaleString()}`}
                              </span>
                              <span className="text-[10px] text-green-500/70 font-medium">
                                market {t.marketValue}
                              </span>
                            </div>
                          </div>
                          <div className="font-semibold text-sm mt-2.5">{t.label}</div>
                          <div className="text-xs opacity-60 mt-0.5">{t.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Step 1: Configuration ────────────────────────────────── */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Configure Your Project</h2>
                    <p className="text-slate-400 text-sm">Set up details and select features.</p>
                  </div>

                  {/* Plan inclusions reminder */}
                  {planData && (
                    <div className="flex items-start gap-2 p-3 rounded-xl border border-green-500/20 bg-green-500/6">
                      <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                      <p className="text-green-400/80 text-xs leading-relaxed">
                        <span className="text-green-400 font-semibold">{planData.label} Plan:</span>{' '}
                        {planData.summary} — all marked <span className="font-semibold">FREE</span> below.
                      </p>
                    </div>
                  )}

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
                    <label className="block text-xs font-medium text-slate-400 mb-2 flex flex-wrap items-center gap-1.5">
                      Number of Pages
                      <span className="text-primary-400 font-bold">{form.pages}</span>
                      {planData ? (
                        pricing.includedPages >= 99 ? (
                          <span className="text-green-400 text-[10px] font-semibold bg-green-500/10 px-1.5 py-0.5 rounded-md border border-green-500/20">
                            unlimited included in your plan
                          </span>
                        ) : (
                          <>
                            <span className="text-green-400 text-[10px] font-semibold bg-green-500/10 px-1.5 py-0.5 rounded-md border border-green-500/20">
                              {pricing.includedPages} included in your plan
                            </span>
                            {form.pages > pricing.includedPages && (
                              <span className="text-slate-500 text-[10px]">
                                (+${(form.pages - pricing.includedPages) * 50} extra)
                              </span>
                            )}
                          </>
                        )
                      ) : (
                        form.pages > 5 && (
                          <span className="text-slate-500">(+${(form.pages - 5) * 50} for extra pages)</span>
                        )
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
                      {planData ? (
                        <span className="text-green-500/60">
                          {pricing.includedPages >= 99 ? 'all pages free' : `${pricing.includedPages} free`}
                        </span>
                      ) : (
                        <span>5 pages (base)</span>
                      )}
                      <span>20 pages</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      Features
                      <span className="text-slate-600 ml-1">
                        ({pricing.includedFeats.length > 0 && `${pricing.includedFeats.length} included · `}
                        {extraFeatures.length} extra)
                      </span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {FEATURES.map((f) => {
                        const isIncluded = pricing.includedFeats.includes(f.key);
                        const isSelected = form.features.includes(f.key);
                        return (
                          <button
                            key={f.key}
                            onClick={() => toggleArr('features', f.key)}
                            disabled={isIncluded}
                            className={`flex items-center gap-2.5 p-3 rounded-xl text-left border transition-all text-sm ${
                              isIncluded
                                ? 'bg-green-500/8 border-green-500/25 text-white cursor-default'
                                : isSelected
                                ? 'bg-primary-500/15 border-primary-500/60 text-white'
                                : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
                            }`}
                          >
                            {/* Checkbox */}
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isIncluded
                                ? 'bg-green-500 border-green-500'
                                : isSelected
                                ? 'bg-primary-500 border-primary-500'
                                : 'border-white/30'
                            }`}>
                              {(isSelected || isIncluded) && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-xs leading-tight flex items-center gap-1.5">
                                {f.label}
                                {isIncluded && (
                                  <Lock className="w-2.5 h-2.5 text-green-500/60 shrink-0" />
                                )}
                              </div>
                              <div className="text-slate-500 text-[10px]">{f.desc}</div>
                            </div>

                            {/* Price / FREE badge */}
                            <div className="flex flex-col items-end shrink-0 gap-0.5">
                              {isIncluded ? (
                                <>
                                  <span className="text-xs font-bold text-green-400">FREE</span>
                                  <span className="text-[9px] text-green-500/50 font-medium">in your plan</span>
                                </>
                              ) : (
                                <>
                                  <span className={`text-xs font-semibold ${isSelected ? 'text-primary-400' : 'text-slate-500'}`}>
                                    +${f.price}
                                  </span>
                                  <span className="text-[9px] text-slate-700 line-through">
                                    ${f.marketValue}
                                  </span>
                                </>
                              )}
                            </div>
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
                      <div className="flex items-center gap-2 flex-1 text-sm font-medium">
                        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        Fast Delivery
                      </div>
                      <span className="text-xs text-amber-400">+30% of base · 40% faster delivery</span>
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

              {/* ── Step 2: Design ───────────────────────────────────────── */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Design Preferences</h2>
                    <p className="text-slate-400 text-sm">Help us understand your visual style. (optional)</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium text-slate-400">Design Style</label>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                        form.designStyle.length === 3
                          ? 'text-primary-300 bg-primary-500/15'
                          : 'text-slate-500 bg-white/5'
                      }`}>
                        {form.designStyle.length} / 3
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {designStyles.map(({ value, label, icon: Icon, desc }) => {
                        const active = form.designStyle.includes(value);
                        const maxed  = !active && form.designStyle.length >= 3;
                        return (
                          <button
                            key={value}
                            onClick={() => toggleStyle(value)}
                            disabled={maxed}
                            className={`flex items-center gap-2.5 p-3 rounded-xl text-left border transition-all ${
                              active
                                ? 'bg-primary-500/15 border-primary-500 text-white'
                                : maxed
                                ? 'bg-white/3 border-white/5 text-slate-600 cursor-not-allowed'
                                : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 relative ${
                              active ? 'bg-primary-500/25' : 'bg-white/8'
                            }`}>
                              <Icon className={`w-4 h-4 ${active ? 'text-primary-400' : maxed ? 'text-slate-600' : 'text-slate-400'}`} />
                              {active && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary-500 rounded-full flex items-center justify-center">
                                  <Check className="w-2 h-2 text-white" />
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold leading-tight truncate">{label}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5 leading-tight truncate">{desc}</div>
                            </div>
                          </button>
                        );
                      })}
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

              {/* ── Step 3: Summary ──────────────────────────────────────── */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Order Summary</h2>
                  <p className="text-slate-400 text-sm mb-5">Review your configuration before proceeding to payment.</p>

                  {/* Price breakdown */}
                  <div className="rounded-xl p-4 mb-4 space-y-2"
                       style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>

                    {/* Base / Package line */}
                    {pricing.pkg ? (
                      <>
                        {/* Package header row */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">{pricing.pkg.label} Package</span>
                            <PlanBadge plan={selectedPlan!} size="sm" />
                          </div>
                          <span className="text-white font-semibold">${pricing.base.toLocaleString()}</span>
                        </div>

                        {/* Included items sub-list */}
                        <div className="ml-3 space-y-1 pb-1">
                          {pricing.includedPages >= 99 ? (
                            <div className="flex justify-between text-xs">
                              <span className="text-green-500/70 flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> Unlimited pages
                              </span>
                              <span className="text-green-500/70 font-medium">Included ✓</span>
                            </div>
                          ) : (
                            <div className="flex justify-between text-xs">
                              <span className="text-green-500/70 flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> Up to {pricing.includedPages} pages
                              </span>
                              <span className="text-green-500/70 font-medium">Included ✓</span>
                            </div>
                          )}
                          {pricing.includedFeats.map((fKey) => {
                            const feat = FEATURES.find((f) => f.key === fKey);
                            return feat ? (
                              <div key={fKey} className="flex justify-between text-xs">
                                <span className="text-green-500/70 flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5" /> {feat.label}
                                </span>
                                <span className="text-green-500/70 font-medium">Included ✓</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">
                          Base price ({serviceTypes.find((s) => s.value === form.serviceType)?.label})
                        </span>
                        <span className="text-white">${pricing.base.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Extra pages */}
                    {pricing.pageExtra > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">
                          Extra pages ({form.pages - pricing.includedPages} × $50)
                        </span>
                        <span className="text-white">+${pricing.pageExtra}</span>
                      </div>
                    )}

                    {/* Extra features (paid) */}
                    {pricing.feat > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">
                          {pricing.pkg ? 'Extra features' : 'Features'} ({extraFeatures.length})
                        </span>
                        <span className="text-white">+${pricing.feat}</span>
                      </div>
                    )}

                    {/* Fast delivery */}
                    {pricing.addon > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Fast Delivery add-on</span>
                        <span className="text-amber-400">+${pricing.addon}</span>
                      </div>
                    )}

                    {/* Total */}
                    <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-primary-400 text-lg">${pricing.total.toLocaleString()}</span>
                    </div>

                    {/* Delivery estimate */}
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      Estimated delivery:{' '}
                      <span className="text-slate-300">{pricing.days} business days</span>
                    </div>
                  </div>

                  {/* Summary rows */}
                  <div className="space-y-2 mb-4">
                    {[
                      selectedPlan && { label: 'Package',  value: planData?.label ?? selectedPlan },
                      { label: 'Service',   value: serviceTypes.find((s) => s.value === form.serviceType)?.label || form.serviceType },
                      { label: 'Title',     value: form.title },
                      { label: 'Pages',     value: `${form.pages}` },
                      {
                        label: 'Features',
                        value: form.features.length > 0
                          ? [
                              ...pricing.includedFeats.filter((k) => form.features.includes(k)).map((k) => {
                                const f = FEATURES.find((feat) => feat.key === k);
                                return f ? `${f.label} (free)` : k;
                              }),
                              ...extraFeatures.map((k) => {
                                const f = FEATURES.find((feat) => feat.key === k);
                                return f ? f.label : k;
                              }),
                            ].join(', ')
                          : 'None',
                      },
                      { label: 'Add-ons',   value: form.addons.length > 0 ? form.addons.join(', ') : 'None' },
                      { label: 'Style',     value: form.designStyle.length > 0 ? form.designStyle.join(', ') : 'Not specified' },
                    ].filter(Boolean).map(({ label, value }: any) => (
                      <div key={label} className="flex gap-3 py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-slate-500 text-sm w-20 sm:w-24 shrink-0">{label}</span>
                        <span className="text-slate-200 text-sm capitalize break-all">{value}</span>
                      </div>
                    ))}
                  </div>

                  {!user && (
                    <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-xl flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                        <ArrowRight className="w-3 h-3 text-primary-400" />
                      </div>
                      <p className="text-primary-300 text-sm">
                        Click &quot;Proceed to Checkout&quot; — we&apos;ll ask you to create a free account to save your order.
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

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={submitOrder}
        contextMessage="Your project details are saved. Create a free account to proceed to checkout."
      />
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

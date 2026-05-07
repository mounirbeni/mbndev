'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Check, Zap, Target, ShoppingCart, BarChart3, Palette, Settings, Lightbulb, type LucideIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { projectAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// Step definitions
const STEPS = ['Project Type', 'Details & Budget', 'Design Preferences', 'Features', 'Review'];

const projectTypes: { value: string; label: string; desc: string; icon: LucideIcon }[] = [
  { value: 'landing-page', label: 'Landing Page',     desc: 'Single page to convert visitors',     icon: Target       },
  { value: 'ecommerce',    label: 'E-Commerce Store', desc: 'Online store with payments',           icon: ShoppingCart },
  { value: 'saas',         label: 'SaaS Dashboard',   desc: 'Complex web application',              icon: BarChart3    },
  { value: 'portfolio',    label: 'Portfolio',         desc: 'Showcase your work',                  icon: Palette      },
  { value: 'web-app',      label: 'Web Application',  desc: 'Custom app with auth & backend',      icon: Settings     },
  { value: 'custom',       label: 'Custom Project',   desc: 'Something unique',                    icon: Lightbulb    },
];

const budgetOptions = [
  { value: 299, label: '$299 — Starter' },
  { value: 699, label: '$699 — Pro' },
  { value: 1299, label: '$1299 — Premium' },
  { value: 0, label: 'Custom Budget' },
];

const featureOptions = [
  'User Authentication', 'Payment Integration', 'Admin Dashboard', 'Blog/CMS',
  'Multi-language', 'SEO Optimization', 'Email Integration', 'Analytics',
  'Booking System', 'Chat/Messaging', 'API Integration', 'Mobile App (PWA)',
];

const designStyles = ['Minimalist', 'Corporate', 'Creative', 'Tech/Dark', 'Luxury', 'Colorful'];

function RequestPageContent() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const [form, setForm] = useState({
    type: params.get('package') === 'starter' ? 'landing-page' : 'custom',
    title: '',
    description: '',
    budget: params.get('package') === 'pro' ? 699 : params.get('package') === 'premium' ? 1299 : 299,
    customBudget: '',
    deadline: '',
    designStyle: '',
    colors: '',
    references: '',
    features: [] as string[],
    package: params.get('package') || 'custom',
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const toggleFeature = (f: string) => {
    set('features', form.features.includes(f)
      ? form.features.filter((x) => x !== f)
      : [...form.features, f]
    );
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const canNext = () => {
    if (step === 0) return !!form.type;
    if (step === 1) return form.title.length >= 3 && form.description.length >= 10;
    return true;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to submit a project request');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const budget = form.budget === 0 ? Number(form.customBudget) : form.budget;
      await projectAPI.create({
        title: form.title,
        description: form.description,
        type: form.type,
        budget,
        deadline: form.deadline || undefined,
        features: form.features,
        package: form.package,
        designPreferences: {
          style: form.designStyle,
          colors: form.colors ? form.colors.split(',').map((c) => c.trim()) : [],
          references: form.references ? form.references.split('\n').filter(Boolean) : [],
        },
      });

      toast.success('Project request submitted! We\'ll review it shortly.');
      router.push('/dashboard/client');
    } catch (err: any) {
      if (err?.response?.status === 401) {
        toast.error('Please sign in to submit a project request');
        router.push('/login');
      } else {
        toast.error(err?.response?.data?.message || 'Failed to submit request');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold">MBN DEV — Project Request</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
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
                    <div
                      className={`flex-1 h-px mx-1 transition-colors hidden sm:block ${
                        i < step ? 'bg-primary-500' : 'bg-white/10'
                      }`}
                      style={{ width: '40px' }}
                    />
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
              transition={{ duration: 0.25 }}
              className="glass rounded-2xl p-8 border border-white/10"
            >
              {/* Step 0: Project Type */}
              {step === 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">What type of project?</h2>
                  <p className="text-slate-400 text-sm mb-6">Select the category that best describes your project.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {projectTypes.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => set('type', t.value)}
                        className={`p-4 rounded-xl text-left border transition-all ${
                          form.type === t.value
                            ? 'bg-primary-500/20 border-primary-500 text-white'
                            : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
                        }`}
                      >
                        <div className="mb-2 w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                          <t.icon className="w-4 h-4 text-primary-400" />
                        </div>
                        <div className="font-medium text-sm">{t.label}</div>
                        <div className="text-xs opacity-60 mt-0.5">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Details */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Project Details</h2>
                    <p className="text-slate-400 text-sm mb-6">Tell us about your project and budget.</p>
                  </div>
                  <Input
                    label="Project Title *"
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="e.g. E-Commerce Store for My Brand"
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Description *</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                      rows={4}
                      className="w-full bg-dark-100 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 resize-none"
                      placeholder="Describe your project in detail — goals, target audience, key features..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Budget</label>
                    <div className="grid grid-cols-2 gap-2">
                      {budgetOptions.map((b) => (
                        <button
                          key={b.value}
                          onClick={() => set('budget', b.value)}
                          className={`p-3 rounded-xl text-sm border text-left transition-all ${
                            form.budget === b.value
                              ? 'bg-primary-500/20 border-primary-500 text-white'
                              : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                    {form.budget === 0 && (
                      <Input
                        className="mt-2"
                        type="number"
                        placeholder="Enter your budget in USD"
                        value={form.customBudget}
                        onChange={(e) => set('customBudget', e.target.value)}
                      />
                    )}
                  </div>
                  <Input
                    label="Desired Deadline (optional)"
                    type="date"
                    value={form.deadline}
                    onChange={(e) => set('deadline', e.target.value)}
                  />
                </div>
              )}

              {/* Step 2: Design */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Design Preferences</h2>
                    <p className="text-slate-400 text-sm mb-6">Help us understand your visual style.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Design Style</label>
                    <div className="flex flex-wrap gap-2">
                      {designStyles.map((s) => (
                        <button
                          key={s}
                          onClick={() => set('designStyle', s)}
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
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Reference Websites (optional)
                    </label>
                    <textarea
                      value={form.references}
                      onChange={(e) => set('references', e.target.value)}
                      rows={3}
                      className="w-full bg-dark-100 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 resize-none"
                      placeholder="https://example.com&#10;https://another-site.com"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Features */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Required Features</h2>
                  <p className="text-slate-400 text-sm mb-6">Select all features you need. ({form.features.length} selected)</p>
                  <div className="grid grid-cols-2 gap-2">
                    {featureOptions.map((f) => (
                      <button
                        key={f}
                        onClick={() => toggleFeature(f)}
                        className={`p-3 rounded-xl text-sm text-left border transition-all flex items-center gap-2 ${
                          form.features.includes(f)
                            ? 'bg-primary-500/20 border-primary-500 text-white'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          form.features.includes(f) ? 'bg-primary-500 border-primary-500' : 'border-white/30'
                        }`}>
                          {form.features.includes(f) && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Review Your Request</h2>
                  <p className="text-slate-400 text-sm mb-6">Confirm your project details before submitting.</p>
                  <div className="space-y-3">
                    {[
                      { label: 'Project Type', value: form.type.replace('-', ' ') },
                      { label: 'Title', value: form.title },
                      { label: 'Budget', value: form.budget === 0 ? `$${form.customBudget}` : `$${form.budget}` },
                      { label: 'Deadline', value: form.deadline || 'Flexible' },
                      { label: 'Design Style', value: form.designStyle || 'Not specified' },
                      { label: 'Features', value: form.features.length > 0 ? form.features.join(', ') : 'None selected' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex gap-3 py-2 border-b border-white/5 last:border-0">
                        <span className="text-slate-500 text-sm w-28 shrink-0">{label}</span>
                        <span className="text-white text-sm capitalize">{value}</span>
                      </div>
                    ))}
                  </div>

                  {!user && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <p className="text-yellow-400 text-sm">
                        You need to{' '}
                        <Link href="/login" className="underline font-medium">sign in</Link>{' '}
                        before submitting.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={back} disabled={step === 0}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={next} disabled={!canNext()}>
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading}>
                Submit Project Request
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
    <Suspense fallback={<div className="min-h-screen bg-dark-300 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <RequestPageContent />
    </Suspense>
  );
}

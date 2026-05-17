'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Building2, Zap, ArrowRight, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHaptic } from '@/hooks/useHaptic';

const FIELD_STYLE = {
  background: 'rgba(255,255,255,0.05)',
  border: '1.5px solid rgba(255,255,255,0.08)',
  outline: 'none',
};

function Field({
  label, type, value, onChange, placeholder, icon: Icon,
  autoComplete, inputMode, required, right,
}: {
  label: string; type: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; icon: any;
  autoComplete?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  required?: boolean; right?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          required={required}
          className="w-full rounded-2xl pl-11 pr-12 py-3.5 text-[15px] text-white placeholder:text-slate-600 transition-all"
          style={FIELD_STYLE}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
          onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        />
        {right}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [form, setForm]     = useState({ name: '', email: '', password: '', company: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t }    = useLanguage();
  const router   = useRouter();
  const haptic   = useHaptic();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      haptic('error');
      return toast.error(t('validation.password'));
    }
    setLoading(true);
    haptic('light');
    try {
      await register(form);
      haptic('success');
      toast.success(t('auth.signup.welcome'));
      router.push('/dashboard/client');
    } catch (err: any) {
      haptic('error');
      toast.error(err?.response?.data?.message || t('toast.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-dvh flex flex-col bg-hero-gradient relative overflow-hidden"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)' }}
    >
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Back button */}
      <div className="px-4 pt-3 pb-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors py-2 pr-3 -ml-1 touch-target"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 pb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: 'easeOut' }}
          className="w-full max-w-sm mx-auto"
        >
          {/* Logo + heading */}
          <div className="text-center mb-7">
            <Link href="/" className="inline-flex items-center justify-center gap-2.5 mb-5">
              <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center glow-purple">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-bold text-xl">MBN DEV</span>
            </Link>
            <h1 className="text-2xl font-bold text-white">{t('auth.signup.title')}</h1>
            <p className="text-slate-400 mt-1.5 text-sm">{t('auth.signup.subtitle')}</p>
          </div>

          {/* Form card */}
          <div
            className="rounded-3xl p-5 sm:p-6"
            style={{
              background:           'rgba(18, 18, 22, 0.95)',
              backdropFilter:       'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border:               '1px solid rgba(255,255,255,0.08)',
              boxShadow:            '0 24px 64px rgba(0,0,0,0.35)',
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label={t('auth.field.name')}
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder={t('auth.signup.namePlaceholder')}
                icon={User}
                autoComplete="name"
                required
              />
              <Field
                label={t('auth.field.email')}
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder={t('auth.placeholder.email')}
                icon={Mail}
                autoComplete="email"
                inputMode="email"
                required
              />
              <Field
                label={t('auth.signup.company')}
                type="text"
                value={form.company}
                onChange={set('company')}
                placeholder={t('auth.signup.companyPlaceholder')}
                icon={Building2}
                autoComplete="organization"
              />
              <Field
                label={t('auth.field.password')}
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder={t('auth.placeholder.passwordMin')}
                icon={Lock}
                autoComplete="new-password"
                required
                right={
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-300 transition-colors touch-target"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl transition-all press-scale mt-1"
                style={{
                  background: loading ? 'rgba(124,58,237,0.5)' : '#7c3aed',
                  boxShadow:  loading ? 'none' : '0 8px 24px rgba(124,58,237,0.35)',
                  fontSize:   '15px',
                }}
                onClick={() => !loading && haptic('medium')}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {t('auth.signup.submit')}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-slate-500 text-sm mt-5">
            {t('auth.signup.haveAccount')}{' '}
            <Link
              href="/login"
              className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
            >
              {t('auth.signup.signin')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

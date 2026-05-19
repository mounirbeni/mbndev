'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import Logo3D from '@/components/ui/Logo3D';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHaptic } from '@/hooks/useHaptic';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const { login, user } = useAuth();
  const { t }   = useLanguage();
  const router  = useRouter();
  const haptic  = useHaptic();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && user) {
      router.push(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/client');
    }
  }, [mounted, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    haptic('light');
    try {
      await login(email, password);
      haptic('success');
      toast.success(t('toast.loggedIn'));
      const stored = JSON.parse(localStorage.getItem('mbndev_user') || '{}');
      router.push(stored.role === 'admin' ? '/dashboard/admin' : '/dashboard/client');
    } catch (err: any) {
      haptic('error');
      toast.error(err?.response?.data?.message || t('toast.invalidCreds'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-dvh flex flex-col bg-hero-gradient relative overflow-hidden"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)' }}
    >
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Back button (mobile) */}
      <div className="px-4 pt-3 pb-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors py-2 pr-3 -ml-1 touch-target"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Link>
      </div>

      {/* Scrollable content — takes all remaining height so the form
          stays centred even when the keyboard pushes it up               */}
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
              <Logo3D size="xl" />
              <span className="text-white font-bold text-xl">MBN DEV</span>
            </Link>
            <h1 className="text-2xl font-bold text-white">{t('auth.login.title')}</h1>
            <p className="text-slate-400 mt-1.5 text-sm">{t('auth.login.subtitleShort')}</p>
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
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  {t('auth.field.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.placeholder.email')}
                    autoComplete="email"
                    inputMode="email"
                    required
                    className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-[15px] text-white placeholder:text-slate-600 transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1.5px solid rgba(255,255,255,0.08)',
                      outline: 'none',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                    onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  {t('auth.field.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.placeholder.passwordDots')}
                    autoComplete="current-password"
                    required
                    className="w-full rounded-2xl pl-11 pr-12 py-3.5 text-[15px] text-white placeholder:text-slate-600 transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1.5px solid rgba(255,255,255,0.08)',
                      outline: 'none',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                    onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-300 transition-colors touch-target"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-slate-500 hover:text-primary-400 transition-colors py-1"
                  >
                    {t('auth.login.forgot')}
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl transition-all press-scale mt-1"
                style={{
                  background:  loading ? 'rgba(124,58,237,0.5)' : '#7c3aed',
                  boxShadow:   loading ? 'none' : '0 8px 24px rgba(124,58,237,0.35)',
                  fontSize:    '15px',
                }}
                onClick={() => !loading && haptic('medium')}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {t('auth.login.submit')}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-slate-500 text-sm mt-5">
            {t('auth.login.noAccount')}{' '}
            <Link
              href="/signup"
              className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
            >
              {t('auth.login.signupFree')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

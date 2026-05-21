'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail, Lock, ArrowRight, Eye, EyeOff, ChevronLeft,
  AlertCircle, ShieldAlert, Loader2, XCircle,
} from 'lucide-react';
import Logo3D from '@/components/ui/Logo3D';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHaptic } from '@/hooks/useHaptic';

// ─── Types ────────────────────────────────────────────────────────────────────

type ErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_DEACTIVATED'
  | 'RATE_LIMITED'
  | null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const min      = Math.floor(totalSec / 60);
  const sec      = totalSec % 60;
  if (min > 0) return `${min}:${String(sec).padStart(2, '0')}`;
  return `${sec}s`;
}

// ─── Inline error banner ──────────────────────────────────────────────────────

function ErrorBanner({
  code, message, attemptsLeft, remainingMs,
}: {
  code: ErrorCode; message: string; attemptsLeft?: number; remainingMs?: number;
}) {
  const [countdown, setCountdown] = useState(remainingMs ?? 0);

  useEffect(() => {
    if (!remainingMs) return;
    setCountdown(remainingMs);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1000) { clearInterval(timer); return 0; }
        return c - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingMs]);

  if (!message) return null;

  const isLocked = code === 'ACCOUNT_LOCKED' || code === 'RATE_LIMITED';
  const isDeactivated = code === 'ACCOUNT_DEACTIVATED';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -8, height: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div
          className="flex items-start gap-3 px-4 py-3.5 rounded-2xl mb-4"
          style={
            isLocked
              ? { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }
              : isDeactivated
              ? { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }
              : { background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }
          }
        >
          {isLocked ? (
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          ) : isDeactivated ? (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium leading-snug ${
              isDeactivated ? 'text-amber-300' : 'text-red-300'
            }`}>
              {message}
            </p>
            {isLocked && countdown > 0 && (
              <p className="text-xs text-red-500 mt-1 font-mono tabular-nums">
                Unlocks in {formatCountdown(countdown)}
              </p>
            )}
            {attemptsLeft !== undefined && attemptsLeft > 0 && !isLocked && (
              <p className="text-xs text-slate-500 mt-1">
                {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining before lockout
              </p>
            )}
            {isDeactivated && (
              <a
                href="mailto:contact@mbndev.ma"
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors mt-1 inline-block"
              >
                Contact support →
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPw,       setShowPw]       = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [mounted,      setMounted]      = useState(false);

  // Error state
  const [errorCode,    setErrorCode]    = useState<ErrorCode>(null);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState<number | undefined>();
  const [remainingMs,  setRemainingMs]  = useState<number | undefined>();

  // Field-level errors
  const [emailErr,  setEmailErr]  = useState('');
  const [passErr,   setPassErr]   = useState('');

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

  const clearErrors = useCallback(() => {
    setErrorCode(null);
    setErrorMsg('');
    setAttemptsLeft(undefined);
    setRemainingMs(undefined);
    setEmailErr('');
    setPassErr('');
  }, []);

  const isLocked = errorCode === 'ACCOUNT_LOCKED' || errorCode === 'RATE_LIMITED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side quick validation
    if (!email.trim()) { setEmailErr('Email is required.'); return; }
    if (!password)     { setPassErr('Password is required.'); return; }

    if (isLocked) {
      haptic('error');
      return toast.error('Account is temporarily locked. Please wait.');
    }

    clearErrors();
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
      const data = err?.response?.data;
      const code = (data?.code ?? null) as ErrorCode;
      const msg  = data?.message || t('toast.invalidCreds');

      setErrorCode(code);
      setErrorMsg(msg);
      setAttemptsLeft(data?.attemptsLeft);
      setRemainingMs(data?.remainingMs);
    } finally {
      setLoading(false);
    }
  };

  const fieldBorder = (hasErr: boolean) =>
    hasErr ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)';

  return (
    <div
      className="min-h-dvh flex flex-col bg-hero-gradient relative overflow-hidden"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)' }}
    >
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Back */}
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
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Inline error banner */}
              {errorMsg && (
                <ErrorBanner
                  code={errorCode}
                  message={errorMsg}
                  attemptsLeft={attemptsLeft}
                  remainingMs={remainingMs}
                />
              )}

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
                    onChange={(e) => { setEmail(e.target.value); clearErrors(); }}
                    placeholder={t('auth.placeholder.email')}
                    autoComplete="email"
                    inputMode="email"
                    required
                    className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-[15px] text-white placeholder:text-slate-600 transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border:     `1.5px solid ${fieldBorder(!!emailErr)}`,
                      outline:    'none',
                    }}
                    onFocus={e  => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                    onBlur={e   => { e.currentTarget.style.borderColor = fieldBorder(!!emailErr); e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  />
                </div>
                {emailErr && (
                  <p className="text-[11px] mt-1.5 font-medium text-red-400">{emailErr}</p>
                )}
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
                    onChange={(e) => { setPassword(e.target.value); clearErrors(); }}
                    placeholder={t('auth.placeholder.passwordDots')}
                    autoComplete="current-password"
                    required
                    className="w-full rounded-2xl pl-11 pr-12 py-3.5 text-[15px] text-white placeholder:text-slate-600 transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border:     `1.5px solid ${fieldBorder(!!passErr)}`,
                      outline:    'none',
                    }}
                    onFocus={e  => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                    onBlur={e   => { e.currentTarget.style.borderColor = fieldBorder(!!passErr); e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
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
                {passErr && (
                  <p className="text-[11px] mt-1.5 font-medium text-red-400">{passErr}</p>
                )}
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
              <motion.button
                type="submit"
                disabled={loading || isLocked}
                whileTap={{ scale: 0.985 }}
                className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl transition-all press-scale mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: isLocked ? 'rgba(239,68,68,0.4)' : loading ? 'rgba(124,58,237,0.5)' : '#7c3aed',
                  boxShadow:  loading || isLocked ? 'none' : '0 8px 24px rgba(124,58,237,0.35)',
                  fontSize:   '15px',
                }}
                onClick={() => !loading && !isLocked && haptic('medium')}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isLocked ? (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    Account Locked
                  </>
                ) : (
                  <>
                    {t('auth.login.submit')}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
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

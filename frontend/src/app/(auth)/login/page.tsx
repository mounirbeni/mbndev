'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail, Lock, ArrowRight, Eye, EyeOff, ChevronLeft,
  AlertCircle, ShieldAlert, Loader2, XCircle, Sparkles,
  CheckCircle2, Globe2, Zap, Shield,
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

// ─── Left panel — cinematic visual story ─────────────────────────────────────

function LeftPanel() {
  const features = [
    { icon: Zap,          label: 'Lightning Fast',    desc: 'Optimized for speed & performance' },
    { icon: Shield,       label: 'Fully Secure',      desc: 'Enterprise-grade security protocols' },
    { icon: Globe2,       label: 'Global Delivery',   desc: 'Deployed worldwide on edge network' },
    { icon: CheckCircle2, label: '100% Satisfaction', desc: 'Guaranteed on every project' },
  ];

  return (
    <div className="hidden lg:flex flex-col relative overflow-hidden bg-[#050508]">
      {/* Deep background gradient */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(124,58,237,0.18) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 50% 40% at 80% 20%, rgba(59,130,246,0.1) 0%, transparent 55%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 40% 30% at 70% 85%, rgba(6,182,212,0.07) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Ambient grid */}
      <div className="absolute inset-0 ambient-grid opacity-40" />
      {/* Film grain */}
      <div className="absolute inset-0 film-grain" />

      {/* Top glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(168,85,247,0.7), transparent)' }}
      />

      {/* Right edge vertical separator */}
      <div className="absolute right-0 top-0 bottom-0 vertical-glow" />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'rgba(124,58,237,0.12)', filter: 'blur(80px)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'rgba(59,130,246,0.09)', filter: 'blur(60px)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full px-12 py-16 justify-between">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3"
        >
          <Logo3D size="md" />
        </motion.div>

        {/* Center hero text */}
        <div className="flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="cin-chip mb-5">
              <Sparkles className="w-3 h-3" />
              Premium Web Studio
            </div>
            <h2 className="text-4xl xl:text-[2.8rem] font-black text-white leading-[1.1] tracking-tight mb-4">
              Build the digital<br />
              future with{' '}
              <span className="gradient-text-animated">confidence</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              Welcome back. Your projects, payments, and progress — all in one premium workspace.
            </p>
          </motion.div>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-3.5 group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 icon-glow-purple transition-transform duration-200 group-hover:scale-105">
                    <Icon className="w-4.5 h-4.5 text-violet-400" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-8"
        >
          {[
            { val: '34+', label: 'Clients' },
            { val: '98%', label: 'On Time' },
            { val: '5.0', label: 'Rating' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-xl font-black text-white tabular">{s.val}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
          <div className="w-px h-8 bg-white/8" />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-1">
              <span className="relative flex w-1.5 h-1.5">
                <span className="live-badge-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-green-400" />
              </span>
              <span className="text-green-400 text-xs font-semibold">System Live</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPw,       setShowPw]       = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [mounted,      setMounted]      = useState(false);

  const [errorCode,    setErrorCode]    = useState<ErrorCode>(null);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState<number | undefined>();
  const [remainingMs,  setRemainingMs]  = useState<number | undefined>();

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
    if (!email.trim()) { setEmailErr('Email is required.'); return; }
    if (!password)     { setPassErr('Password is required.'); return; }
    if (isLocked) { haptic('error'); return toast.error('Account is temporarily locked. Please wait.'); }

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

  const fieldStyle = (hasErr: boolean, focused = false) => ({
    background:    focused ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)',
    border:        `1.5px solid ${hasErr ? 'rgba(239,68,68,0.55)' : focused ? 'rgba(124,58,237,0.55)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius:  '14px',
    outline:       'none',
    color:         '#fff',
    fontSize:      '15px',
    boxShadow:     focused && !hasErr ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
    transition:    'border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
  });

  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused,  setPassFocused]  = useState(false);

  return (
    <div
      className="min-h-dvh flex overflow-hidden"
      style={{
        background: '#08080b',
        paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)',
      }}
    >
      {/* ── Left visual panel (desktop only) ──────────────────────────── */}
      <div className="hidden lg:block w-[46%] shrink-0">
        <div className="sticky top-0 h-dvh">
          <LeftPanel />
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-dvh relative overflow-hidden">

        {/* Mobile background */}
        <div className="lg:hidden absolute inset-0 pointer-events-none">
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 20%, rgba(124,58,237,0.12) 0%, transparent 65%)' }} />
          <div className="absolute inset-0 film-grain" />
        </div>

        {/* Top edge glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.4) 50%, transparent 100%)' }}
        />

        {/* Back button */}
        <div className="relative z-10 px-5 pt-4 pb-1">
          <Link
            href="/"
            className="cin-btn-ghost"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col justify-center px-5 sm:px-8 py-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md mx-auto lg:mx-0 lg:max-w-sm"
          >
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
                <Logo3D size="xl" />
              </Link>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                {t('auth.login.title')}
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t('auth.login.subtitleShort')}
              </p>
            </div>

            {/* Card */}
            <div className="cin-card p-6 sm:p-7">
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>

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
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-widest">
                    {t('auth.field.email')}
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200"
                      style={{ color: emailFocused ? '#a855f7' : emailErr ? '#f87171' : '#64748b' }}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); clearErrors(); }}
                      placeholder={t('auth.placeholder.email')}
                      autoComplete="email"
                      inputMode="email"
                      required
                      className="w-full pl-11 pr-4 py-3.5"
                      style={fieldStyle(!!emailErr, emailFocused)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={()  => setEmailFocused(false)}
                    />
                  </div>
                  {emailErr && (
                    <p className="text-[11px] mt-1.5 font-medium text-red-400 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />{emailErr}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-widest">
                    {t('auth.field.password')}
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200"
                      style={{ color: passFocused ? '#a855f7' : passErr ? '#f87171' : '#64748b' }}
                    />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearErrors(); }}
                      placeholder={t('auth.placeholder.passwordDots')}
                      autoComplete="current-password"
                      required
                      className="w-full pl-11 pr-12 py-3.5"
                      style={fieldStyle(!!passErr, passFocused)}
                      onFocus={() => setPassFocused(true)}
                      onBlur={()  => setPassFocused(false)}
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
                    <p className="text-[11px] mt-1.5 font-medium text-red-400 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />{passErr}
                    </p>
                  )}
                  <div className="flex justify-end mt-2.5">
                    <Link
                      href="/forgot-password"
                      className="text-xs text-slate-500 hover:text-violet-400 transition-colors py-1 font-medium"
                    >
                      {t('auth.login.forgot')}
                    </Link>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || isLocked}
                  onClick={() => !loading && !isLocked && haptic('medium')}
                  className="cin-btn-primary mt-1"
                  style={
                    isLocked
                      ? { background: 'rgba(239,68,68,0.4)', boxShadow: 'none' }
                      : loading
                      ? { background: 'rgba(124,58,237,0.5)', boxShadow: 'none', cursor: 'not-allowed' }
                      : undefined
                  }
                >
                  <span className="flex items-center gap-2">
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
                  </span>
                </button>
              </form>
            </div>

            {/* Sign up link */}
            <p className="text-center text-slate-500 text-sm mt-6">
              {t('auth.login.noAccount')}{' '}
              <Link
                href="/signup"
                className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
              >
                {t('auth.login.signupFree')}
              </Link>
            </p>

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 mt-5">
              <Shield className="w-3 h-3 text-slate-600" />
              <p className="text-xs text-slate-600">256-bit SSL encryption · Zero data sharing</p>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}

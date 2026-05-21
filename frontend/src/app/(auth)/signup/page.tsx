'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail, Lock, User, Building2, Phone, ArrowRight,
  Eye, EyeOff, ChevronLeft, CheckCircle2, XCircle,
  Loader2, AlertCircle, ShieldCheck,
} from 'lucide-react';
import Logo3D from '@/components/ui/Logo3D';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHaptic } from '@/hooks/useHaptic';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldStatus = 'idle' | 'checking' | 'valid' | 'error' | 'warning';

interface FieldState {
  status:  FieldStatus;
  message: string;
}

const idle:    FieldState = { status: 'idle',  message: '' };
const checking:FieldState = { status: 'checking', message: '' };

// ─── Password strength ────────────────────────────────────────────────────────

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: 'Weak',   color: '#ef4444' };
  if (score <= 2) return { score, label: 'Fair',   color: '#f59e0b' };
  if (score <= 3) return { score, label: 'Good',   color: '#3b82f6' };
  if (score <= 4) return { score, label: 'Strong', color: '#10b981' };
  return              { score, label: 'Very Strong', color: '#7c3aed' };
}

// ─── Field status icon ────────────────────────────────────────────────────────

function FieldIcon({ status }: { status: FieldStatus }) {
  if (status === 'checking') return <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />;
  if (status === 'valid')    return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  if (status === 'error')    return <XCircle className="w-4 h-4 text-red-400" />;
  if (status === 'warning')  return <AlertCircle className="w-4 h-4 text-amber-400" />;
  return null;
}

// ─── Field border colour ──────────────────────────────────────────────────────

function borderColor(status: FieldStatus, focused: boolean): string {
  if (status === 'error')   return 'rgba(239,68,68,0.6)';
  if (status === 'valid')   return 'rgba(16,185,129,0.5)';
  if (status === 'warning') return 'rgba(245,158,11,0.5)';
  if (focused)              return 'rgba(124,58,237,0.5)';
  return 'rgba(255,255,255,0.08)';
}

// ─── Inline error / hint ──────────────────────────────────────────────────────

function FieldHint({ state }: { state: FieldState }) {
  if (!state.message) return null;
  const colors: Record<FieldStatus, string> = {
    error:    'text-red-400',
    valid:    'text-emerald-400',
    warning:  'text-amber-400',
    checking: 'text-slate-500',
    idle:     'text-slate-500',
  };
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={state.message}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className={`text-[11px] mt-1.5 font-medium ${colors[state.status]}`}
      >
        {state.message}
      </motion.p>
    </AnimatePresence>
  );
}

// ─── Generic field wrapper ────────────────────────────────────────────────────

function Field({
  label, type, value, onChange, placeholder, icon: Icon,
  autoComplete, inputMode, required, fieldState, right, onBlur,
}: {
  label: string; type: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; icon: any; autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  required?: boolean; fieldState: FieldState;
  right?: React.ReactNode; onBlur?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const bc = borderColor(fieldState.status, focused);

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
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          required={required}
          className="w-full rounded-2xl pl-11 pr-12 py-3.5 text-[15px] text-white placeholder:text-slate-600 transition-all"
          style={{
            background:  focused ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.05)',
            border:      `1.5px solid ${bc}`,
            outline:     'none',
          }}
        />
        {/* Status icon */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {right ?? <FieldIcon status={fieldState.status} />}
        </div>
      </div>
      <FieldHint state={fieldState} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', company: '', phone: '',
  });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  // Per-field states
  const [nameState,     setNameState]     = useState<FieldState>(idle);
  const [emailState,    setEmailState]    = useState<FieldState>(idle);
  const [passwordState, setPasswordState] = useState<FieldState>(idle);
  const [phoneState,    setPhoneState]    = useState<FieldState>(idle);

  const emailDebounce = useRef<ReturnType<typeof setTimeout>>();
  const phoneDebounce = useRef<ReturnType<typeof setTimeout>>();

  const { register } = useAuth();
  const { t }        = useLanguage();
  const router       = useRouter();
  const haptic       = useHaptic();

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // ── Real-time email availability ──────────────────────────────────────────

  const checkEmail = useCallback((email: string) => {
    clearTimeout(emailDebounce.current);
    if (!email.trim()) { setEmailState(idle); return; }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      setEmailState({ status: 'error', message: 'Enter a valid email address.' });
      return;
    }

    setEmailState(checking);
    emailDebounce.current = setTimeout(async () => {
      try {
        const { data } = await api.post('/auth/check-email', { email });
        if (data.available) {
          setEmailState({ status: 'valid', message: 'Email is available.' });
        } else if (data.code === 'ACCOUNT_DEACTIVATED') {
          setEmailState({ status: 'warning', message: data.message });
        } else {
          setEmailState({ status: 'error', message: 'This email is already registered. Sign in instead.' });
        }
      } catch {
        setEmailState(idle);
      }
    }, 550);
  }, []);

  // ── Real-time phone availability ──────────────────────────────────────────

  const checkPhone = useCallback((phone: string) => {
    clearTimeout(phoneDebounce.current);
    if (!phone.trim()) { setPhoneState(idle); return; }

    setPhoneState(checking);
    phoneDebounce.current = setTimeout(async () => {
      try {
        const { data } = await api.post('/auth/check-phone', { phone });
        if (!data.valid) {
          setPhoneState({ status: 'error', message: 'Invalid phone number. Use format: +1234567890' });
        } else if (data.available) {
          setPhoneState({ status: 'valid', message: 'Phone number is available.' });
        } else {
          setPhoneState({ status: 'error', message: 'This phone number is already linked to an account.' });
        }
      } catch {
        setPhoneState(idle);
      }
    }, 550);
  }, []);

  // ── Password strength feedback ────────────────────────────────────────────

  useEffect(() => {
    if (!form.password) { setPasswordState(idle); return; }
    const s = getPasswordStrength(form.password);
    if (form.password.length < 8) {
      setPasswordState({ status: 'error', message: 'Password must be at least 8 characters.' });
    } else if (!/[a-zA-Z]/.test(form.password)) {
      setPasswordState({ status: 'error', message: 'Password must contain at least one letter.' });
    } else if (!/[0-9]/.test(form.password)) {
      setPasswordState({ status: 'error', message: 'Password must contain at least one number.' });
    } else if (s.score <= 2) {
      setPasswordState({ status: 'warning', message: `Password strength: ${s.label}. Add uppercase or symbols.` });
    } else {
      setPasswordState({ status: 'valid', message: `Password strength: ${s.label}` });
    }
  }, [form.password]);

  // ── Name validation on blur ───────────────────────────────────────────────

  const validateName = () => {
    if (!form.name.trim()) return;
    if (form.name.trim().length < 2) {
      setNameState({ status: 'error', message: 'Name must be at least 2 characters.' });
    } else {
      setNameState({ status: 'valid', message: '' });
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Block if we know there are active errors
    if (emailState.status === 'error' || emailState.status === 'checking') {
      haptic('error');
      return toast.error(emailState.status === 'checking' ? 'Checking email…' : emailState.message);
    }
    if (phoneState.status === 'error') {
      haptic('error');
      return toast.error(phoneState.message);
    }
    if (passwordState.status === 'error') {
      haptic('error');
      return toast.error(passwordState.message);
    }

    setLoading(true);
    haptic('light');

    try {
      await register({
        name:     form.name,
        email:    form.email,
        password: form.password,
        company:  form.company,
        phone:    form.phone || undefined,
      });
      haptic('success');
      toast.success('Welcome to MBN DEV!');
      router.push('/dashboard/client');
    } catch (err: any) {
      haptic('error');
      const data = err?.response?.data;
      const msg  = data?.message || 'Something went wrong. Please try again.';
      const code = data?.code;
      const field= data?.field;

      // Update field state with server error
      if (field === 'email' || code === 'EMAIL_TAKEN') {
        setEmailState({ status: 'error', message: msg });
      } else if (field === 'phone' || code === 'PHONE_TAKEN') {
        setPhoneState({ status: 'error', message: msg });
      }

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(form.password);
  const strengthBars = [1, 2, 3, 4, 5];

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

              {/* Name */}
              <Field
                label={t('auth.field.name')}
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder={t('auth.signup.namePlaceholder')}
                icon={User}
                autoComplete="name"
                required
                fieldState={nameState}
                onBlur={validateName}
              />

              {/* Email */}
              <Field
                label={t('auth.field.email')}
                type="email"
                value={form.email}
                onChange={(e) => { set('email')(e); checkEmail(e.target.value); }}
                placeholder={t('auth.placeholder.email')}
                icon={Mail}
                autoComplete="email"
                inputMode="email"
                required
                fieldState={emailState}
              />

              {/* Phone (optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  Phone <span className="normal-case font-normal text-slate-600">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => { set('phone')(e); checkPhone(e.target.value); }}
                    placeholder="+1 234 567 8900"
                    autoComplete="tel"
                    inputMode="tel"
                    className="w-full rounded-2xl pl-11 pr-12 py-3.5 text-[15px] text-white placeholder:text-slate-600 transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border:     `1.5px solid ${borderColor(phoneState.status, false)}`,
                      outline:    'none',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = borderColor(phoneState.status, true); e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                    onBlur={e  => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <FieldIcon status={phoneState.status} />
                  </div>
                </div>
                <FieldHint state={phoneState} />
              </div>

              {/* Company */}
              <Field
                label={`${t('auth.signup.company')} (optional)`}
                type="text"
                value={form.company}
                onChange={set('company')}
                placeholder={t('auth.signup.companyPlaceholder')}
                icon={Building2}
                autoComplete="organization"
                fieldState={idle}
              />

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  {t('auth.field.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder={t('auth.placeholder.passwordMin')}
                    autoComplete="new-password"
                    required
                    className="w-full rounded-2xl pl-11 pr-12 py-3.5 text-[15px] text-white placeholder:text-slate-600 transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border:     `1.5px solid ${borderColor(passwordState.status, false)}`,
                      outline:    'none',
                    }}
                    onFocus={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                    onBlur={e  => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-300 transition-colors touch-target"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength bars */}
                {form.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2"
                  >
                    <div className="flex gap-1 mb-1">
                      {strengthBars.map((n) => (
                        <div
                          key={n}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            background: n <= strength.score ? strength.color : 'rgba(255,255,255,0.08)',
                          }}
                        />
                      ))}
                    </div>
                    <FieldHint state={passwordState} />
                  </motion.div>
                )}
              </div>

              {/* Security note */}
              <div
                className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl"
                style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.15)' }}
              >
                <ShieldCheck className="w-4 h-4 text-primary-400 shrink-0" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your account is protected with unique email and phone verification. Each identity can only have one account.
                </p>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading || emailState.status === 'checking' || emailState.status === 'error' || phoneState.status === 'error'}
                whileTap={{ scale: 0.985 }}
                className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl transition-all mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: loading ? 'rgba(124,58,237,0.5)' : '#7c3aed',
                  boxShadow:  loading ? 'none' : '0 8px 24px rgba(124,58,237,0.35)',
                  fontSize:   '15px',
                }}
                onClick={() => !loading && haptic('medium')}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {t('auth.signup.submit')}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
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

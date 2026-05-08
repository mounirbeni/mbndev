'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Check, Zap, Star, Crown, ArrowRight, Lock } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const BENEFITS = [
  { icon: Check, text: 'Save your project draft instantly' },
  { icon: Check, text: 'Track progress & revisions in real time' },
  { icon: Check, text: 'Manage payments & invoices' },
  { icon: Check, text: 'Direct message with the developer' },
  { icon: Check, text: 'Full dashboard access' },
];

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after successful login/register */
  onSuccess?: () => void;
  /** Which tab to start on */
  defaultTab?: 'login' | 'register';
  /** Context message shown in the modal header */
  contextMessage?: string;
  /** Name of the plan the user selected (shown in modal) */
  plan?: string;
}

export default function AuthModal({
  open,
  onClose,
  onSuccess,
  defaultTab = 'register',
  contextMessage,
  plan,
}: AuthModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regCompany, setRegCompany] = useState('');

  // Reset tab when modal opens
  useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginEmail, loginPass);
      toast.success('Welcome back!');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPass.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register({ name: regName, email: regEmail, password: regPass, company: regCompany || undefined });
      toast.success('Account created! Welcome aboard 🎉');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const planColors: Record<string, string> = {
    starter: 'text-blue-300',
    pro: 'text-primary-300',
    premium: 'text-amber-300',
    custom: 'text-slate-300',
  };
  const planColor = plan ? (planColors[plan.toLowerCase()] ?? 'text-primary-300') : 'text-primary-300';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-4xl pointer-events-auto grid md:grid-cols-2 glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">

              {/* ── Left panel — benefits ─────────────────────────────────────── */}
              <div className="relative hidden md:flex flex-col justify-between p-8 bg-gradient-to-br from-primary-900/60 to-blue-900/30 border-r border-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-blue-500/5 pointer-events-none" />
                <div className="relative z-10">
                  {/* Logo mark */}
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-bold text-lg">MBN DEV</span>
                  </div>

                  {plan && (
                    <div className="mb-6 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Selected plan</p>
                      <p className={`font-bold text-lg capitalize ${planColor}`}>
                        {plan === 'pro' && <Star className="w-4 h-4 inline mr-1.5 -mt-0.5" />}
                        {plan === 'premium' && <Crown className="w-4 h-4 inline mr-1.5 -mt-0.5" />}
                        {plan === 'starter' && <Zap className="w-4 h-4 inline mr-1.5 -mt-0.5" />}
                        {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
                      </p>
                    </div>
                  )}

                  {contextMessage && (
                    <p className="text-slate-300 text-sm mb-6">{contextMessage}</p>
                  )}

                  <h2 className="text-2xl font-bold text-white mb-2">
                    {tab === 'register' ? 'Create your account' : 'Welcome back'}
                  </h2>
                  <p className="text-slate-400 text-sm mb-8">
                    {tab === 'register'
                      ? 'Sign up to save your project and get full access to your client workspace.'
                      : 'Sign in to continue your project request and access your dashboard.'}
                  </p>

                  <ul className="space-y-3">
                    {BENEFITS.map((b, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                        <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                          <b.icon className="w-3 h-3 text-primary-400" />
                        </div>
                        {b.text}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative z-10 mt-8">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {['M', 'A', 'K'].map((l, i) => (
                        <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-900">
                          {l}
                        </div>
                      ))}
                    </div>
                    <p className="text-slate-400 text-xs">Join our growing clients</p>
                  </div>
                </div>
              </div>

              {/* ── Right panel — form ────────────────────────────────────────── */}
              <div className="flex flex-col p-8">
                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Mobile header */}
                <div className="md:hidden mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-white font-bold">MBN DEV</span>
                  </div>
                  {contextMessage && (
                    <p className="text-slate-400 text-sm">{contextMessage}</p>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex bg-white/5 rounded-xl p-1 mb-6">
                  {(['register', 'login'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${
                        tab === t
                          ? 'bg-primary-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t === 'register' ? 'Create Account' : 'Sign In'}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {tab === 'register' ? (
                    <motion.form
                      key="register"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.18 }}
                      onSubmit={handleRegister}
                      className="space-y-4 flex-1 flex flex-col"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1.5">Full Name *</label>
                          <Input
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="Your name"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1.5">Company</label>
                          <Input
                            value={regCompany}
                            onChange={(e) => setRegCompany(e.target.value)}
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Email *</label>
                        <Input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Password *</label>
                        <div className="relative">
                          <Input
                            type={showPass ? 'text' : 'password'}
                            value={regPass}
                            onChange={(e) => setRegPass(e.target.value)}
                            placeholder="Min. 6 characters"
                            required
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                          >
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" size="md" className="w-full mt-2 group" disabled={loading}>
                        {loading ? 'Creating account…' : (
                          <>Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                        )}
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.18 }}
                      onSubmit={handleLogin}
                      className="space-y-4 flex-1 flex flex-col"
                    >
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Email</label>
                        <Input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Password</label>
                        <div className="relative">
                          <Input
                            type={showPass ? 'text' : 'password'}
                            value={loginPass}
                            onChange={(e) => setLoginPass(e.target.value)}
                            placeholder="Your password"
                            required
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                          >
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" size="md" className="w-full mt-2 group" disabled={loading}>
                        {loading ? 'Signing in…' : (
                          <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                        )}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>

                <p className="text-xs text-center text-slate-500 mt-6">
                  {tab === 'register'
                    ? 'Already have an account? '
                    : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => setTab(tab === 'register' ? 'login' : 'register')}
                    className="text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    {tab === 'register' ? 'Sign in' : 'Create one'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

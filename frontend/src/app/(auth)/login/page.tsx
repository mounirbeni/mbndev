'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Zap, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  if (user) {
    router.push(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/client');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      const stored = JSON.parse(localStorage.getItem('mbndev_user') || '{}');
      router.push(stored.role === 'admin' ? '/dashboard/admin' : '/dashboard/client');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-hero-gradient px-4 py-8"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px) + 32px, 48px)' }}
    >
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo + heading */}
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center justify-center gap-2.5 mb-5">
            <div className="w-11 h-11 bg-primary-500 rounded-2xl flex items-center justify-center glow-purple">
              <Zap className="w-5.5 h-5.5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">MBN DEV</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 mt-1.5 text-sm">Sign in to your account</p>
        </div>

        {/* Form card */}
        <div className="glass-strong rounded-2xl p-6 border border-white/8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/60 focus:bg-white/8 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/60 focus:bg-white/8 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-primary-400 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all press-scale shadow-lg shadow-primary-500/25 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="flex items-center gap-3 mt-5 mb-4">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-slate-600 text-[11px] font-medium tracking-wide">DEMO ACCOUNTS</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { role: 'Admin',  email: 'admin@mbndev.com',  pw: 'admin123',  color: 'text-primary-400', bg: 'hover:bg-primary-500/8 hover:border-primary-500/20' },
              { role: 'Client', email: 'client@demo.com',   pw: 'client123', color: 'text-blue-400',    bg: 'hover:bg-blue-500/8 hover:border-blue-500/20' },
            ].map((d) => (
              <button
                key={d.role}
                type="button"
                onClick={() => { setEmail(d.email); setPassword(d.pw); }}
                className={`text-left px-3 py-2.5 bg-white/4 border border-white/8 ${d.bg} rounded-xl transition-all press-scale`}
              >
                <div className={`text-xs font-semibold ${d.color} mb-0.5`}>{d.role}</div>
                <div className="text-slate-500 text-[11px] truncate">{d.email}</div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Sign up free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

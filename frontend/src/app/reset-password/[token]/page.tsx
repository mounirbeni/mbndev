'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { authAPI } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { t } = useLanguage();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (password.length < 8) return toast.error(t('validation.password'));
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return toast.error(t('validation.password'));
    }
    if (password !== confirm) return toast.error(t('validation.passwordMatch'));

    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push('/login'), 2200);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('toast.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-hero-gradient flex items-center justify-center px-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
              <Image src="/images/logo.png" alt="MBN DEV" width={40} height={40} className="w-full h-full object-contain" />
            </div>
            <span className="text-white font-bold text-xl">MBN DEV</span>
          </Link>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/10">
          {!done ? (
            <>
              <div className="w-14 h-14 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Lock className="w-7 h-7 text-primary-400" />
              </div>

              <h1 className="text-2xl font-bold text-white mb-2 text-center">{t('auth.reset.title')}</h1>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed text-center">
                {t('auth.reset.subtitle')}
              </p>

              <form onSubmit={submit} className="space-y-4">
                <div className="relative">
                  <Input
                    type={show ? 'text' : 'password'}
                    label={t('auth.reset.newPassword')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-9 text-slate-500 hover:text-slate-300"
                  >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Input
                  type={show ? 'text' : 'password'}
                  label={t('auth.reset.confirmPassword')}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />

                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  {t('auth.reset.submit')}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 240 }}
                className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5"
              >
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">{t('auth.reset.done.title')}</h1>
              <p className="text-slate-400 text-sm mb-2">{t('auth.reset.done.sub')}</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> {t('auth.forgot.back')}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

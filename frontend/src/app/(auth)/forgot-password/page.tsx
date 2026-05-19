'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, CheckCircle2 } from 'lucide-react';
import Logo3D from '@/components/ui/Logo3D';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { authAPI } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useLanguage();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await authAPI.forgotPassword(email.trim());
      setSent(true);
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
            <Logo3D size="lg" />
            <span className="text-white font-bold text-xl">MBN DEV</span>
          </Link>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/10">
          {!sent ? (
            <>
              <div className="w-14 h-14 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Lock className="w-7 h-7 text-primary-400" />
              </div>

              <h1 className="text-2xl font-bold text-white mb-2 text-center">{t('auth.forgot.title')}</h1>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed text-center">
                {t('auth.forgot.subtitle')}
              </p>

              <form onSubmit={submit} className="space-y-4">
                <Input
                  type="email"
                  label={t('auth.field.emailShort')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.placeholder.emailAlt')}
                  required
                  autoComplete="email"
                  autoFocus
                />

                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  <Mail className="w-4 h-4" />
                  {t('auth.forgot.submit')}
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
              <h1 className="text-2xl font-bold text-white mb-2">{t('auth.forgot.sent.title')}</h1>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {t('auth.forgot.sent.body').replace('{email}', email)}
              </p>
              <p className="text-slate-600 text-xs mb-6">
                {t('auth.forgot.sent.spam')}
              </p>
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

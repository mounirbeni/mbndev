'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Building2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return toast.error(t('validation.password'));
    }
    setLoading(true);
    try {
      await register(form);
      toast.success(t('auth.signup.welcome'));
      router.push('/dashboard/client');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('toast.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-4 py-12">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center glow-purple">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">MBN DEV</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">{t('auth.signup.title')}</h1>
          <p className="text-slate-400 mt-1 text-sm">{t('auth.signup.subtitle')}</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={t('auth.field.name')}
              type="text"
              placeholder={t('auth.signup.namePlaceholder')}
              value={form.name}
              onChange={set('name')}
              icon={<User className="w-4 h-4" />}
              required
            />
            <Input
              label={t('auth.field.email')}
              type="email"
              placeholder={t('auth.placeholder.email')}
              value={form.email}
              onChange={set('email')}
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              label={t('auth.signup.company')}
              type="text"
              placeholder={t('auth.signup.companyPlaceholder')}
              value={form.company}
              onChange={set('company')}
              icon={<Building2 className="w-4 h-4" />}
            />
            <Input
              label={t('auth.field.password')}
              type="password"
              placeholder={t('auth.placeholder.passwordMin')}
              value={form.password}
              onChange={set('password')}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {t('auth.signup.submit')}
            </Button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          {t('auth.signup.haveAccount')}{' '}
          <Link href="/login" className="text-primary-400 hover:text-primary-300 transition-colors">
            {t('auth.signup.signin')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

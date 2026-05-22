'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { authAPI } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { getInitials } from '@/lib/utils';
import { User, Lock, Shield, MessageCircle, ExternalLink, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, logout, refresh } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  /* ── Profile form ───────────────────────────────────── */
  const [profile, setProfile] = useState({
    name:    user?.name    || '',
    company: user?.company || '',
    phone:   user?.phone   || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const handleSaveProfile = async () => {
    if (!profile.name.trim()) { toast.error(t('validation.required')); return; }
    setSavingProfile(true);
    try {
      await authAPI.updateProfile(profile);
      await refresh();
      toast.success(t('toast.saved'));
    } catch {
      toast.error(t('toast.error'));
    } finally {
      setSavingProfile(false);
    }
  };

  /* ── Password form ──────────────────────────────────── */
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [savingPwd, setSavingPwd] = useState(false);

  const handleChangePassword = async () => {
    if (!pwd.current || !pwd.next || !pwd.confirm) { toast.error(t('validation.required')); return; }
    if (pwd.next.length < 6) { toast.error(t('validation.password')); return; }
    if (pwd.next !== pwd.confirm) { toast.error(t('validation.passwordMatch')); return; }
    setSavingPwd(true);
    try {
      await authAPI.updateProfile({ currentPassword: pwd.current, newPassword: pwd.next });
      toast.success(t('toast.passwordReset'));
      setPwd({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('toast.error'));
    } finally {
      setSavingPwd(false);
    }
  };

  /* ── Delete account ─────────────────────────────────── */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [cancellingDeletion, setCancellingDeletion] = useState(false);

  const isPendingDeletion = !!user?.deletionRequestedAt;

  const handleDeleteAccount = async () => {
    if (!deletePassword) { toast.error(t('validation.required')); return; }
    setDeletingAccount(true);
    try {
      await authAPI.deleteAccount(deletePassword);
      toast.success('Deletion request submitted. An admin will confirm shortly.');
      await refresh();
      setShowDeleteConfirm(false);
      setDeletePassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('toast.error'));
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleCancelDeletion = async () => {
    setCancellingDeletion(true);
    try {
      await authAPI.cancelDeletionRequest();
      toast.success('Deletion request cancelled.');
      await refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('toast.error'));
    } finally {
      setCancellingDeletion(false);
    }
  };

  const cardClass = 'glass rounded-2xl p-6 border border-white/5';

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">{t('dash.nav.settings')}</h1>
        <p className="text-slate-400 text-sm mt-1">{t('dash.overview')}</p>
      </motion.div>

      {/* ── Profile ──────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={cardClass}>
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-primary-400" />
          <h2 className="text-base font-semibold text-white">{t('auth.field.name')}</h2>
        </div>

        {/* Avatar row */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-white/3 rounded-xl border border-white/5">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0">
            {user ? getInitials(user.name) : '?'}
          </div>
          <div>
            <p className="text-white font-semibold">{user?.name}</p>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <span className="inline-block mt-1 text-xs text-primary-400 bg-primary-500/10 border border-primary-500/20 rounded-full px-2 py-0.5 capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label={t('auth.field.name')}
            value={profile.name}
            onChange={(e) => setProfile((f) => ({ ...f, name: e.target.value }))}
            placeholder={t('auth.signup.namePlaceholder')}
          />
          <Input
            label={t('auth.field.email')}
            value={user?.email || ''}
            disabled
            className="opacity-50 cursor-not-allowed"
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label={t('auth.signup.company')}
              value={profile.company}
              onChange={(e) => setProfile((f) => ({ ...f, company: e.target.value }))}
              placeholder={t('auth.signup.companyPlaceholder')}
            />
            <Input
              label={t('auth.field.phone')}
              value={profile.phone}
              onChange={(e) => setProfile((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+212 6 xx xx xx xx"
            />
          </div>
          <div className="flex justify-end pt-1">
            <Button onClick={handleSaveProfile} loading={savingProfile}>{t('common.save')}</Button>
          </div>
        </div>
      </motion.div>

      {/* ── Password ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardClass}>
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-4 h-4 text-yellow-400" />
          <h2 className="text-base font-semibold text-white">{t('auth.reset.title')}</h2>
        </div>
        <div className="space-y-4">
          <Input
            label={t('settings.currentPassword')}
            type="password"
            value={pwd.current}
            onChange={(e) => setPwd((f) => ({ ...f, current: e.target.value }))}
            placeholder={t('settings.currentPasswordPh')}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label={t('auth.reset.newPassword')}
              type="password"
              value={pwd.next}
              onChange={(e) => setPwd((f) => ({ ...f, next: e.target.value }))}
              placeholder={t('auth.placeholder.passwordMin')}
            />
            <Input
              label={t('auth.reset.confirmPassword')}
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd((f) => ({ ...f, confirm: e.target.value }))}
              placeholder={t('settings.repeatPasswordPh')}
            />
          </div>
          <div className="flex justify-end pt-1">
            <Button onClick={handleChangePassword} loading={savingPwd} variant="outline">
              {t('settings.updatePassword')}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Support ──────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-green-400" />
          <h2 className="text-base font-semibold text-white">{t('settings.needHelp')}</h2>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          {t('settings.needHelpSub')}
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://wa.me/212705914424"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] text-sm font-semibold hover:bg-[#25D366]/25 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            {t('settings.whatsappSupport')}
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
          <a
            href="tel:+212705914424"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/10 transition-all"
          >
            {t('settings.callSupport')}
          </a>
        </div>
      </motion.div>

      {/* ── Danger zone ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className={`glass rounded-2xl p-6 border ${isPendingDeletion ? 'border-orange-500/30' : 'border-red-500/15'}`}
      >
        <div className="flex items-center gap-2 mb-1">
          <Trash2 className={`w-4 h-4 ${isPendingDeletion ? 'text-orange-400' : 'text-red-400'}`} />
          <h2 className={`text-base font-semibold ${isPendingDeletion ? 'text-orange-400' : 'text-red-400'}`}>
            {t('settings.dangerZone')}
          </h2>
          {isPendingDeletion && (
            <span className="ml-1 text-[10px] font-black tracking-widest px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30">
              PENDING
            </span>
          )}
        </div>
        <p className="text-slate-500 text-sm mb-4">
          {isPendingDeletion
            ? 'Your deletion request is waiting for admin approval. You will be notified once it is reviewed.'
            : 'Permanently delete your account and all associated data. Requires admin approval.'}
        </p>

        <AnimatePresence mode="wait">
          {isPendingDeletion ? (
            <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 space-y-3"
            >
              <p className="text-orange-300 text-sm">
                Your account deletion request has been submitted and is pending admin review.
              </p>
              <Button
                variant="ghost"
                className="text-slate-400 border border-white/10 hover:bg-white/5"
                onClick={handleCancelDeletion}
                loading={cancellingDeletion}
              >
                Cancel Deletion Request
              </Button>
            </motion.div>
          ) : !showDeleteConfirm ? (
            <motion.div key="delete-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Button
                variant="ghost"
                className="text-red-400 border border-red-500/20 hover:bg-red-500/10"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete My Account
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="delete-confirm"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="space-y-4 p-4 rounded-xl border border-red-500/25 bg-red-500/5"
            >
              <p className="text-red-300 text-sm font-medium">
                Enter your password to submit the deletion request:
              </p>
              <Input
                type="password"
                label="Password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your current password"
                onKeyDown={(e) => e.key === 'Enter' && handleDeleteAccount()}
              />
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="text-slate-400 border border-white/10 hover:bg-white/5"
                  onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                >
                  Cancel
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-400 border border-red-500/30 hover:bg-red-500/15"
                  onClick={handleDeleteAccount}
                  loading={deletingAccount}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Submit Request
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { getInitials } from '@/lib/utils';
import { User, Lock, Shield, MessageCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  /* ── Profile form ───────────────────────────────────── */
  const [profile, setProfile] = useState({
    name:    user?.name    || '',
    company: user?.company || '',
    phone:   user?.phone   || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const handleSaveProfile = async () => {
    if (!profile.name.trim()) { toast.error('Name is required'); return; }
    setSavingProfile(true);
    try {
      await authAPI.updateProfile(profile);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  /* ── Password form ──────────────────────────────────── */
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [savingPwd, setSavingPwd] = useState(false);

  const handleChangePassword = async () => {
    if (!pwd.current || !pwd.next || !pwd.confirm) { toast.error('All fields are required'); return; }
    if (pwd.next.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pwd.next !== pwd.confirm) { toast.error('New passwords do not match'); return; }
    setSavingPwd(true);
    try {
      await authAPI.updateProfile({ currentPassword: pwd.current, newPassword: pwd.next });
      toast.success('Password changed successfully');
      setPwd({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPwd(false);
    }
  };

  const cardClass = 'glass rounded-2xl p-6 border border-white/5';

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account preferences.</p>
      </motion.div>

      {/* ── Profile ──────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={cardClass}>
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-primary-400" />
          <h2 className="text-base font-semibold text-white">Profile Information</h2>
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
            label="Full Name"
            value={profile.name}
            onChange={(e) => setProfile((f) => ({ ...f, name: e.target.value }))}
            placeholder="Your full name"
          />
          <Input
            label="Email Address"
            value={user?.email || ''}
            disabled
            className="opacity-50 cursor-not-allowed"
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Company"
              value={profile.company}
              onChange={(e) => setProfile((f) => ({ ...f, company: e.target.value }))}
              placeholder="Your company"
            />
            <Input
              label="Phone"
              value={profile.phone}
              onChange={(e) => setProfile((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+212 6 xx xx xx xx"
            />
          </div>
          <div className="flex justify-end pt-1">
            <Button onClick={handleSaveProfile} loading={savingProfile}>Save Profile</Button>
          </div>
        </div>
      </motion.div>

      {/* ── Password ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardClass}>
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-4 h-4 text-yellow-400" />
          <h2 className="text-base font-semibold text-white">Change Password</h2>
        </div>
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={pwd.current}
            onChange={(e) => setPwd((f) => ({ ...f, current: e.target.value }))}
            placeholder="Your current password"
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              value={pwd.next}
              onChange={(e) => setPwd((f) => ({ ...f, next: e.target.value }))}
              placeholder="At least 6 characters"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd((f) => ({ ...f, confirm: e.target.value }))}
              placeholder="Repeat new password"
            />
          </div>
          <div className="flex justify-end pt-1">
            <Button onClick={handleChangePassword} loading={savingPwd} variant="outline">
              Update Password
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Support ──────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-green-400" />
          <h2 className="text-base font-semibold text-white">Need Help?</h2>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          Have a question or issue? Reach out to Mounir directly.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://wa.me/212705914424"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] text-sm font-semibold hover:bg-[#25D366]/25 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp Support
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
          <a
            href="tel:+212705914424"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/10 transition-all"
          >
            +212 705 914 424
          </a>
        </div>
      </motion.div>

      {/* ── Danger zone ──────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 border border-red-500/15">
        <h2 className="text-base font-semibold text-red-400 mb-1">Danger Zone</h2>
        <p className="text-slate-500 text-sm mb-4">
          These actions are irreversible. Please be certain before proceeding.
        </p>
        <Button
          variant="ghost"
          className="text-red-400 border border-red-500/20 hover:bg-red-500/10"
          onClick={() => {
            if (confirm('Are you sure you want to sign out of all devices?')) logout();
          }}
        >
          Sign Out
        </Button>
      </motion.div>
    </div>
  );
}

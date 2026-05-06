'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { getInitials } from '@/lib/utils';

export default function SettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    company: user?.company || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      await authAPI.updateProfile(form);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <div className="glass rounded-2xl p-6 border border-white/5">
        <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {user ? getInitials(user.name) : '?'}
          </div>
          <div>
            <p className="text-white font-medium">{user?.name}</p>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <p className="text-primary-400 text-xs capitalize mt-0.5">{user?.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={set('name')} />
          <Input label="Email" value={user?.email || ''} disabled className="opacity-60 cursor-not-allowed" />
          <Input label="Company" value={form.company} onChange={set('company')} placeholder="Your company" />
          <Input label="Phone" value={form.phone} onChange={set('phone')} placeholder="+212 6 xx xx xx xx" />

          <div className="flex justify-end">
            <Button onClick={handleSave} loading={loading}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

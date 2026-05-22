'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '@/lib/api';
import { User } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import PlanBadge from '@/components/ui/PlanBadge';
import toast from 'react-hot-toast';
import { Users, AlertTriangle, RefreshCcw, UserCheck, UserX, Trash2, X } from 'lucide-react';

export default function AdminClientsPage() {
  const { t } = useLanguage();
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchClients = useCallback((silent = false) => {
    if (!silent) { setLoading(true); setFetchError(null); }
    adminAPI.getClients()
      .then(({ data }) => setClients(data.clients))
      .catch((err) => {
        console.error(err);
        if (!silent) setFetchError(t('toast.error'));
      })
      .finally(() => { if (!silent) setLoading(false); });
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminAPI.deleteClient(deleteTarget._id ?? deleteTarget.id ?? '');
      setClients((prev) => prev.filter((c) => (c._id ?? c.id) !== (deleteTarget._id ?? deleteTarget.id)));
      toast.success('Client account deleted.');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('toast.error'));
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const { data } = await adminAPI.toggleClient(id);
      setClients((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isActive: data.user.isActive } : c))
      );
      toast.success(t('toast.saved'));
    } catch {
      toast.error(t('toast.error'));
    }
  };

  const activeCount   = clients.filter((c) => c.isActive).length;
  const inactiveCount = clients.length - activeCount;

  return (
    <div className="space-y-6 max-w-5xl">
      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-300 flex-1">{fetchError}</span>
          <button
            onClick={() => fetchClients(false)}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {t('admin.clients')}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {loading ? 'Loading...' : `${clients.length} ${t('admin.clients.count')}`}
        </p>
      </div>

      {/* Stats */}
      {!loading && clients.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="relative glass rounded-2xl border border-white/5 overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-primary-600 via-primary-500 to-violet-500" />
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs mb-0.5">{t('admin.clients')}</p>
                <p className="text-2xl font-black text-white">{clients.length}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary-500/15 flex items-center justify-center">
                <Users className="w-4.5 h-4.5 text-primary-400" strokeWidth={1.8} />
              </div>
            </div>
          </div>
          <div className="relative glass rounded-2xl border border-white/5 overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500" />
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs mb-0.5">{t('status.active')}</p>
                <p className="text-2xl font-black text-emerald-400">{activeCount}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <UserCheck className="w-4.5 h-4.5 text-emerald-400" strokeWidth={1.8} />
              </div>
            </div>
          </div>
          <div className="relative glass rounded-2xl border border-white/5 overflow-hidden col-span-2 sm:col-span-1">
            <div className="h-[3px] bg-gradient-to-r from-red-600 via-red-500 to-rose-500" />
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs mb-0.5">{t('status.inactive')}</p>
                <p className="text-2xl font-black text-red-400">{inactiveCount}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center">
                <UserX className="w-4.5 h-4.5 text-red-400" strokeWidth={1.8} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-sm rounded-2xl border border-red-500/25 p-6"
            style={{ background: 'rgba(8,8,11,0.97)', boxShadow: '0 0 60px rgba(239,68,68,0.12), 0 24px 64px rgba(0,0,0,0.8)' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <button onClick={() => setDeleteTarget(null)} className="text-slate-500 hover:text-white transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-white font-bold text-base mb-1">Delete Client Account</h3>
            <p className="text-slate-400 text-sm mb-1">
              You are about to permanently delete:
            </p>
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-white/4 border border-white/8">
              <p className="text-white text-sm font-semibold">{deleteTarget.name}</p>
              <p className="text-slate-500 text-xs">{deleteTarget.email}</p>
            </div>
            <p className="text-red-400/80 text-xs mb-5">This action is permanent and cannot be undone. All associated data will be removed.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-300 border border-white/10 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-white/5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="w-8 h-8 rounded-full skeleton-shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 rounded skeleton-shimmer" />
                  <div className="h-2.5 w-1/2 rounded skeleton-shimmer" />
                </div>
                <div className="h-5 w-16 rounded-full skeleton-shimmer hidden sm:block" />
                <div className="h-5 w-12 rounded-full skeleton-shimmer" />
              </div>
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-slate-600" strokeWidth={1.5} />
            </div>
            <p className="text-slate-300 text-sm font-medium mb-1">{t('empty.clients')}</p>
            <p className="text-slate-600 text-xs">Registered clients will appear here</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6">
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{t('admin.clients')}</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden sm:table-cell">{t('request.packageLabel')}</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden md:table-cell">{t('auth.signup.company')}</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden lg:table-cell">{t('auth.field.phone')}</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{t('admin.status')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {clients.map((c, i) => (
                <motion.tr
                  key={c._id || c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)' }}
                      >
                        {getInitials(c.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white text-sm font-medium truncate">{c.name}</div>
                        <div className="text-slate-500 text-xs truncate">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell"><PlanBadge plan={c.plan} /></td>
                  <td className="p-4 text-sm text-slate-400 hidden md:table-cell">{c.company || '—'}</td>
                  <td className="p-4 text-sm text-slate-400 hidden lg:table-cell">
                    {c.createdAt ? formatDate(c.createdAt) : '—'}
                  </td>
                  <td className="p-4">
                    <Badge color={c.isActive ? 'green' : 'red'}>
                      {c.isActive ? t('status.active') : t('status.inactive')}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(c._id ?? c.id ?? '')}
                        className="text-xs text-slate-400 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/6 border border-transparent hover:border-white/8"
                      >
                        {t('admin.toggle')}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="text-xs text-red-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                        title="Delete client"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projectAPI } from '@/lib/api';
import { Project, ProjectStatus } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, getProjectTypeLabel } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Search, AlertTriangle, RefreshCcw, ChevronDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import PlanBadge from '@/components/ui/PlanBadge';

const statusOptions: ProjectStatus[] = ['pending', 'in-progress', 'review', 'revision', 'completed', 'delivered', 'cancelled'];

const STATUS_COLORS: Record<string, string> = {
  'pending':     'text-slate-400',
  'in-progress': 'text-blue-400',
  'review':      'text-orange-400',
  'revision':    'text-orange-300',
  'completed':   'text-emerald-400',
  'delivered':   'text-violet-400',
  'cancelled':   'text-red-400',
};

/* Inline status picker that opens a floating dropdown */
function InlineStatusPicker({
  projectId,
  current,
  onSaved,
}: {
  projectId: string;
  current: string;
  onSaved: (id: string, status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pick = async (status: string) => {
    if (status === current) { setOpen(false); return; }
    setSaving(true);
    setOpen(false);
    try {
      await projectAPI.update(projectId, { status });
      onSaved(projectId, status);
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 group"
        disabled={saving}
      >
        <StatusBadge status={current as ProjectStatus} />
        {saving ? (
          <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />
        ) : (
          <ChevronDown className={`w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-all duration-150 ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 mt-1.5 z-50 min-w-[140px] glass rounded-xl border border-white/10 shadow-xl overflow-hidden"
          >
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => pick(s)}
                className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-white/8 ${
                  s === current ? 'bg-white/6 ' + (STATUS_COLORS[s] ?? 'text-slate-300') : STATUS_COLORS[s] ?? 'text-slate-400'
                }`}
              >
                {s === current && <span className="mr-1.5">•</span>}
                {s.replace('-', ' ')}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminProjectsPage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState({ status: '', progress: 0, notes: '' });
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchProjects = useCallback((silent = false) => {
    if (!silent) { setLoading(true); setFetchError(null); }
    projectAPI
      .getAll({ search, status: statusFilter })
      .then(({ data }) => setProjects(data.projects))
      .catch((err) => {
        console.error(err);
        if (!silent) setFetchError('Failed to load. Please try again.');
      })
      .finally(() => { if (!silent) setLoading(false); });
  }, [search, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => { timer = setInterval(() => fetchProjects(true), 30_000); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
    const onVis = () => document.visibilityState === 'visible' ? start() : stop();
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, [fetchProjects]);

  const openEdit = (p: Project) => {
    setEditingProject(p);
    setEditForm({ status: p.status, progress: p.progress, notes: p.notes || '' });
  };

  const quickStatusSaved = (id: string, status: string) => {
    setProjects((prev) => prev.map((p) => (p._id === id ? { ...p, status: status as ProjectStatus } : p)));
  };

  const saveEdit = async () => {
    if (!editingProject) return;
    setSaving(true);
    try {
      await projectAPI.update(editingProject._id ?? editingProject.id ?? '', editForm);
      toast.success(t('toast.saved'));
      setEditingProject(null);
      fetchProjects();
    } catch {
      toast.error(t('toast.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {fetchError && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-300 flex-1">{fetchError}</span>
          <button
            onClick={() => fetchProjects(false)}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{t('admin.allProjects')}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? 'Loading...' : `${projects.length} ${t('admin.projectsTotal')}`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search')}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/60 focus:bg-white/8 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-primary-500/60 transition-colors"
        >
          <option value="">{t('admin.allStatuses')}</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s.replace('-', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-white/5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-2/5 rounded skeleton-shimmer" />
                  <div className="h-2.5 w-1/4 rounded skeleton-shimmer" />
                </div>
                <div className="h-5 w-14 rounded-full skeleton-shimmer hidden sm:block" />
                <div className="h-3.5 w-16 rounded skeleton-shimmer hidden md:block" />
                <div className="h-5 w-16 rounded-full skeleton-shimmer" />
                <div className="flex items-center gap-2 hidden lg:flex">
                  <div className="h-1.5 w-20 rounded-full skeleton-shimmer" />
                  <div className="h-3 w-8 rounded skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-slate-600" strokeWidth={1.5} />
            </div>
            <p className="text-slate-300 text-sm font-medium mb-1">{t('empty.projects')}</p>
            <p className="text-slate-600 text-xs">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{t('admin.col.project')}</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden sm:table-cell">{t('admin.clients')}</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden md:table-cell">{t('admin.col.plan')}</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden md:table-cell">{t('client.budget')}</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{t('admin.status')}</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden lg:table-cell">{t('admin.progress')}</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden lg:table-cell">{t('client.created')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => {
                  const client = typeof p.client === 'object' ? p.client : null;
                  return (
                    <motion.tr
                      key={p._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/5 hover:bg-white/2 transition-colors"
                    >
                      <td className="p-4">
                        <div className="text-white text-sm font-medium">{p.title}</div>
                        <div className="text-slate-500 text-xs">{getProjectTypeLabel(p.type, t)}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-400 hidden sm:table-cell">{client?.name || '—'}</td>
                      <td className="p-4 hidden md:table-cell"><PlanBadge plan={p.package} /></td>
                      <td className="p-4 text-sm font-medium text-white hidden md:table-cell">{formatCurrency(p.budget)}</td>
                      <td className="p-4">
                        <InlineStatusPicker
                          projectId={p._id ?? p.id ?? ''}
                          current={p.status}
                          onSaved={quickStatusSaved}
                        />
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-500 rounded-full"
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-400 hidden lg:table-cell">{formatDate(p.createdAt)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/admin/projects/${p._id}`}
                            className="text-xs text-slate-400 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/6 border border-transparent hover:border-white/8"
                          >
                            {t('common.view')}
                          </Link>
                          <button
                            onClick={() => openEdit(p)}
                            className="text-xs text-primary-400 hover:text-primary-300 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-primary-500/10 border border-transparent hover:border-primary-500/20"
                          >
                            {t('common.edit')}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={!!editingProject} onClose={() => setEditingProject(null)} title={t('admin.updateProject')}>
        {editingProject && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">{t('admin.status')}</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-primary-500"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s.replace('-', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">
                {t('admin.progress')}: {editForm.progress}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={editForm.progress}
                onChange={(e) => setEditForm((f) => ({ ...f, progress: +e.target.value }))}
                className="w-full accent-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">{t('admin.notes')}</label>
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-primary-500 resize-none"
                placeholder={t('admin.notes')}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setEditingProject(null)}>{t('common.cancel')}</Button>
              <Button onClick={saveEdit} loading={saving}>{t('common.save')}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

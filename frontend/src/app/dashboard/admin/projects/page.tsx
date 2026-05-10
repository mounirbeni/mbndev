'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { projectAPI } from '@/lib/api';
import { Project, ProjectStatus } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, getProjectTypeLabel } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import Link from 'next/link';
import PlanBadge from '@/components/ui/PlanBadge';

const statusOptions: ProjectStatus[] = ['pending', 'in-progress', 'review', 'completed', 'cancelled'];

export default function AdminProjectsPage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState({ status: '', progress: 0, notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchProjects = (silent = false) => {
    if (!silent) setLoading(true);
    projectAPI
      .getAll({ search, status: statusFilter })
      .then(({ data }) => setProjects(data.projects))
      .catch(console.error)
      .finally(() => { if (!silent) setLoading(false); });
  };

  useEffect(() => {
    fetchProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => { timer = setInterval(() => fetchProjects(true), 30_000); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
    const onVis = () => document.visibilityState === 'visible' ? start() : stop();
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const openEdit = (p: Project) => {
    setEditingProject(p);
    setEditForm({ status: p.status, progress: p.progress, notes: p.notes || '' });
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('admin.allProjects')}</h1>
          <p className="text-slate-400 text-sm mt-1">{projects.length} {t('admin.projectsTotal')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search')}
            className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-primary-500 w-64 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-primary-500"
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
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center text-slate-500">{t('empty.projects')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">{t('admin.col.project')}</th>
                  <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">{t('admin.clients')}</th>
                  <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">{t('admin.col.plan')}</th>
                  <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">{t('client.budget')}</th>
                  <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">{t('admin.status')}</th>
                  <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">{t('admin.progress')}</th>
                  <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">{t('client.created')}</th>
                  <th className="p-4" />
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
                      <td className="p-4 text-sm text-slate-400">{client?.name || '—'}</td>
                      <td className="p-4"><PlanBadge plan={p.package} /></td>
                      <td className="p-4 text-sm font-medium text-white">{formatCurrency(p.budget)}</td>
                      <td className="p-4"><StatusBadge status={p.status} /></td>
                      <td className="p-4">
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
                      <td className="p-4 text-sm text-slate-400">{formatDate(p.createdAt)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/admin/projects/${p._id}`}
                            className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                          >
                            {t('common.view')}
                          </Link>
                          <button
                            onClick={() => openEdit(p)}
                            className="text-xs text-primary-400 hover:text-primary-300 transition-colors px-2 py-1 rounded-lg hover:bg-primary-500/10"
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

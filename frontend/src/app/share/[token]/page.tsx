'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Zap, CheckCircle2, Clock, AlertCircle, ExternalLink,
  Calendar, Target, Users,
} from 'lucide-react';
import { projectAPI } from '@/lib/api';
import ProjectLifecycle, { ProjectStatus } from '@/components/dashboard/ProjectLifecycle';
import { formatDate } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const TYPE_LABELS: Record<string, string> = {
  website:        'Custom Website',
  ecommerce:      'E-Commerce Store',
  dashboard:      'SaaS Dashboard',
  mobile:         'Mobile App',
  'landing-page': 'Landing Page',
  'web-app':      'Web Application',
  saas:           'SaaS Platform',
  portfolio:      'Portfolio',
  custom:         'Custom Project',
};

function MilestoneItem({ title, status, dueDate }: { title: string; status: string; dueDate?: string | null }) {
  const done = status === 'paid' || status === 'completed';
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
        done ? 'bg-green-500/20' : 'bg-white/5'
      }`}>
        {done
          ? <CheckCircle2 className="w-3 h-3 text-green-400" />
          : <Clock className="w-3 h-3 text-slate-600" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <span className={`text-sm ${done ? 'text-slate-400 line-through' : 'text-white'}`}>
          {title}
        </span>
      </div>
      {dueDate && (
        <span className="text-[10px] text-slate-600 shrink-0">{formatDate(dueDate)}</span>
      )}
    </div>
  );
}

export default function SharePage() {
  const { t }      = useLanguage();
  const { token }  = useParams<{ token: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    projectAPI.getByShareToken(token)
      .then(({ data }) => setProject(data.project))
      .catch((err) => setError(err?.response?.data?.message || 'Could not load project'))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">MBN DEV</span>
          </Link>
          <span className="text-xs text-slate-500 border border-white/10 px-3 py-1 rounded-full">
            {t('share.sharedView')}
          </span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">{t('share.loading')}</p>
          </div>
        )}

        {/* Error */}
        {!loading && (error || !project) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-white">{t('share.linkInvalid')}</h2>
            <p className="text-slate-500 text-sm max-w-xs">
              {error || t('share.linkInvalidSub')}
            </p>
            <Link
              href="/"
              className="mt-2 text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1.5"
            >
              {t('share.visitMbn')} <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        )}

        {/* Project view */}
        {!loading && project && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="glass rounded-3xl border border-white/5 overflow-hidden">
              <div className="h-[2px] bg-gradient-to-r from-primary-700 via-primary-500 to-violet-500" />
              <div className="p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                      {TYPE_LABELS[project.type] || project.type}
                    </span>
                    <h1 className="text-2xl font-bold text-white mt-1">{project.title}</h1>
                    {project.client?.company && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-sm text-slate-400">{project.client.company}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                    {/* Progress */}
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full bg-primary-500 rounded-full"
                        />
                      </div>
                      <span className="text-sm font-bold text-white">{project.progress}%</span>
                    </div>
                    {project.deadline && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {t('share.deadline')}: {formatDate(project.deadline)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Lifecycle */}
            <div className="glass rounded-2xl border border-white/5 p-6">
              <h2 className="text-sm font-semibold text-white mb-5">{t('share.projectStage')}</h2>
              <ProjectLifecycle status={project.status as ProjectStatus} animated />
            </div>

            {/* Milestones (if any) */}
            {project.milestones?.length > 0 && (
              <div className="glass rounded-2xl border border-white/5 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-primary-400" />
                  <h2 className="text-sm font-semibold text-white">{t('share.milestones')}</h2>
                  <span className="ml-auto text-xs text-slate-500">
                    {project.milestones.filter((m: any) => m.status === 'paid').length} / {project.milestones.length} {t('share.done')}
                  </span>
                </div>
                <div>
                  {project.milestones.map((m: any, i: number) => (
                    <MilestoneItem key={i} title={m.title} status={m.status} dueDate={m.dueDate} />
                  ))}
                </div>
              </div>
            )}

            {/* Last updated */}
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>{t('share.lastUpdated')} {formatDate(project.updatedAt)}</span>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-primary-500/60 hover:text-primary-400 transition-colors"
              >
                {t('share.poweredBy')} <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

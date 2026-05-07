'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import { Project } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate, projectTypeLabels } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  href: string;
  index?: number;
}

export default function ProjectCard({ project, href, index = 0 }: ProjectCardProps) {
  const client = typeof project.client === 'object' ? project.client : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
    >
      <Link href={href}>
        <div className="glass rounded-2xl p-4 sm:p-5 border border-white/6 hover:border-primary-500/30 transition-all duration-200 group cursor-pointer press-scale">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-3">
              <h3 className="text-white font-semibold truncate group-hover:text-primary-300 transition-colors">
                {project.title}
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                {projectTypeLabels[project.type] || project.type}
              </p>
            </div>
            <StatusBadge status={project.status} />
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Progress</span>
              <span className="text-slate-400">{project.progress}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 1, delay: index * 0.05 + 0.3 }}
                className="h-full progress-bar rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {project.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(project.deadline)}
                </span>
              )}
              {client && (
                <span className="text-slate-500">{client.name}</span>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

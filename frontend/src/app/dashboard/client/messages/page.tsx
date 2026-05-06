'use client';

import { useState, useEffect } from 'react';
import { projectAPI } from '@/lib/api';
import { Project } from '@/types';
import MessageThread from '@/components/dashboard/MessageThread';
import { MessageSquare } from 'lucide-react';

export default function ClientMessagesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectAPI.getMine()
      .then(({ data }) => {
        setProjects(data.projects);
        if (data.projects.length > 0) setSelected(data.projects[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-bold text-white mb-6">Messages</h1>

      <div className="flex gap-4 h-[calc(100%-3.5rem)]">
        {/* Project list */}
        <div className="w-64 glass rounded-2xl border border-white/5 overflow-y-auto shrink-0">
          <div className="p-3 space-y-1">
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
              ))}
            {!loading && projects.length === 0 && (
              <div className="p-4 text-center text-slate-500 text-sm">No projects yet</div>
            )}
            {projects.map((p) => (
              <button
                key={p._id}
                onClick={() => setSelected(p)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  selected?._id === p._id
                    ? 'bg-primary-500/20 border border-primary-500/30'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="text-sm font-medium text-white truncate">{p.title}</div>
                <div className="text-xs text-slate-500 capitalize mt-0.5">{p.status}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Message thread */}
        <div className="flex-1 glass rounded-2xl border border-white/5 overflow-hidden">
          {selected ? (
            <MessageThread projectId={selected._id} projectTitle={selected.title} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Select a project to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { projectAPI } from '@/lib/api';
import { Project } from '@/types';
import MessageThread from '@/components/dashboard/MessageThread';
import { MessageSquare, Search } from 'lucide-react';

export default function AdminMessagesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectAPI.getAll()
      .then(({ data }) => {
        setProjects(data.projects);
        if (data.projects.length > 0) setSelected(data.projects[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-bold text-white mb-6">Messages</h1>

      <div className="flex gap-4 h-[calc(100%-3.5rem)]">
        {/* Project list */}
        <div className="w-72 glass rounded-2xl border border-white/5 flex flex-col shrink-0">
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
              ))}
            {filtered.map((p) => {
              const client = typeof p.client === 'object' ? p.client : null;
              return (
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
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {client?.name || 'Unknown client'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thread */}
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

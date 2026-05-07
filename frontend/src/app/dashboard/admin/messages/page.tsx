'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projectAPI } from '@/lib/api';
import { Project } from '@/types';
import MessageThread from '@/components/dashboard/MessageThread';
import { MessageSquare, Search, ArrowLeft } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminMessagesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileChat, setMobileChat] = useState(false);

  useEffect(() => {
    projectAPI.getAll()
      .then(({ data }) => {
        setProjects(data.projects);
        if (data.projects.length > 0 && window.innerWidth >= 1024) {
          setSelected(data.projects[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (p: Project) => {
    setSelected(p);
    setMobileChat(true);
  };

  return (
    <div className="max-w-7xl h-[calc(100svh-8rem)] min-h-[400px] flex flex-col">
      {/* Header */}
      <div className={`mb-4 lg:mb-6 flex items-center gap-3 ${mobileChat ? 'lg:block hidden' : 'flex'}`}>
        {mobileChat && (
          <button
            onClick={() => setMobileChat(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">
            {mobileChat && selected ? selected.title : 'Messages'}
          </h1>
          {!mobileChat && (
            <p className="text-slate-500 text-sm hidden sm:block">Manage client conversations</p>
          )}
        </div>
      </div>

      <div className="flex gap-4 flex-1 overflow-hidden min-h-0">
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {!mobileChat && (
            <motion.div
              key="sidebar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full lg:w-72 glass rounded-2xl border border-white/5 flex flex-col shrink-0"
            >
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

              <div className="flex-1 overflow-y-auto p-2 space-y-1 scroll-native">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))
                ) : filtered.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm">No projects found</div>
                ) : (
                  filtered.map((p) => {
                    const client = typeof p.client === 'object' ? p.client : null;
                    return (
                      <button
                        key={p._id}
                        onClick={() => handleSelect(p)}
                        className={`w-full text-left p-3 rounded-xl transition-all press-scale ${
                          selected?._id === p._id && !mobileChat
                            ? 'bg-primary-500/20 border border-primary-500/30'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">{p.title}</div>
                            <div className="text-xs text-slate-500 mt-0.5 truncate">
                              {client?.name || 'Unknown client'}
                            </div>
                          </div>
                          <StatusBadge status={p.status} />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thread */}
        <AnimatePresence initial={false}>
          {selected && (mobileChat || true) ? (
            <motion.div
              key={selected._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex-1 glass rounded-2xl border border-white/5 overflow-hidden min-w-0 ${
                mobileChat ? 'block w-full' : 'hidden lg:block'
              }`}
            >
              <MessageThread projectId={selected._id ?? selected.id ?? ''} projectTitle={selected.title} />
            </motion.div>
          ) : (
            !mobileChat && (
              <div className="flex-1 glass rounded-2xl border border-white/5 hidden lg:flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Select a project to view messages</p>
                </div>
              </div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

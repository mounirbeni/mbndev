'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '@/lib/api';
import { User } from '@/types';
import { formatDate, getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import PlanBadge from '@/components/ui/PlanBadge';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';

export default function AdminClientsPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getClients()
      .then(({ data }) => setClients(data.clients))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (id: string) => {
    try {
      const { data } = await adminAPI.toggleClient(id);
      setClients((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isActive: data.user.isActive } : c))
      );
      toast.success('Client status updated');
    } catch {
      toast.error('Failed to update client');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Clients</h1>
        <p className="text-slate-400 text-sm mt-1">{clients.length} registered clients</p>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No clients yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">Client</th>
                <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">Plan</th>
                <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">Company</th>
                <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">Joined</th>
                <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">Status</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {clients.map((c, i) => (
                <motion.tr
                  key={c._id || c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-white/5 hover:bg-white/2 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {getInitials(c.name)}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{c.name}</div>
                        <div className="text-slate-500 text-xs">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><PlanBadge plan={c.plan} /></td>
                  <td className="p-4 text-sm text-slate-400">{c.company || '—'}</td>
                  <td className="p-4 text-sm text-slate-400">{c.createdAt ? formatDate(c.createdAt) : '—'}</td>
                  <td className="p-4">
                    <Badge color={c.isActive ? 'green' : 'red'}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleStatus(c._id ?? c.id ?? '')}
                      className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                    >
                      Toggle
                    </button>
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

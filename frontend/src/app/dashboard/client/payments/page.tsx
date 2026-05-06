'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { paymentAPI } from '@/lib/api';
import { Payment } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard } from 'lucide-react';

export default function ClientPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentAPI.getAll()
      .then(({ data }) => setPayments(data.payments))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-white">Payments</h1>

      <div className="glass rounded-2xl p-6 border border-white/5">
        <p className="text-slate-400 text-sm">Total Paid</p>
        <p className="text-4xl font-bold text-white mt-1">{formatCurrency(total)}</p>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No payments yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">Project</th>
                <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">Milestone</th>
                <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">Amount</th>
                <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">Status</th>
                <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((pay, i) => {
                const project = typeof pay.project === 'object' ? pay.project : null;
                return (
                  <motion.tr
                    key={pay._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/2 transition-colors"
                  >
                    <td className="p-4 text-sm text-white">{project?.title || '—'}</td>
                    <td className="p-4 text-sm text-slate-400">{pay.milestoneTitle || '—'}</td>
                    <td className="p-4 text-sm font-semibold text-white">{formatCurrency(pay.amount)}</td>
                    <td className="p-4">
                      <StatusBadge status={pay.status} />
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {pay.paidAt ? formatDate(pay.paidAt) : formatDate(pay.createdAt)}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

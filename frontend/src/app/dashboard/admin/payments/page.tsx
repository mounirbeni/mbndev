'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { paymentAPI } from '@/lib/api';
import { Payment } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, CheckCircle, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const METHOD_LABELS: Record<string, string> = {
  cih_bank:   'CIH Bank',
  paypal:     'PayPal',
  taptapsend: 'TapTapSend',
  mock:       'Mock',
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  const fetchPayments = (silent = false) => {
    if (!silent) setLoading(true);
    paymentAPI.getAll()
      .then(({ data }) => setPayments(data.payments))
      .catch(console.error)
      .finally(() => { if (!silent) setLoading(false); });
  };

  // Initial load
  useEffect(() => { fetchPayments(); }, []);

  // Real-time polling (15 s when tab is visible)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => { timer = setInterval(() => fetchPayments(true), 15_000); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
    const onVis = () => document.visibilityState === 'visible' ? start() : stop();
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      await paymentAPI.approveManual(id);
      toast.success('Payment approved — project created!');
      fetchPayments(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve payment');
    } finally {
      setApproving(null);
    }
  };

  const totalRevenue    = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pendingVerif    = payments.filter((p) => p.status === 'pending_verification');
  const pendingAmount   = payments.filter((p) => p.status === 'pending' || p.status === 'pending_verification').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Payments</h1>
        {pendingVerif.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold text-yellow-300"
               style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)' }}>
            <Clock className="w-4 h-4" />
            {pendingVerif.length} awaiting verification
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-6 border border-white/5">
          <p className="text-slate-400 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-white mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="glass rounded-2xl p-6 border border-white/5">
          <p className="text-slate-400 text-sm">Pending</p>
          <p className="text-3xl font-bold text-yellow-400 mt-1">{formatCurrency(pendingAmount)}</p>
        </div>
        <div className="glass rounded-2xl p-6 border border-white/5">
          <p className="text-slate-400 text-sm">Total Invoices</p>
          <p className="text-3xl font-bold text-white mt-1">{payments.length}</p>
        </div>
      </div>

      {/* Payments table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No payments yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">Client</th>
                  <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">Order / Project</th>
                  <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">Amount</th>
                  <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">Method</th>
                  <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">Status</th>
                  <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">Date</th>
                  <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">Invoice</th>
                  <th className="text-left p-4 text-xs text-slate-500 font-medium uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((pay, i) => {
                  const client  = typeof pay.client  === 'object' ? pay.client  : null;
                  const project = typeof pay.project === 'object' ? pay.project : null;
                  const order   = typeof pay.order   === 'object' ? pay.order   : null;
                  const isVerif = pay.status === 'pending_verification';

                  return (
                    <motion.tr
                      key={pay._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={`border-b border-white/5 transition-colors ${
                        isVerif ? 'bg-yellow-500/5 hover:bg-yellow-500/8' : 'hover:bg-white/2'
                      }`}
                    >
                      <td className="p-4 text-sm text-white">{client?.name || '—'}</td>
                      <td className="p-4 text-sm text-slate-400">
                        {order?.title || project?.title || '—'}
                      </td>
                      <td className="p-4 text-sm font-semibold text-white">{formatCurrency(pay.amount)}</td>
                      <td className="p-4 text-sm text-slate-400">
                        {pay.method ? METHOD_LABELS[pay.method] || pay.method : 'Manual'}
                      </td>
                      <td className="p-4"><StatusBadge status={pay.status} /></td>
                      <td className="p-4 text-sm text-slate-400">
                        {pay.paidAt ? formatDate(pay.paidAt) : formatDate(pay.createdAt)}
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/invoice/${pay._id}`}
                          className="inline-flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View
                        </Link>
                      </td>
                      <td className="p-4">
                        {isVerif ? (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(pay._id as string)}
                            disabled={approving === pay._id}
                            className="text-xs"
                          >
                            {approving === pay._id ? (
                              <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                                Approving…
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approve
                              </span>
                            )}
                          </Button>
                        ) : (
                          <span className="text-slate-700 text-xs">—</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { paymentAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Printer, ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function InvoicePage() {
  const { id }   = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t }    = useLanguage();
  const router   = useRouter();

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    paymentAPI.getOne(id)
      .then(({ data }) => setPayment(data.payment))
      .catch((err)    => setError(err?.response?.data?.message || 'Invoice not found'))
      .finally(()     => setLoading(false));
  }, [id]);

  if (!user) { router.push('/login'); return null; }

  if (loading) return (
    <div className="min-h-screen bg-[#f4f4f8] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !payment) return (
    <div className="min-h-screen bg-[#f4f4f8] flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium mb-4">{error || 'Invoice not found'}</p>
        <button onClick={() => router.back()} className="text-sm text-violet-600 hover:underline">← Go back</button>
      </div>
    </div>
  );

  const client    = typeof payment.client  === 'object' ? payment.client  : null;
  const order     = typeof payment.order   === 'object' ? payment.order   : null;
  const project   = typeof payment.project === 'object' ? payment.project : null;
  const isPaid    = payment.status === 'paid';
  const isPending = payment.status === 'pending_verification';

  const invoiceNum  = `INV-${new Date(payment.createdAt).getFullYear()}-${(payment._id || payment.id || '').slice(-6).toUpperCase()}`;
  const issueDate   = formatDate(payment.createdAt);
  const paidDate    = payment.paidAt ? formatDate(payment.paidAt) : null;
  const projectTitle = order?.title || project?.title || 'Web Development Service';

  const METHOD_LABELS: Record<string, string> = {
    cih_bank:   'CIH Bank Transfer',
    paypal:     'PayPal',
    taptapsend: 'TapTapSend',
    mock:       'Online Payment',
  };
  const methodLabel = METHOD_LABELS[payment.method] || 'Manual Payment';

  const SERVICE_LABELS: Record<string, string> = {
    website:   'Business Website',
    ecommerce: 'E-Commerce Store',
    dashboard: 'SaaS Dashboard',
    mobile:    'Mobile Application',
    custom:    'Custom Development',
  };
  const serviceType = order?.serviceType || project?.type || 'custom';
  const serviceLabel = SERVICE_LABELS[serviceType] || 'Web Development Service';

  return (
    <div className="min-h-screen bg-[#f0f0f5] print:bg-white">

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="print:hidden sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="max-w-[820px] mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-mono hidden sm:block">{invoiceNum}</span>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors
                         bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / Save PDF</span>
              <span className="sm:hidden">Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Invoice ─────────────────────────────────────────────────────────── */}
      <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-8 print:p-0 print:py-0">
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-black/8 print:shadow-none print:rounded-none">

          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-violet-700 via-violet-500 to-blue-500 print:h-1" />

          {/* Header band */}
          <div className="bg-gradient-to-br from-[#0e0e18] to-[#1a1030] px-8 sm:px-10 py-8 print:py-6">
            <div className="flex items-start justify-between">

              {/* Brand */}
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <span className="text-white font-black text-base leading-none">M</span>
                  </div>
                  <span className="text-white font-black text-lg tracking-tight">MBN <span className="text-violet-400">DEV</span></span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Professional Web Development<br />
                  Morocco · Worldwide<br />
                  contact@mbndev.ma · mbndev.ma
                </p>
              </div>

              {/* Invoice label + status */}
              <div className="text-right">
                <p className="text-gray-500 text-[10px] uppercase tracking-[0.15em] font-bold mb-1">Invoice</p>
                <p className="text-white text-2xl font-black tracking-tight mb-3">{invoiceNum}</p>
                {isPaid && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    <CheckCircle2 className="w-3 h-3" /> PAID
                  </span>
                )}
                {isPending && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                    <Clock className="w-3 h-3" /> PENDING
                  </span>
                )}
                {!isPaid && !isPending && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-500/15 text-gray-400 border border-gray-500/25">
                    <AlertCircle className="w-3 h-3" /> {payment.status.toUpperCase()}
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* Body */}
          <div className="px-8 sm:px-10 py-8 print:py-6">

            {/* Bill from / to */}
            <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-100">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] mb-3">From</p>
                <p className="text-sm font-bold text-gray-900 mb-1">MBN DEV</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  contact@mbndev.ma<br />
                  mbndev.ma<br />
                  Morocco
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] mb-3">Bill To</p>
                <p className="text-sm font-bold text-gray-900 mb-1">{client?.name || 'Client'}</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {client?.company && <>{client.company}<br /></>}
                  {client?.email || ''}
                </p>
              </div>
            </div>

            {/* Date + method row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-2xl print:bg-gray-50">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Issue Date</p>
                <p className="text-sm font-semibold text-gray-800">{issueDate}</p>
              </div>
              {paidDate && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Paid On</p>
                  <p className="text-sm font-semibold text-emerald-600">{paidDate}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Method</p>
                <p className="text-sm font-semibold text-gray-800">{methodLabel}</p>
              </div>
              {payment.externalRef && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reference</p>
                  <p className="text-sm font-mono text-gray-600 break-all">{payment.externalRef}</p>
                </div>
              )}
            </div>

            {/* Line items */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left pb-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.12em]">Description</th>
                    <th className="text-center pb-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] w-12">Qty</th>
                    <th className="text-right pb-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] w-32">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-50">
                    <td className="py-5">
                      <p className="text-sm font-bold text-gray-900 mb-0.5">{projectTitle}</p>
                      <p className="text-xs text-gray-400">{serviceLabel}</p>
                      {order?.features?.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          Includes: {order.features.slice(0, 4).join(', ')}
                          {order.features.length > 4 ? ` +${order.features.length - 4} more` : ''}
                        </p>
                      )}
                    </td>
                    <td className="py-5 text-center text-sm text-gray-500">1</td>
                    <td className="py-5 text-right text-sm font-bold text-gray-900">{formatCurrency(payment.amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(payment.amount)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tax</span>
                  <span>—</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between text-base font-black text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(payment.amount)}</span>
                </div>
                {isPaid && (
                  <div className="flex justify-between text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl print:bg-emerald-50">
                    <span>Amount Paid</span>
                    <span>{formatCurrency(payment.amount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* PAID watermark for paid invoices */}
            {isPaid && (
              <div className="flex justify-center mb-6 print:block">
                <div className="border-4 border-emerald-200 text-emerald-400 font-black text-3xl tracking-[0.3em] px-8 py-2 rounded-2xl rotate-[-2deg] opacity-60 select-none">
                  PAID
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-100 pt-6 flex items-end justify-between">
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                Thank you for your business. All source code is delivered upon project completion.
                Questions? Contact us at contact@mbndev.ma
              </p>
              <div className="text-right shrink-0 ml-4">
                <p className="text-xs font-bold text-gray-300">MBN DEV</p>
                <p className="text-[10px] text-gray-400">mbndev.ma</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page { margin: 0; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}

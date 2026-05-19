'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { paymentAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Printer, ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Logo3D from '@/components/ui/Logo3D';

function InvoiceStatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-green-50 text-green-700 border border-green-200 print:bg-green-50">
        <CheckCircle2 className="w-3 h-3" /> {t('invoice.status.paid')}
      </span>
    );
  }
  if (status === 'pending_verification') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3" /> {t('invoice.status.pendingVerif')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-gray-100 text-gray-600 border border-gray-200">
      <AlertCircle className="w-3 h-3" /> {status.toUpperCase()}
    </span>
  );
}

export default function InvoicePage() {
  const { id }    = useParams<{ id: string }>();
  const { user }  = useAuth();
  const { t }     = useLanguage();
  const router    = useRouter();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    paymentAPI.getOne(id)
      .then(({ data }) => setPayment(data.payment))
      .catch((err) => setError(err?.response?.data?.message || t('invoice.loadError')))
      .finally(() => setLoading(false));
  }, [id]);

  if (!user) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">{error || t('invoice.notFound')}</p>
          <button onClick={() => router.back()} className="mt-4 text-sm text-violet-600 hover:underline">
            {t('invoice.goBack')}
          </button>
        </div>
      </div>
    );
  }

  const client  = typeof payment.client  === 'object' ? payment.client  : null;
  const order   = typeof payment.order   === 'object' ? payment.order   : null;
  const project = typeof payment.project === 'object' ? payment.project : null;

  const invoiceNum  = `INV-${new Date(payment.createdAt).getFullYear()}-${(payment._id || payment.id || '').slice(-6).toUpperCase()}`;
  const issueDate   = formatDate(payment.createdAt);
  const paidDate    = payment.paidAt ? formatDate(payment.paidAt) : null;
  const serviceType = order?.serviceType || project?.type || 'custom';

  const SERVICE_KEY_MAP: Record<string, string> = {
    website:        'invoice.service.website',
    ecommerce:      'invoice.service.ecommerce',
    dashboard:      'invoice.service.dashboard',
    mobile:         'invoice.service.mobile',
    'landing-page': 'invoice.service.landingPage',
    'web-app':      'invoice.service.webApp',
    saas:           'invoice.service.saas',
    portfolio:      'invoice.service.portfolio',
    custom:         'invoice.service.custom',
  };

  const METHOD_KEY_MAP: Record<string, string> = {
    cih_bank:   'invoice.method.cih',
    paypal:     'invoice.method.paypal',
    taptapsend: 'invoice.method.taptap',
    mock:       'invoice.method.mock',
  };

  const serviceLabel = t(SERVICE_KEY_MAP[serviceType] || 'invoice.service.default');
  const projectTitle = order?.title || project?.title || t('invoice.service.default');
  const methodLabel  = payment.method
    ? t(METHOD_KEY_MAP[payment.method] || 'invoice.method.manual')
    : t('invoice.method.manual');

  const featuresText = order?.features?.length > 0
    ? `${t('invoice.includes')}: ${order.features.slice(0, 4).join(', ')}${
        order.features.length > 4 ? ` +${order.features.length - 4} ${t('invoice.more').replace('{n}', '')}` : ''
      }`
    : null;

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">

      {/* ── Toolbar (hidden in print) ───────────────────────────────────────── */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-[860px] mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('invoice.back')}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 font-mono">{invoiceNum}</span>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Printer className="w-4 h-4" />
              {t('invoice.printSave')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Invoice card ────────────────────────────────────────────────────── */}
      <div className="max-w-[860px] mx-auto px-4 py-10 print:py-0 print:px-0">
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 overflow-hidden print:shadow-none print:rounded-none">

          {/* Purple gradient top bar */}
          <div className="h-2 bg-gradient-to-r from-violet-700 via-violet-500 to-blue-500 print:block" />

          <div className="p-10 print:p-10">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between mb-10">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <Logo3D size="md" />
                  <span className="text-xl font-black text-gray-900 tracking-tight">MBN DEV</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {t('invoice.brand.tagline')}<br />
                  {t('invoice.brand.location')}<br />
                  hello@mbndev.com
                </p>
              </div>

              {/* Invoice title & number */}
              <div className="text-right">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">{t('invoice.title').toUpperCase()}</h1>
                <p className="text-xs font-mono text-gray-400 mb-3">{invoiceNum}</p>
                <InvoiceStatusBadge status={payment.status} t={t} />
              </div>
            </div>

            {/* ── Bill From / To ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t('invoice.from')}</p>
                <p className="text-sm font-bold text-gray-900">MBN DEV</p>
                <p className="text-xs text-gray-500 mt-0.5">hello@mbndev.com</p>
                <p className="text-xs text-gray-500">Morocco</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t('invoice.billTo')}</p>
                <p className="text-sm font-bold text-gray-900">{client?.name || 'Client'}</p>
                {client?.company && <p className="text-xs text-gray-500 mt-0.5">{client.company}</p>}
                <p className="text-xs text-gray-500">{client?.email || ''}</p>
              </div>
            </div>

            {/* ── Dates row ───────────────────────────────────────────────── */}
            <div className="flex gap-8 mb-10 p-4 bg-slate-50 rounded-2xl print:bg-gray-50">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('invoice.issueDate')}</p>
                <p className="text-sm font-semibold text-gray-700">{issueDate}</p>
              </div>
              {paidDate && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('invoice.paymentDate')}</p>
                  <p className="text-sm font-semibold text-green-600">{paidDate}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('invoice.paymentMethod')}</p>
                <p className="text-sm font-semibold text-gray-700">{methodLabel}</p>
              </div>
              {payment.externalRef && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('invoice.reference')}</p>
                  <p className="text-sm font-mono text-gray-600">{payment.externalRef}</p>
                </div>
              )}
            </div>

            {/* ── Line items ──────────────────────────────────────────────── */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('invoice.description')}</th>
                    <th className="text-center py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-16">{t('invoice.qty')}</th>
                    <th className="text-right py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-28">{t('invoice.amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-50">
                    <td className="py-4">
                      <p className="text-sm font-semibold text-gray-900">{projectTitle}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{serviceLabel}</p>
                      {featuresText && (
                        <p className="text-xs text-gray-400 mt-1">{featuresText}</p>
                      )}
                    </td>
                    <td className="py-4 text-center text-sm text-gray-600">1</td>
                    <td className="py-4 text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── Totals ──────────────────────────────────────────────────── */}
            <div className="flex justify-end mb-10">
              <div className="w-56 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{t('invoice.subtotal')}</span>
                  <span>{formatCurrency(payment.amount)}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>{t('invoice.total')}</span>
                  <span>{formatCurrency(payment.amount)}</span>
                </div>
                {payment.status === 'paid' && (
                  <div className="flex justify-between text-sm text-green-600 font-semibold">
                    <span>{t('invoice.amountPaid')}</span>
                    <span>{formatCurrency(payment.amount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Footer note ─────────────────────────────────────────────── */}
            <div className="border-t border-gray-100 pt-6 flex items-center justify-between">
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                {t('invoice.footerNote')}
              </p>
              <div className="text-right">
                <p className="text-xs text-gray-400">mbndev.com</p>
                <p className="text-xs text-gray-400">hello@mbndev.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only styles */}
      <style jsx global>{`
        @media print {
          @page { margin: 0; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}

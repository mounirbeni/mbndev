'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Zap, CreditCard, Shield, Clock, Check,
  Loader2, AlertCircle, Copy, ExternalLink, CheckCircle2,
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { orderAPI, paymentAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/ui/Button';

// ── Payment method config ────────────────────────────────────────────────────

const CIH_BANK = {
  holder: process.env.NEXT_PUBLIC_CIH_HOLDER || 'MOUNIR BANNI',
  rib:    process.env.NEXT_PUBLIC_CIH_RIB    || '230 450 3396820211017700 73',
  iban:   process.env.NEXT_PUBLIC_CIH_IBAN   || 'MA64 2304 5033 9682 0211 0177 0073',
  swift:  process.env.NEXT_PUBLIC_CIH_SWIFT  || 'CIHMMAMC',
  bank:   'CIH Bank',
};

const PAYPAL_EMAIL = process.env.NEXT_PUBLIC_PAYPAL_ME || 'mounirbani46@gmail.com';
const TAPTAP_PHONE = process.env.NEXT_PUBLIC_TAPTAP_PHONE || '+212705914424';

const SERVICE_LABELS: Record<string, string> = {
  website: 'Website', ecommerce: 'E-Commerce Store',
  dashboard: 'SaaS Dashboard', mobile: 'Mobile App', custom: 'Custom Project',
};

type PayMethod = 'cih_bank' | 'paypal' | 'taptapsend';

const METHODS: { id: PayMethod; label: string; desc: string; logo: string }[] = [
  { id: 'cih_bank',   label: 'CIH Bank Transfer', desc: 'Direct bank transfer (Morocco)', logo: '/images/cih.jpe'    },
  { id: 'paypal',     label: 'PayPal',             desc: 'Pay with your PayPal account',  logo: '/images/paypal.jpe' },
  { id: 'taptapsend', label: 'TapTapSend',         desc: 'Send via TapTapSend app',       logo: '/images/taptap.jpeg'},
];

// ─────────────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { t }             = useLanguage();
  const { orderId }       = useParams<{ orderId: string }>();
  const router            = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [order,   setOrder]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying,  setPaying]  = useState(false);
  const [error,   setError]   = useState('');
  const [method,  setMethod]  = useState<PayMethod>('cih_bank');
  const [externalRef, setExternalRef] = useState('');
  const [copied,  setCopied]  = useState('');
  const [done,    setDone]    = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push(`/login?next=/checkout/${orderId}`); return; }
    orderAPI.getOne(orderId)
      .then(({ data }) => setOrder(data.order))
      .catch((err) => setError(err?.response?.data?.message || t('checkout.orderNotFound')))
      .finally(() => setLoading(false));
  }, [orderId, user, authLoading, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const handleSubmit = async () => {
    setPaying(true);
    try {
      await paymentAPI.submitManual({
        orderId,
        method,
        externalRef: externalRef.trim() || undefined,
      });
      setDone(true);
      if (typeof window !== 'undefined') localStorage.removeItem('mbndev_request_draft');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('share.paymentFail'));
    } finally {
      setPaying(false);
    }
  };

  // ── Loading / error states ──────────────────────────────────────────────────
  if (loading || authLoading) return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen bg-hero-gradient flex flex-col items-center justify-center gap-4 p-6 text-center">
      <AlertCircle className="w-12 h-12 text-red-400" />
      <h1 className="text-xl font-bold text-white">{error || t('checkout.orderNotFound')}</h1>
      <Link href="/dashboard/client/orders"><Button variant="outline">{t('checkout.viewMyOrders')}</Button></Link>
    </div>
  );

  if (order.status === 'paid') return (
    <div className="min-h-screen bg-hero-gradient flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
        <Check className="w-8 h-8 text-green-400" />
      </div>
      <h1 className="text-xl font-bold text-white">{t('checkout.alreadyPaid')}</h1>
      {order.project && (
        <Link href={`/dashboard/client/projects/${order.project.id}`}><Button>{t('checkout.viewProject')} →</Button></Link>
      )}
    </div>
  );

  if (done) return (
    <div className="min-h-screen bg-hero-gradient flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">{t('checkout.done.title')}</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-2">
          {t('checkout.done.sub1')}
        </p>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          {t('checkout.done.sub2')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard/client/orders">
            <Button size="md">{t('checkout.done.viewOrders')}</Button>
          </Link>
          <a href="https://wa.me/212705914424" target="_blank" rel="noopener noreferrer">
            <Button size="md" variant="outline">{t('checkout.done.whatsApp')}</Button>
          </a>
        </div>
      </motion.div>
    </div>
  );

  const reference = `MBN-${orderId.slice(-8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col">
      <header className="glass border-b border-white/5 px-4 sm:px-6 py-4 flex items-center gap-4 shrink-0">
        <Link href="/request" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold">{t('checkout.title')}</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
          <Shield className="w-3.5 h-3.5 text-green-400" />
          {t('checkout.verified')}
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center p-4 sm:p-6 py-6 sm:py-10">
        <div className="w-full max-w-xl space-y-5">

          {/* Order summary */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 sm:p-6 border border-white/10">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">{order.title}</h1>
                <p className="text-slate-500 text-sm">{SERVICE_LABELS[order.serviceType] || order.serviceType}</p>
              </div>
            </div>

            <div className="space-y-1.5 mb-4 text-sm">
              {order.features?.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('checkout.features')} ({order.features.length})</span>
                  <span className="text-slate-300">{t('checkout.included')}</span>
                </div>
              )}
              {order.addons?.includes('fastDelivery') && (
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><Zap className="w-3 h-3 text-amber-400" /> {t('checkout.fastDelivery')}</span>
                  <span className="text-amber-400">{t('checkout.included')}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-base">
                <span className="text-white">{t('checkout.totalDue')}</span>
                <span className="text-primary-400 text-xl">${order.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 pt-3 border-t border-white/5">
              <Clock className="w-3.5 h-3.5 text-primary-400" />
              {t('checkout.estDelivery')}: <span className="text-slate-300">{order.deliveryDays} {t('checkout.businessDays')}</span>
            </div>
          </motion.div>

          {/* Payment methods */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass rounded-2xl p-5 sm:p-6 border border-white/10">
            <h2 className="text-white font-semibold text-sm mb-4">{t('checkout.payMethod')}</h2>

            <div className="space-y-2 mb-5">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    method === m.id
                      ? 'bg-white/8 border-white/25'
                      : 'bg-white/4 border-white/8 hover:border-white/15'
                  }`}
                >
                  <div className="w-12 h-9 rounded-lg shrink-0 overflow-hidden">
                    <Image src={m.logo} alt={m.label} width={48} height={36} className="w-full h-full object-cover" unoptimized />
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-semibold ${method === m.id ? 'text-white' : 'text-slate-400'}`}>{m.label}</div>
                    <div className="text-slate-500 text-xs">{m.desc}</div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    method === m.id ? 'border-primary-500 bg-primary-500' : 'border-white/20'
                  }`}>
                    {method === m.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Payment instructions panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={method}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="rounded-xl p-4 mb-5 space-y-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {method === 'cih_bank' && (
                  <>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-3">CIH Bank Transfer Details</p>
                    <div className="space-y-2.5">
                      {[
                        { label: 'Bank',       value: CIH_BANK.bank,   canCopy: false },
                        { label: 'Titulaire',  value: CIH_BANK.holder, canCopy: true  },
                        { label: 'RIB',        value: CIH_BANK.rib,    canCopy: true  },
                        { label: 'IBAN',       value: CIH_BANK.iban,   canCopy: true  },
                        { label: 'SWIFT',      value: CIH_BANK.swift,  canCopy: true  },
                        { label: 'Amount',     value: `$${order.totalPrice.toLocaleString()}`, canCopy: true },
                        { label: 'Reference',  value: reference, canCopy: true },
                      ].map(({ label, value, canCopy }) => (
                        <div key={label} className="flex items-center justify-between gap-2">
                          <span className="text-slate-500 text-xs w-20 shrink-0">{label}</span>
                          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                            <span className="text-white text-xs font-mono truncate">{value}</span>
                            {canCopy && (
                              <button
                                onClick={() => copy(value, label)}
                                className="text-slate-500 hover:text-primary-400 transition-colors shrink-0"
                                aria-label={`Copy ${label}`}
                              >
                                {copied === label
                                  ? <Check className="w-3.5 h-3.5 text-green-400" />
                                  : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {method === 'paypal' && (
                  <>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-3">PayPal Instructions</p>
                    <p className="text-sm text-slate-300 mb-3">
                      Send <span className="text-white font-bold">${order.totalPrice.toLocaleString()} USD</span> to:
                    </p>
                    <div className="space-y-2.5 mb-3">
                      {[
                        { label: 'PayPal Email', value: PAYPAL_EMAIL,  canCopy: true },
                        { label: 'Amount',       value: `$${order.totalPrice.toLocaleString()} USD`, canCopy: true },
                        { label: 'Reference',    value: reference,    canCopy: true },
                      ].map(({ label, value, canCopy }) => (
                        <div key={label} className="flex items-center justify-between gap-2">
                          <span className="text-slate-500 text-xs w-24 shrink-0">{label}</span>
                          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                            <span className="text-white text-xs font-mono truncate">{value}</span>
                            {canCopy && (
                              <button onClick={() => copy(value, label)} className="text-slate-500 hover:text-primary-400 transition-colors shrink-0" aria-label={`Copy ${label}`}>
                                {copied === label ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <a
                      href="https://www.paypal.com/send"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                      style={{ background: '#003087', color: '#fff' }}
                    >
                      Open PayPal
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </>
                )}

                {method === 'taptapsend' && (
                  <>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-3">TapTapSend Instructions</p>
                    <div className="space-y-2">
                      {[
                        { label: 'Send to',   value: TAPTAP_PHONE, canCopy: true },
                        { label: 'Amount',    value: `$${order.totalPrice.toLocaleString()}`, canCopy: true },
                        { label: 'Reference', value: reference,    canCopy: true },
                      ].map(({ label, value, canCopy }) => (
                        <div key={label} className="flex items-center justify-between gap-2">
                          <span className="text-slate-500 text-xs w-20 shrink-0">{label}</span>
                          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                            <span className="text-white text-sm font-mono truncate">{value}</span>
                            {canCopy && (
                              <button onClick={() => copy(value, label)} className="text-slate-500 hover:text-primary-400 transition-colors shrink-0" aria-label={`Copy ${label}`}>
                                {copied === label ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Optional reference / proof field */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {t('checkout.txRef')} <span className="text-slate-600">{t('checkout.txRefHint')}</span>
              </label>
              <input
                type="text"
                value={externalRef}
                onChange={(e) => setExternalRef(e.target.value)}
                placeholder={method === 'paypal' ? 'PayPal transaction ID' : method === 'cih_bank' ? 'Bank reference / receipt #' : 'Transfer reference'}
                maxLength={200}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/60"
              />
            </div>

            <Button className="w-full" size="lg" onClick={handleSubmit} loading={paying}>
              <Check className="w-4 h-4" />
              {method === 'cih_bank'   && t('checkout.bankDone')}
              {method === 'paypal'     && t('checkout.paypalDone')}
              {method === 'taptapsend' && t('checkout.taptapDone')}
            </Button>

            <p className="text-xs text-slate-600 text-center mt-3">
              {t('checkout.terms')}{' '}
              <Link href="/terms" className="text-primary-500 hover:text-primary-400">{t('checkout.termsLink')}</Link>.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

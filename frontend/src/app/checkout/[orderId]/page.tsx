'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Zap, CreditCard, Shield, Clock, Check,
  Loader2, AlertCircle, Copy, ExternalLink, CheckCircle2, BookmarkCheck,
  Pencil, X, AlertTriangle,
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { orderAPI, paymentAPI } from '@/lib/api';
import type { ChangeEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getProjectTypeLabel } from '@/lib/utils';
import Logo3D from '@/components/ui/Logo3D';
import Button from '@/components/ui/Button';

// ── Payment method config ────────────────────────────────────────────────────

const CIH_BANK = {
  holder: process.env.NEXT_PUBLIC_CIH_HOLDER || 'MOUNIR BANNI',
  rib:    process.env.NEXT_PUBLIC_CIH_RIB    || '230 450 3396820211017700 73',
  iban:   process.env.NEXT_PUBLIC_CIH_IBAN   || 'MA64 2304 5033 9682 0211 0177 0073',
  swift:  process.env.NEXT_PUBLIC_CIH_SWIFT  || 'CIHMMAMC',
  bank:   'CIH Bank',
};

const PAYPAL_EMAIL = process.env.NEXT_PUBLIC_PAYPAL_ME || 'mobanunir@gmail.com';
const TAPTAP_PHONE = process.env.NEXT_PUBLIC_TAPTAP_PHONE || '+212705914424';

type PayMethod = 'cih_bank' | 'paypal' | 'taptapsend';

// ─────────────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { t }             = useLanguage();
  const { orderId }       = useParams<{ orderId: string }>();

  const METHODS: { id: PayMethod; label: string; desc: string; logo: string }[] = [
    { id: 'cih_bank',   label: t('checkout.method.cih'),    desc: t('checkout.method.cihDesc'),    logo: '/images/cih.jpe'    },
    { id: 'paypal',     label: t('checkout.method.paypal'), desc: t('checkout.method.paypalDesc'), logo: '/images/paypal.jpe' },
    { id: 'taptapsend', label: t('checkout.method.taptap'), desc: t('checkout.method.taptapDesc'), logo: '/images/taptap.jpeg'},
  ];
  const router            = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [order,        setOrder]      = useState<any>(null);
  const [loading,      setLoading]    = useState(true);
  const [paying,       setPaying]     = useState(false);
  const [error,        setError]      = useState('');
  const [method,       setMethod]     = useState<PayMethod>('cih_bank');
  const [externalRef,  setExternalRef] = useState('');
  const [copied,       setCopied]     = useState('');
  const [done,         setDone]       = useState(false);
  const [savedLater,   setSavedLater] = useState(false);

  // Idempotency key — generated once per page load, prevents double-submit
  // (survives re-renders but resets on full page navigation)
  const [idempotencyKey] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    const storageKey = `idem_${orderId}`;
    const stored = sessionStorage.getItem(storageKey);
    if (stored) return stored;
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(storageKey, key);
    return key;
  });

  // Edit order state
  const [editing,     setEditing]    = useState(false);
  const [editFields,  setEditFields] = useState({ description: '', notes: '' });
  const [savingEdit,  setSavingEdit] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push(`/login?next=/checkout/${orderId}`); return; }
    orderAPI.getOne(orderId)
      .then(({ data }) => {
        setOrder(data.order);
        setEditFields({ description: data.order.description || '', notes: data.order.notes || '' });
      })
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
    if (paying) return; // hard guard against double-click
    setPaying(true);
    try {
      const res = await paymentAPI.submitManual({
        orderId,
        method,
        externalRef:    externalRef.trim() || undefined,
        idempotencyKey: idempotencyKey || undefined,
      });
      // Clear the idempotency key from sessionStorage on success so a
      // genuine retry (after rejection) gets a fresh key
      if (!res.data?.idempotent && typeof window !== 'undefined') {
        sessionStorage.removeItem(`idem_${orderId}`);
        localStorage.removeItem('mbndev_request_draft');
      }
      setDone(true);
    } catch (err: any) {
      const code = err?.response?.data?.code;
      const msg  = err?.response?.data?.message;
      if (code === 'DUPLICATE_SUBMISSION') {
        // Payment already exists — treat as success so client sees the pending state
        toast('Your payment is already under review.');
        setDone(true);
      } else if (code === 'SERIALIZATION_FAILURE') {
        toast.error('Concurrent submission — please wait a moment and try again.');
      } else {
        toast.error(msg || t('share.paymentFail'));
      }
    } finally {
      setPaying(false);
    }
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const { data } = await orderAPI.update(orderId, editFields);
      setOrder(data.order);
      setEditing(false);
      toast.success('Order updated!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('toast.error'));
    } finally {
      setSavingEdit(false);
    }
  };

  // Derive payment states
  const pendingPayment  = order?.payments?.find((p: any) => p.status === 'pending_verification');
  const rejectedPayment = order?.payments?.find((p: any) => p.status === 'failed' &&
    order?.payments?.every((q: any) => q.status !== 'pending_verification'));

  // Expiry countdown for pending payment (expiresAt from backend)
  const [expiryLabel, setExpiryLabel] = useState('');
  useEffect(() => {
    if (!pendingPayment?.expiresAt) return;
    const tick = () => {
      const ms   = new Date(pendingPayment.expiresAt).getTime() - Date.now();
      if (ms <= 0) { setExpiryLabel('expired'); return; }
      const h    = Math.floor(ms / 3_600_000);
      const m    = Math.floor((ms % 3_600_000) / 60_000);
      setExpiryLabel(`${h}h ${m}m remaining`);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [pendingPayment]);

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
        <p className="text-slate-400 text-sm leading-relaxed mb-2">{t('checkout.done.sub1')}</p>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">{t('checkout.done.sub2')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard/client/orders"><Button size="md">{t('checkout.done.viewOrders')}</Button></Link>
          <a href="https://wa.me/212705914424" target="_blank" rel="noopener noreferrer">
            <Button size="md" variant="outline">{t('checkout.done.whatsApp')}</Button>
          </a>
        </div>
      </motion.div>
    </div>
  );

  if (savedLater) return (
    <div className="min-h-screen bg-hero-gradient flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)' }}>
          <BookmarkCheck className="w-10 h-10 text-violet-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Order Saved!</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-2">
          Your order <span className="text-white font-semibold">#{orderId.slice(-8).toUpperCase()}</span> has been saved.
        </p>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          You can complete payment anytime from your dashboard under <span className="text-slate-300">My Orders</span>. We'll keep it ready for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard/client/orders"><Button size="md">View My Orders</Button></Link>
          <a href="https://wa.me/212705914424" target="_blank" rel="noopener noreferrer">
            <Button size="md" variant="outline">Contact on WhatsApp</Button>
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
          <Logo3D size="sm" />
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
                <p className="text-slate-500 text-sm">{getProjectTypeLabel(order.serviceType, t)}</p>
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

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-primary-400" />
                {t('checkout.estDelivery')}: <span className="text-slate-300">{order.deliveryDays} {t('checkout.businessDays')}</span>
              </div>
              {!pendingPayment && (
                <button
                  onClick={() => setEditing((v) => !v)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/6 border border-transparent hover:border-white/10"
                >
                  <Pencil className="w-3 h-3" />
                  Edit Order
                </button>
              )}
            </div>

            {/* Inline edit form */}
            <AnimatePresence>
              {editing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-white/8 space-y-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Modify Your Order</p>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Description / Requirements</label>
                      <textarea
                        rows={3}
                        value={editFields.description}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditFields((f) => ({ ...f, description: e.target.value }))}
                        placeholder="Describe what you need..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/60 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Additional Notes</label>
                      <textarea
                        rows={2}
                        value={editFields.notes}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditFields((f) => ({ ...f, notes: e.target.value }))}
                        placeholder="Any special requests or notes..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/60 resize-none"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setEditing(false); setEditFields({ description: order.description || '', notes: order.notes || '' }); }}
                        className="flex items-center gap-1.5 text-xs text-slate-400 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-all"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={savingEdit}
                        className="flex items-center gap-1.5 text-xs text-white px-3 py-2 rounded-lg transition-all disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}
                      >
                        {savingEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        Save Changes
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Rejected payment — client can resubmit ───────────────────── */}
          {rejectedPayment && !pendingPayment && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
              className="glass rounded-2xl p-5 border border-red-500/25"
              style={{ background: 'rgba(239,68,68,0.05)' }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Previous Payment Not Confirmed</p>
                  {rejectedPayment.rejectionReason
                    ? <p className="text-slate-400 text-xs leading-relaxed mb-2">
                        <span className="text-slate-300 font-medium">Reason: </span>{rejectedPayment.rejectionReason}
                      </p>
                    : <p className="text-slate-500 text-xs mb-2">Please check your payment details and resubmit below.</p>
                  }
                  <p className="text-slate-600 text-xs">Submit a new payment using the form below.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Pending payment waiting state ─────────────────────────────── */}
          {pendingPayment && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="glass rounded-2xl p-5 sm:p-6 border border-amber-500/25"
              style={{ background: 'rgba(245,158,11,0.05)' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-white font-bold text-base mb-1">Payment Submitted — Awaiting Confirmation</h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3">
                    Your payment has been submitted via <span className="text-white font-semibold capitalize">{(pendingPayment.method || '').replace('_', ' ')}</span>. We're verifying it now — this usually takes a few hours.
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-xs text-amber-400/80">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                      </span>
                      Waiting for admin to confirm receipt
                    </div>
                    {expiryLabel && expiryLabel !== 'expired' && (
                      <span className="text-xs text-slate-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {expiryLabel}
                      </span>
                    )}
                    {expiryLabel === 'expired' && (
                      <span className="text-xs text-red-400 font-medium">⏱ Expired — please resubmit</span>
                    )}
                  </div>
                  {pendingPayment.externalRef && (
                    <p className="text-slate-500 text-xs mt-2">Reference: <span className="text-slate-300 font-mono">{pendingPayment.externalRef}</span></p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Payment methods — only show when no pending payment */}
          {!pendingPayment && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass rounded-2xl p-5 sm:p-6 border border-white/10">
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
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-3">{t('checkout.cih.heading')}</p>
                    <div className="space-y-2.5">
                      {[
                        { label: t('checkout.cih.bank'),      value: CIH_BANK.bank,   canCopy: false },
                        { label: t('checkout.cih.holder'),    value: CIH_BANK.holder, canCopy: true  },
                        { label: t('checkout.cih.rib'),       value: CIH_BANK.rib,    canCopy: true  },
                        { label: t('checkout.cih.iban'),      value: CIH_BANK.iban,   canCopy: true  },
                        { label: t('checkout.cih.swift'),     value: CIH_BANK.swift,  canCopy: true  },
                        { label: t('checkout.cih.amount'),    value: `$${order.totalPrice.toLocaleString()}`, canCopy: true },
                        { label: t('checkout.cih.reference'), value: reference, canCopy: true },
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
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-3">{t('checkout.paypal.heading')}</p>
                    <p className="text-sm text-slate-300 mb-3">
                      {t('checkout.paypal.sendTo')} <span className="text-white font-bold">${order.totalPrice.toLocaleString()} USD</span> {t('checkout.paypal.to')}
                    </p>
                    <div className="space-y-2.5 mb-3">
                      {[
                        { label: t('checkout.paypal.email'),    value: PAYPAL_EMAIL,  canCopy: true },
                        { label: t('checkout.cih.amount'),      value: `$${order.totalPrice.toLocaleString()} USD`, canCopy: true },
                        { label: t('checkout.cih.reference'),   value: reference,    canCopy: true },
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
                      {t('checkout.paypal.openBtn')}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </>
                )}

                {method === 'taptapsend' && (
                  <>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-3">{t('checkout.taptap.heading')}</p>
                    <div className="space-y-2">
                      {[
                        { label: t('checkout.taptap.sendTo'),  value: TAPTAP_PHONE, canCopy: true },
                        { label: t('checkout.cih.amount'),     value: `$${order.totalPrice.toLocaleString()}`, canCopy: true },
                        { label: t('checkout.cih.reference'),  value: reference,    canCopy: true },
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
                placeholder={method === 'paypal' ? t('checkout.ph.paypal') : method === 'cih_bank' ? t('checkout.ph.bank') : t('checkout.ph.taptap')}
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

            {/* Pay Later */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-slate-600 text-xs font-medium">or</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            <button
              onClick={() => { if (typeof window !== 'undefined') localStorage.removeItem('mbndev_request_draft'); setSavedLater(true); }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all border"
              style={{ background: 'rgba(124,58,237,0.08)', borderColor: 'rgba(124,58,237,0.25)', color: '#a78bfa' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.15)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.08)'; }}
            >
              <BookmarkCheck className="w-4 h-4" />
              Save Order &amp; Pay Later
            </button>

            <p className="text-xs text-slate-600 text-center mt-3">
              {t('checkout.terms')}{' '}
              <Link href="/terms" className="text-primary-500 hover:text-primary-400">{t('checkout.termsLink')}</Link>.
            </p>
          </motion.div>}

        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Zap, CreditCard, Shield, Clock, Check,
  Loader2, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI, paymentAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';

const SERVICE_LABELS: Record<string, string> = {
  website: 'Website', ecommerce: 'E-Commerce Store',
  dashboard: 'SaaS Dashboard', mobile: 'Mobile App', custom: 'Custom Project',
};

const FEATURE_LABELS: Record<string, string> = {
  auth: 'User Authentication', payment: 'Payment Integration',
  dashboard: 'Admin Dashboard', multilang: 'Multi-language',
  seo: 'SEO Optimization', api: 'API Integration', hosting: 'Hosting Setup',
};

export default function CheckoutPage() {
  const { orderId }       = useParams<{ orderId: string }>();
  const router            = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [order,   setOrder]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying,  setPaying]  = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    orderAPI.getOne(orderId)
      .then(({ data }) => setOrder(data.order))
      .catch((err) => {
        setError(err?.response?.data?.message || 'Order not found');
      })
      .finally(() => setLoading(false));
  }, [orderId, user, authLoading, router]);

  const handleStripeCheckout = async () => {
    setPaying(true);
    try {
      const { data } = await paymentAPI.orderCheckout({ orderId });
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to start checkout');
      setPaying(false);
    }
  };

  const handleMockPayment = async () => {
    setPaying(true);
    try {
      const { data } = await paymentAPI.mock({ orderId });
      toast.success('Payment confirmed! Project created.');
      router.push(`/checkout/success?order_id=${orderId}&project_id=${data.project?.id || ''}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Mock payment failed');
      setPaying(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-hero-gradient flex flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <h1 className="text-xl font-bold text-white">{error || 'Order not found'}</h1>
        <Link href="/dashboard/client/orders">
          <Button variant="outline">View My Orders</Button>
        </Link>
      </div>
    );
  }

  if (order.status === 'paid') {
    return (
      <div className="min-h-screen bg-hero-gradient flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="w-8 h-8 text-green-400" />
        </div>
        <h1 className="text-xl font-bold text-white">This order is already paid</h1>
        {order.project && (
          <Link href={`/dashboard/client/projects/${order.project.id}`}>
            <Button>View Project →</Button>
          </Link>
        )}
      </div>
    );
  }

  const isStripeEnabled = !!process.env.NEXT_PUBLIC_STRIPE_KEY;

  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/5 px-4 sm:px-6 py-4 flex items-center gap-4 shrink-0">
        <Link href="/request" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold">Checkout</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
          <Shield className="w-3.5 h-3.5 text-green-400" />
          Secure checkout
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center p-4 sm:p-6 py-6 sm:py-10">
        <div className="w-full max-w-lg">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Order details card */}
            <div className="glass rounded-2xl p-5 sm:p-7 border border-white/10 mb-5">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg leading-tight">{order.title}</h1>
                  <p className="text-slate-500 text-sm">{SERVICE_LABELS[order.serviceType] || order.serviceType}</p>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Service base price</span>
                  <span className="text-slate-200">included</span>
                </div>
                {order.pages > 5 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Extra pages ({order.pages - 5})</span>
                    <span className="text-slate-200">included</span>
                  </div>
                )}
                {order.features?.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Features ({order.features.length})</span>
                    <span className="text-slate-200">included</span>
                  </div>
                )}
                {order.addons?.includes('fastDelivery') && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">⚡ Fast Delivery</span>
                    <span className="text-amber-400">included</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-lg">
                  <span className="text-white">Total Due</span>
                  <span className="text-primary-400">${order.totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery info */}
              <div className="flex items-center gap-2 text-sm text-slate-500 py-3 border-t border-white/5">
                <Clock className="w-4 h-4 text-primary-400" />
                Estimated delivery: <span className="text-slate-300">{order.deliveryDays} business days</span>
              </div>

              {/* Features list */}
              {order.features?.length > 0 && (
                <div className="pt-3 border-t border-white/5">
                  <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Included Features</p>
                  <div className="flex flex-wrap gap-1.5">
                    {order.features.map((f: string) => (
                      <span key={f} className="text-xs px-2 py-0.5 rounded-lg bg-primary-500/10 text-primary-300 border border-primary-500/20">
                        {FEATURE_LABELS[f] || f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Payment buttons */}
            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={handleStripeCheckout}
                loading={paying}
                disabled={!isStripeEnabled}
              >
                <CreditCard className="w-4 h-4" />
                {isStripeEnabled ? 'Pay with Stripe' : 'Stripe not configured'}
              </Button>

              {/* Demo mode mock payment */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/8" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-transparent px-3 text-xs text-slate-600">DEMO</span>
                </div>
              </div>

              <button
                onClick={handleMockPayment}
                disabled={paying}
                className="w-full py-3.5 rounded-xl text-sm font-semibold border transition-all
                           text-slate-300 hover:text-white hover:border-white/30 active:scale-[0.98]
                           disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)' }}
              >
                {paying ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Simulate Payment (Demo)'
                )}
              </button>

              <p className="text-xs text-slate-600 text-center">
                By paying you agree to our{' '}
                <Link href="/terms" className="text-primary-500 hover:text-primary-400">terms of service</Link>.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

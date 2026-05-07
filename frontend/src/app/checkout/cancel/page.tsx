'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

function CancelContent() {
  const params  = useSearchParams();
  const orderId = params.get('order_id');

  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col items-center justify-center p-6">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px]
                      bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
             style={{ background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.25)' }}>
          <XCircle className="w-10 h-10 text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Payment Cancelled</h1>
        <p className="text-slate-400 mb-8">
          Your payment was cancelled. Your order is still saved — you can try again whenever you&apos;re ready.
        </p>

        <div className="space-y-3">
          {orderId && (
            <Link href={`/checkout/${orderId}`}>
              <Button className="w-full" size="lg">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </Link>
          )}
          <Link href="/dashboard/client/orders">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4" />
              View My Orders
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-300 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CancelContent />
    </Suspense>
  );
}

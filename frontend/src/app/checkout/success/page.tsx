'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, FolderOpen, LayoutDashboard } from 'lucide-react';
import Button from '@/components/ui/Button';

function SuccessContent() {
  const params  = useSearchParams();
  const orderId = params.get('order_id');

  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col items-center justify-center p-6">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px]
                      bg-green-500/8 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.3)' }}
        >
          <CheckCircle2 className="w-12 h-12 text-green-400" />
        </motion.div>

        <h1 className="text-3xl font-bold text-white mb-3">Payment received</h1>
        <p className="text-slate-400 mb-2">
          Your payment has been recorded and is awaiting verification.
        </p>
        <p className="text-slate-500 text-sm mb-8">
          We typically verify payments within a few hours. The moment it&apos;s confirmed, your project becomes active and you&apos;ll get a notification.
        </p>

        <div className="space-y-3">
          <Link href="/dashboard/client/orders">
            <Button className="w-full" size="lg">
              <FolderOpen className="w-4 h-4" />
              View my orders
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/dashboard/client">
            <Button variant="outline" className="w-full" size="lg">
              <LayoutDashboard className="w-4 h-4" />
              Go to dashboard
            </Button>
          </Link>
        </div>

        {orderId && (
          <p className="text-slate-600 text-xs mt-6">Order: {orderId}</p>
        )}
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

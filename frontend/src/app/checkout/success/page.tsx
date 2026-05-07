'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, FolderOpen, LayoutDashboard, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { orderAPI } from '@/lib/api';

function SuccessContent() {
  const params  = useSearchParams();
  const orderId = params.get('order_id');

  const [projectId, setProjectId] = useState<string | null>(null);
  const [polling,   setPolling]   = useState(true);
  const [attempts,  setAttempts]  = useState(0);

  // Poll the order until project is created by Stripe webhook (up to ~30s)
  useEffect(() => {
    if (!orderId) { setPolling(false); return; }

    let tries = 0;
    const MAX = 12; // 12 × 2.5s = 30s

    const check = async () => {
      try {
        const { data } = await orderAPI.getOne(orderId);
        const pid = data.order?.project?.id || data.order?.project?._id || data.order?.projectId;
        if (pid) {
          setProjectId(pid);
          setPolling(false);
          return;
        }
      } catch {}
      tries++;
      setAttempts(tries);
      if (tries >= MAX) setPolling(false);
    };

    check();
    const timer = setInterval(check, 2500);
    return () => clearInterval(timer);
  }, [orderId]);

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
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.3)' }}
        >
          <CheckCircle2 className="w-12 h-12 text-green-400" />
        </motion.div>

        <h1 className="text-3xl font-bold text-white mb-3">Payment Successful! 🎉</h1>
        <p className="text-slate-400 mb-2">
          Your payment has been confirmed and your project is being created.
        </p>
        <p className="text-slate-500 text-sm mb-8">
          Our team will review your project and start working on it shortly.
          You'll receive updates through your dashboard and notifications.
        </p>

        <div className="space-y-3">
          {/* Project link — shows once webhook fires */}
          {projectId ? (
            <Link href={`/dashboard/client/projects/${projectId}`}>
              <Button className="w-full" size="lg">
                <FolderOpen className="w-4 h-4" />
                View Your Project
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : polling ? (
            <div className="flex items-center justify-center gap-2 py-3 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
              Setting up your project… ({attempts}/12)
            </div>
          ) : null}

          <Link href="/dashboard/client">
            <Button variant="outline" className="w-full" size="lg">
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {orderId && (
          <p className="text-slate-600 text-xs mt-6">
            Order ID: {orderId}
          </p>
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

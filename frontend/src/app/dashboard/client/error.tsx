'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Client Error]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <h2 className="text-lg font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-slate-400 text-sm max-w-xs mb-6">
        We couldn&apos;t load this page. Check your connection and try again.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </button>
        <Link
          href="/dashboard/client"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/6 hover:bg-white/10 text-slate-300 text-sm font-semibold rounded-xl transition-colors"
        >
          <Home className="w-4 h-4" />
          Dashboard
        </Link>
      </div>
      {error.digest && (
        <p className="mt-4 text-xs text-slate-600 font-mono">Error ID: {error.digest}</p>
      )}
    </div>
  );
}

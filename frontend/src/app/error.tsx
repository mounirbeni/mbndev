'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a12] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
      <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
        An unexpected error occurred. The issue has been logged and we&apos;ll look into it.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold rounded-xl border border-white/10 transition-colors"
        >
          <Home className="w-4 h-4" />
          Go home
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-slate-600 font-mono">Error ID: {error.digest}</p>
      )}
    </div>
  );
}

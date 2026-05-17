'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <h2 className="text-lg font-bold text-white mb-2">Failed to load</h2>
      <p className="text-slate-400 text-sm max-w-xs mb-6">
        Something went wrong loading this page. Please try again.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        <RefreshCcw className="w-4 h-4" />
        Retry
      </button>
      {error.digest && (
        <p className="mt-4 text-xs text-slate-600 font-mono">Error ID: {error.digest}</p>
      )}
    </div>
  );
}

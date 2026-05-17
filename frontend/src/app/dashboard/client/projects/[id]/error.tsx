'use client';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
export default function ProjectError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <h2 className="text-white font-semibold text-lg mb-1">Failed to load project</h2>
        <p className="text-slate-400 text-sm mb-6">{error?.message || 'An unexpected error occurred.'}</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="px-4 py-2 bg-primary-500/15 border border-primary-500/25 text-primary-400 text-sm font-medium rounded-xl hover:bg-primary-500/25 transition-colors">
            Try again
          </button>
          <Link href="/dashboard/client/projects" className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 text-sm font-medium rounded-xl hover:bg-white/10 transition-colors">
            Back to projects
          </Link>
        </div>
      </div>
    </div>
  );
}

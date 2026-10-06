'use client';

import { use, useEffect, useState } from 'react';
import { Loader2, Printer } from 'lucide-react';
import ReportView from '@/components/local-growth/ReportView';
import type { LocalGrowthData, ReportBrand } from '@/lib/api';

/** Shared growth report — public, no sign-in, not indexed. */
export default function SharedReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [state, setState] = useState<{ data: LocalGrowthData; brand: ReportBrand | null } | 'missing' | null>(null);

  useEffect(() => {
    fetch(`/api/local-growth/public/${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) { await res.body?.cancel(); setState('missing'); return; }
        const body = await res.json();
        setState({ data: body.report.data, brand: body.brand });
      })
      .catch(() => setState('missing'));
  }, [token]);

  return (
    <div className="min-h-screen bg-[#07060f] px-4 py-8 text-slate-200 sm:px-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-4xl">
        {state === null && <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>}
        {state === 'missing' && <p className="py-24 text-center text-slate-400">This report doesn&apos;t exist or is no longer shared.</p>}
        {state && state !== 'missing' && (
          <>
            <div className="mb-4 flex justify-end print:hidden">
              <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5">
                <Printer className="h-4 w-4" />Print / Save PDF
              </button>
            </div>
            <ReportView data={state.data} brand={state.brand} />
          </>
        )}
      </div>
    </div>
  );
}

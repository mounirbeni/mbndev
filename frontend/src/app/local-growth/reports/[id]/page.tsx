'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Link2, Printer, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import ReportView from '@/components/local-growth/ReportView';
import { localGrowthAPI, type LocalGrowthReport, type ReportBrand } from '@/lib/api';

export default function LocalGrowthReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<LocalGrowthReport | null>(null);
  const [brand, setBrand] = useState<ReportBrand | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    localGrowthAPI.get(id).then(
      ({ data }) => { setReport(data.report); setBrand(data.brand); },
      () => setFailed(true),
    );
  }, [id]);

  const shareUrl = report ? `${window.location.origin}/report/${report.shareToken}` : '';
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); toast.success('Share link copied'); } catch { toast.error('Copy failed'); }
  };

  if (failed) return <p className="py-20 text-center text-slate-400">Report not found. <Link href="/local-growth/reports" className="underline">Back to reports</Link></p>;
  if (!report?.data) return <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2 print:hidden">
        <Link href="/local-growth/reports" className="mr-auto flex items-center gap-1 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" />Reports</Link>
        <Button size="sm" variant="secondary" onClick={copyLink}><Link2 className="h-4 w-4" />Copy share link</Button>
        <Button size="sm" variant="secondary" onClick={() => window.print()}><Printer className="h-4 w-4" />Print / Save PDF</Button>
      </div>
      <ReportView data={report.data} brand={brand} />
    </div>
  );
}

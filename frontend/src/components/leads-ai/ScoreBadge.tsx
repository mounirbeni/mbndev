import { Loader2 } from 'lucide-react';

/** Opportunity score pill: red-hot ≥70, amber 40–69, grey below. */
export default function ScoreBadge({ score, loading }: { score?: number | null; loading?: boolean }) {
  if (loading || score == null) {
    return (
      <span className="inline-flex h-8 w-12 items-center justify-center rounded-lg bg-white/5" aria-label="Analyzing">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
      </span>
    );
  }
  const cls = score >= 70
    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
    : score >= 40
      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      : 'bg-white/5 text-slate-400 border-white/10';
  return (
    <span className={`inline-flex h-8 w-12 items-center justify-center rounded-lg border text-sm font-bold tabular-nums ${cls}`} title="Opportunity score">
      {score}
    </span>
  );
}

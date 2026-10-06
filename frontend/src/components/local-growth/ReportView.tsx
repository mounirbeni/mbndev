import { Star, Globe, Phone, Clock, Camera, MapPin, AlertTriangle, CheckCircle2, MessageSquareQuote } from 'lucide-react';
import type { LocalGrowthData, ReportBrand } from '@/lib/api';

const PRIORITY: Record<string, string> = {
  high:   'border-rose-500/30 bg-rose-500/10 text-rose-300',
  medium: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  low:    'border-white/10 bg-white/5 text-slate-300',
};

function scoreColor(n: number) {
  return n >= 70 ? 'text-emerald-300' : n >= 45 ? 'text-amber-300' : 'text-rose-300';
}

function Gauge({ value, label, big }: { value: number; label: string; big?: boolean }) {
  const r = big ? 52 : 30;
  const c = 2 * Math.PI * r;
  const size = (r + 8) * 2;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label}: ${value} out of 100`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={big ? 10 : 7} className="text-white/10 print:text-slate-200" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={big ? 10 : 7} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} className={scoreColor(value)} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className={`fill-current font-bold ${scoreColor(value)}`} fontSize={big ? 30 : 17}>{value}</text>
      </svg>
      <span className={`mt-1 text-center ${big ? 'text-sm font-semibold text-white' : 'text-xs text-slate-400'} print:text-slate-700`}>{label}</span>
    </div>
  );
}

const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

/** The full growth report. Used in the app, on shared links and when printed. */
export default function ReportView({ data, brand }: { data: LocalGrowthData; brand?: ReportBrand | null }) {
  const b = data.business;
  const bench = data.benchmark;
  return (
    <article className="space-y-6 print:space-y-4 print:text-black">
      <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:flex-row sm:items-center print:border-slate-300">
        <Gauge value={data.scores.overall} label="Growth Score" big />
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-widest text-slate-500">Online presence report</p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl print:text-black">{b.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-400 print:text-slate-600"><MapPin className="h-3.5 w-3.5 shrink-0" />{b.address || '—'}{b.type ? ` · ${b.type}` : ''}</p>
          <div className="mt-4 flex flex-wrap gap-5">
            <Gauge value={data.scores.reputation} label="Reputation" />
            <Gauge value={data.scores.website} label="Website" />
            <Gauge value={data.scores.profile} label="Google profile" />
          </div>
        </div>
      </header>

      {data.summary && (
        <section className="rounded-3xl border border-violet-400/20 bg-violet-500/[0.06] p-6 print:border-slate-300 print:bg-white">
          <h2 className="flex items-center gap-2 font-semibold text-white print:text-black"><MessageSquareQuote className="h-4 w-4 text-violet-300" />Summary</h2>
          <p className="mt-2 leading-relaxed text-slate-300 print:text-slate-800">{data.summary}</p>
        </section>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 print:border-slate-300">
        <h2 className="font-semibold text-white print:text-black">Action plan</h2>
        {data.actions.length === 0 ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-emerald-300"><CheckCircle2 className="h-4 w-4" />Excellent — nothing urgent to fix.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {data.actions.map((a, i) => (
              <li key={`${a.title}-${i}`} className="flex gap-3">
                <span className={`mt-0.5 h-fit shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${PRIORITY[a.priority]}`}>{a.priority}</span>
                <div>
                  <p className="font-medium text-white print:text-black">{a.title}</p>
                  <p className="mt-0.5 text-sm text-slate-400 print:text-slate-700">{a.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2 print:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 print:border-slate-300">
          <h2 className="font-semibold text-white print:text-black">Google profile</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-300 print:text-slate-800">
            <li className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-400" />{b.rating ?? '—'} rating · {b.reviews} reviews</li>
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-500" />Latest review: {fmtDate(b.lastReviewAt)}</li>
            <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-slate-500" />{b.website ? b.website.replace(/^https?:\/\//, '').replace(/\/$/, '') : <span className="text-rose-300">No website</span>}</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-500" />{b.phone || <span className="text-rose-300">No phone on Google</span>}</li>
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-500" />{b.hasHours ? 'Opening hours listed' : <span className="text-rose-300">No opening hours</span>}</li>
            <li className="flex items-center gap-2"><Camera className="h-4 w-4 text-slate-500" />{b.photos} photo{b.photos === 1 ? '' : 's'} visible</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 print:border-slate-300">
          <h2 className="font-semibold text-white print:text-black">Website check</h2>
          {data.websiteIssues.length === 0 ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-emerald-300"><CheckCircle2 className="h-4 w-4" />No major website issues found.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {data.websiteIssues.map((i) => (
                <li key={i.key} className="flex items-start gap-2 text-sm text-slate-300 print:text-slate-800">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />{i.label}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 print:border-slate-300">
        <h2 className="font-semibold text-white print:text-black">Nearby competitors</h2>
        {bench.competitors === 0 ? (
          <p className="mt-2 text-sm text-slate-400">No comparable businesses found nearby.</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-slate-400 print:text-slate-700">
              Average rating {bench.avgRating ?? '—'} · median {bench.medianReviews != null ? Math.round(bench.medianReviews) : '—'} reviews · {bench.withWebsite}/{bench.competitors} have a website
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500">
                  <tr><th className="py-2 pr-3 font-medium">Business</th><th className="px-3 py-2 font-medium">Rating</th><th className="px-3 py-2 font-medium">Reviews</th><th className="py-2 pl-3 font-medium">Website</th></tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-300 print:text-slate-800">
                  <tr className="bg-violet-500/[0.06] font-semibold text-white print:text-black">
                    <td className="py-2 pr-3">{b.name} (you)</td><td className="px-3 py-2">{b.rating ?? '—'}</td><td className="px-3 py-2">{b.reviews}</td><td className="py-2 pl-3">{b.website ? 'Yes' : 'No'}</td>
                  </tr>
                  {data.competitors.map((c) => (
                    <tr key={c.placeId}>
                      <td className="py-2 pr-3">{c.name}</td><td className="px-3 py-2">{c.rating ?? '—'}</td><td className="px-3 py-2">{c.reviews}</td><td className="py-2 pl-3">{c.website ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <footer className="pb-4 text-center text-xs text-slate-500">
        {brand ? (
          <>Prepared by {brand.url ? <a href={brand.url} target="_blank" rel="noopener noreferrer" className="underline">{brand.name}</a> : brand.name} · {fmtDate(data.generatedAt)}</>
        ) : (
          <>Generated with <a href="https://mbndev.ma/products/local-growth" className="underline">MBN Local Growth</a> · {fmtDate(data.generatedAt)}</>
        )}
      </footer>
    </article>
  );
}

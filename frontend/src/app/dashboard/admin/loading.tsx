export default function AdminLoading() {
  return (
    <div className="space-y-6 max-w-7xl">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-4 sm:p-5 border border-white/6 animate-pulse">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/8 rounded w-2/3" />
                <div className="h-8 bg-white/8 rounded w-1/2" />
              </div>
              <div className="w-11 h-11 rounded-xl bg-white/8" />
            </div>
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div className="glass rounded-2xl border border-white/6 overflow-hidden animate-pulse">
        <div className="p-4 border-b border-white/6">
          <div className="h-5 bg-white/8 rounded w-40" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-white/4">
            <div className="w-8 h-8 rounded-full bg-white/8 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-white/8 rounded w-1/3" />
              <div className="h-3 bg-white/6 rounded w-1/4" />
            </div>
            <div className="h-6 w-20 bg-white/8 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

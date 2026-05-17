export default function ClientLoading() {
  return (
    <div className="space-y-6 max-w-7xl">
      {/* Greeting skeleton */}
      <div className="animate-pulse space-y-2">
        <div className="h-7 bg-white/8 rounded w-56" />
        <div className="h-4 bg-white/6 rounded w-80" />
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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
      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 border border-white/6 space-y-3 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-white/8 rounded w-3/4" />
                <div className="h-3 bg-white/6 rounded w-1/2" />
              </div>
              <div className="h-6 w-20 bg-white/8 rounded-full ml-3" />
            </div>
            <div className="space-y-1">
              <div className="h-1.5 bg-white/8 rounded-full" />
            </div>
            <div className="flex justify-between">
              <div className="h-3 bg-white/6 rounded w-24" />
              <div className="h-3 bg-white/6 rounded w-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

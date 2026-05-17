export default function ProjectLoading() {
  return (
    <div className="space-y-6 max-w-5xl animate-pulse">
      {/* Header */}
      <div className="h-8 w-64 bg-white/5 rounded-xl" />
      {/* Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-24 bg-white/5 rounded-xl" />
        ))}
      </div>
      {/* Content */}
      <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
        <div className="h-5 w-48 bg-white/5 rounded-lg" />
        <div className="h-3 w-full bg-white/5 rounded-lg" />
        <div className="h-3 w-3/4 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

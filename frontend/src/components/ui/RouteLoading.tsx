// Loading screen for the dynamic, data-fetching routes. Deliberately not a root
// app/loading.tsx: that wraps every static page in a Suspense boundary whose
// content stays hidden until a late swap script runs, delaying first paint.
export default function RouteLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    </div>
  );
}

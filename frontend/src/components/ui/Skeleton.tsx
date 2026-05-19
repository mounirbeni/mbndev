import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-xl skeleton-shimmer',
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full shrink-0" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-2.5 w-8" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-6" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 border-b border-white/5">
      <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-2.5 w-1/5" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-3 w-12" />
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="glass rounded-2xl p-4 sm:p-5 border border-white/5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl shrink-0" />
      </div>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-2.5 w-28" />
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stats row */}
      <div className="tab-scroll lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-[152px] flex-shrink-0 lg:w-auto">
            <SkeletonStat />
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-8 w-20 rounded-xl" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
      {/* Table head */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-white/8">
        {[40, 28, 16, 12].map((w, i) => (
          <Skeleton key={i} className={`h-3 w-[${w}%] flex-shrink-0`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

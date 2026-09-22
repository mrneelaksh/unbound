'use client';

import { cn } from './cn';

// ─── Primitive shimmer block ──────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  rounded?: string;
}

export function Skeleton({ className, rounded = 'rounded-lg' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-white/6',
        rounded,
        className,
      )}
    />
  );
}

// ─── MetricCard skeleton ──────────────────────────────────────────────────────

export function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'p-5 flex flex-col gap-3 rounded-xl bg-[#111111] border border-white/8',
        className,
      )}
      aria-busy="true"
      aria-label="Loading metric"
    >
      {/* Label row */}
      <div className="flex items-start justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      {/* Value */}
      <Skeleton className="h-10 w-32" />
      {/* Subtitle */}
      <Skeleton className="h-3 w-28" />
    </div>
  );
}

// ─── QuestCard skeleton ───────────────────────────────────────────────────────

export function QuestCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl p-4 flex flex-col gap-3 bg-[#111111] border border-white/8',
        className,
      )}
      aria-busy="true"
      aria-label="Loading quest"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      {/* Meta */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-14 ml-auto" />
      </div>
    </div>
  );
}

// ─── GlassCard skeleton ───────────────────────────────────────────────────────

export function GlassCardSkeleton({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl p-5 flex flex-col gap-3',
        'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]',
        className,
      )}
      aria-busy="true"
      aria-label="Loading"
    >
      <Skeleton className="h-4 w-2/5" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3', i === lines - 1 ? 'w-3/5' : 'w-full')}
        />
      ))}
    </div>
  );
}

// ─── ProgressBar skeleton ─────────────────────────────────────────────────────

export function ProgressBarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)} aria-busy="true" aria-label="Loading">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-10" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
  );
}

// ─── Heatmap skeleton ─────────────────────────────────────────────────────────

export function HeatmapSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex flex-col gap-2 overflow-hidden', className)}
      aria-busy="true"
      aria-label="Loading heatmap"
    >
      {/* Month row */}
      <Skeleton className="h-3 w-full rounded" />
      {/* Grid rows */}
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full rounded" />
      ))}
    </div>
  );
}

import React from 'react'

export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 animate-pulse relative z-10">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-white/10 rounded-xl" />
          <div className="h-4 w-96 bg-white/5 rounded-lg" />
        </div>
        <div className="h-7 w-24 bg-white/10 rounded-full" />
      </div>

      {/* Hero Recovery Skeleton */}
      <div className="h-56 rounded-3xl bg-card/60 border border-white/5 p-8 flex items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white/10 shrink-0" />
          <div className="space-y-3">
            <div className="h-3 w-28 bg-white/10 rounded" />
            <div className="h-7 w-48 bg-white/10 rounded-xl" />
            <div className="h-4 w-60 bg-white/5 rounded" />
          </div>
        </div>
        <div className="w-72 space-y-3 hidden lg:block">
          <div className="h-4 w-32 bg-white/10 rounded" />
          <div className="h-2 w-full bg-white/10 rounded-full" />
        </div>
      </div>

      {/* Action Banner Skeleton */}
      <div className="h-20 rounded-2xl bg-white/5 border border-white/10" />

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-card/60 border border-white/5 p-5 space-y-2">
            <div className="h-3 w-16 bg-white/10 rounded" />
            <div className="h-6 w-24 bg-white/10 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

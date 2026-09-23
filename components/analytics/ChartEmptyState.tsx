'use client'

import React from 'react'
import { BarChart2, Shield } from 'lucide-react'

interface ChartEmptyStateProps {
  title?: string
  message?: string
  height?: string | number
  actionButton?: React.ReactNode
}

export function ChartEmptyState({
  title = 'NOT ENOUGH DATA',
  message = 'Keep tracking to reveal your trend over time.',
  height = '220px',
  actionButton,
}: ChartEmptyStateProps) {
  return (
    <div
      style={{ height }}
      className="w-full relative flex flex-col items-center justify-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.01] overflow-hidden"
    >
      {/* Subtle Ghost Axes & Gridlines */}
      <div className="absolute inset-x-8 bottom-6 top-8 pointer-events-none opacity-20 flex flex-col justify-between">
        <div className="w-full border-b border-white/10" />
        <div className="w-full border-b border-white/10" />
        <div className="w-full border-b border-white/10" />
        <div className="w-full border-b border-white/20" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm space-y-2.5">
        <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-[#C7FF72]/70">
          <BarChart2 size={20} />
        </div>
        <div>
          <h4 className="font-mono text-xs uppercase tracking-wider font-bold text-white">
            {title}
          </h4>
          <p className="font-sans text-xs text-muted mt-1 leading-relaxed">
            {message}
          </p>
        </div>
        {actionButton && <div className="pt-2">{actionButton}</div>}
      </div>
    </div>
  )
}

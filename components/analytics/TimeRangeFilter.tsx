'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { TimeRange } from '@/lib/analytics/types'

interface TimeRangeFilterProps {
  selectedRange: TimeRange
  onChange: (range: TimeRange) => void
}

const RANGES: { id: TimeRange; label: string }[] = [
  { id: 'today', label: 'TODAY' },
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
  { id: '6m', label: '6M' },
  { id: '1y', label: '1Y' },
  { id: 'all', label: 'ALL' },
]

export function TimeRangeFilter({ selectedRange, onChange }: TimeRangeFilterProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-card/90 backdrop-blur-md border border-white/10 font-mono text-xs shadow-inner">
        {RANGES.map((r) => {
          const isSelected = selectedRange === r.id
          return (
            <button
              key={r.id}
              onClick={() => onChange(r.id)}
              className={`relative px-3.5 py-1.5 rounded-xl uppercase tracking-wider transition-colors duration-200 cursor-pointer select-none shrink-0 ${
                isSelected
                  ? 'text-black font-bold'
                  : 'text-subtle hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="analytics-range-indicator"
                  className="absolute inset-0 rounded-xl bg-[#C7FF72] shadow-[0_0_12px_rgba(199,255,114,0.4)]"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-10">{r.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

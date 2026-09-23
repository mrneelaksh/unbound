'use client'

import React from 'react'
import { Sparkles, Brain, Compass, Clock, Zap, Activity } from 'lucide-react'
import type { PatternSummary } from '@/lib/analytics/types'

interface PatternSummaryCardProps {
  summary: PatternSummary
}

export function PatternSummaryCard({ summary }: PatternSummaryCardProps) {
  const items = [
    {
      label: 'MOST CONSISTENT HABIT',
      value: summary.mostConsistentHabit || 'Awaiting initial telemetry',
      desc: 'Observed highest compliance across daily checkpoints.',
      icon: Compass,
    },
    {
      label: 'HIGH-RISK TIME WINDOW',
      value: summary.mostDifficultWindow || 'No dominant pattern yet',
      desc: 'Temporal susceptibility where urge friction is elevated.',
      icon: Clock,
    },
    {
      label: 'MOST EFFECTIVE INTERVENTION',
      value: summary.mostSuccessfulIntervention || 'Awaiting deflection trials',
      desc: 'Demonstrated highest repeat impulse dissipation.',
      icon: Zap,
    },
    {
      label: 'STRONGEST ACTIVITY DAY',
      value: summary.strongestActivityDay || 'No day bias observed',
      desc: 'Day of week with peak movement volume and energy output.',
      icon: Activity,
    },
    {
      label: 'OPTIMAL FOCUS DAY',
      value: summary.bestFocusDay || 'Emerging rhythm',
      desc: 'Cognitive endurance sessions cluster around this period.',
      icon: Brain,
    },
    {
      label: 'HYDRATION DISCIPLINE',
      value: summary.bestHydrationDay || 'Building baseline',
      desc: 'Cellular recovery target reached with highest consistency.',
      icon: Sparkles,
    },
  ]

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 space-y-6 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#C7FF72]/15 text-[#C7FF72]">
              <Sparkles size={16} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
              NEURAL SYNTHESIS ENGINE
            </span>
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mt-1">
            WHAT YOUR DATA SHOWS (PERSONAL PATTERN SUMMARY)
          </h3>
          <p className="font-mono text-xs text-muted mt-0.5">
            Empirical observations synthesized from your actual logs. Confidence-aware pattern mapping.
          </p>
        </div>

        <div className="font-mono text-[10px] text-[#C7FF72] bg-[#C7FF72]/10 border border-[#C7FF72]/30 px-3 py-1 rounded-full font-bold hidden sm:block">
          CONFIDENCE-CALIBRATED
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-white/15 transition-all"
            >
              <div className="flex items-center gap-2 text-subtle">
                <Icon size={14} className="text-[#C7FF72]" />
                <span className="font-mono text-[10px] uppercase tracking-wider">{item.label}</span>
              </div>
              <div className="font-display text-sm md:text-base font-bold text-white">
                {item.value}
              </div>
              <p className="font-sans text-xs text-muted leading-relaxed">
                {item.desc}
              </p>
            </div>
          )
        })}
      </div>

      {/* AI Coach Insight Quote (Req 65) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-white/[0.03] to-[#C7FF72]/[0.05] border border-white/10 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[#C7FF72]/15 text-[#C7FF72] shrink-0 mt-0.5">
          <Brain size={16} />
        </div>
        <div>
          <h5 className="font-display text-xs font-bold text-white uppercase tracking-wider">
            AI COACH SYNTHESIS NOTE
          </h5>
          <p className="font-sans text-xs text-muted leading-relaxed mt-0.5">
            {summary.mostDifficultWindow
              ? `Patterns indicate susceptibility around ${summary.mostDifficultWindow}. Activating Night Shield and setting pre-emptive replacement anchors before fatigue sets in will dramatically stabilize your recovery momentum.`
              : 'As your daily telemetry deepens, the AI Coach will detect subtle biological correlations between your hydration, sleep consistency, and prefrontal impulse resistance.'}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-subtle">
        <span>DATA: COMPUTED CORRELATION MATRIX</span>
        <span>AVOIDS ABSOLUTE DETERMINISTIC CLAIMS</span>
      </div>
    </div>
  )
}

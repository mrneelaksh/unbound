'use client'

import React from 'react'
import { Hourglass, Sparkles, CheckCircle2 } from 'lucide-react'
import type { ActivityRecord, UrgeRecord } from '@/lib/store'
import { ChartEmptyState } from './ChartEmptyState'

interface TimeRedirectedCardProps {
  activities: ActivityRecord[]
  urges: UrgeRecord[]
  timeLabel: string
}

export function TimeRedirectedCard({ activities, urges, timeLabel }: TimeRedirectedCardProps) {
  const focusMins = activities.filter((a) => a.type === 'focus').reduce((acc, a) => acc + (a.durationMinutes || 0), 0)
  const runMins = activities.filter((a) => a.type === 'run').reduce((acc, a) => acc + (a.durationMinutes || 0), 0)
  const walkMins = activities.filter((a) => a.type === 'walk').reduce((acc, a) => acc + (a.durationMinutes || 0), 0)
  const urgeReclaimedMins = urges.length * 30 // conservative estimated 30 min saved per deflected loop

  const totalMins = focusMins + runMins + walkMins + urgeReclaimedMins
  const totalHours = Number((totalMins / 60).toFixed(1))

  const categories = [
    { label: 'Deep Focus & Study', mins: focusMins, color: '#C7FF72' },
    { label: 'Somatic Movement & Running', mins: runMins, color: '#FFFFFF' },
    { label: 'Walking & Grounding', mins: walkMins, color: '#888888' },
    { label: 'Compulsive Loops Interrupted', mins: urgeReclaimedMins, color: '#444444' },
  ].filter((c) => c.mins > 0)

  const hasData = totalMins > 0

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 space-y-6 shadow-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#C7FF72]/15 text-[#C7FF72]">
              <Hourglass size={16} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
              COGNITIVE RECLAIM TELEMETRY
            </span>
            <span className="font-mono text-xs text-subtle">· {timeLabel}</span>
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mt-1">
            ESTIMATED TIME REDIRECTED &amp; RECLAIMED
          </h3>
        </div>

        <div className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 font-mono text-[10px] text-subtle uppercase">
          ESTIMATED DATA (REQ 38)
        </div>
      </div>

      {!hasData ? (
        <ChartEmptyState
          title="NO TIME REDIRECTION RECORDED"
          message="Every time you substitute a compulsive urge with focus or outdoor movement, you repossess hours of life that would have slipped away."
          height="180px"
        />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="font-numbers text-3xl md:text-4xl font-bold text-white tracking-tight">
                {totalHours} HOURS <span className="text-[#C7FF72] text-xl">RECLAIMED</span>
              </div>
              <p className="font-sans text-xs text-muted mt-1">
                Cognitive energy that was consciously invested back into building yourself.
              </p>
            </div>
            <div className="font-mono text-xs text-[#C7FF72] font-bold">
              ~{Math.round(totalMins)} Total Minutes
            </div>
          </div>

          {/* Stacked Progress Bar */}
          <div className="w-full h-4 rounded-xl bg-white/5 overflow-hidden flex">
            {categories.map((c, idx) => {
              const widthPct = Math.max(4, Math.round((c.mins / totalMins) * 100))
              return (
                <div
                  key={idx}
                  title={`${c.label}: ${c.mins} min (${widthPct}%)`}
                  className="h-full transition-all duration-700"
                  style={{ width: `${widthPct}%`, backgroundColor: c.color }}
                />
              )
            })}
          </div>

          {/* Categories Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 font-mono text-xs">
            {categories.map((c, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-white text-[11px] truncate">{c.label}</span>
                </div>
                <div className="font-numbers text-base font-bold text-white pl-4.5">
                  {c.mins} MIN <span className="text-subtle text-[10px]">({Math.round((c.mins / totalMins) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-subtle">
        <span>METHODOLOGY: ACTIVE SESSIONS + ESTIMATED REDIRECTED CYCLE PREVENTIONS</span>
        <span>EXPLICITLY LABELED AS ESTIMATED</span>
      </div>
    </div>
  )
}

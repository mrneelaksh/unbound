'use client'

import React from 'react'
import {
  BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine
} from 'recharts'
import { Droplets, Award, TrendingUp, CheckCircle2 } from 'lucide-react'
import type { TimeSeriesPoint } from '@/lib/analytics/types'
import { ChartEmptyState } from './ChartEmptyState'

interface HydrationAnalyticsCardProps {
  todayWaterMl: number
  dailyGoalMl: number
  averageIntake: number
  daysMetGoal: number
  trackedDays: number
  consistencyPercent: number
  bestDayMl: number
  trend: TimeSeriesPoint[]
  timeLabel: string
}

export function HydrationAnalyticsCard({
  todayWaterMl,
  dailyGoalMl,
  averageIntake,
  daysMetGoal,
  trackedDays,
  consistencyPercent,
  bestDayMl,
  trend,
  timeLabel,
}: HydrationAnalyticsCardProps) {
  const hasData = trackedDays > 0 || todayWaterMl > 0

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 space-y-6 shadow-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#C7FF72]/15 text-[#C7FF72]">
              <Droplets size={16} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
              METABOLIC &amp; CELLULAR RECOVERY
            </span>
            <span className="font-mono text-xs text-subtle">· {timeLabel}</span>
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mt-1">
            HYDRATION INTAKE VS DAILY GOAL
          </h3>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="flex items-center gap-1.5 text-[#C7FF72]">
            <span className="w-2.5 h-2.5 rounded bg-[#C7FF72] inline-block shadow-[0_0_6px_rgba(199,255,114,0.5)]" /> Actual Intake
          </span>
          <span className="flex items-center gap-1.5 text-muted">
            <span className="w-2.5 h-2.5 rounded bg-white/40 inline-block" /> Goal ({dailyGoalMl} ml)
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[10px] text-subtle uppercase">TODAY INTAKE</span>
          <div className="font-numbers text-2xl font-bold text-[#C7FF72]">{todayWaterMl} ML</div>
          <span className="font-mono text-[10px] text-muted">
            {Math.round((todayWaterMl / (dailyGoalMl || 2500)) * 100)}% of daily target
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[10px] text-subtle uppercase">AVERAGE INTAKE</span>
          <div className="font-numbers text-2xl font-bold text-white">
            {hasData ? `${averageIntake} ML` : '0 ML'}
          </div>
          <span className="font-mono text-[10px] text-muted">Across tracked days</span>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[10px] text-subtle uppercase">CONSISTENCY</span>
          <div className="font-numbers text-2xl font-bold text-white">
            {daysMetGoal} / {trackedDays || 7}
          </div>
          <span className="font-mono text-[10px] text-[#C7FF72] font-bold">
            {consistencyPercent}% goal adherence
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[10px] text-subtle uppercase">BEST HYDRATION DAY</span>
          <div className="font-numbers text-2xl font-bold text-white">
            {bestDayMl > 0 ? `${bestDayMl} ML` : '—'}
          </div>
          <span className="font-mono text-[10px] text-muted">Peak daily record</span>
        </div>
      </div>

      {/* Water vs Goal Bar Chart */}
      <div className="h-64 w-full pt-2">
        {!hasData ? (
          <ChartEmptyState
            title="NO HYDRATION LOGGED YET"
            message="Log your first glass in the Wellbeing tab or dashboard to start your hydration timeline."
            height="100%"
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 10, fill: '#888' }} />
              <YAxis stroke="#444" tick={{ fontSize: 10, fill: '#888' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
                formatter={(val: any) => [`${val} ml`, 'Intake']}
              />
              <ReferenceLine
                y={dailyGoalMl}
                stroke="rgba(255,255,255,0.3)"
                strokeDasharray="4 4"
                label={{
                  value: 'Goal',
                  fill: '#888',
                  fontSize: 10,
                  position: 'right',
                }}
              />
              <Bar
                dataKey="value"
                name="Intake"
                fill="#C7FF72"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-subtle">
        <span>DATA: WATER LOG ENTRIES</span>
        <span>BENCHMARK: 2,500 ML / DAY FOR OPTIMAL PREFRONTAL CLARITY</span>
      </div>
    </div>
  )
}

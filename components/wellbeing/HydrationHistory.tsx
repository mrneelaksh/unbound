'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, AreaChart, Area, ResponsiveContainer,
  XAxis, YAxis, Tooltip
} from 'recharts'
import { Calendar, BarChart2, TrendingUp, CheckCircle2, Droplets } from 'lucide-react'

export interface WaterDaySummary {
  date: string
  day: string
  amountMl: number
  goalMet: boolean
  percentOfGoal: number
}

interface HydrationHistoryProps {
  history7d: WaterDaySummary[]
  history30d: WaterDaySummary[]
  history90d: WaterDaySummary[]
  dailyGoalMl: number
  totalLogsCount: number
}

export function HydrationHistory({
  history7d,
  history30d,
  history90d,
  dailyGoalMl,
  totalLogsCount,
}: HydrationHistoryProps) {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d')
  const [viewMode, setViewMode] = useState<'bars' | 'trend'>('bars')

  const activeHistory =
    timeframe === '7d' ? history7d : timeframe === '30d' ? history30d : history90d

  const activeDaysWithData = activeHistory.filter((d) => d.amountMl > 0)
  const hasData = totalLogsCount > 0 && activeDaysWithData.length > 0

  const totalConsumed = activeHistory.reduce((acc, d) => acc + d.amountMl, 0)
  const averageDailyMl =
    activeDaysWithData.length > 0
      ? Math.round(totalConsumed / activeDaysWithData.length)
      : 0
  const daysGoalMet = activeHistory.filter((d) => d.goalMet).length
  const consistencyPercent =
    activeHistory.length > 0 ? Math.round((daysGoalMet / activeHistory.length) * 100) : 0

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 shadow-card space-y-6">
      {/* Header with Timeframe toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 size={18} className="text-[#C7FF72]" />
            <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
              HYDRATION HISTORY &amp; CONSISTENCY
            </h3>
          </div>
          <p className="font-mono text-xs text-muted mt-0.5">
            Observing daily fluid intake volume and target achievement over time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle (Bars vs Trend Area) */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-[10px]">
            <button
              onClick={() => setViewMode('bars')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'bars' ? 'bg-white text-black font-bold' : 'text-subtle hover:text-white'
              }`}
            >
              BARS
            </button>
            <button
              onClick={() => setViewMode('trend')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'trend' ? 'bg-white text-black font-bold' : 'text-subtle hover:text-white'
              }`}
            >
              TREND
            </button>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-[10px]">
            {(['7d', '30d', '90d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  timeframe === tf
                    ? 'bg-[#C7FF72] text-[#050505] font-bold shadow-sm'
                    : 'text-subtle hover:text-white'
                }`}
              >
                {tf === '7d' ? '7 DAYS' : tf === '30d' ? '30 DAYS' : '90 DAYS'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Stat Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[9px] uppercase tracking-wider text-subtle">
            AVERAGE INTAKE
          </span>
          <div className="font-numbers text-xl font-bold text-white">
            {hasData ? `${averageDailyMl.toLocaleString()} ml` : '—'}
          </div>
          <p className="font-mono text-[10px] text-muted">Per active day</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[9px] uppercase tracking-wider text-subtle">
            CONSISTENCY
          </span>
          <div className="font-numbers text-xl font-bold text-[#C7FF72]">
            {hasData ? `${consistencyPercent}%` : '0%'}
          </div>
          <p className="font-mono text-[10px] text-muted">{daysGoalMet} days reached goal</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[9px] uppercase tracking-wider text-subtle">
            TOTAL CONSUMED
          </span>
          <div className="font-numbers text-xl font-bold text-white">
            {hasData ? `${(totalConsumed / 1000).toFixed(1)} L` : '0.0 L'}
          </div>
          <p className="font-mono text-[10px] text-muted">Across this period</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[9px] uppercase tracking-wider text-subtle">
            DAILY GOAL
          </span>
          <div className="font-numbers text-xl font-bold text-white">
            {dailyGoalMl.toLocaleString()} ml
          </div>
          <p className="font-mono text-[10px] text-muted">Target threshold</p>
        </div>
      </div>

      {/* Main Chart Area */}
      {!hasData ? (
        <div className="p-10 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2">
          <Droplets size={26} className="mx-auto text-subtle/50" />
          <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
            NO WATER HISTORY YET.
          </h4>
          <p className="font-mono text-xs text-muted max-w-sm mx-auto">
            Log your first water intake using the quick-add buttons above. Your daily volume chart and consistency trends will formulate here in real time.
          </p>
        </div>
      ) : (
        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'bars' ? (
              <BarChart data={activeHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey={timeframe === '7d' ? 'day' : 'date'}
                  stroke="#555"
                  tick={{ fontSize: 10, fill: '#888', fontFamily: 'monospace' }}
                  tickFormatter={(val) => (timeframe === '7d' ? val : val.slice(5))}
                />
                <YAxis
                  stroke="#555"
                  tick={{ fontSize: 10, fill: '#888', fontFamily: 'monospace' }}
                  tickFormatter={(val) => `${val / 1000}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0E0E0E',
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: '#FFF',
                  }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} ml`, 'Intake']}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                />
                <Bar
                  dataKey="amountMl"
                  fill="#C7FF72"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={timeframe === '7d' ? 36 : 14}
                />
              </BarChart>
            ) : (
              <AreaChart data={activeHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hydrationGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C7FF72" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#C7FF72" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey={timeframe === '7d' ? 'day' : 'date'}
                  stroke="#555"
                  tick={{ fontSize: 10, fill: '#888', fontFamily: 'monospace' }}
                  tickFormatter={(val) => (timeframe === '7d' ? val : val.slice(5))}
                />
                <YAxis
                  stroke="#555"
                  tick={{ fontSize: 10, fill: '#888', fontFamily: 'monospace' }}
                  tickFormatter={(val) => `${val / 1000}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0E0E0E',
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: '#FFF',
                  }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} ml`, 'Intake']}
                />
                <Area
                  type="monotone"
                  dataKey="amountMl"
                  stroke="#C7FF72"
                  strokeWidth={2}
                  fill="url(#hydrationGrad)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Section 25: Subtle Hydration Heatmap */}
      <div className="pt-4 border-t border-white/5 space-y-2">
        <div className="flex items-center justify-between font-mono text-[10px] text-subtle">
          <span className="uppercase tracking-wider">WEEKLY CONSISTENCY HEATMAP</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-white/5 inline-block" /> Low / Zero
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-white/20 inline-block" /> Partial
            </span>
            <span className="flex items-center gap-1 text-[#C7FF72]">
              <span className="w-2 h-2 rounded bg-[#C7FF72] inline-block" /> Goal Reached
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-1 font-mono text-center">
          {history7d.map((day) => {
            const isGoal = day.goalMet
            const isPartial = day.amountMl > 0 && !isGoal

            return (
              <div
                key={day.date}
                className="p-2.5 rounded-xl border transition-all flex flex-col items-center justify-center gap-1"
                style={{
                  backgroundColor: isGoal ? 'rgba(199, 255, 114, 0.12)' : isPartial ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  borderColor: isGoal ? 'rgba(199, 255, 114, 0.35)' : 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <span className="text-[10px] text-subtle uppercase">{day.day}</span>
                <span className={`text-xs font-bold ${isGoal ? 'text-[#C7FF72]' : isPartial ? 'text-white' : 'text-subtle/50'}`}>
                  {day.amountMl > 0 ? `${Math.round(day.amountMl / 100) / 10}L` : '—'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

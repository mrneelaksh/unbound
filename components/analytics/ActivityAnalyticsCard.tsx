'use client'

import React, { useState } from 'react'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import { Footprints, Trophy, TrendingUp, Sparkles, Activity } from 'lucide-react'
import type { RunningMetrics, WalkingMetrics } from '@/lib/analytics/types'
import { ChartEmptyState } from './ChartEmptyState'

interface ActivityAnalyticsCardProps {
  running: RunningMetrics
  walking: WalkingMetrics
  contributionGrid: Array<{ date: string; count: number; level: number }>
  timeLabel: string
}

export function ActivityAnalyticsCard({
  running,
  walking,
  contributionGrid,
  timeLabel,
}: ActivityAnalyticsCardProps) {
  const [activityTab, setActivityTab] = useState<'running' | 'walking' | 'heatmap'>('running')

  const hasRuns = running.totalRuns > 0
  const hasWalks = walking.totalSteps > 0

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 space-y-6 shadow-card">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#C7FF72]/15 text-[#C7FF72]">
              <Footprints size={16} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
              PHYSICAL RESILIENCE &amp; SOMATIC RESET
            </span>
            <span className="font-mono text-xs text-subtle">· {timeLabel}</span>
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mt-1">
            RUNNING, WALKING &amp; ACTIVITY CONSISTENCY
          </h3>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px]">
          {(
            [
              { id: 'running', label: 'Running' },
              { id: 'walking', label: 'Walking & Steps' },
              { id: 'heatmap', label: 'Contribution Grid' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivityTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
                activityTab === tab.id
                  ? 'bg-white/15 text-white font-bold'
                  : 'text-subtle hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Running (Reqs 19, 20, 21, 22) */}
      {activityTab === 'running' && (
        <div className="space-y-6">
          {/* Running KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="font-mono text-[10px] text-subtle uppercase">TOTAL DISTANCE</span>
              <div className="font-numbers text-2xl font-bold text-[#C7FF72]">
                {running.totalDistanceKm} KM
              </div>
              <span className="font-mono text-[10px] text-muted">{running.totalRuns} total runs</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="font-mono text-[10px] text-subtle uppercase">AVG PACE</span>
              <div className="font-numbers text-2xl font-bold text-white">
                {running.avgPaceMinutesPerKm ? `${running.avgPaceMinutesPerKm} m/km` : '—'}
              </div>
              <span className="font-mono text-[10px] text-subtle">Average speed</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="font-mono text-[10px] text-subtle uppercase">BEST PACE</span>
              <div className="font-numbers text-2xl font-bold text-white">
                {running.bestPaceMinutesPerKm ? `${running.bestPaceMinutesPerKm} m/km` : '—'}
              </div>
              <span className="font-mono text-[10px] text-[#C7FF72]">Peak velocity</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="font-mono text-[10px] text-subtle uppercase">LONGEST RUN (PB)</span>
              <div className="font-numbers text-2xl font-bold text-white">
                {running.longestRunKm > 0 ? `${running.longestRunKm} KM` : '—'}
              </div>
              <span className="font-mono text-[10px] text-muted">
                {running.longestRunDate || 'Personal Best'}
              </span>
            </div>
          </div>

          {/* Running Charts */}
          {!hasRuns ? (
            <ChartEmptyState
              title="NO RUN DATA YET"
              message="Complete your first run in the Activity tab to unlock running distance charts, pace trends, and personal records."
              height="240px"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Distance chart */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-xs text-subtle">
                  <span>DISTANCE PER RUN (KM)</span>
                  <span className="text-[#C7FF72]">Area Trend</span>
                </div>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={running.distanceTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="runDistGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C7FF72" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#C7FF72" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 10, fill: '#888' }} />
                      <YAxis stroke="#444" tick={{ fontSize: 10, fill: '#888' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111',
                          borderColor: 'rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                        }}
                        formatter={(val: any) => [`${val} km`, 'Distance']}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#C7FF72"
                        strokeWidth={2}
                        fill="url(#runDistGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pace trend chart (Req 21: Note lower pace = faster) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-xs text-subtle">
                  <span>PACE TRAJECTORY</span>
                  <span className="text-[10px] text-muted">Lower = Faster speed</span>
                </div>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={running.paceTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 10, fill: '#888' }} />
                      <YAxis stroke="#444" tick={{ fontSize: 10, fill: '#888' }} reversed />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111',
                          borderColor: 'rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                        }}
                        formatter={(val: any) => [`${val} min/km (faster pace is lower)`, 'Pace']}
                      />
                      <Line
                        type="monotone"
                        dataKey="pace"
                        stroke="#FFFFFF"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#C7FF72' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Walking & Steps (Reqs 23, 24) */}
      {activityTab === 'walking' && (
        <div className="space-y-6">
          {/* Walking KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="font-mono text-[10px] text-subtle uppercase">TOTAL STEPS</span>
              <div className="font-numbers text-2xl font-bold text-white">
                {walking.totalSteps.toLocaleString()}
              </div>
              <span className="font-mono text-[10px] text-muted">Real sensor/manual</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="font-mono text-[10px] text-subtle uppercase">DAILY AVERAGE</span>
              <div className="font-numbers text-2xl font-bold text-[#C7FF72]">
                {walking.avgDailySteps.toLocaleString()}
              </div>
              <span className="font-mono text-[10px] text-subtle">Steps / active day</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="font-mono text-[10px] text-subtle uppercase">WALK DISTANCE</span>
              <div className="font-numbers text-2xl font-bold text-white">
                {walking.totalDistanceKm} KM
              </div>
              <span className="font-mono text-[10px] text-muted">Outdoor / treadmill</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="font-mono text-[10px] text-subtle uppercase">ACTIVE MINUTES</span>
              <div className="font-numbers text-2xl font-bold text-white">
                {walking.activeMinutes} MIN
              </div>
              <span className="font-mono text-[10px] text-muted">Somatic activation</span>
            </div>
          </div>

          {!hasWalks ? (
            <ChartEmptyState
              title="NO STEP DATA RECORDED"
              message="Track an outdoor walk or log steps in the Activity tab to reveal daily step volume and weekly trends."
              height="240px"
            />
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-xs text-subtle">
                <span>DAILY STEP VOLUME</span>
                <span className="text-muted">Target: 10,000 steps</span>
              </div>
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={walking.stepTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 10, fill: '#888' }} />
                    <YAxis stroke="#444" tick={{ fontSize: 10, fill: '#888' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111',
                        borderColor: 'rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                      }}
                      formatter={(val: any) => [`${val.toLocaleString()} steps`, 'Steps']}
                    />
                    <Bar dataKey="value" fill="#C7FF72" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Contribution Heatmap Grid (Req 25) */}
      {activityTab === 'heatmap' && (
        <div className="space-y-4">
          <div>
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              ACTIVITY CONSISTENCY (60-DAY CONTRIBUTION GRID)
            </h4>
            <p className="font-mono text-xs text-muted mt-0.5">
              Reflects somatic actions: walks, runs, and focus sessions logged over the last 60 days.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="flex flex-wrap gap-1.5 justify-start">
              {contributionGrid.map((day, idx) => {
                let bg = 'bg-[#181818]'
                if (day.level === 1) bg = 'bg-[#2E2E2E]'
                if (day.level === 2) bg = 'bg-[#4B4B4B]'
                if (day.level === 3) bg = 'bg-[#8BB74A]'
                if (day.level === 4) bg = 'bg-[#C7FF72] shadow-[0_0_8px_rgba(199,255,114,0.5)]'

                return (
                  <div
                    key={idx}
                    title={`${day.date}: ${day.count} active minutes`}
                    className={`w-4 h-4 rounded-[3px] border border-white/5 transition-all ${bg}`}
                  />
                )
              })}
            </div>

            <div className="flex items-center justify-between font-mono text-[10px] text-subtle pt-2 border-t border-white/5">
              <span>Past 60 days</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                <span className="w-3 h-3 rounded-[2px] bg-[#181818]" />
                <span className="w-3 h-3 rounded-[2px] bg-[#2E2E2E]" />
                <span className="w-3 h-3 rounded-[2px] bg-[#4B4B4B]" />
                <span className="w-3 h-3 rounded-[2px] bg-[#8BB74A]" />
                <span className="w-3 h-3 rounded-[2px] bg-[#C7FF72]" />
                <span>More Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-subtle">
        <span>DATA: REAL SENSOR &amp; LOGGED SESSIONS</span>
        <span>NO FABRICATED STEPS OR ARTIFICIAL RUNS</span>
      </div>
    </div>
  )
}

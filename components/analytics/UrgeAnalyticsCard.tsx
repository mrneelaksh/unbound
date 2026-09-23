'use client'

import React, { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import { Zap, Shield, Clock, Flame, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { TimeSeriesPoint, HeatmapCell, TriggerStat, InterventionStat } from '@/lib/analytics/types'
import { ChartEmptyState } from './ChartEmptyState'

interface UrgeAnalyticsCardProps {
  totalUrges: number
  trend: TimeSeriesPoint[]
  heatmapMatrix: HeatmapCell[]
  triggersList: TriggerStat[]
  interventionsList: InterventionStat[]
  averageIntensity: number
  deflectionRate: number
  timeLabel: string
}

export function UrgeAnalyticsCard({
  totalUrges,
  trend,
  heatmapMatrix,
  triggersList,
  interventionsList,
  averageIntensity,
  deflectionRate,
  timeLabel,
}: UrgeAnalyticsCardProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'heatmap' | 'triggers' | 'interventions'>('timeline')

  const hasUrges = totalUrges > 0

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 space-y-6 shadow-card">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#C7FF72]/15 text-[#C7FF72]">
              <Zap size={16} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
              NEUROCHEMICAL REGULATION
            </span>
            <span className="font-mono text-xs text-subtle">· {timeLabel}</span>
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mt-1">
            URGE TRENDS &amp; INTERVENTION DEFLECTION
          </h3>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'timeline', label: 'Timeline' },
              { id: 'heatmap', label: 'Heatmap' },
              { id: 'triggers', label: 'Triggers' },
              { id: 'interventions', label: 'Interventions' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-white/15 text-white font-bold'
                  : 'text-subtle hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[10px] text-subtle uppercase">TOTAL URGES</span>
          <div className="font-numbers text-2xl font-bold text-white">{totalUrges}</div>
          <span className="font-mono text-[10px] text-subtle">Logged events</span>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[10px] text-subtle uppercase">AVG INTENSITY</span>
          <div className="font-numbers text-2xl font-bold text-white">
            {hasUrges ? `${averageIntensity} / 10` : '—'}
          </div>
          <span className="font-mono text-[10px] text-subtle">Subjective scale</span>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[10px] text-subtle uppercase">DEFLECTION RATE</span>
          <div className="font-numbers text-2xl font-bold text-[#C7FF72]">
            {hasUrges ? `${deflectionRate}%` : '100%'}
          </div>
          <span className="font-mono text-[10px] text-subtle">Successfully bypassed</span>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[10px] text-subtle uppercase">TOP DEFLECTION HABIT</span>
          <div className="font-mono text-xs font-bold text-white truncate pt-1">
            {interventionsList[0]?.name || (hasUrges ? 'Mindful Breathing' : 'None yet')}
          </div>
          <span className="font-mono text-[10px] text-[#C7FF72]">
            {interventionsList[0] ? `${interventionsList[0].rate}% effective` : 'Ready to prime'}
          </span>
        </div>
      </div>

      {/* Tab 1: Timeline */}
      {activeTab === 'timeline' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-xs text-subtle">
            <span>URGE FREQUENCY OVER TIME</span>
            <span className="text-[#C7FF72] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#C7FF72]" /> Urge Count
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            {!hasUrges ? (
              <ChartEmptyState
                title="NO URGE EVENTS LOGGED"
                message="Whenever a compulsive impulse strikes, activate Urge Mode to deflect it. Your deflection trajectory will chart here."
                height="100%"
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="urgeTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C7FF72" stopOpacity={0.3} />
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
                      borderRadius: '10px',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Urges"
                    stroke="#C7FF72"
                    strokeWidth={2}
                    fill="url(#urgeTrendGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Heatmap (Requirement 9) */}
      {activeTab === 'heatmap' && (
        <div className="space-y-4">
          <div>
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              WHEN DIFFICULT MOMENTS APPEAR (TIME-OF-DAY × DAY-OF-WEEK)
            </h4>
            <p className="font-mono text-xs text-muted mt-0.5">
              Identifies when cognitive fatigue creates impulse susceptibility across your weekly rhythm.
            </p>
          </div>

          {!hasUrges ? (
            <ChartEmptyState
              title="NOT ENOUGH DATA"
              message="Log a few more moments in Urge Mode to reveal your high-risk temporal patterns."
              height="240px"
            />
          ) : (
            <div className="space-y-3 pt-2">
              <div className="overflow-x-auto no-scrollbar">
                <div className="min-w-[480px]">
                  {/* Heatmap Grid */}
                  <div className="grid grid-cols-[140px_repeat(7,1fr)] gap-1.5 font-mono text-xs">
                    {/* Header: Days */}
                    <div />
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <div key={day} className="text-center font-bold text-subtle text-[11px] py-1">
                        {day}
                      </div>
                    ))}

                    {/* Rows */}
                    {[
                      { idx: 0, label: 'Morning (6am-12pm)' },
                      { idx: 1, label: 'Afternoon (12pm-6pm)' },
                      { idx: 2, label: 'Evening (6pm-10pm)' },
                      { idx: 3, label: 'Late Night (10pm-6am)' },
                    ].map((row) => (
                      <React.Fragment key={row.idx}>
                        <div className="text-muted text-[11px] flex items-center pr-2">
                          {row.label}
                        </div>
                        {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                          const cell = heatmapMatrix.find(
                            (c) => c.periodIndex === row.idx && c.dayIndex === dayIdx
                          )
                          const count = cell?.count || 0
                          const intensity = cell?.intensity || 0

                          // Colors strictly per Requirement 9: dark grey, light grey, light green
                          let bgClass = 'bg-[#181818] border-white/5 text-transparent'
                          if (intensity === 1) bgClass = 'bg-[#2E2E2E] border-white/10 text-subtle'
                          if (intensity === 2) bgClass = 'bg-[#4B4B4B] border-white/20 text-white font-bold'
                          if (intensity === 3)
                            bgClass = 'bg-[#C7FF72] border-[#C7FF72] text-black font-bold shadow-[0_0_10px_rgba(199,255,114,0.4)]'

                          return (
                            <div
                              key={dayIdx}
                              title={`${row.label} on ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIdx]}: ${count} urges`}
                              className={`h-11 rounded-lg border flex items-center justify-center transition-all ${bgClass}`}
                            >
                              {count > 0 && <span className="text-[11px]">{count}</span>}
                            </div>
                          )
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center justify-end gap-3 font-mono text-[10px] text-subtle pt-2">
                <span>Frequency:</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#181818] border border-white/5" /> None
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#2E2E2E]" /> Low
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#4B4B4B]" /> Moderate
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#C7FF72]" /> Peak
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Common Triggers (Requirement 10) */}
      {activeTab === 'triggers' && (
        <div className="space-y-4">
          <div>
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              COMMON TRIGGERS (SORTED BY ACTUAL FREQUENCY)
            </h4>
            <p className="font-mono text-xs text-muted mt-0.5">
              Ranked from your real check-in inputs. Awareness precedes emotional regulation.
            </p>
          </div>

          {triggersList.length === 0 ? (
            <ChartEmptyState
              title="NO TRIGGERS LOGGED YET"
              message="When using Urge Mode or Daily Check-in, note what triggered the impulse to build this ranking."
              height="220px"
            />
          ) : (
            <div className="space-y-3 pt-2">
              {triggersList.map((t, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-white capitalize">{t.trigger}</span>
                    <span className="text-muted">
                      {t.percentage}% ({t.count} {t.count === 1 ? 'event' : 'events'})
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-[#C7FF72] rounded-full transition-all duration-700"
                      style={{
                        width: `${t.percentage}%`,
                        opacity: 0.4 + (t.percentage / 100) * 0.6,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Interventions (Requirement 11) */}
      {activeTab === 'interventions' && (
        <div className="space-y-4">
          <div>
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              WHAT HELPS MOST: INTERVENTION EFFECTIVENESS
            </h4>
            <p className="font-mono text-xs text-muted mt-0.5">
              Comparing completion and repeat success rates across physical, mindful, and cognitive strategies.
            </p>
          </div>

          {interventionsList.length === 0 ? (
            <ChartEmptyState
              title="NO INTERVENTION DATA"
              message="Complete replacement habits like Cold Reset, Box Breathing, or Chess during Urge Mode to evaluate effectiveness."
              height="220px"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {interventionsList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="font-mono text-xs font-bold text-white capitalize">
                      {item.name}
                    </div>
                    <div className="font-mono text-[10px] text-muted">
                      {item.successes} deflected out of {item.attempts} attempts
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-numbers text-lg font-bold text-[#C7FF72]">
                      {item.rate}%
                    </div>
                    <div className="font-mono text-[9px] text-subtle uppercase">SUCCESS RATE</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Interpretation */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-subtle">
        <span>DATA: LOGGED URGE CHECK-INS</span>
        <span>CONFIDENTIAL &amp; ZERO-KNOWLEDGE SCOPED</span>
      </div>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import {
  BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine
} from 'recharts'
import { Moon, Plus, Sparkles, CheckCircle2 } from 'lucide-react'
import type { SleepMetrics } from '@/lib/analytics/types'
import { ChartEmptyState } from './ChartEmptyState'
import { useUserStore } from '@/lib/store'

interface SleepAnalyticsCardProps {
  sleep: SleepMetrics
  timeLabel: string
}

export function SleepAnalyticsCard({ sleep, timeLabel }: SleepAnalyticsCardProps) {
  const { logSleep } = useUserStore()
  const [showLogModal, setShowLogModal] = useState(false)
  const [durationInput, setDurationInput] = useState('7.5')
  const [bedtimeInput, setBedtimeInput] = useState('23:00')

  const hasData = sleep.totalTrackedDays > 0

  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault()
    const hours = parseFloat(durationInput) || 7.5
    const today = new Date().toISOString().slice(0, 10)
    logSleep({
      date: today,
      durationHours: hours,
      bedtime: bedtimeInput,
    })
    setShowLogModal(false)
  }

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 space-y-6 shadow-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#C7FF72]/15 text-[#C7FF72]">
              <Moon size={16} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
              CIRCADIAN &amp; REPAIR CYCLES
            </span>
            <span className="font-mono text-xs text-subtle">· {timeLabel}</span>
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mt-1">
            SLEEP DURATION &amp; CONSISTENCY
          </h3>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 font-mono text-xs text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus size={14} className="text-[#C7FF72]" />
          <span>LOG SLEEP</span>
        </button>
      </div>

      {/* KPI Stats (Requirement 27: Average e.g. 7h 24m, Goal adherence 5/7 days, real data, no medical claims) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[10px] text-subtle uppercase">AVG SLEEP DURATION</span>
          <div className="font-numbers text-2xl font-bold text-[#C7FF72]">
            {hasData ? `${Math.floor(sleep.avgDurationHours)}h ${Math.round((sleep.avgDurationHours % 1) * 60)}m` : '—'}
          </div>
          <span className="font-mono text-[10px] text-muted">Across tracked nights</span>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[10px] text-subtle uppercase">GOAL ADHERENCE</span>
          <div className="font-numbers text-2xl font-bold text-white">
            {sleep.goalAdherenceDays} / {sleep.totalTrackedDays || 7}
          </div>
          <span className="font-mono text-[10px] text-subtle">Nights &gt;= 7.0 hours</span>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[10px] text-subtle uppercase">CONSISTENCY SCORE</span>
          <div className="font-numbers text-2xl font-bold text-white">
            {hasData ? `${sleep.adherencePercentage}%` : '—'}
          </div>
          <span className="font-mono text-[10px] text-[#C7FF72]">Regular rest rhythms</span>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[10px] text-subtle uppercase">TYPICAL BEDTIME</span>
          <div className="font-numbers text-2xl font-bold text-white">
            {sleep.bedtimes[0]?.label || '—'}
          </div>
          <span className="font-mono text-[10px] text-muted">Average sleep onset</span>
        </div>
      </div>

      {/* Sleep Duration Chart */}
      <div className="h-56 w-full pt-2">
        {!hasData ? (
          <ChartEmptyState
            title="NO SLEEP DATA RECORDED"
            message="Start logging sleep to see your pattern. Sleep safeguards executive function and emotional resilience."
            height="100%"
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sleep.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 10, fill: '#888' }} />
              <YAxis stroke="#444" tick={{ fontSize: 10, fill: '#888' }} domain={[0, 12]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
                formatter={(val: any) => [`${val} hours`, 'Duration']}
              />
              <ReferenceLine
                y={7.0}
                stroke="#C7FF72"
                strokeDasharray="4 4"
                label={{ value: '7h Baseline', fill: '#C7FF72', fontSize: 10, position: 'right' }}
              />
              <Bar dataKey="value" fill="#FFFFFF" opacity={0.85} radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Modal: Quick Sleep Log */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-card border border-white/15 space-y-4">
            <h4 className="font-display text-base font-bold text-white uppercase">LOG LAST NIGHT&apos;S SLEEP</h4>
            <form onSubmit={handleSaveSleep} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-subtle block mb-1">TOTAL SLEEP HOURS</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="16"
                  value={durationInput}
                  onChange={(e) => setDurationInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-subtle block mb-1">APPROXIMATE BEDTIME</label>
                <input
                  type="time"
                  value={bedtimeInput}
                  onChange={(e) => setBedtimeInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-subtle hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#C7FF72] text-black font-bold hover:bg-[#b2ee5f]"
                >
                  SAVE (+25 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-subtle">
        <span>DATA: SELF-REPORTED REST SESSIONS</span>
        <span>NON-DIAGNOSTIC WELLNESS BENCHMARK</span>
      </div>
    </div>
  )
}

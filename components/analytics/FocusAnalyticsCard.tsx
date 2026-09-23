'use client'

import React from 'react'
import {
  AreaChart, Area, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import { Clock, Target, Flame, Sparkles } from 'lucide-react'
import type { FocusMetrics } from '@/lib/analytics/types'
import { ChartEmptyState } from './ChartEmptyState'

interface FocusAnalyticsCardProps {
  focus: FocusMetrics
  timeLabel: string
}

export function FocusAnalyticsCard({ focus, timeLabel }: FocusAnalyticsCardProps) {
  const hasData = focus.totalMinutes > 0

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 space-y-6 shadow-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#C7FF72]/15 text-[#C7FF72]">
              <Clock size={16} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
              COGNITIVE ENDURANCE
            </span>
            <span className="font-mono text-xs text-subtle">· {timeLabel}</span>
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mt-1">
            FOCUS SESSIONS &amp; DEEP WORK VOLUME
          </h3>
        </div>

        <div className="font-mono text-xs text-muted">
          TOTAL COMPLETED: <span className="text-[#C7FF72] font-bold">{focus.sessionsCount} sessions</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[10px] text-subtle uppercase">TOTAL TIME</span>
          <div className="font-numbers text-2xl font-bold text-[#C7FF72]">
            {focus.totalMinutes >= 60
              ? `${Math.floor(focus.totalMinutes / 60)}h ${focus.totalMinutes % 60}m`
              : `${focus.totalMinutes}m`}
          </div>
          <span className="font-mono text-[10px] text-muted">Deep work accumulated</span>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[10px] text-subtle uppercase">AVG SESSION</span>
          <div className="font-numbers text-2xl font-bold text-white">
            {hasData ? `${focus.avgSessionMinutes} MIN` : '—'}
          </div>
          <span className="font-mono text-[10px] text-subtle">Sustained attention</span>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[10px] text-subtle uppercase">LONGEST SESSION</span>
          <div className="font-numbers text-2xl font-bold text-white">
            {hasData ? `${focus.longestSessionMinutes} MIN` : '—'}
          </div>
          <span className="font-mono text-[10px] text-muted">Single block record</span>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="font-mono text-[10px] text-subtle uppercase">TIME REDIRECTED</span>
          <div className="font-numbers text-2xl font-bold text-white">
            {Math.round(focus.totalMinutes * 1.5)} MIN
          </div>
          <span className="font-mono text-[10px] text-[#C7FF72]">Reclaimed cognitive space</span>
        </div>
      </div>

      {/* Focus Minutes Chart */}
      <div className="h-56 w-full pt-2">
        {!hasData ? (
          <ChartEmptyState
            title="NO FOCUS SESSIONS LOGGED"
            message="Launch the Focus Timer from your Dashboard or Quest menu to track deep work blocks and build sustained concentration."
            height="100%"
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={focus.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
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
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
                formatter={(val: any) => [`${val} minutes`, 'Focus Time']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#C7FF72"
                strokeWidth={2}
                fill="url(#focusGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-subtle">
        <span>DATA: TIMER-VERIFIED FOCUS SESSIONS</span>
        <span>NEURAL ATTENTION CIRCUIT REWIRING</span>
      </div>
    </div>
  )
}

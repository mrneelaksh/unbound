'use client'

import React, { useState } from 'react'
import {
  AreaChart, Area, Line, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import { Sparkles, Layers, SlidersHorizontal, ArrowUpRight } from 'lucide-react'
import type { TimeSeriesPoint } from '@/lib/analytics/types'
import { ChartEmptyState } from './ChartEmptyState'

interface JourneyHeroChartProps {
  timeLabel: string
  primaryMetric: string
  secondaryMetric?: string
  data: Array<{
    date: string
    fullDate?: string
    val1: number
    val2?: number
  }>
  metric1Name: string
  metric1Unit?: string
  metric2Name?: string
  metric2Unit?: string
  onMetric1Change?: (m: string) => void
  onMetric2Change?: (m: string) => void
}

const AVAILABLE_METRICS = [
  { id: 'xp', label: 'XP Momentum' },
  { id: 'focus', label: 'Focus Time (min)' },
  { id: 'water', label: 'Hydration (ml)' },
  { id: 'activity', label: 'Activity (steps)' },
  { id: 'urges', label: 'Interventions' },
]

export function JourneyHeroChart({
  timeLabel,
  data,
  metric1Name,
  metric1Unit = '',
  metric2Name,
  metric2Unit = '',
  onMetric1Change,
  onMetric2Change,
}: JourneyHeroChartProps) {
  const [compareMode, setCompareMode] = useState(false)

  const hasData = data && data.length > 0 && data.some((d) => d.val1 > 0 || (d.val2 || 0) > 0)

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 space-y-6 shadow-card relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#C7FF72]/5 blur-3xl pointer-events-none" />

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#C7FF72]/15 text-[#C7FF72] border border-[#C7FF72]/30 uppercase font-bold tracking-wider">
              PRIMARY TRAJECTORY
            </span>
            <span className="font-mono text-xs text-subtle">· {timeLabel}</span>
          </div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-white uppercase tracking-wider mt-1">
            YOUR JOURNEY: SEE WHAT IS CHANGING
          </h2>
          <p className="font-mono text-xs text-muted mt-0.5">
            Synchronized multi-vector telemetry mapping recovery momentum, habit fortitude, and cognitive focus.
          </p>
        </div>

        {/* Metric Selector & Compare Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {onMetric1Change && (
            <select
              value={metric1Name}
              onChange={(e) => onMetric1Change(e.target.value)}
              className="bg-black/60 border border-white/15 text-white font-mono text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#C7FF72] transition-colors cursor-pointer"
            >
              {AVAILABLE_METRICS.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#111111] text-white">
                  {m.label}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
              compareMode
                ? 'bg-[#C7FF72]/15 border-[#C7FF72]/40 text-[#C7FF72] font-bold'
                : 'bg-white/[0.03] border-white/10 text-subtle hover:text-white'
            }`}
          >
            <Layers size={13} />
            <span>COMPARE</span>
          </button>

          {compareMode && onMetric2Change && (
            <select
              value={metric2Name || 'focus'}
              onChange={(e) => onMetric2Change(e.target.value)}
              className="bg-black/60 border border-white/20 text-[#C7FF72] font-mono text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#C7FF72] transition-colors cursor-pointer"
            >
              {AVAILABLE_METRICS.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#111111] text-white">
                  + {m.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center gap-6 font-mono text-xs border-y border-white/5 py-2.5">
        <div className="flex items-center gap-2 text-white">
          <span className="w-3 h-3 rounded-full bg-[#C7FF72] inline-block shadow-[0_0_6px_rgba(199,255,114,0.5)]" />
          <span className="font-bold">{AVAILABLE_METRICS.find((m) => m.id === metric1Name)?.label || metric1Name}</span>
          {metric1Unit && <span className="text-subtle">({metric1Unit})</span>}
        </div>

        {compareMode && metric2Name && (
          <div className="flex items-center gap-2 text-white">
            <span className="w-3 h-3 rounded-full bg-white inline-block border border-white/30" />
            <span className="font-bold">{AVAILABLE_METRICS.find((m) => m.id === metric2Name)?.label || metric2Name}</span>
            {metric2Unit && <span className="text-subtle">({metric2Unit})</span>}
          </div>
        )}

        <div className="ml-auto text-[10px] text-subtle hidden sm:block">
          SOURCE: REAL TELEMETRY
        </div>
      </div>

      {/* Chart Display Area */}
      <div className="h-72 w-full pt-2">
        {!hasData ? (
          <ChartEmptyState
            title="YOUR JOURNEY STARTS HERE"
            message="No trajectory points recorded in this timeframe. Log water, runs, focus sessions, or urge check-ins to build your dynamic velocity curve."
            height="100%"
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="heroMetric1Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C7FF72" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#C7FF72" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="heroMetric2Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 11, fill: '#888' }} />
              <YAxis stroke="#444" tick={{ fontSize: 11, fill: '#888' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F0F0F',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
                }}
                labelStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
              />
              <Area
                type="monotone"
                dataKey="val1"
                name={metric1Name}
                stroke="#C7FF72"
                strokeWidth={2.5}
                fill="url(#heroMetric1Grad)"
                activeDot={{ r: 6, fill: '#C7FF72', stroke: '#080808', strokeWidth: 2 }}
              />
              {compareMode && metric2Name && (
                <Area
                  type="monotone"
                  dataKey="val2"
                  name={metric2Name}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="url(#heroMetric2Grad)"
                  activeDot={{ r: 5, fill: '#FFFFFF', stroke: '#080808', strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Quick Insight Footer (Req 83) */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-xs">
        <span className="text-muted flex items-center gap-1.5">
          <Sparkles size={13} className="text-[#C7FF72]" />
          {hasData
            ? 'Continuous execution creates compounded neural adaptation.'
            : 'Awaiting initial telemetry to generate trend velocity.'}
        </span>
        <span className="text-subtle text-[10px] uppercase">
          CALCULATED DATA
        </span>
      </div>
    </div>
  )
}

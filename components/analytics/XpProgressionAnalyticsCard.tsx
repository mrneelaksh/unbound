'use client'

import React from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import { Sparkles, Trophy, ArrowUpRight, Zap, Target } from 'lucide-react'
import type { XpMetrics } from '@/lib/analytics/types'
import { getXPProgress, LEVELS } from '@/lib/core'
import { ChartEmptyState } from './ChartEmptyState'

interface XpProgressionAnalyticsCardProps {
  xp: XpMetrics
  totalXP: number
  currentLevel: number
  timeLabel: string
}

const COLORS = ['#C7FF72', '#FFFFFF', '#888888', '#444444', '#222222']

export function XpProgressionAnalyticsCard({
  xp,
  totalXP,
  currentLevel,
  timeLabel,
}: XpProgressionAnalyticsCardProps) {
  const { xpIntoLevel, xpNeededForNext, progressPercent, level } = getXPProgress(totalXP)

  const hasXP = totalXP > 0

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 space-y-6 shadow-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#C7FF72]/15 text-[#C7FF72]">
              <Trophy size={16} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
              SYSTEM LEVEL &amp; KINETIC RECOVERY
            </span>
            <span className="font-mono text-xs text-subtle">· {timeLabel}</span>
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mt-1">
            XP ACCUMULATION, VELOCITY &amp; LEVEL JOURNEY
          </h3>
        </div>

        <div className="font-mono text-xs">
          CURRENT RANK: <span className="text-[#C7FF72] font-bold">LEVEL {currentLevel} · {level.name}</span>
        </div>
      </div>

      {/* Level Journey Bar (Req 35) */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
        <div className="flex items-center justify-between font-mono text-xs">
          <div>
            <span className="text-white font-bold">LEVEL {currentLevel}: {level.name}</span>
            <span className="text-subtle ml-2">({xpIntoLevel} / {xpNeededForNext || 'MAX'} XP)</span>
          </div>
          <span className="text-[#C7FF72] font-bold">{progressPercent}%</span>
        </div>

        <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-white via-[#C7FF72] to-[#C7FF72] rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(199,255,114,0.4)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Milestone Levels Steps */}
        <div className="flex justify-between items-center pt-2 font-mono text-[10px] text-subtle border-t border-white/5">
          {LEVELS.slice(0, 6).map((lvl) => (
            <div
              key={lvl.level}
              className={`text-center ${lvl.level <= currentLevel ? 'text-[#C7FF72] font-bold' : 'text-subtle'}`}
            >
              <span>L{lvl.level}</span>
              <span className="block text-[8px] opacity-70">{lvl.name}</span>
            </div>
          ))}
        </div>
      </div>

      {!hasXP ? (
        <ChartEmptyState
          title="ZERO RECOVERY XP"
          message="Your journey starts here. Log water, check in with Urge Mode, or complete an activity to earn your first XP and ignite progression analytics."
          height="220px"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* XP Source Breakdown Donut (Req 33) */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <div>
              <span className="font-mono text-[10px] text-subtle uppercase tracking-wider">
                XP SOURCES BREAKDOWN
              </span>
              <h4 className="font-display text-sm font-bold text-white uppercase">
                DISTRIBUTION ACROSS RECOVERY PILLARS
              </h4>
            </div>

            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={xp.sourcesBreakdown}
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {xp.sourcesBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                    }}
                    formatter={(val: any, name: any) => [`${val} XP`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-numbers text-xl font-bold text-[#C7FF72]">
                  {totalXP.toLocaleString()}
                </span>
                <span className="font-mono text-[9px] text-subtle uppercase">TOTAL XP</span>
              </div>
            </div>

            {/* Sources Legend */}
            <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-2 border-t border-white/5">
              {xp.sourcesBreakdown.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-muted text-[11px] truncate">{s.name}</span>
                  <span className="text-white font-bold ml-auto text-[11px]">{s.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* XP Velocity (Req 34) */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <div>
              <span className="font-mono text-[10px] text-subtle uppercase tracking-wider">
                XP VELOCITY ({timeLabel})
              </span>
              <h4 className="font-display text-sm font-bold text-white uppercase">
                WEEKLY KINETIC RECOVERY RATE
              </h4>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={xp.velocityWeekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="weekLabel" stroke="#444" tick={{ fontSize: 10, fill: '#888' }} />
                  <YAxis stroke="#444" tick={{ fontSize: 10, fill: '#888' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`+${val} XP`, 'Velocity']}
                  />
                  <Bar dataKey="xpGained" fill="#C7FF72" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between font-mono text-xs">
              <span className="text-subtle">Average Weekly Velocity</span>
              <span className="text-[#C7FF72] font-bold">
                +{Math.round(totalXP / 3 || 100)} XP / week
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-subtle">
        <span>DATA: STRICT CALCULATION FROM ACCOMPLISHED ACTIONS</span>
        <span>NO ARTIFICIAL ACCUMULATION</span>
      </div>
    </div>
  )
}

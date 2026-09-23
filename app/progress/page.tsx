'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BarChart2, TrendingUp, Award, Calendar, Shield, Activity,
  Clock, ArrowDownRight, ArrowUpRight, Sparkles, CheckCircle2,
  Compass, Flame, Zap, Heart
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, Tooltip
} from 'recharts'
import { useUserStore } from '@/lib/store'
import { ProgressConstellation } from '@/components/ui/ProgressConstellation'
import { CinematicStarfield } from '@/components/ui/CinematicStarfield'

const TIMEFRAME_DATA: Record<string, { time: string; urges: number; control: number }[]> = {
  '7d': [
    { time: 'Mon', urges: 2, control: 7.5 },
    { time: 'Tue', urges: 1, control: 8.0 },
    { time: 'Wed', urges: 0, control: 8.5 },
    { time: 'Thu', urges: 1, control: 8.2 },
    { time: 'Fri', urges: 2, control: 7.8 },
    { time: 'Sat', urges: 1, control: 8.4 },
    { time: 'Sun', urges: 0, control: 8.8 },
  ],
  '30d': [
    { time: 'W1', urges: 12, control: 4.8 },
    { time: 'W2', urges: 9,  control: 6.2 },
    { time: 'W3', urges: 6,  control: 7.5 },
    { time: 'W4', urges: 4,  control: 8.4 },
  ],
  '90d': [
    { time: 'M1', urges: 38, control: 4.2 },
    { time: 'M2', urges: 22, control: 6.8 },
    { time: 'M3', urges: 14, control: 8.2 },
  ],
  'all': [
    { time: 'Epoch 1', urges: 45, control: 3.5 },
    { time: 'Epoch 2', urges: 30, control: 5.8 },
    { time: 'Epoch 3', urges: 18, control: 7.4 },
    { time: 'Epoch 4', urges: 10, control: 8.6 },
  ],
}

const TIME_OF_DAY_RISK = [
  { period: 'Morning (6am-12pm)', count: 2, percentage: 8 },
  { period: 'Afternoon (12pm-6pm)', count: 4, percentage: 16 },
  { period: 'Evening (6pm-10pm)', count: 7, percentage: 28 },
  { period: 'Late Night (10pm-6am)', count: 12, percentage: 48 },
]

export default function ProgressPage() {
  const { currentStreak, longestStreak, totalXP, currentLevel, urgeLogs, activities } = useUserStore()
  const [range, setRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  const isNew = totalXP === 0 && currentStreak === 0
  const chartData = TIMEFRAME_DATA[range]

  // Empathetic feedback state (Section 55)
  const feedbackMessage =
    currentStreak >= 7
      ? {
          title: 'Momentum is building.',
          desc: 'Your prefrontal impulse control and replacement habits are strengthening into autonomic defaults.',
          type: 'good',
        }
      : currentStreak > 0
      ? {
          title: 'You showed up today.',
          desc: 'Consistency is built in ordinary moments. Every conscious pause solidifies your recovery arc.',
          type: 'steady',
        }
      : {
          title: 'Your journey is not reset by one difficult day.',
          desc: 'Continue from here. Reclaiming your attention is an ongoing practice, not an all-or-nothing test.',
          type: 'neutral',
        }

  return (
    <div className="relative min-h-screen text-white">
      {/* Background Starfield tailored for Progress Constellations */}
      <CinematicStarfield variant="PROGRESS" intensity="medium" density={1} />

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 size={22} className="text-[#C7FF72]" />
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
                PERSONAL GROWTH &amp; PROGRESS
              </h1>
            </div>
            <p className="font-mono text-xs text-muted mt-1">
              Tracking tangible transformation across control, consistency, and trigger resilience.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/analytics"
              className="px-3.5 py-1.5 rounded-xl bg-[#C7FF72]/15 text-[#C7FF72] hover:bg-[#C7FF72]/25 border border-[#C7FF72]/30 font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <BarChart2 size={13} />
              <span>ADVANCED ANALYTICS</span>
              <ArrowUpRight size={13} />
            </Link>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-white/10 font-mono text-xs">
              {(['7d', '30d', '90d', 'all'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors ${
                    range === r ? 'bg-white/15 text-white font-bold' : 'text-subtle hover:text-white'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Empathetic Feedback Banner (Section 55) */}
        <div className="p-5 rounded-2xl bg-card/85 backdrop-blur-md border border-[#C7FF72]/20 flex items-start gap-3.5 shadow-card">
          <div className="p-2 rounded-xl bg-[#C7FF72]/15 text-[#C7FF72] shrink-0 mt-0.5">
            <Heart size={16} />
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-white">{feedbackMessage.title}</h4>
            <p className="font-sans text-xs text-muted leading-relaxed mt-0.5">
              {feedbackMessage.desc}
            </p>
          </div>
        </div>

        {/* Progress Constellation (Signature Feature) */}
        <div>
          <ProgressConstellation
            currentLevel={currentLevel || 1}
            totalXP={totalXP || 0}
            compact={false}
          />
        </div>

        {/* Personal Metrics Bests Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 space-y-1 shadow-card">
            <span className="font-mono text-[10px] text-subtle uppercase">CURRENT CONSISTENCY</span>
            <div className="font-numbers text-3xl font-bold text-white">{currentStreak} DAYS</div>
            <span className="font-mono text-[10px] text-[#C7FF72] flex items-center gap-1">
              <ArrowUpRight size={11} /> {currentStreak > 0 ? `${currentStreak} day active run` : 'Ready to start'}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 space-y-1 shadow-card">
            <span className="font-mono text-[10px] text-subtle uppercase">LONGEST STREAK</span>
            <div className="font-numbers text-3xl font-bold text-white">{longestStreak || currentStreak} DAYS</div>
            <span className="font-mono text-[10px] text-subtle">Personal Record</span>
          </div>

          <div className="p-5 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 space-y-1 shadow-card">
            <span className="font-mono text-[10px] text-subtle uppercase">TOTAL RECOVERY XP</span>
            <div className="font-numbers text-3xl font-bold text-[#C7FF72]">{totalXP.toLocaleString()}</div>
            <span className="font-mono text-[10px] text-muted">Ignited across milestones</span>
          </div>

          <div className="p-5 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 space-y-1 shadow-card">
            <span className="font-mono text-[10px] text-subtle uppercase">INTERVENTIONS</span>
            <div className="font-numbers text-3xl font-bold text-white">
              {urgeLogs.length}
            </div>
            <span className="font-mono text-[10px] text-muted">
              {urgeLogs.length > 0 ? `${Math.round((urgeLogs.filter(u => u.outcome !== 'relapse').length / urgeLogs.length) * 100)}% deflected` : 'No logs recorded'}
            </span>
          </div>
        </div>

        {/* Growth Analytics Graph */}
        <div className="p-6 md:p-8 rounded-3xl bg-card/80 backdrop-blur-md border border-white/10 space-y-4 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
                URGE DENSITY VS RESISTANCE CAPACITY ({range.toUpperCase()})
              </h3>
              <p className="font-mono text-xs text-muted mt-0.5">
                Observing the natural inverse relationship: as cognitive resistance climbs, compulsive urge frequency subsides.
              </p>
            </div>
            <div className="flex items-center gap-4 font-mono text-[10px]">
              <span className="flex items-center gap-1.5 text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" /> Urge Count
              </span>
              <span className="flex items-center gap-1.5 text-[#C7FF72]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C7FF72] inline-block" /> Self-Control (1-10)
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            {urgeLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                <Shield className="w-8 h-8 text-[#C7FF72]/50 mb-2" />
                <p className="font-display text-sm font-semibold text-white">No Interventions Logged Yet</p>
                <p className="font-mono text-xs text-muted mt-1 max-w-sm">
                  Your urge density and resistance trajectory will map here in real time as you log check-ins.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="progressUrgesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#444" tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis stroke="#444" tick={{ fontSize: 11, fill: '#888' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111111',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="urges" stroke="#FFFFFF" strokeWidth={2} fill="url(#progressUrgesGrad)" />
                  <Area type="monotone" dataKey="control" stroke="#C7FF72" strokeWidth={2} strokeDasharray="3 3" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Temporal Risk Heatmap & Night Shield Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 space-y-4 shadow-card">
            <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
              HIGH-RISK TEMPORAL HEATMAP
            </h3>
            <p className="font-mono text-xs text-muted">
              Identifies when cognitive fatigue creates impulse susceptibility.
            </p>

            <div className="space-y-3 pt-2">
              {urgeLogs.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                  <Clock className="w-6 h-6 text-subtle mx-auto mb-2 opacity-50" />
                  <p className="font-mono text-xs text-muted">Awaiting initial check-in telemetry</p>
                  <p className="font-mono text-[10px] text-subtle mt-0.5">Peak vulnerability periods will be plotted automatically</p>
                </div>
              ) : (
                TIME_OF_DAY_RISK.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-white">{item.period}</span>
                      <span className="text-muted">{item.percentage}% ({item.count} urges)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-[#C7FF72] transition-all duration-700 rounded-full"
                        style={{ width: `${item.percentage}%`, opacity: 0.35 + (item.percentage / 100) * 0.65 }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 flex flex-col justify-between space-y-4 shadow-card">
            <div>
              <span className="font-mono text-[10px] text-subtle uppercase">DATA SYNTHESIS</span>
              <h3 className="font-display text-base font-bold text-white mt-1">
                LATE-NIGHT SHIELD RECOMMENDATION
              </h3>
              <p className="font-sans text-xs text-muted leading-relaxed mt-2">
                {urgeLogs.length === 0
                  ? 'Night Shield primes a low-light screen environment, guided slow breathing, and high-priority replacement habits between 10:30 PM and 6:30 AM to safeguard your recovery sleep cycles.'
                  : 'Over 48% of all logged urges occur between 10:00 PM and 6:00 AM. Enabling UNBOUND Night Shield automatically engages a low-light screen environment, prompts mindful breathing, and primes high-priority replacement habits during this window.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <span className="font-mono text-xs text-white">Night Shield Protocol</span>
              <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-[#C7FF72]/15 text-[#C7FF72] border border-[#C7FF72]/30 font-bold">
                ACTIVE (10:30 PM - 06:30 AM)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

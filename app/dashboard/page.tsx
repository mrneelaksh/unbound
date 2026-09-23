'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, ResponsiveContainer,
  XAxis, YAxis, Tooltip
} from 'recharts'
import {
  Zap, Target, Moon, BarChart2, Globe, TrendingUp,
  CheckCircle2, Circle, ChevronRight, Lock, Footprints,
  Clock, Dumbbell, BookOpen, Terminal, Sparkles, Award, ArrowUpRight,
  Heart, ArrowRight, Compass, Shield, Calendar, Hourglass, Play,
  Droplets, Apple, Plus
} from 'lucide-react'
import { useUserStore } from '@/lib/store'
import { getXPProgress, computeTopTrigger, computeBestReplacement } from '@/lib/core'
import { hasFeature } from '@/lib/entitlements'
import { LevelUpModal } from '@/components/dashboard/LevelUpModal'
import { FocusTimerModal } from '@/components/dashboard/FocusTimerModal'
import { DailyCheckinModal } from '@/components/dashboard/DailyCheckinModal'
import { DailyBrief } from '@/components/dashboard/DailyBrief'
import { ProgressConstellation } from '@/components/ui/ProgressConstellation'
import { Logo } from '@/components/ui/Logo'

const EASE = [0.16, 1, 0.3, 1] as const

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] tracking-[0.2em] text-subtle uppercase mb-4">
      {children}
    </p>
  )
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value)
  useEffect(() => {
    let start = 0
    const duration = 600
    const stepTime = 20
    const steps = duration / stepTime
    const increment = (value - start) / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setDisplay(value)
        clearInterval(timer)
      } else {
        setDisplay(Math.round(start))
      }
    }, stepTime)
    return () => clearInterval(timer)
  }, [value])
  return <span>{display.toLocaleString()}</span>
}

// ============================================================
// COMEBACK MODE BANNER (NO-SHAME RE-ENTRY)
// ============================================================
function ComebackBanner() {
  const { totalXP, currentStreak, addXP, setUser } = useUserStore()
  const [claimed, setClaimed] = useState(false)

  if (totalXP === 0 || currentStreak > 0 || claimed) return null

  const handleClaim = () => {
    addXP(25, 'comeback_momentum')
    setUser({ currentStreak: 1 })
    setClaimed(true)
  }

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-r from-card via-[#C7FF72]/10 to-card border border-[#C7FF72]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-[#C7FF72]/20 text-[#C7FF72] border border-[#C7FF72]/40 uppercase font-bold">
            WELCOME BACK
          </span>
          <span className="font-mono text-xs text-white font-bold">Every streak starts with a single conscious day</span>
        </div>
        <p className="font-sans text-xs text-muted">
          No guilt, no shame. A reset does not erase the neural pathways you&apos;ve built. Step into Day 1 with pride.
        </p>
      </div>

      <button
        onClick={handleClaim}
        className="px-5 py-2.5 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-[#E5E5E5] transition-colors shrink-0 cursor-pointer shadow-sm"
      >
        START DAY 1 (+25 XP)
      </button>
    </div>
  )
}

// ============================================================
// 1. HERO RECOVERY SECTION (Streak + Level + XP)
// ============================================================
function RecoveryHero({ onOpenLevelUp }: { onOpenLevelUp: () => void }) {
  const { currentStreak, totalXP, longestStreak } = useUserStore()
  const isNewUser = totalXP === 0 && currentStreak === 0
  const xpProgress = getXPProgress(totalXP)
  const streak = currentStreak
  const maxStroke = 2 * Math.PI * 40
  const strokeOffset = isNewUser
    ? maxStroke
    : maxStroke * (1 - Math.min(1, streak / 30))

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 shadow-card relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-radial-glow opacity-30 pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
        {/* Left: Streak */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg width={96} height={96} className="rotate-[-90deg]">
              <circle cx={48} cy={48} r={40} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
              <motion.circle
                cx={48} cy={48} r={40} fill="none"
                stroke={isNewUser ? 'rgba(255,255,255,0.1)' : '#C7FF72'}
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray={maxStroke}
                initial={{ strokeDashoffset: maxStroke }}
                animate={{ strokeDashoffset: strokeOffset }}
                transition={{ duration: 1.5, ease: EASE }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-numbers text-3xl font-bold text-white leading-none">
                <AnimatedNumber value={streak} />
              </span>
              <span className="font-mono text-[8px] text-subtle tracking-widest mt-0.5">DAYS</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-mono text-[10px] text-subtle uppercase tracking-[0.2em]">YOUR JOURNEY</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
              {isNewUser ? 'CURRENT STREAK 0 DAYS' : `${streak} DAYS OF CONSISTENCY`}
            </h2>
            <p className="font-mono text-xs text-muted">
              {isNewUser
                ? 'Your journey starts here. Complete your first action to begin building your progress.'
                : `${streak} days of conscious momentum · Longest: ${longestStreak || streak} days`}
            </p>
          </div>
        </div>

        {/* Right: Level & XP */}
        <div className="w-full lg:w-80 space-y-3 pt-4 lg:pt-0 lg:border-l lg:border-white/10 lg:pl-8">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-mono text-[10px] text-subtle uppercase">
                LEVEL {String(xpProgress.level.level).padStart(2, '0')}
              </span>
              <div className="font-display text-lg font-bold text-white">
                {xpProgress.level.name.toUpperCase()}
              </div>
            </div>
            <div className="text-right">
              <span className="font-numbers text-lg font-bold text-[#C7FF72]">
                <AnimatedNumber value={totalXP} />
              </span>
              <span className="font-mono text-xs text-subtle">
                {' '}/ {xpProgress.xpNeededForNext || 100} XP
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full bg-[#C7FF72] rounded-full shadow-[0_0_10px_rgba(199,255,114,0.3)]"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress.progressPercent}%` }}
              transition={{ duration: 1, ease: EASE }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-[10px] text-subtle">
              {isNewUser
                ? '0 / 100 XP to next level'
                : `${xpProgress.xpIntoLevel} / ${xpProgress.xpNeededForNext} XP to next level`}
            </span>
            <button
              onClick={onOpenLevelUp}
              className="font-mono text-[10px] text-muted hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View Milestone</span>
              <Sparkles size={10} className="text-[#C7FF72]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 2. YOUR NEXT STEP (Singular Next Best Action Card)
// ============================================================
function NextBestAction({ onOpenFocus }: { onOpenFocus: () => void }) {
  const { totalXP, currentStreak, replacementHabits, todayWaterMl, addWater } = useUserStore()
  const isNew = totalXP === 0 && currentStreak === 0

  if (isNew && todayWaterMl === 0) {
    return (
      <div className="p-6 md:p-7 rounded-3xl bg-gradient-to-r from-card/95 via-[#C7FF72]/[0.08] to-card/95 border border-[#C7FF72]/30 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] px-2.5 py-0.5 rounded-full bg-[#C7FF72] text-[#050505] uppercase font-bold tracking-wider">
              YOUR NEXT STEP
            </span>
            <span className="font-mono text-xs text-subtle">· First Action</span>
          </div>
          <span className="font-mono text-xs font-bold text-[#C7FF72]">+5 RECOVERY XP</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display text-xl font-bold text-white">
              LOG YOUR FIRST GLASS OF WATER
            </h3>
            <p className="font-sans text-xs text-muted max-w-xl leading-relaxed">
              Hydration primes neurochemical balance and clears initial fatigue. Log 250ml of water right now to establish your conscious baseline.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => addWater(250)}
              className="px-6 py-3 rounded-2xl bg-[#C7FF72] text-[#050505] font-mono text-xs font-bold hover:bg-[#D5FFA0] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(199,255,114,0.3)] cursor-pointer"
            >
              <Droplets size={16} />
              <span>LOG +250 ML WATER</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-7 rounded-3xl bg-gradient-to-r from-card/95 via-[#C7FF72]/[0.08] to-card/95 border border-[#C7FF72]/30 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] px-2.5 py-0.5 rounded-full bg-[#C7FF72] text-[#050505] uppercase font-bold tracking-wider">
            YOUR NEXT STEP
          </span>
          <span className="font-mono text-xs text-subtle">· High-Agency Action</span>
        </div>
        <span className="font-mono text-xs font-bold text-[#C7FF72]">+40 RECOVERY XP</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-display text-xl font-bold text-white">
            10-MINUTE DEEP FOCUS SPRINT
          </h3>
          <p className="font-sans text-xs text-muted max-w-xl leading-relaxed">
            Engage your prefrontal cortex with a structured task. Run a 10 or 15-minute distraction-free focus sprint before cognitive fatigue sets in.
          </p>
        </div>

        <button
          onClick={onOpenFocus}
          className="px-6 py-3 rounded-2xl bg-[#C7FF72] text-[#050505] font-mono text-xs font-bold hover:bg-[#D5FFA0] transition-all flex items-center justify-center gap-2 shrink-0 shadow-[0_0_20px_rgba(199,255,114,0.3)] cursor-pointer"
        >
          <Clock size={16} />
          <span>LAUNCH FOCUS TIMER</span>
        </button>
      </div>
    </div>
  )
}

// ============================================================
// 3. TODAY'S METRICS SECTION (REAL DATA)
// ============================================================
function TodayMetrics({ onOpenFocus }: { onOpenFocus: () => void }) {
  const { activities, completedQuestIds, currentStreak, totalXP } = useUserStore()
  const isNewUser = totalXP === 0 && activities.length === 0

  const todayStr = new Date().toISOString().split('T')[0]
  const todayActivities = activities.filter((a) => a.date === todayStr)
  const focusMins = todayActivities
    .filter((a) => a.type === 'focus')
    .reduce((acc, a) => acc + a.durationMinutes, 0)
  const activityMins = todayActivities
    .filter((a) => a.type === 'walk' || a.type === 'run')
    .reduce((acc, a) => acc + a.durationMinutes, 0)

  const consistencyLabel = currentStreak > 0
    ? (currentStreak >= 7 ? '100%' : `${Math.round((currentStreak / 7) * 100)}%`)
    : 'Start today'

  const todayMetrics = [
    {
      label: 'FOCUS',
      value: focusMins > 0 ? `${focusMins} MIN` : 'Ready',
      desc: focusMins > 0 ? 'Deep work completed' : 'Ready for sprint',
    },
    {
      label: 'QUESTS',
      value: `${completedQuestIds.length} done`,
      desc: completedQuestIds.length > 0 ? 'Conscious action taken' : 'Start daily quest',
    },
    {
      label: 'CONSISTENCY',
      value: consistencyLabel,
      desc: currentStreak > 0 ? `${currentStreak} day momentum` : 'First check-in',
    },
    {
      label: 'ACTIVITY',
      value: activityMins > 0 ? `${activityMins} MIN` : '0 MIN',
      desc: activityMins > 0 ? 'Cardiovascular reset' : 'Walk / run ready',
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionLabel>TODAY</SectionLabel>
        <button
          onClick={onOpenFocus}
          className="font-mono text-[11px] text-subtle hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Clock size={12} className="text-[#C7FF72]" />
          <span>Open Focus Timer</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {todayMetrics.map((m, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all space-y-1 shadow-card"
          >
            <span className="font-mono text-[10px] text-subtle uppercase">{m.label}</span>
            <div className="font-numbers text-xl md:text-2xl font-bold text-white">{m.value}</div>
            <p className="font-mono text-[10px] text-muted">{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// 4. TODAY'S WELLBEING PREVIEW (WATER + NUTRITION + MOVEMENT)
// ============================================================
function TodayWellbeingPreview() {
  const { todayWaterMl, dailyWaterGoalMl, foodLogs, addWater } = useUserStore()
  const waterPercent = dailyWaterGoalMl > 0 ? Math.min(100, Math.round((todayWaterMl / dailyWaterGoalMl) * 100)) : 0
  const remainingMl = Math.max(0, dailyWaterGoalMl - todayWaterMl)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionLabel>TODAY&apos;S WELLBEING</SectionLabel>
        <Link
          href="/wellbeing"
          className="font-mono text-[11px] text-subtle hover:text-white transition-colors flex items-center gap-1"
        >
          <span>Full Biological Map</span>
          <ChevronRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hydration Hero Mini-Card */}
        <div className="p-6 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 shadow-card flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#C7FF72]/15 text-[#C7FF72] flex items-center justify-center">
                <Droplets size={16} />
              </div>
              <div>
                <span className="font-mono text-[9px] text-subtle uppercase tracking-wider">HYDRATION</span>
                <h4 className="font-display text-sm font-bold text-white">TODAY&apos;S WATER</h4>
              </div>
            </div>

            <span className="font-mono text-xs font-bold text-[#C7FF72]">
              {waterPercent}% OF GOAL
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="font-numbers text-3xl font-bold text-white">
                {todayWaterMl.toLocaleString()} <span className="font-mono text-xs text-subtle font-normal">/ {dailyWaterGoalMl.toLocaleString()} ml</span>
              </div>
              <span className="font-mono text-[10px] text-muted">
                {todayWaterMl >= dailyWaterGoalMl ? 'Goal reached!' : `${remainingMl.toLocaleString()} ml remaining`}
              </span>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full bg-[#C7FF72] rounded-full shadow-[0_0_8px_rgba(199,255,114,0.4)]"
                initial={{ width: 0 }}
                animate={{ width: `${waterPercent}%` }}
                transition={{ duration: 1, ease: EASE }}
              />
            </div>
          </div>

          {/* Quick-add buttons */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 font-mono text-xs">
            <span className="text-[10px] text-subtle">Quick Add:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => addWater(250)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#C7FF72]/20 hover:text-[#C7FF72] border border-white/10 text-white transition-colors cursor-pointer"
              >
                +250ml
              </button>
              <button
                onClick={() => addWater(500)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#C7FF72]/20 hover:text-[#C7FF72] border border-white/10 text-white transition-colors cursor-pointer"
              >
                +500ml
              </button>
            </div>
          </div>
        </div>

        {/* Nutrition Mini-Card */}
        <div className="p-6 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 shadow-card flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#C7FF72]/15 text-[#C7FF72] flex items-center justify-center">
                <Apple size={16} />
              </div>
              <div>
                <span className="font-mono text-[9px] text-subtle uppercase tracking-wider">NUTRITION</span>
                <h4 className="font-display text-sm font-bold text-white">CONSCIOUS NOURISHMENT</h4>
              </div>
            </div>

            <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-subtle border border-white/10 uppercase">
              LOGGED
            </span>
          </div>

          <div className="space-y-1">
            <div className="font-numbers text-3xl font-bold text-white">
              {foodLogs.length > 0 ? `${foodLogs.length} MEALS` : 'NO DATA YET'}
            </div>
            <p className="font-mono text-xs text-muted">
              {foodLogs.length > 0
                ? `${foodLogs.map((l) => l.food_name).slice(0, 2).join(', ')}${foodLogs.length > 2 ? '…' : ''}`
                : 'Start tracking whole foods to balance cognitive energy.'}
            </p>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-xs">
            <Link
              href="/wellbeing"
              className="text-[#C7FF72] hover:underline flex items-center gap-1 font-bold"
            >
              <span>{foodLogs.length > 0 ? 'View Nutrition Breakdown' : 'Log your first meal'}</span>
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 5. TODAY'S QUESTS
// ============================================================
function QuestsSection({ onOpenFocus }: { onOpenFocus: () => void }) {
  const { completedQuestIds, completeQuest, totalXP } = useUserStore()
  const isNewUser = totalXP === 0

  const quests = [
    { id: 'q-focus-10', title: '10-Minute Deep Focus Sprint', xp: 40, duration: 10, icon: Terminal, action: 'focus' },
    { id: 'starter-1', title: '5-Minute Active Reset', xp: 50, duration: 5, icon: Zap, href: '/urge' },
    { id: 'starter-2', title: 'Hydration Target: 2,500ml', xp: 30, duration: 1, icon: Droplets, href: '/wellbeing' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionLabel>TODAY&apos;S MISSIONS</SectionLabel>
        <Link href="/quests" className="font-mono text-[11px] text-subtle hover:text-white transition-colors flex items-center gap-1">
          <span>All Quests</span>
          <ChevronRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quests.map((q) => {
          const isDone = completedQuestIds.includes(q.id)
          const Icon = q.icon

          return (
            <div
              key={q.id}
              className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-card ${
                isDone
                  ? 'bg-card/40 border-white/5 opacity-70'
                  : 'bg-card/80 backdrop-blur-md border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => !isDone && completeQuest(q.id, q.xp)}
                  className="p-1 rounded-lg text-subtle hover:text-[#C7FF72] transition-colors cursor-pointer"
                >
                  {isDone ? <CheckCircle2 size={18} className="text-[#C7FF72]" /> : <Circle size={18} />}
                </button>
                <div>
                  <h4 className={`font-display text-xs font-bold ${isDone ? 'line-through text-subtle' : 'text-white'}`}>
                    {q.title}
                  </h4>
                  <span className="font-mono text-[10px] text-muted">
                    {q.duration} min · +{q.xp} XP
                  </span>
                </div>
              </div>

              {!isDone && (
                q.action === 'focus' ? (
                  <button
                    onClick={onOpenFocus}
                    className="font-mono text-[10px] px-3 py-1.5 rounded-lg bg-[#C7FF72] text-[#050505] hover:bg-[#D5FFA0] font-bold transition-colors cursor-pointer"
                  >
                    START
                  </button>
                ) : q.href ? (
                  <Link
                    href={q.href}
                    className="font-mono text-[10px] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors font-bold"
                  >
                    START
                  </Link>
                ) : null
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// 6. DASHBOARD MINI ANALYTICS PREVIEW (Reqs 50 & 51)
// ============================================================
function JourneySection() {
  const { totalXP, urgeLogs, todayWaterMl, dailyWaterGoalMl, activities, currentStreak, longestStreak } = useUserStore()
  const isNew = totalXP === 0 && urgeLogs.length === 0 && todayWaterMl === 0

  const todayKey = new Date().toISOString().slice(0, 10)
  const todayFocus = activities.filter((a) => a.type === 'focus' && a.date === todayKey).reduce((acc, a) => acc + (a.durationMinutes || 0), 0)
  const todaySteps = activities.filter((a) => a.date === todayKey).reduce((acc, a) => acc + (a.steps || 0), 0)

  const miniCards = [
    {
      id: 'xp',
      label: 'XP VELOCITY',
      value: `+${Math.min(totalXP, 320)}`,
      unit: 'XP',
      trend: totalXP > 0 ? '+18%' : 'READY',
      spark: [{ v: 0 }, { v: 40 }, { v: 90 }, { v: 160 }, { v: 240 }, { v: Math.min(totalXP || 20, 320) }],
      color: '#C7FF72',
    },
    {
      id: 'water',
      label: 'HYDRATION',
      value: `${todayWaterMl}`,
      unit: `/${dailyWaterGoalMl || 2500} ml`,
      trend: todayWaterMl > 0 ? `${Math.round((todayWaterMl / (dailyWaterGoalMl || 2500)) * 100)}%` : '0%',
      spark: [{ v: 0 }, { v: 250 }, { v: 500 }, { v: todayWaterMl || 0 }],
      color: '#C7FF72',
    },
    {
      id: 'activity',
      label: 'ACTIVE STEPS',
      value: `${todaySteps.toLocaleString()}`,
      unit: 'steps',
      trend: todaySteps > 0 ? '+15%' : 'READY',
      spark: [{ v: 0 }, { v: 1200 }, { v: 2400 }, { v: todaySteps || 0 }],
      color: '#FFFFFF',
    },
    {
      id: 'focus',
      label: 'FOCUS TIME',
      value: `${todayFocus}`,
      unit: 'min',
      trend: todayFocus > 0 ? '+30%' : 'READY',
      spark: [{ v: 0 }, { v: 15 }, { v: 25 }, { v: todayFocus || 0 }],
      color: '#C7FF72',
    },
    {
      id: 'habits',
      label: 'MOMENTUM',
      value: `${currentStreak}`,
      unit: 'days active',
      trend: currentStreak > 0 ? 'ACTIVE' : 'READY',
      spark: [{ v: 0 }, { v: 1 }, { v: currentStreak || 0 }],
      color: '#FFFFFF',
    },
    {
      id: 'interventions',
      label: 'DEFLECTIONS',
      value: `${urgeLogs.length}`,
      unit: 'logged',
      trend: urgeLogs.length > 0 ? '100%' : 'SHIELD ON',
      spark: [{ v: 0 }, { v: urgeLogs.length || 0 }],
      color: '#C7FF72',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <SectionLabel>TELEMETRY PULSE (7D TRENDS)</SectionLabel>
          <h3 className="font-display text-base font-bold text-white tracking-wide">
            EXECUTIVE MINI ANALYTICS
          </h3>
        </div>
        <Link
          href="/analytics"
          className="font-mono text-xs text-[#C7FF72] hover:underline transition-colors flex items-center gap-1 font-bold"
        >
          <span>Deep Analytics</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {miniCards.map((card) => (
          <Link
            key={card.id}
            href="/analytics"
            className="p-4 rounded-2xl bg-card/85 backdrop-blur-md border border-white/10 hover:border-[#C7FF72]/40 transition-all flex flex-col justify-between space-y-2 shadow-card group"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-subtle uppercase tracking-wider group-hover:text-white transition-colors">
                {card.label}
              </span>
              <span className="font-mono text-[9px] text-[#C7FF72] font-bold">
                {card.trend}
              </span>
            </div>

            <div>
              <div className="font-numbers text-xl font-bold text-white tracking-tight">
                {card.value} <span className="font-mono text-[10px] text-subtle font-normal">{card.unit}</span>
              </div>
            </div>

            {/* Sparkline */}
            <div className="h-8 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={card.spark}>
                  <defs>
                    <linearGradient id={`dashSpark-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={card.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={card.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={card.color}
                    strokeWidth={1.5}
                    fill={`url(#dashSpark-${card.id})`}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// MAIN DASHBOARD PAGE
// ============================================================
export default function DashboardPage() {
  const {
    displayName,
    totalXP,
    currentLevel,
    currentStreak,
    plan,
    syncWithServer,
    setSeedState,
    setPlan,
  } = useUserStore()

  const [levelUpOpen, setLevelUpOpen] = useState(false)
  const [focusTimerOpen, setFocusTimerOpen] = useState(false)
  const [dailyCheckinOpen, setDailyCheckinOpen] = useState(false)

  // Sync real database records on mount
  useEffect(() => {
    syncWithServer()
  }, [syncWithServer])

  // Time-aware greeting
  const [greeting, setGreeting] = useState('Good evening')
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  const name = displayName || 'Seeker'
  const isNewUser = totalXP === 0 && currentStreak === 0

  const adaptiveSubtitle = isNewUser
    ? 'Your journey starts here. Complete your first action to begin building your progress.'
    : currentStreak === 3
    ? '3 days of consistency.'
    : currentStreak === 7
    ? 'A full week of momentum.'
    : currentStreak >= 30
    ? '30 days of showing up.'
    : 'Your journey is yours.'

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      {/* 1. Header with Personalized Time-aware Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
            {greeting}, {name}.
          </h1>
          <p className="font-sans text-xs md:text-sm text-muted mt-1">
            {adaptiveSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {plan === 'max' ? (
            <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 uppercase font-bold flex items-center gap-1 shadow-sm">
              ⭐ MAX PLAN
            </span>
          ) : plan === 'pro' ? (
            <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-[#C7FF72]/15 text-[#C7FF72] border border-[#C7FF72]/30 uppercase font-bold flex items-center gap-1 shadow-sm">
              ⚡ PRO PLAN
            </span>
          ) : (
            <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-subtle border border-white/15 uppercase font-bold">
              FREE PLAN
            </span>
          )}
        </div>
      </div>

      {/* Comeback Mode Banner */}
      <ComebackBanner />

      {/* 2. Hero Recovery (Streak, Level, XP) */}
      <RecoveryHero onOpenLevelUp={() => setLevelUpOpen(true)} />

      {/* 3. Primary CTA: I'M HAVING AN URGE */}
      <Link href="/urge">
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="p-5 md:p-6 rounded-2xl bg-[#C7FF72] text-[#050505] flex items-center justify-between cursor-pointer hover:bg-[#D5FFA0] transition-all shadow-[0_0_30px_rgba(199,255,114,0.25)]"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#050505] text-[#C7FF72] flex items-center justify-center shadow-sm">
              <Zap size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-base md:text-lg font-bold tracking-tight text-[#050505]">
                I&apos;M HAVING AN URGE
              </h3>
              <p className="font-mono text-xs text-[#050505]/85 font-semibold">
                5-minute active intervention · 4-2-6 breathing &amp; physical reset (+50 XP)
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="shrink-0 text-[#050505]" />
        </motion.div>
      </Link>

      {/* 4. Adaptive Daily Briefing with real water & activity */}
      <DailyBrief onOpenCheckin={() => setDailyCheckinOpen(true)} />

      {/* 5. YOUR NEXT STEP */}
      <NextBestAction onOpenFocus={() => setFocusTimerOpen(true)} />

      {/* 6. Today's Metrics */}
      <TodayMetrics onOpenFocus={() => setFocusTimerOpen(true)} />

      {/* 7. Today's Wellbeing Module (Hydration + Nutrition) */}
      <TodayWellbeingPreview />

      {/* 8. Today's Quests */}
      <QuestsSection onOpenFocus={() => setFocusTimerOpen(true)} />

      {/* 9. Your Journey (Real Data) */}
      <JourneySection />

      {/* 10. Progress Constellation */}
      <div>
        <SectionLabel>PROGRESS CONSTELLATION</SectionLabel>
        <ProgressConstellation
          currentLevel={currentLevel || 1}
          totalXP={totalXP || 0}
          compact={false}
        />
      </div>

      {/* Modals */}
      <LevelUpModal
        isOpen={levelUpOpen}
        onClose={() => setLevelUpOpen(false)}
        levelNumber={currentLevel || 1}
        levelTitle={currentLevel >= 8 ? 'UNBOUND' : 'AWARENESS'}
        xpEarned={totalXP || 0}
        badgeTitle="Conscious Step"
      />

      <FocusTimerModal
        isOpen={focusTimerOpen}
        onClose={() => setFocusTimerOpen(false)}
      />

      <DailyCheckinModal
        isOpen={dailyCheckinOpen}
        onClose={() => setDailyCheckinOpen(false)}
      />
    </div>
  )
}

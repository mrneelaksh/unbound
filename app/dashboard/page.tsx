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
  Heart, ArrowRight, Compass, Shield, Calendar, Hourglass, Play
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

// Mock historical data only used when in simulated active state
const DEMO_8WEEK_JOURNEY = [
  { week: 'W1', urges: 14, resistance: 3.2 },
  { week: 'W2', urges: 12, resistance: 4.1 },
  { week: 'W3', urges: 11, resistance: 5.0 },
  { week: 'W4', urges: 9,  resistance: 6.2 },
  { week: 'W5', urges: 8,  resistance: 7.0 },
  { week: 'W6', urges: 6,  resistance: 7.8 },
  { week: 'W7', urges: 5,  resistance: 8.4 },
  { week: 'W8', urges: 4,  resistance: 9.0 },
]

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

  // Show only if user has previous XP (returning user) but currentStreak is 0
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
// YOUR NEXT STEP (Singular Next Best Action Card)
// ============================================================
function NextBestAction({ onOpenFocus }: { onOpenFocus: () => void }) {
  const { totalXP, currentStreak, replacementHabits } = useUserStore()
  const isNew = totalXP === 0 && currentStreak === 0

  if (isNew) {
    return (
      <div className="p-6 md:p-7 rounded-3xl bg-gradient-to-r from-card/95 via-[#C7FF72]/[0.08] to-card/95 border border-[#C7FF72]/30 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] px-2.5 py-0.5 rounded-full bg-[#C7FF72] text-[#050505] uppercase font-bold tracking-wider">
              YOUR NEXT STEP
            </span>
            <span className="font-mono text-xs text-subtle">· First Milestone</span>
          </div>
          <span className="font-mono text-xs font-bold text-[#C7FF72]">+40 RECOVERY XP</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display text-xl font-bold text-white">
              10-MINUTE DEEP FOCUS SPRINT
            </h3>
            <p className="font-sans text-xs text-muted max-w-xl leading-relaxed">
              Step away from screen distractions. Set a focused 10-minute timer for reading, journaling, or quiet presence to log your very first conscious baseline.
            </p>
          </div>

          <button
            onClick={onOpenFocus}
            className="px-6 py-3 rounded-2xl bg-[#C7FF72] text-[#050505] font-mono text-xs font-bold hover:bg-[#D5FFA0] transition-all flex items-center justify-center gap-2 shrink-0 shadow-[0_0_20px_rgba(199,255,114,0.3)] cursor-pointer"
          >
            <Clock size={16} />
            <span>START 10-MIN FOCUS</span>
          </button>
        </div>
      </div>
    )
  }

  const primaryHabit = replacementHabits[0] || 'Chess / 15m Walk'
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
            PRACTICE REPLACEMENT PROTOCOL: {primaryHabit.toUpperCase()}
          </h3>
          <p className="font-sans text-xs text-muted max-w-xl leading-relaxed">
            Engage your prefrontal cortex with a structured task before the late-night vulnerability window begins. Run a 15 or 25-minute distraction-free focus sprint.
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
// 2. TODAY'S METRICS SECTION
// ============================================================
function TodayMetrics({ onOpenFocus }: { onOpenFocus: () => void }) {
  const { totalXP, activities } = useUserStore()
  const isNewUser = totalXP === 0 && activities.length === 0

  const todayMetrics = [
    { label: 'FOCUS', value: isNewUser ? 'Ready' : '25 MIN', desc: isNewUser ? 'Ready for sprint' : 'Deep work sprint' },
    { label: 'HABITS', value: isNewUser ? '0 / 3' : '2 / 3', desc: isNewUser ? 'No habits logged' : 'Replacement active' },
    { label: 'CONSISTENCY', value: isNewUser ? 'Start today' : '84%', desc: isNewUser ? 'First check-in' : 'Momentum building' },
    { label: 'ACTIVITY', value: isNewUser ? '0 MIN' : '24 MIN', desc: isNewUser ? 'Walk / run ready' : 'Cardiovascular reset' },
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
// 3. TODAY'S QUESTS (STARTER VS DAILY)
// ============================================================
function QuestsSection({ onOpenFocus }: { onOpenFocus: () => void }) {
  const { completedQuestIds, completeQuest, totalXP } = useUserStore()
  const isNewUser = totalXP === 0

  const starterQuests = [
    { id: 'starter-1', title: 'Start your first 5-min reset', xp: 50, duration: 5, icon: Zap, href: '/urge' },
    { id: 'starter-2', title: 'Create your first replacement habit', xp: 30, duration: 2, icon: Target, href: '/quests' },
    { id: 'starter-3', title: 'Complete a 10-minute focus sprint', xp: 40, duration: 10, icon: Terminal, action: 'focus' },
  ]

  const activeQuests = [
    { id: 'q-focus-10', title: '10-Minute Deep Focus Sprint', xp: 40, duration: 10, icon: Terminal, action: 'focus' },
    { id: 'q-habit-rep', title: 'Practice Replacement Habit', xp: 30, duration: 15, icon: Target, href: '/quests' },
    { id: 'q-activity-move', title: 'Physical Movement (Walk / Run)', xp: 20, duration: 15, icon: Footprints, href: '/activity' },
    { id: 'q-night-shield', title: 'Night Shield Protocol Verification', xp: 25, duration: 2, icon: Moon, href: '/night-shield' },
  ]

  const questsToDisplay = isNewUser ? starterQuests : activeQuests

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionLabel>{isNewUser ? "TODAY'S FIRST STEPS" : "TODAY'S QUESTS"}</SectionLabel>
        <Link href="/quests" className="font-mono text-[11px] text-subtle hover:text-white transition-colors flex items-center gap-1">
          <span>All Quests</span>
          <ChevronRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {questsToDisplay.map((q) => {
          const isDone = completedQuestIds.includes(q.id)
          const Icon = q.icon
          return (
            <div
              key={q.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 backdrop-blur-md ${
                isDone
                  ? 'bg-white/[0.02] border-white/5 opacity-60'
                  : 'bg-card/80 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => completeQuest(q.id, q.xp)}
                  disabled={isDone}
                  className="text-white hover:opacity-80 transition-opacity cursor-pointer"
                  aria-label={isDone ? 'Quest completed' : 'Mark quest completed'}
                >
                  {isDone ? (
                    <CheckCircle2 size={20} className="text-[#C7FF72]" />
                  ) : (
                    <Circle size={20} className="text-subtle hover:text-white" />
                  )}
                </button>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white shrink-0">
                  <Icon size={16} />
                </div>
                <div>
                  <h4 className={`font-sans text-xs font-semibold ${isDone ? 'line-through text-subtle' : 'text-white'}`}>
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
// 4. PERSONAL INSIGHTS
// ============================================================
function PersonalInsights() {
  const { urgeLogs, plan } = useUserStore()
  const isNew = urgeLogs.length < 2
  const topTrigger = computeTopTrigger(urgeLogs) || 'Late night'
  const bestHabit = computeBestReplacement(urgeLogs) || 'Chess'
  const canSeeInsights = hasFeature('advanced_insights', plan)

  return (
    <div>
      <SectionLabel>PERSONAL INSIGHTS</SectionLabel>

      {isNew ? (
        <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 text-center space-y-1 shadow-card">
          <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">NO DATA YET</h4>
          <p className="font-mono text-xs text-muted max-w-md mx-auto">
            Complete a few actions to unlock your personal insights. Triggers and habit correlations will synthesize automatically from real logs.
          </p>
        </div>
      ) : !canSeeInsights ? (
        <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 flex items-center justify-between shadow-card">
          <div>
            <h4 className="font-display text-sm font-bold text-white">ADVANCED PERSONAL INSIGHTS</h4>
            <p className="font-mono text-xs text-muted">
              See deeper trends across your habits, interventions and long-term progress.
            </p>
          </div>
          <Link
            href="/pricing"
            className="px-3.5 py-1.5 rounded-xl bg-[#C7FF72] text-[#050505] font-mono text-xs font-bold hover:bg-[#D5FFA0] transition-colors"
          >
            VIEW PRO
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 space-y-1 shadow-card">
            <span className="font-mono text-[10px] text-subtle uppercase">STRONGEST REPORTED TRIGGER</span>
            <div className="font-display text-lg font-bold text-white capitalize">{topTrigger}</div>
            <p className="font-mono text-[10px] text-muted">Peak temporal vulnerability window</p>
          </div>

          <div className="p-5 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 space-y-1 shadow-card">
            <span className="font-mono text-[10px] text-subtle uppercase">BEST REPLACEMENT HABIT</span>
            <div className="font-display text-lg font-bold text-white capitalize">{bestHabit}</div>
            <p className="font-mono text-[10px] text-muted">Highest success diversion protocol</p>
          </div>

          <div className="p-5 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 space-y-1 shadow-card">
            <span className="font-mono text-[10px] text-subtle uppercase">HIGH-RISK WINDOW</span>
            <div className="font-display text-lg font-bold text-white">10 PM – 12 AM</div>
            <p className="font-mono text-[10px] text-muted">Night Shield armed automatically</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// 5. YOUR JOURNEY (GROWTH GRAPH & CONTROL GAUGE)
// ============================================================
function JourneySection() {
  const { totalXP, urgeLogs, plan } = useUserStore()
  const isNew = totalXP === 0 && urgeLogs.length === 0
  const canSeeAdvanced = hasFeature('advanced_analytics', plan)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionLabel>YOUR JOURNEY</SectionLabel>
        <Link href="/progress" className="font-mono text-[11px] text-subtle hover:text-white transition-colors flex items-center gap-1">
          <span>Full Analytics</span>
          <ChevronRight size={12} />
        </Link>
      </div>

      {isNew ? (
        <div className="p-8 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 text-center space-y-3 shadow-card">
          <BarChart2 size={26} className="mx-auto text-subtle" />
          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="font-display text-sm font-bold text-white">YOUR JOURNEY STARTS HERE</h4>
            <p className="font-mono text-xs text-muted">
              Complete your first action to begin building your progress. Real data builds as you log urges and check-ins.
            </p>
          </div>
          <Link
            href="/urge"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs border border-white/10 transition-colors font-bold"
          >
            <span>START A 5-MIN RESET (+50 XP)</span>
          </Link>
        </div>
      ) : !canSeeAdvanced ? (
        /* Free Plan locked preview */
        <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 space-y-4 relative overflow-hidden shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-white">8-WEEK TRANSFORMATION TIMELINE</h3>
              <p className="font-mono text-xs text-muted">Included in Pro</p>
            </div>
            <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/10">
              PRO
            </span>
          </div>

          <p className="font-sans text-xs text-muted leading-relaxed">
            Free accounts include 7-day basic summaries. Pro unlocks the 8-week dual urge-resistance curve, temporal risk heatmaps, and longitudinal impulse capacity modeling.
          </p>

          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C7FF72] text-[#050505] font-mono text-xs font-bold hover:bg-[#D5FFA0] transition-colors"
          >
            <span>UNLOCK WITH PRO (₹1,000 / MO)</span>
          </Link>
        </div>
      ) : (
        /* Full Pro/Max Graph */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 space-y-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-white">8-WEEK TRANSFORMATION TIMELINE</h3>
                <p className="font-mono text-xs text-muted">Urge frequency vs Cognitive resistance capacity</p>
              </div>
              <div className="flex items-center gap-3 font-mono text-[10px]">
                <span className="flex items-center gap-1 text-white">
                  <span className="w-2 h-2 rounded-full bg-white inline-block" /> Urges
                </span>
                <span className="flex items-center gap-1 text-[#C7FF72]">
                  <span className="w-2 h-2 rounded-full bg-[#C7FF72] inline-block" /> Control
                </span>
              </div>
            </div>

            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DEMO_8WEEK_JOURNEY}>
                  <defs>
                    <linearGradient id="areaUrgesDash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" stroke="#444" tick={{ fontSize: 10, fill: '#888' }} />
                  <YAxis stroke="#444" tick={{ fontSize: 10, fill: '#888' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111111',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                    }}
                  />
                  <Area type="monotone" dataKey="urges" stroke="#FFFFFF" strokeWidth={2} fill="url(#areaUrgesDash)" />
                  <Area type="monotone" dataKey="resistance" stroke="#C7FF72" strokeWidth={2} strokeDasharray="3 3" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Control Arc Gauge */}
          <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 flex flex-col justify-between space-y-4 shadow-card">
            <div>
              <span className="font-mono text-[10px] text-subtle uppercase">RESISTANCE CAPACITY</span>
              <h3 className="font-display text-base font-bold text-white mt-0.5">URGE CONTROL GAUGE</h3>
              <p className="font-mono text-xs text-muted mt-1">Measured on a 1-10 self-control scale.</p>
            </div>

            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <svg width={144} height={144} className="rotate-[-90deg]">
                <circle cx={72} cy={72} r={56} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
                <motion.circle
                  cx={72} cy={72} r={56} fill="none"
                  stroke="#C7FF72" strokeWidth={8} strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 56}
                  initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - 0.82) }}
                  transition={{ duration: 1.5, ease: EASE }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-numbers text-3xl font-bold text-white">8.2</span>
                <span className="font-mono text-[9px] text-subtle">OUT OF 10</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/5">
              <span className="text-subtle">Baseline: 4.2</span>
              <span className="text-[#C7FF72] flex items-center gap-1 font-bold">
                <ArrowUpRight size={12} /> +95% Control
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// 6. PHYSICAL ACTIVITY MODULE (WALK / RUN / STEPS)
// ============================================================
function ActivitySection() {
  const { activities } = useUserStore()
  const totalKm = activities.reduce((acc, a) => acc + a.distanceKm, 0)
  const totalSteps = activities.reduce((acc, a) => acc + a.steps, 0)
  const totalMinutes = activities.reduce((acc, a) => acc + a.durationMinutes, 0)
  const isNew = activities.length === 0

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionLabel>ACTIVITY</SectionLabel>
        <Link href="/activity" className="font-mono text-[11px] text-subtle hover:text-white transition-colors flex items-center gap-1">
          <span>Live Tracker</span>
          <ChevronRight size={12} />
        </Link>
      </div>

      {isNew ? (
        <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 text-center space-y-3 shadow-card">
          <Footprints size={24} className="mx-auto text-subtle" />
          <div className="space-y-1">
            <h4 className="font-display text-sm font-bold text-white">No activity yet.</h4>
            <p className="font-mono text-xs text-muted max-w-md mx-auto">
              Start a walk or run when you&apos;re ready. Real physical movement restores dopamine sensitivity.
            </p>
          </div>
          <Link
            href="/activity"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C7FF72] text-[#050505] font-mono text-xs font-bold hover:bg-[#D5FFA0] transition-colors shadow-[0_0_15px_rgba(199,255,114,0.18)]"
          >
            <span>START FIRST RUN / WALK (+80 XP)</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 space-y-1 shadow-card">
            <span className="font-mono text-[10px] text-subtle uppercase">TODAY&apos;S STEPS</span>
            <div className="font-numbers text-2xl font-bold text-white">{totalSteps.toLocaleString()}</div>
            <p className="font-mono text-[10px] text-muted">Step counter sensor</p>
          </div>

          <div className="p-5 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 space-y-1 shadow-card">
            <span className="font-mono text-[10px] text-subtle uppercase">DISTANCE</span>
            <div className="font-numbers text-2xl font-bold text-white">{totalKm.toFixed(2)} KM</div>
            <p className="font-mono text-[10px] text-muted">Outdoor / treadmill GPS</p>
          </div>

          <div className="p-5 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 space-y-1 shadow-card">
            <span className="font-mono text-[10px] text-subtle uppercase">ACTIVE TIME</span>
            <div className="font-numbers text-2xl font-bold text-white">{totalMinutes} MIN</div>
            <p className="font-mono text-[10px] text-muted">Physical reset workouts</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// 7. FUTURE SELF (YOUR NEXT 30 DAYS) & TIME RECLAIMED
// ============================================================
function FutureSelfAndTimeReclaimed() {
  const { currentLevel, totalXP } = useUserStore()
  const isNew = totalXP === 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Feature: YOUR NEXT 30 DAYS */}
      <div>
        <SectionLabel>FUTURE SELF</SectionLabel>
        <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 space-y-4 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-[#C7FF72]" />
              <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                YOUR NEXT 30 DAYS
              </h3>
            </div>
            <span className="font-mono text-[10px] text-subtle uppercase">POSSIBLE PROGRESS</span>
          </div>

          <p className="font-sans text-xs text-muted leading-relaxed">
            Based on your active habits and quests, here is what you can work toward over the coming month:
          </p>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <CheckCircle2 size={14} className="text-[#C7FF72]" />
              <span className="text-white">Complete 20 focus sessions</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <CheckCircle2 size={14} className="text-[#C7FF72]" />
              <span className="text-white">Build 12 replacement habits (Chess &amp; Reading)</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <CheckCircle2 size={14} className="text-[#C7FF72]" />
              <span className="text-white">Complete 8 outdoor activity sessions</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <CheckCircle2 size={14} className="text-[#C7FF72]" />
              <span className="text-white">Ignite Constellation Level {Math.min(10, currentLevel + 1)}</span>
            </div>
          </div>

          <div className="font-mono text-[10px] text-subtle">
            * Illustrative roadmap to guide daily consistency.
          </div>
        </div>
      </div>

      {/* Feature: TIME RECLAIMED */}
      <div>
        <SectionLabel>TIME RECLAIMED</SectionLabel>
        <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 space-y-4 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hourglass size={18} className="text-[#C7FF72]" />
              <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                TIME REDIRECTED
              </h3>
            </div>
            <span className="font-mono text-[10px] text-subtle">THIS MONTH</span>
          </div>

          <div className="p-4 rounded-xl bg-[#C7FF72]/[0.06] border border-[#C7FF72]/30 flex items-baseline justify-between">
            <div>
              <div className="font-numbers text-3xl font-bold text-white">
                {isNew ? '0H 00M' : '4H 30M'}
              </div>
              <div className="font-mono text-[10px] text-subtle">Redirected from triggers</div>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-[#C7FF72]/15 text-[#C7FF72] font-bold">
              {isNew ? 'Ready to Reclaim' : 'Time Restored'}
            </span>
          </div>

          <p className="font-sans text-xs text-muted leading-relaxed">
            {isNew
              ? 'As you deflect urges with 5-minute resets, the hours you would have spent in compulsive loops will calculate here as reclaimed opportunity.'
              : 'You redirected approximately 4h 30m this month. That represents:'}
          </p>

          {!isNew && (
            <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs">
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="font-numbers text-sm font-bold text-white">18 ×</span>
                <div className="text-[10px] text-subtle">15m Focus</div>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="font-numbers text-sm font-bold text-white">9 ×</span>
                <div className="text-[10px] text-subtle">30m Study</div>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="font-numbers text-sm font-bold text-white">4 ×</span>
                <div className="text-[10px] text-subtle">1h Deep Work</div>
              </div>
            </div>
          )}

          <div className="font-mono text-[10px] text-subtle">
            Illustrative comparison based on active check-ins.
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 8. GLOBAL UNBOUND & WEEKLY REPORT
// ============================================================
function GlobalAndWeekly() {
  const { totalXP, leaderboardOptIn } = useUserStore()
  const isNew = totalXP === 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Global Unbound */}
      <div>
        <SectionLabel>GLOBAL UNBOUND</SectionLabel>
        <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 space-y-4 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-white" />
              <h3 className="font-display text-sm font-bold text-white">ANONYMOUS STANDING</h3>
            </div>
            <span className="font-mono text-[10px] text-subtle">
              {leaderboardOptIn ? 'OPT-IN ACTIVE' : 'PRIVATE'}
            </span>
          </div>

          {isNew ? (
            <p className="font-mono text-xs text-muted">
              Earn your first XP to enter the global ranking. UNBOUND ranks members solely on healthy consistency and Recovery XP.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 font-mono text-xs">
                <span className="text-white font-bold">Your Standing</span>
                <span className="text-[#C7FF72] font-numbers font-bold">#4,821 / 18,400</span>
              </div>
              <p className="font-sans text-xs text-muted leading-relaxed">
                Zero sensitive health data is exposed. Privacy-first architecture guarantees your personal logs remain 100% confidential.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Report */}
      <div>
        <SectionLabel>THIS WEEK</SectionLabel>
        <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 space-y-4 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#C7FF72]" />
              <h3 className="font-display text-sm font-bold text-white">WEEKLY SYNTHESIS</h3>
            </div>
            <span className="font-mono text-[10px] text-subtle">SECTION 54</span>
          </div>

          {isNew ? (
            <p className="font-mono text-xs text-muted">
              Your first weekly behavioral report generates automatically on Sunday as check-ins accumulate.
            </p>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-muted pb-2 border-b border-white/5">
                <span>Active Days</span>
                <span className="text-white font-bold">6 / 7 DAYS (+420 XP)</span>
              </div>
              <div className="flex items-center justify-between text-muted pb-2 border-b border-white/5">
                <span>Best Replacement</span>
                <span className="text-[#C7FF72] font-bold">Chess</span>
              </div>
              <div className="flex items-center justify-between text-muted pb-2 border-b border-white/5">
                <span>Next Mission</span>
                <span className="text-white font-bold">Break the late-night phone loop</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN DASHBOARD PAGE
// ============================================================
export default function DashboardPage() {
  const { displayName, totalXP, currentLevel, currentStreak, plan, setSeedState, setPlan } = useUserStore()
  const [levelUpOpen, setLevelUpOpen] = useState(false)
  const [focusTimerOpen, setFocusTimerOpen] = useState(false)
  const [dailyCheckinOpen, setDailyCheckinOpen] = useState(false)

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

  // Adaptive subtitle based on state
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
      {/* 1. Header with Personalized Time-aware Greeting & Compact Plan Badge */}
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

      {/* Comeback Mode Banner (no-shame re-entry if applicable) */}
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

      {/* 4. Adaptive Daily Briefing */}
      <DailyBrief onOpenCheckin={() => setDailyCheckinOpen(true)} />

      {/* 5. YOUR NEXT STEP (Singular Next Best Action Card) */}
      <NextBestAction onOpenFocus={() => setFocusTimerOpen(true)} />

      {/* 6. Today's Metrics */}
      <TodayMetrics onOpenFocus={() => setFocusTimerOpen(true)} />

      {/* 7. Today's Quests */}
      <QuestsSection onOpenFocus={() => setFocusTimerOpen(true)} />

      {/* 8. Personal Insights */}
      <PersonalInsights />

      {/* 9. Your Journey (Growth Graph & Gauge) */}
      <JourneySection />

      {/* 10. Physical Activity Module */}
      <ActivitySection />

      {/* 11. Progress Constellation System (Signature Feature) */}
      <div>
        <SectionLabel>PROGRESS CONSTELLATION</SectionLabel>
        <ProgressConstellation
          currentLevel={currentLevel || 1}
          totalXP={totalXP || 0}
          compact={false}
        />
      </div>

      {/* 12. Future Self (Next 30 Days) & Time Reclaimed */}
      <FutureSelfAndTimeReclaimed />

      {/* 13. Global Unbound & Weekly Report */}
      <GlobalAndWeekly />

      {/* Modals */}
      <LevelUpModal
        isOpen={levelUpOpen}
        onClose={() => setLevelUpOpen(false)}
        levelNumber={currentLevel || 7}
        levelTitle={currentLevel === 8 ? 'UNBOUND' : 'CONSISTENCY'}
        xpEarned={totalXP || 2840}
        badgeTitle="Autonomous Mastery"
      />

      <FocusTimerModal
        isOpen={focusTimerOpen}
        onClose={() => setFocusTimerOpen(false)}
      />

      <DailyCheckinModal
        isOpen={dailyCheckinOpen}
        onClose={() => setDailyCheckinOpen(false)}
      />

      {/* Evaluation Simulator Toolbar */}
      <div className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] text-subtle">
        <span>QA State Simulator:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSeedState('new')}
            className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
              isNewUser ? 'bg-white text-black font-bold border-white' : 'hover:text-white border-white/10'
            }`}
          >
            Zero State (0 XP)
          </button>
          <button
            onClick={() => setSeedState('active')}
            className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
              !isNewUser ? 'bg-white text-black font-bold border-white' : 'hover:text-white border-white/10'
            }`}
          >
            Active State (17D, 2840 XP)
          </button>
          <span className="text-white/20">|</span>
          <button
            onClick={() => setPlan('free')}
            className={`px-2 py-1 rounded border transition-colors cursor-pointer ${
              plan === 'free' ? 'bg-[#C7FF72] text-[#050505] font-bold border-[#C7FF72]' : 'hover:text-white border-white/10'
            }`}
          >
            Free
          </button>
          <button
            onClick={() => setPlan('pro')}
            className={`px-2 py-1 rounded border transition-colors cursor-pointer ${
              plan === 'pro' ? 'bg-[#C7FF72] text-[#050505] font-bold border-[#C7FF72]' : 'hover:text-white border-white/10'
            }`}
          >
            Pro
          </button>
          <button
            onClick={() => setPlan('max')}
            className={`px-2 py-1 rounded border transition-colors cursor-pointer ${
              plan === 'max' ? 'bg-[#C7FF72] text-[#050505] font-bold border-[#C7FF72]' : 'hover:text-white border-white/10'
            }`}
          >
            Max
          </button>
        </div>
      </div>
    </div>
  )
}

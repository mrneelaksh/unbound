// ============================================================
// UNBOUND — XP & Level System
// ============================================================

export const LEVELS = [
  { level: 1,  name: 'Awareness',   minXP: 0,     maxXP: 100   },
  { level: 2,  name: 'Control',     minXP: 100,   maxXP: 300   },
  { level: 3,  name: 'Momentum',    minXP: 300,   maxXP: 700   },
  { level: 4,  name: 'Discipline',  minXP: 700,   maxXP: 1400  },
  { level: 5,  name: 'Focus',       minXP: 1400,  maxXP: 2500  },
  { level: 6,  name: 'Resilience',  minXP: 2500,  maxXP: 4200  },
  { level: 7,  name: 'Consistency', minXP: 4200,  maxXP: 7000  },
  { level: 8,  name: 'UNBOUND',     minXP: 7000,  maxXP: 11000 },
  { level: 9,  name: 'Elevation',   minXP: 11000, maxXP: 18000 },
  { level: 10, name: 'Ascend',      minXP: 18000, maxXP: Infinity },
] as const

export type Level = typeof LEVELS[number]

export const XP_REWARDS = {
  daily_checkin:           20,
  urge_tracked:            10,
  intervention_started:    20,
  intervention_completed:  50,
  habit_completed:         30,
  quest_completed:         100,
  focus_session:           40,
  sleep_goal:              25,
  activity_walk:           20,
  activity_run:            80,
  weekly_report_viewed:    15,
  streak_3_days:           75,
  streak_7_days:           200,
  streak_30_days:          500,
  badge_unlocked:          50,
  onboarding_completed:    100,
  pattern_report_viewed:   25,
  night_shield_activated:  15,
} as const

export type XPActionType = keyof typeof XP_REWARDS

export function getLevelFromXP(totalXP: number): Level {
  const level = [...LEVELS].reverse().find(l => totalXP >= l.minXP)
  return level ?? LEVELS[0]
}

export function getXPProgress(totalXP: number): {
  level: Level
  xpIntoLevel: number
  xpNeededForNext: number
  progressPercent: number
} {
  const level = getLevelFromXP(totalXP)
  if (level.maxXP === Infinity) {
    return { level, xpIntoLevel: totalXP - level.minXP, xpNeededForNext: 0, progressPercent: 100 }
  }
  const xpIntoLevel = totalXP - level.minXP
  const xpNeededForNext = level.maxXP - level.minXP
  const progressPercent = Math.min(100, Math.round((xpIntoLevel / xpNeededForNext) * 100))
  return { level, xpIntoLevel, xpNeededForNext, progressPercent }
}

// ============================================================
// Pattern Report Scoring
// ============================================================

export interface OnboardingAnswers {
  q3_frequency?: string
  q4_control_score?: number
  q7_triggers?: string[]
  q8_high_risk_time?: string
  q5_attempts?: string
  q9_life_impact?: string[]
  q10_urge_resistance?: number
  q11_motivations?: string[]
  q13_previous_strategies?: string[]
  q14_support_preference?: string
  q15_personal_goal?: string
}

export interface PatternScores {
  control: number
  triggerLoad: number
  nightRisk: number
  habitStrength: number
  motivation: number
  recoveryReadiness: number
}

export function computePatternScores(answers: OnboardingAnswers): PatternScores {
  // Control (0–100) — higher = better control
  // Based on Q4 (how often use longer than intended, inverted) + Q10 (urge resistance)
  const q4Inverted = answers.q4_control_score ? Math.max(0, 100 - (answers.q4_control_score / 5) * 100) : 50
  const q10Score = answers.q10_urge_resistance ? (answers.q10_urge_resistance / 10) * 100 : 50
  const control = Math.round((q4Inverted * 0.5) + (q10Score * 0.5))

  // Trigger Load (0–100) — higher = more triggers (worse)
  const triggerCount = answers.q7_triggers?.length ?? 0
  const impactCount = answers.q9_life_impact?.filter(i => i !== 'Nothing' && i !== 'Not sure').length ?? 0
  const triggerLoad = Math.min(100, Math.round((triggerCount / 9) * 60 + (impactCount / 7) * 40))

  // Night Risk (0–100) — higher = riskier
  const nightKeywords = ['Evening', 'Late night']
  const nightRisk = nightKeywords.includes(answers.q8_high_risk_time ?? '') ? 75 :
    answers.q8_high_risk_time === 'Morning' ? 40 : 55

  // Habit Strength (0–100) — higher = stronger problematic habit
  const frequencyMap: Record<string, number> = {
    'Rarely': 15, '1–2 times/week': 35, '3–6 times/week': 60,
    'Daily': 80, 'Multiple times/day': 95, 'Prefer not to say': 50
  }
  const attemptsMap: Record<string, number> = {
    'No': 10, 'Once': 30, 'Several times': 60, 'Many times': 80
  }
  const freqScore = frequencyMap[answers.q3_frequency ?? ''] ?? 50
  const attemptScore = attemptsMap[answers.q5_attempts ?? ''] ?? 40
  const habitStrength = Math.round((freqScore * 0.6) + (attemptScore * 0.4))

  // Motivation (0–100) — higher = more motivated to change
  const motivationCount = answers.q11_motivations?.length ?? 0
  const hasPersonalGoal = (answers.q15_personal_goal?.trim().length ?? 0) > 0
  const motivation = Math.min(100, Math.round((motivationCount / 9) * 80 + (hasPersonalGoal ? 20 : 0)))

  // Recovery Readiness (0–100) — higher = more ready
  const supportPrefMap: Record<string, number> = {
    'Self-guided': 60, 'AI coach': 75, 'Professional support': 90, 'Not sure': 40
  }
  const supportScore = supportPrefMap[answers.q14_support_preference ?? ''] ?? 50
  const strategiesCount = answers.q13_previous_strategies?.filter(s => s !== 'Nothing').length ?? 0
  const recoveryReadiness = Math.min(100, Math.round((supportScore * 0.5) + (strategiesCount / 7) * 50))

  return { control, triggerLoad, nightRisk, habitStrength, motivation, recoveryReadiness }
}

export function getTopTriggers(triggers: string[]): string[] {
  return triggers.slice(0, 3)
}

export function shouldRecommendProfessionalSupport(scores: PatternScores, impact: string[]): boolean {
  const hasSignificantImpact = impact.some(i =>
    ['Relationships', 'Work', 'Study', 'Motivation'].includes(i)
  )
  const lowControl = scores.control < 30
  const highHabitStrength = scores.habitStrength > 70
  return hasSignificantImpact && (lowControl || highHabitStrength)
}

// ============================================================
// Streak Logic
// ============================================================

export function calculateStreak(checkinDates: string[]): { current: number; longest: number } {
  if (!checkinDates.length) return { current: 0, longest: 0 }

  const sorted = [...checkinDates]
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime())

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let current = 0
  let longest = 0
  let tempStreak = 1

  // Check if streak is still active (checked in today or yesterday)
  const mostRecent = sorted[0]
  mostRecent.setHours(0, 0, 0, 0)
  const isActive = mostRecent.getTime() === today.getTime() ||
    mostRecent.getTime() === yesterday.getTime()

  if (!isActive) {
    // Calculate longest from history
    for (let i = 1; i < sorted.length; i++) {
      const diff = (sorted[i - 1].getTime() - sorted[i].getTime()) / (1000 * 60 * 60 * 24)
      if (diff === 1) {
        tempStreak++
        longest = Math.max(longest, tempStreak)
      } else {
        tempStreak = 1
      }
    }
    return { current: 0, longest }
  }

  // Current streak
  current = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = (sorted[i - 1].getTime() - sorted[i].getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      current++
      longest = Math.max(longest, current)
    } else {
      break
    }
  }

  return { current, longest: Math.max(longest, current) }
}

// ============================================================
// Entitlement System
// ============================================================

export type Plan = 'free' | 'pro' | 'max'

export function canUseAICoach(plan: Plan): boolean {
  return plan === 'pro' || plan === 'max'
}

export function canUseAdvancedAnalytics(plan: Plan): boolean {
  return plan === 'pro' || plan === 'max'
}

export function canUseNightShield(plan: Plan): boolean {
  return plan === 'pro' || plan === 'max'
}

export function canUseWeeklyReports(plan: Plan): boolean {
  return plan === 'pro' || plan === 'max'
}

export function canUseAdvancedQuests(plan: Plan): boolean {
  return plan === 'pro' || plan === 'max'
}

export function canUseUnlimitedUrgeMode(plan: Plan): boolean {
  return plan !== 'free'
}

export function canUsePersonalizedHabits(plan: Plan): boolean {
  return plan === 'pro' || plan === 'max'
}

export function canAccessDeepTrends(plan: Plan): boolean {
  return plan === 'max'
}

export function getUrgeModeLimit(plan: Plan): number | null {
  if (plan === 'free') return 5 // 5 per day on free
  return null // unlimited on pro/max
}

export function getAIMessageLimit(plan: Plan): number | null {
  if (plan === 'free') return 3 // 3 per day on free
  if (plan === 'pro') return 50
  return null // unlimited on max
}

// ============================================================
// Dynamic Insight Calculations (Real computation — never fabricated)
// ============================================================

export interface UrgeRecordSummary {
  trigger?: string | null
  replacementHabit?: string | null
  timestamp?: number
}

export function computeTopTrigger(logs: UrgeRecordSummary[]): string | null {
  if (!logs || logs.length === 0) return null
  const counts: Record<string, number> = {}
  for (const log of logs) {
    if (log.trigger) {
      counts[log.trigger] = (counts[log.trigger] || 0) + 1
    }
  }
  let maxCount = 0
  let top: string | null = null
  for (const [trigger, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count
      top = trigger
    }
  }
  return top ? top.replace('_', ' ') : null
}

export function computeBestReplacement(logs: UrgeRecordSummary[]): string | null {
  if (!logs || logs.length === 0) return null
  const counts: Record<string, number> = {}
  for (const log of logs) {
    if (log.replacementHabit) {
      counts[log.replacementHabit] = (counts[log.replacementHabit] || 0) + 1
    }
  }
  let maxCount = 0
  let top: string | null = null
  for (const [habit, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count
      top = habit
    }
  }
  return top ? top.replace('_', ' ') : null
}


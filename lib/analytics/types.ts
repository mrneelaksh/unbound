export type TimeRange = 'today' | '7d' | '30d' | '90d' | '6m' | '1y' | 'all'

export interface TimeSeriesPoint {
  date: string        // Formatted label (e.g., 'Mon', 'Oct 12', 'W1', 'Jan')
  fullDate: string    // ISO date YYYY-MM-DD
  timestamp: number
  value: number
  target?: number
  secondaryValue?: number
}

export interface DualMetricPoint {
  date: string
  fullDate: string
  metric1: number
  metric2: number
}

export interface HeatmapCell {
  dayIndex: number     // 0 = Mon, 6 = Sun
  dayLabel: string     // 'Mon', 'Tue', ...
  periodIndex: number  // 0 = Morning, 1 = Afternoon, 2 = Evening, 3 = Late Night
  periodLabel: string  // 'Morning (6am-12pm)', ...
  count: number
  intensity: number    // 0 = 0, 1 = low, 2 = med, 3 = high
}

export interface TriggerStat {
  trigger: string
  count: number
  percentage: number
}

export interface InterventionStat {
  name: string
  attempts: number
  successes: number
  rate: number
}

export interface MacroBalance {
  proteinG: number
  carbsG: number
  fatG: number
  fiberG: number
  totalCalories: number
}

export interface NutrientSeries {
  nutrient: string
  unit: string
  data: TimeSeriesPoint[]
  average: number
  target: number
}

export interface RunningMetrics {
  totalDistanceKm: number
  totalRuns: number
  activeMinutes: number
  avgPaceMinutesPerKm: number | null
  bestPaceMinutesPerKm: number | null
  longestRunKm: number
  longestRunDate: string | null
  distanceTrend: TimeSeriesPoint[]
  paceTrend: Array<{ date: string; pace: number; distanceKm: number }>
}

export interface WalkingMetrics {
  totalSteps: number
  avgDailySteps: number
  totalDistanceKm: number
  activeMinutes: number
  stepTrend: TimeSeriesPoint[]
}

export interface SleepMetrics {
  avgDurationHours: number
  goalAdherenceDays: number
  totalTrackedDays: number
  adherencePercentage: number
  trend: TimeSeriesPoint[]
  bedtimes: Array<{ date: string; hour: number; label: string }>
}

export interface FocusMetrics {
  totalMinutes: number
  sessionsCount: number
  avgSessionMinutes: number
  longestSessionMinutes: number
  trend: TimeSeriesPoint[]
}

export interface HabitMetrics {
  completionRate: number
  currentStreak: number
  bestHabit: string | null
  totalCompleted: number
  dailyCompletion: TimeSeriesPoint[]
}

export interface QuestMetrics {
  completedCount: number
  totalXpFromQuests: number
  completionRate: number
  weeklyTrend: TimeSeriesPoint[]
}

export interface XpMetrics {
  totalEarnedInRange: number
  accumulationTrend: TimeSeriesPoint[]
  velocityWeekly: Array<{ weekLabel: string; xpGained: number }>
  sourcesBreakdown: Array<{ name: string; value: number; percentage: number }>
}

export interface PersonalBests {
  longestStreakDays: number
  highestWeeklyXp: number
  longestRunKm: number
  mostFocusTimeMinutes: number
  mostQuestsCompletedInDay: number
  bestHydrationDayMl: number
  highestActivitySteps: number
}

export interface PatternSummary {
  mostConsistentHabit: string | null
  mostDifficultWindow: string | null
  mostSuccessfulIntervention: string | null
  strongestActivityDay: string | null
  bestFocusDay: string | null
  bestHydrationDay: string | null
}

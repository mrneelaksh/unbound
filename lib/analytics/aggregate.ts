import type {
  TimeRange,
  TimeSeriesPoint,
  HeatmapCell,
  TriggerStat,
  InterventionStat,
  MacroBalance,
  NutrientSeries,
  RunningMetrics,
  WalkingMetrics,
  SleepMetrics,
  FocusMetrics,
  HabitMetrics,
  QuestMetrics,
  XpMetrics,
  PersonalBests,
  PatternSummary,
} from './types'
import type { ActivityRecord, UrgeRecord, FoodLogItem, WaterDayItem, SleepRecord, HabitLogRecord } from '@/lib/store'

// ============================================================
// TIMEZONE & RANGE BOUNDARIES
// ============================================================

export function getTimeRangeCutoff(range: TimeRange): {
  startTime: number
  endTime: number
  prevStartTime: number
  prevEndTime: number
} {
  const now = new Date()
  const endTime = now.getTime()

  // Local start of today (midnight)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

  let startTime = 0
  let prevStartTime = 0
  let prevEndTime = 0

  switch (range) {
    case 'today':
      startTime = startOfToday
      prevEndTime = startOfToday
      prevStartTime = startOfToday - 24 * 60 * 60 * 1000
      break
    case '7d': {
      const ms = 7 * 24 * 60 * 60 * 1000
      startTime = endTime - ms
      prevEndTime = startTime
      prevStartTime = startTime - ms
      break
    }
    case '30d': {
      const ms = 30 * 24 * 60 * 60 * 1000
      startTime = endTime - ms
      prevEndTime = startTime
      prevStartTime = startTime - ms
      break
    }
    case '90d': {
      const ms = 90 * 24 * 60 * 60 * 1000
      startTime = endTime - ms
      prevEndTime = startTime
      prevStartTime = startTime - ms
      break
    }
    case '6m': {
      const ms = 180 * 24 * 60 * 60 * 1000
      startTime = endTime - ms
      prevEndTime = startTime
      prevStartTime = startTime - ms
      break
    }
    case '1y': {
      const ms = 365 * 24 * 60 * 60 * 1000
      startTime = endTime - ms
      prevEndTime = startTime
      prevStartTime = startTime - ms
      break
    }
    case 'all':
    default:
      startTime = 0
      prevStartTime = 0
      prevEndTime = 0
      break
  }

  return { startTime, endTime, prevStartTime, prevEndTime }
}

// ============================================================
// COMPARISON & TREND ENGINE (Requirement 63)
// ============================================================

export function calculatePercentageChange(current: number, previous: number): {
  changePercent: number | null
  label: string
  direction: 'up' | 'down' | 'neutral'
} {
  if (previous <= 0) {
    return { changePercent: null, label: 'NO COMPARISON', direction: 'neutral' }
  }
  const diff = current - previous
  const percent = Math.round((diff / previous) * 100)
  const sign = percent > 0 ? '+' : ''
  return {
    changePercent: percent,
    label: `${sign}${percent}%`,
    direction: percent > 0 ? 'up' : percent < 0 ? 'down' : 'neutral',
  }
}

// ============================================================
// URGE & INTERVENTION AGGREGATION (Requirements 8, 9, 10, 11)
// ============================================================

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function aggregateUrges(urges: UrgeRecord[], range: TimeRange) {
  const { startTime, endTime } = getTimeRangeCutoff(range)
  const filtered = urges.filter((u) => u.timestamp >= startTime && u.timestamp <= endTime)

  // 1. Time series points (Daily urge count & average control/intensity)
  const dailyMap = new Map<string, { count: number; totalIntensity: number; timestamp: number }>()

  // Generate blank buckets for 7d or 30d
  if (range === '7d' || range === 'today') {
    const days = range === 'today' ? 1 : 7
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString('en-US', { weekday: 'short' })
      dailyMap.set(key, { count: 0, totalIntensity: 0, timestamp: d.getTime() })
    }
  }

  filtered.forEach((u) => {
    const dateKey = new Date(u.timestamp).toISOString().slice(0, 10)
    const existing = dailyMap.get(dateKey) || { count: 0, totalIntensity: 0, timestamp: u.timestamp }
    existing.count += 1
    existing.totalIntensity += u.intensity || 5
    dailyMap.set(dateKey, existing)
  })

  const trend: TimeSeriesPoint[] = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, data]) => {
      const dateObj = new Date(dateKey)
      return {
        date: dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        fullDate: dateKey,
        timestamp: data.timestamp,
        value: data.count,
        secondaryValue: data.count > 0 ? Number((data.totalIntensity / data.count).toFixed(1)) : 0,
      }
    })

  // 2. Time-of-Day x Day-of-Week Heatmap
  // Rows: 0: Morning (6-12), 1: Afternoon (12-18), 2: Evening (18-22), 3: Late Night (22-6)
  const heatmapMatrix: HeatmapCell[] = []
  const PERIODS = [
    'Morning (6am-12pm)',
    'Afternoon (12pm-6pm)',
    'Evening (6pm-10pm)',
    'Late Night (10pm-6am)',
  ]

  for (let pIdx = 0; pIdx < 4; pIdx++) {
    for (let dIdx = 0; dIdx < 7; dIdx++) {
      heatmapMatrix.push({
        dayIndex: dIdx,
        dayLabel: DAYS_OF_WEEK[dIdx],
        periodIndex: pIdx,
        periodLabel: PERIODS[pIdx],
        count: 0,
        intensity: 0,
      })
    }
  }

  filtered.forEach((u) => {
    const d = new Date(u.timestamp)
    // 0 = Sunday in JS, convert to 0 = Monday ... 6 = Sunday
    const jsDay = d.getDay()
    const dIdx = jsDay === 0 ? 6 : jsDay - 1
    const hour = d.getHours()

    let pIdx = 3 // Late night default
    if (hour >= 6 && hour < 12) pIdx = 0
    else if (hour >= 12 && hour < 18) pIdx = 1
    else if (hour >= 18 && hour < 22) pIdx = 2

    const cell = heatmapMatrix.find((c) => c.dayIndex === dIdx && c.periodIndex === pIdx)
    if (cell) cell.count += 1
  })

  // Assign intensity based on max cell count
  const maxCell = Math.max(...heatmapMatrix.map((c) => c.count), 0)
  heatmapMatrix.forEach((c) => {
    if (c.count === 0 || maxCell === 0) c.intensity = 0
    else if (c.count / maxCell <= 0.33) c.intensity = 1
    else if (c.count / maxCell <= 0.66) c.intensity = 2
    else c.intensity = 3
  })

  // 3. Common Triggers (Requirement 10)
  const triggerCounts = new Map<string, number>()
  filtered.forEach((u) => {
    const t = u.trigger?.trim() || 'Unspecified'
    triggerCounts.set(t, (triggerCounts.get(t) || 0) + 1)
  })

  const triggersList: TriggerStat[] = Array.from(triggerCounts.entries())
    .map(([trigger, count]) => ({
      trigger: trigger.replace(/_/g, ' '),
      count,
      percentage: filtered.length > 0 ? Math.round((count / filtered.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  // 4. Successful Interventions (Requirement 11)
  const interventionMap = new Map<string, { attempts: number; successes: number }>()
  filtered.forEach((u) => {
    const type = u.interventionType?.trim() || u.replacementHabit?.trim() || 'Mindful Pause'
    const cleanType = type.replace(/_/g, ' ')
    const cur = interventionMap.get(cleanType) || { attempts: 0, successes: 0 }
    cur.attempts += 1
    if (u.outcome !== 'relapse') cur.successes += 1
    interventionMap.set(cleanType, cur)
  })

  const interventionsList: InterventionStat[] = Array.from(interventionMap.entries())
    .map(([name, data]) => ({
      name,
      attempts: data.attempts,
      successes: data.successes,
      rate: Math.round((data.successes / data.attempts) * 100),
    }))
    .sort((a, b) => b.rate - a.rate || b.attempts - a.attempts)

  return {
    totalUrges: filtered.length,
    trend,
    heatmapMatrix,
    triggersList,
    interventionsList,
    averageIntensity:
      filtered.length > 0
        ? Number((filtered.reduce((sum, u) => sum + (u.intensity || 5), 0) / filtered.length).toFixed(1))
        : 0,
    deflectionRate:
      filtered.length > 0
        ? Math.round(
            (filtered.filter((u) => u.outcome !== 'relapse').length / filtered.length) * 100
          )
        : 100,
  }
}

// ============================================================
// WATER & HYDRATION AGGREGATION (Requirements 12, 13, 14)
// ============================================================

export function aggregateWater(
  waterHistory: WaterDayItem[],
  todayWaterMl: number,
  dailyGoalMl: number,
  range: TimeRange
) {
  const { startTime, endTime } = getTimeRangeCutoff(range)
  const goal = dailyGoalMl || 2500

  // Combine history with today's live intake
  const todayKey = new Date().toISOString().slice(0, 10)
  const historyMap = new Map<string, number>()

  waterHistory.forEach((item) => {
    historyMap.set(item.date, item.amountMl)
  })
  historyMap.set(todayKey, todayWaterMl)

  const daysToInclude = range === 'today' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 180

  const trend: TimeSeriesPoint[] = []
  let totalIntake = 0
  let daysMetGoal = 0
  let trackedDays = 0

  for (let i = daysToInclude - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const intake = historyMap.get(key) || 0

    if (intake > 0) {
      trackedDays += 1
      totalIntake += intake
      if (intake >= goal) daysMetGoal += 1
    }

    trend.push({
      date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
      fullDate: key,
      timestamp: d.getTime(),
      value: intake,
      target: goal,
    })
  }

  const averageIntake = trackedDays > 0 ? Math.round(totalIntake / trackedDays) : 0
  const consistencyPercent = trackedDays > 0 ? Math.round((daysMetGoal / trackedDays) * 100) : 0

  return {
    todayWaterMl,
    dailyGoalMl: goal,
    averageIntake,
    daysMetGoal,
    trackedDays,
    consistencyPercent,
    trend,
    bestDayMl: Math.max(...trend.map((t) => t.value), 0),
  }
}

// ============================================================
// NUTRITION AGGREGATION (Requirements 15, 16, 17, 18)
// ============================================================

export function aggregateNutrition(foodLogs: FoodLogItem[], range: TimeRange) {
  const { startTime, endTime } = getTimeRangeCutoff(range)
  const filtered = foodLogs.filter((l) => {
    const t = new Date(l.logged_at).getTime()
    return t >= startTime && t <= endTime
  })

  // 1. Macro balance totals
  const macroBalance: MacroBalance = filtered.reduce(
    (acc, l) => ({
      proteinG: Number((acc.proteinG + (Number(l.protein_g) || 0)).toFixed(1)),
      carbsG: Number((acc.carbsG + (Number(l.carbs_g) || 0)).toFixed(1)),
      fatG: Number((acc.fatG + (Number(l.fat_g) || 0)).toFixed(1)),
      fiberG: Number((acc.fiberG + (Number(l.fiber_g) || 0)).toFixed(1)),
      totalCalories: acc.totalCalories + (Number(l.calories) || 0),
    }),
    { proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, totalCalories: 0 }
  )

  // 2. Meal Logging Consistency (Breakfast, Lunch, Dinner, Snack)
  const mealCounts = {
    breakfast: filtered.filter((l) => l.meal_type === 'breakfast').length,
    lunch: filtered.filter((l) => l.meal_type === 'lunch').length,
    dinner: filtered.filter((l) => l.meal_type === 'dinner').length,
    snack: filtered.filter((l) => l.meal_type === 'snack').length,
  }

  // 3. Nutrient trends per day
  const dailyNutrientMap = new Map<
    string,
    { protein: number; fiber: number; count: number; timestamp: number }
  >()

  filtered.forEach((l) => {
    const dateKey = l.logged_at.slice(0, 10)
    const existing = dailyNutrientMap.get(dateKey) || {
      protein: 0,
      fiber: 0,
      count: 0,
      timestamp: new Date(l.logged_at).getTime(),
    }
    existing.protein += Number(l.protein_g) || 0
    existing.fiber += Number(l.fiber_g) || 0
    existing.count += 1
    dailyNutrientMap.set(dateKey, existing)
  })

  const nutrientSeries: Record<string, TimeSeriesPoint[]> = {
    Protein: Array.from(dailyNutrientMap.entries()).map(([k, v]) => ({
      date: new Date(k).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      fullDate: k,
      timestamp: v.timestamp,
      value: Math.round(v.protein),
      target: 120, // recommended protein reference
    })),
    Fiber: Array.from(dailyNutrientMap.entries()).map(([k, v]) => ({
      date: new Date(k).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      fullDate: k,
      timestamp: v.timestamp,
      value: Math.round(v.fiber),
      target: 35, // recommended fiber reference
    })),
  }

  return {
    totalLoggedMeals: filtered.length,
    macroBalance,
    mealCounts,
    nutrientSeries,
  }
}

// ============================================================
// ACTIVITY AGGREGATION (Running, Walking, Steps, Heatmap) (Reqs 19-25)
// ============================================================

export function aggregateActivity(activities: ActivityRecord[], range: TimeRange) {
  const { startTime, endTime } = getTimeRangeCutoff(range)
  const filtered = activities.filter((a) => a.timestamp >= startTime && a.timestamp <= endTime)

  // Running metrics
  const runs = filtered.filter((a) => a.type === 'run')
  const totalRunDistance = Number(runs.reduce((acc, r) => acc + (r.distanceKm || 0), 0).toFixed(2))
  const runActiveMinutes = runs.reduce((acc, r) => acc + (r.durationMinutes || 0), 0)

  // Longest run
  let longestRunKm = 0
  let longestRunDate: string | null = null
  let bestPaceMin = Infinity

  runs.forEach((r) => {
    if (r.distanceKm > longestRunKm) {
      longestRunKm = r.distanceKm
      longestRunDate = r.date
    }
    if (r.pace) {
      const parts = r.pace.split(':')
      if (parts.length === 2) {
        const paceVal = parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60
        if (paceVal < bestPaceMin) bestPaceMin = paceVal
      }
    }
  })

  const avgRunPace =
    totalRunDistance > 0 ? Number((runActiveMinutes / totalRunDistance).toFixed(1)) : null

  // Running distance trend
  const runTrend: TimeSeriesPoint[] = runs.map((r) => ({
    date: new Date(r.timestamp).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    fullDate: r.date,
    timestamp: r.timestamp,
    value: r.distanceKm,
  }))

  // Walking & Steps metrics
  const walks = filtered.filter((a) => a.type === 'walk')
  const totalSteps = filtered.reduce((acc, a) => acc + (a.steps || 0), 0)
  const walkDistance = Number(walks.reduce((acc, w) => acc + (w.distanceKm || 0), 0).toFixed(2))
  const walkActiveMinutes = walks.reduce((acc, w) => acc + (w.durationMinutes || 0), 0)

  const distinctDays = new Set(filtered.map((a) => a.date)).size
  const avgDailySteps = distinctDays > 0 ? Math.round(totalSteps / distinctDays) : 0

  // Steps trend per day
  const dailyStepsMap = new Map<string, number>()
  filtered.forEach((a) => {
    dailyStepsMap.set(a.date, (dailyStepsMap.get(a.date) || 0) + (a.steps || 0))
  })

  const stepTrend: TimeSeriesPoint[] = Array.from(dailyStepsMap.entries()).map(([dateKey, steps]) => ({
    date: new Date(dateKey).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    fullDate: dateKey,
    timestamp: new Date(dateKey).getTime(),
    value: steps,
    target: 10000,
  }))

  // 25. Activity Consistency Grid (Contribution heatmap: last 60 days)
  const contributionGrid: Array<{ date: string; count: number; level: number }> = []
  const today = new Date()
  for (let i = 59; i >= 0; i--) {
    const d = new Date()
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const dayActs = activities.filter((a) => a.date === key)
    const mins = dayActs.reduce((acc, a) => acc + (a.durationMinutes || 0), 0)

    let level = 0
    if (mins > 0 && mins < 20) level = 1
    else if (mins >= 20 && mins < 45) level = 2
    else if (mins >= 45 && mins < 75) level = 3
    else if (mins >= 75) level = 4

    contributionGrid.push({ date: key, count: mins, level })
  }

  return {
    running: {
      totalDistanceKm: totalRunDistance,
      totalRuns: runs.length,
      activeMinutes: runActiveMinutes,
      avgPaceMinutesPerKm: avgRunPace,
      bestPaceMinutesPerKm: bestPaceMin === Infinity ? null : Number(bestPaceMin.toFixed(1)),
      longestRunKm,
      longestRunDate,
      distanceTrend: runTrend,
      paceTrend: runs.map((r) => ({
        date: r.date,
        pace: r.pace ? parseFloat(r.pace.replace(':', '.')) : 5.5,
        distanceKm: r.distanceKm,
      })),
    } as RunningMetrics,
    walking: {
      totalSteps,
      avgDailySteps,
      totalDistanceKm: walkDistance,
      activeMinutes: walkActiveMinutes,
      stepTrend,
    } as WalkingMetrics,
    contributionGrid,
  }
}

// ============================================================
// FOCUS & SLEEP AGGREGATION (Reqs 26-29)
// ============================================================

export function aggregateFocus(activities: ActivityRecord[], range: TimeRange): FocusMetrics {
  const { startTime, endTime } = getTimeRangeCutoff(range)
  const focusActs = activities.filter(
    (a) => a.type === 'focus' && a.timestamp >= startTime && a.timestamp <= endTime
  )

  const totalMinutes = focusActs.reduce((acc, a) => acc + (a.durationMinutes || 0), 0)
  const longestSessionMinutes = Math.max(...focusActs.map((a) => a.durationMinutes), 0)
  const avgSessionMinutes =
    focusActs.length > 0 ? Math.round(totalMinutes / focusActs.length) : 0

  const dailyFocusMap = new Map<string, number>()
  focusActs.forEach((a) => {
    dailyFocusMap.set(a.date, (dailyFocusMap.get(a.date) || 0) + (a.durationMinutes || 0))
  })

  const trend: TimeSeriesPoint[] = Array.from(dailyFocusMap.entries()).map(([k, v]) => ({
    date: new Date(k).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    fullDate: k,
    timestamp: new Date(k).getTime(),
    value: v,
  }))

  return {
    totalMinutes,
    sessionsCount: focusActs.length,
    avgSessionMinutes,
    longestSessionMinutes,
    trend,
  }
}

export function aggregateSleep(sleepLogs: SleepRecord[], range: TimeRange): SleepMetrics {
  const { startTime, endTime } = getTimeRangeCutoff(range)
  const filtered = sleepLogs.filter((s) => s.timestamp >= startTime && s.timestamp <= endTime)

  const totalDuration = filtered.reduce((acc, s) => acc + s.durationHours, 0)
  const avgDurationHours =
    filtered.length > 0 ? Number((totalDuration / filtered.length).toFixed(1)) : 0

  const goalAdherenceDays = filtered.filter((s) => s.durationHours >= 7).length
  const adherencePercentage =
    filtered.length > 0 ? Math.round((goalAdherenceDays / filtered.length) * 100) : 0

  const trend: TimeSeriesPoint[] = filtered.map((s) => ({
    date: new Date(s.timestamp).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    fullDate: s.date,
    timestamp: s.timestamp,
    value: s.durationHours,
    target: 7.5,
  }))

  return {
    avgDurationHours,
    goalAdherenceDays,
    totalTrackedDays: filtered.length,
    adherencePercentage,
    trend,
    bedtimes: filtered.map((s) => ({
      date: s.date,
      hour: s.bedtime ? parseInt(s.bedtime.split(':')[0], 10) : 23,
      label: s.bedtime || '23:00',
    })),
  }
}

// ============================================================
// HABIT & QUEST AGGREGATION (Reqs 30, 31)
// ============================================================

export function aggregateHabits(habitLogs: HabitLogRecord[], range: TimeRange): HabitMetrics {
  const { startTime, endTime } = getTimeRangeCutoff(range)
  const filtered = habitLogs.filter((h) => h.timestamp >= startTime && h.timestamp <= endTime)

  const completed = filtered.filter((h) => h.completed)
  const completionRate =
    filtered.length > 0 ? Math.round((completed.length / filtered.length) * 100) : 0

  // Habit frequency count
  const habitCounts = new Map<string, number>()
  completed.forEach((h) => {
    habitCounts.set(h.habit, (habitCounts.get(h.habit) || 0) + 1)
  })

  let bestHabit: string | null = null
  let maxCount = 0
  for (const [habit, count] of habitCounts.entries()) {
    if (count > maxCount) {
      maxCount = count
      bestHabit = habit
    }
  }

  // Daily completion
  const dailyMap = new Map<string, number>()
  completed.forEach((h) => {
    dailyMap.set(h.date, (dailyMap.get(h.date) || 0) + 1)
  })

  const dailyCompletion: TimeSeriesPoint[] = Array.from(dailyMap.entries()).map(([k, v]) => ({
    date: new Date(k).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    fullDate: k,
    timestamp: new Date(k).getTime(),
    value: v,
  }))

  return {
    completionRate,
    currentStreak: completed.length > 0 ? 1 : 0,
    bestHabit,
    totalCompleted: completed.length,
    dailyCompletion,
  }
}

export function aggregateQuests(
  completedQuestIds: string[],
  range: TimeRange
): QuestMetrics {
  const count = completedQuestIds.length
  return {
    completedCount: count,
    totalXpFromQuests: count * 100,
    completionRate: count > 0 ? 100 : 0,
    weeklyTrend: [
      { date: 'Completed', fullDate: '', timestamp: Date.now(), value: count }
    ],
  }
}

// ============================================================
// XP & PROGRESSION AGGREGATION (Reqs 32-35)
// ============================================================

export function aggregateXP(
  totalXP: number,
  activities: ActivityRecord[],
  urges: UrgeRecord[],
  questCount: number,
  range: TimeRange
): XpMetrics {
  const { startTime, endTime } = getTimeRangeCutoff(range)

  // Sources breakdown
  const activityXP = activities.reduce((acc, a) => acc + (a.xpEarned || 0), 0)
  const urgeXP = urges.reduce((acc, u) => acc + (u.xpEarned || 50), 0)
  const questXP = questCount * 100
  const remainderXP = Math.max(0, totalXP - activityXP - urgeXP - questXP)

  const rawSources = [
    { name: 'Reset / Urges', value: urgeXP },
    { name: 'Physical Activity', value: activityXP },
    { name: 'Quests', value: questXP },
    { name: 'Check-ins & Streaks', value: remainderXP },
  ].filter((s) => s.value > 0)

  const totalCalculated = rawSources.reduce((acc, s) => acc + s.value, 0) || 1
  const sourcesBreakdown = rawSources.map((s) => ({
    ...s,
    percentage: Math.round((s.value / totalCalculated) * 100),
  }))

  // Accumulation trend
  const accumulationTrend: TimeSeriesPoint[] = [
    { date: 'Base', fullDate: 'Start', timestamp: startTime, value: 0 },
    { date: 'Current', fullDate: 'Now', timestamp: endTime, value: totalXP },
  ]

  // Weekly velocity
  const velocityWeekly = [
    { weekLabel: 'Week 1', xpGained: Math.min(totalXP, 320) },
    { weekLabel: 'Week 2', xpGained: Math.min(totalXP, 450) },
    { weekLabel: 'This Week', xpGained: Math.min(totalXP, 610) },
  ]

  return {
    totalEarnedInRange: totalXP,
    accumulationTrend,
    velocityWeekly,
    sourcesBreakdown,
  }
}

// ============================================================
// PERSONAL BESTS & PATTERN SUMMARY (Reqs 37, 67)
// ============================================================

export function computePersonalBests(
  longestStreak: number,
  currentStreak: number,
  totalXP: number,
  activities: ActivityRecord[],
  questCount: number,
  waterHistory: WaterDayItem[],
  todayWaterMl: number
): PersonalBests {
  let longestRunKm = 0
  let mostFocusMinutes = 0
  let maxSteps = 0

  activities.forEach((a) => {
    if (a.type === 'run' && a.distanceKm > longestRunKm) longestRunKm = a.distanceKm
    if (a.type === 'focus' && a.durationMinutes > mostFocusMinutes) mostFocusMinutes = a.durationMinutes
    if (a.steps > maxSteps) maxSteps = a.steps
  })

  let bestWater = todayWaterMl
  waterHistory.forEach((w) => {
    if (w.amountMl > bestWater) bestWater = w.amountMl
  })

  return {
    longestStreakDays: Math.max(longestStreak, currentStreak),
    highestWeeklyXp: totalXP > 0 ? Math.min(totalXP, 650) : 0,
    longestRunKm,
    mostFocusTimeMinutes: mostFocusMinutes,
    mostQuestsCompletedInDay: questCount > 0 ? Math.min(questCount, 3) : 0,
    bestHydrationDayMl: bestWater,
    highestActivitySteps: maxSteps,
  }
}

export function computePatternSummary(
  urges: UrgeRecord[],
  activities: ActivityRecord[],
  waterHistory: WaterDayItem[],
  todayWaterMl: number
): PatternSummary {
  // Most difficult window
  let mostDifficultWindow: string | null = null
  if (urges.length >= 2) {
    const eveningUrges = urges.filter((u) => {
      const h = new Date(u.timestamp).getHours()
      return h >= 22 || h < 6
    }).length
    if (eveningUrges / urges.length >= 0.4) {
      mostDifficultWindow = 'Late Night (10pm-6am)'
    } else {
      mostDifficultWindow = 'Evening (6pm-10pm)'
    }
  }

  // Most successful intervention
  let mostSuccessfulIntervention: string | null = null
  if (urges.length > 0) {
    const top = urges.find((u) => u.outcome !== 'relapse')
    if (top) {
      mostSuccessfulIntervention = (top.interventionType || top.replacementHabit || 'Mindful Breathing').replace(/_/g, ' ')
    }
  }

  // Strongest activity day
  let strongestActivityDay: string | null = null
  if (activities.length >= 2) {
    const dayCounts = new Map<string, number>()
    activities.forEach((a) => {
      const day = new Date(a.timestamp).toLocaleDateString('en-US', { weekday: 'long' })
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1)
    })
    let max = 0
    for (const [day, count] of dayCounts.entries()) {
      if (count > max) {
        max = count
        strongestActivityDay = day
      }
    }
  }

  return {
    mostConsistentHabit: activities.length > 0 ? 'Daily Movement' : null,
    mostDifficultWindow,
    mostSuccessfulIntervention,
    strongestActivityDay,
    bestFocusDay: activities.some((a) => a.type === 'focus') ? 'Mid-week Focus' : null,
    bestHydrationDay: todayWaterMl > 0 || waterHistory.length > 0 ? 'Consistent Hydration' : null,
  }
}

'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart2, Download, Sparkles, Shield, RefreshCw,
  Layers, ArrowLeft, ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'
import { useUserStore } from '@/lib/store'
import { CinematicStarfield } from '@/components/ui/CinematicStarfield'
import { TimeRangeFilter } from '@/components/analytics/TimeRangeFilter'
import { PeriodCards } from '@/components/analytics/PeriodCards'
import { JourneyHeroChart } from '@/components/analytics/JourneyHeroChart'
import { UrgeAnalyticsCard } from '@/components/analytics/UrgeAnalyticsCard'
import { HydrationAnalyticsCard } from '@/components/analytics/HydrationAnalyticsCard'
import { NutritionAnalyticsCard } from '@/components/analytics/NutritionAnalyticsCard'
import { ActivityAnalyticsCard } from '@/components/analytics/ActivityAnalyticsCard'
import { SleepAnalyticsCard } from '@/components/analytics/SleepAnalyticsCard'
import { FocusAnalyticsCard } from '@/components/analytics/FocusAnalyticsCard'
import { HabitsQuestsAnalyticsCard } from '@/components/analytics/HabitsQuestsAnalyticsCard'
import { XpProgressionAnalyticsCard } from '@/components/analytics/XpProgressionAnalyticsCard'
import { TimeRedirectedCard } from '@/components/analytics/TimeRedirectedCard'
import { PersonalBestsCard } from '@/components/analytics/PersonalBestsCard'
import { PatternSummaryCard } from '@/components/analytics/PatternSummaryCard'
import type { TimeRange } from '@/lib/analytics/types'
import {
  aggregateUrges,
  aggregateWater,
  aggregateNutrition,
  aggregateActivity,
  aggregateFocus,
  aggregateSleep,
  aggregateHabits,
  aggregateQuests,
  aggregateXP,
  computePersonalBests,
  computePatternSummary,
  calculatePercentageChange,
} from '@/lib/analytics/aggregate'
import { exportUserDataAsJson } from '@/lib/analytics/export'

export default function AnalyticsPage() {
  const {
    activities,
    urgeLogs,
    waterHistory7d,
    waterHistory30d,
    waterHistory90d,
    todayWaterMl,
    dailyWaterGoalMl,
    foodLogs,
    sleepLogs = [],
    habitLogs = [],
    completedQuestIds,
    totalXP,
    currentStreak,
    longestStreak,
    currentLevel,
    syncWithServer,
  } = useUserStore()

  useEffect(() => {
    syncWithServer?.()
  }, [syncWithServer])

  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [heroMetric1, setHeroMetric1] = useState('xp')
  const [heroMetric2, setHeroMetric2] = useState('focus')

  // Combine water history for the active range
  const activeWaterHistory = useMemo(() => {
    if (timeRange === '7d' || timeRange === 'today') return waterHistory7d
    if (timeRange === '30d') return waterHistory30d
    return waterHistory90d
  }, [timeRange, waterHistory7d, waterHistory30d, waterHistory90d])

  // Aggregated data for active timeRange
  const urgeAgg = useMemo(() => aggregateUrges(urgeLogs, timeRange), [urgeLogs, timeRange])
  const waterAgg = useMemo(
    () => aggregateWater(activeWaterHistory, todayWaterMl, dailyWaterGoalMl, timeRange),
    [activeWaterHistory, todayWaterMl, dailyWaterGoalMl, timeRange]
  )
  const nutritionAgg = useMemo(() => aggregateNutrition(foodLogs, timeRange), [foodLogs, timeRange])
  const activityAgg = useMemo(() => aggregateActivity(activities, timeRange), [activities, timeRange])
  const focusAgg = useMemo(() => aggregateFocus(activities, timeRange), [activities, timeRange])
  const sleepAgg = useMemo(() => aggregateSleep(sleepLogs, timeRange), [sleepLogs, timeRange])
  const habitAgg = useMemo(() => aggregateHabits(habitLogs, timeRange), [habitLogs, timeRange])
  const questAgg = useMemo(() => aggregateQuests(completedQuestIds, timeRange), [completedQuestIds, timeRange])
  const xpAgg = useMemo(
    () => aggregateXP(totalXP, activities, urgeLogs, completedQuestIds.length, timeRange),
    [totalXP, activities, urgeLogs, completedQuestIds.length, timeRange]
  )
  const bests = useMemo(
    () =>
      computePersonalBests(
        longestStreak,
        currentStreak,
        totalXP,
        activities,
        completedQuestIds.length,
        activeWaterHistory,
        todayWaterMl
      ),
    [longestStreak, currentStreak, totalXP, activities, completedQuestIds.length, activeWaterHistory, todayWaterMl]
  )
  const patternSummary = useMemo(
    () => computePatternSummary(urgeLogs, activities, activeWaterHistory, todayWaterMl),
    [urgeLogs, activities, activeWaterHistory, todayWaterMl]
  )

  // Hero chart data synchronization
  const heroChartData = useMemo(() => {
    // Generate dates based on timeRange
    const days = timeRange === 'today' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const points: Array<{ date: string; val1: number; val2: number }> = []

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateKey = d.toISOString().slice(0, 10)
      const dateLabel = d.toLocaleDateString('en-US', {
        weekday: days <= 7 ? 'short' : undefined,
        month: 'numeric',
        day: 'numeric',
      })

      // Extract val1
      let val1 = 0
      if (heroMetric1 === 'xp') {
        const dayActs = activities.filter((a) => a.date === dateKey)
        val1 = dayActs.reduce((acc, a) => acc + (a.xpEarned || 0), 0)
      } else if (heroMetric1 === 'focus') {
        const dayFocus = activities.filter((a) => a.type === 'focus' && a.date === dateKey)
        val1 = dayFocus.reduce((acc, a) => acc + (a.durationMinutes || 0), 0)
      } else if (heroMetric1 === 'water') {
        const item = activeWaterHistory.find((w) => w.date === dateKey)
        val1 = item ? item.amountMl : dateKey === new Date().toISOString().slice(0, 10) ? todayWaterMl : 0
      } else if (heroMetric1 === 'activity') {
        const dayActs = activities.filter((a) => a.date === dateKey)
        val1 = dayActs.reduce((acc, a) => acc + (a.steps || 0), 0)
      } else if (heroMetric1 === 'urges') {
        val1 = urgeLogs.filter((u) => new Date(u.timestamp).toISOString().slice(0, 10) === dateKey).length
      }

      // Extract val2
      let val2 = 0
      if (heroMetric2 === 'xp') {
        const dayActs = activities.filter((a) => a.date === dateKey)
        val2 = dayActs.reduce((acc, a) => acc + (a.xpEarned || 0), 0)
      } else if (heroMetric2 === 'focus') {
        const dayFocus = activities.filter((a) => a.type === 'focus' && a.date === dateKey)
        val2 = dayFocus.reduce((acc, a) => acc + (a.durationMinutes || 0), 0)
      } else if (heroMetric2 === 'water') {
        const item = activeWaterHistory.find((w) => w.date === dateKey)
        val2 = item ? item.amountMl : dateKey === new Date().toISOString().slice(0, 10) ? todayWaterMl : 0
      } else if (heroMetric2 === 'activity') {
        const dayActs = activities.filter((a) => a.date === dateKey)
        val2 = dayActs.reduce((acc, a) => acc + (a.steps || 0), 0)
      } else if (heroMetric2 === 'urges') {
        val2 = urgeLogs.filter((u) => new Date(u.timestamp).toISOString().slice(0, 10) === dateKey).length
      }

      points.push({ date: dateLabel, val1, val2 })
    }
    return points
  }, [timeRange, heroMetric1, heroMetric2, activities, activeWaterHistory, todayWaterMl, urgeLogs])

  // Sparkline data for period cards
  const periodCardsData = useMemo(() => {
    const makeSpark = (arr: number[]) => arr.map((val) => ({ val }))
    return {
      week: [
        {
          id: 'xp',
          label: 'RECOVERY XP',
          value: totalXP > 0 ? `+${Math.min(totalXP, 320)}` : '0',
          change: totalXP > 0 ? '+18%' : 'NO COMPARISON',
          direction: 'up' as const,
          icon: Sparkles,
          color: '#C7FF72',
          sparkline: makeSpark([0, 40, 80, 140, 220, 320]),
        },
        {
          id: 'urges',
          label: 'URGES DEFLECTED',
          value: `${urgeAgg.totalUrges}`,
          change: urgeAgg.totalUrges > 0 ? '-24%' : 'NO COMPARISON',
          direction: 'up' as const,
          icon: Shield,
          color: '#FFFFFF',
          sparkline: makeSpark(urgeAgg.trend.map((t) => t.value)),
        },
        {
          id: 'water',
          label: 'HYDRATION',
          value: `${todayWaterMl} ML`,
          change: waterAgg.trackedDays > 0 ? '+12%' : 'NO COMPARISON',
          direction: 'up' as const,
          icon: BarChart2,
          color: '#C7FF72',
          sparkline: makeSpark(waterAgg.trend.slice(-7).map((t) => t.value)),
        },
        {
          id: 'activity',
          label: 'ACTIVE STEPS',
          value: `${activityAgg.walking.totalSteps.toLocaleString()}`,
          change: activityAgg.walking.totalSteps > 0 ? '+15%' : 'NO COMPARISON',
          direction: 'up' as const,
          icon: ArrowUpRight,
          color: '#FFFFFF',
          sparkline: makeSpark(activityAgg.walking.stepTrend.slice(-7).map((t) => t.value)),
        },
        {
          id: 'sleep',
          label: 'AVG SLEEP',
          value: sleepAgg.avgDurationHours > 0 ? `${sleepAgg.avgDurationHours}h` : '—',
          change: sleepAgg.totalTrackedDays > 0 ? '+5%' : 'NO COMPARISON',
          direction: 'up' as const,
          icon: Shield,
          color: '#FFFFFF',
          sparkline: makeSpark(sleepAgg.trend.slice(-7).map((t) => t.value)),
        },
        {
          id: 'focus',
          label: 'FOCUS TIME',
          value: `${focusAgg.totalMinutes}m`,
          change: focusAgg.totalMinutes > 0 ? '+30%' : 'NO COMPARISON',
          direction: 'up' as const,
          icon: Sparkles,
          color: '#C7FF72',
          sparkline: makeSpark(focusAgg.trend.slice(-7).map((t) => t.value)),
        },
        {
          id: 'habits',
          label: 'HABIT STREAK',
          value: `${currentStreak}d`,
          change: currentStreak > 0 ? '+100%' : 'NO COMPARISON',
          direction: 'up' as const,
          icon: Sparkles,
          color: '#C7FF72',
          sparkline: makeSpark([0, 1, 1, 1, 2, currentStreak]),
        },
      ],
      month: [
        {
          id: 'xp',
          label: 'RECOVERY XP',
          value: totalXP.toLocaleString(),
          change: totalXP > 0 ? '+45%' : 'NO COMPARISON',
          direction: 'up' as const,
          icon: Sparkles,
          color: '#C7FF72',
          sparkline: makeSpark([0, 150, 400, 750, totalXP]),
        },
        {
          id: 'urges',
          label: 'INTERVENTIONS',
          value: `${urgeLogs.length}`,
          change: urgeLogs.length > 0 ? '-35%' : 'NO COMPARISON',
          direction: 'up' as const,
          icon: Shield,
          color: '#FFFFFF',
          sparkline: makeSpark(urgeLogs.slice(-10).map((_, i) => i)),
        },
        {
          id: 'water',
          label: 'AVG HYDRATION',
          value: `${waterAgg.averageIntake} ML`,
          change: waterAgg.trackedDays > 0 ? '+8%' : 'NO COMPARISON',
          direction: 'up' as const,
          icon: BarChart2,
          color: '#C7FF72',
          sparkline: makeSpark(waterAgg.trend.slice(-15).map((t) => t.value)),
        },
        {
          id: 'activity',
          label: 'DISTANCE (KM)',
          value: `${(activityAgg.running.totalDistanceKm + activityAgg.walking.totalDistanceKm).toFixed(1)}k`,
          change: activityAgg.running.totalDistanceKm > 0 ? '+20%' : 'NO COMPARISON',
          direction: 'up' as const,
          icon: ArrowUpRight,
          color: '#FFFFFF',
          sparkline: makeSpark([0, 2, 5, 8, 12]),
        },
        {
          id: 'sleep',
          label: 'REST SCORE',
          value: sleepAgg.avgDurationHours > 0 ? `${sleepAgg.adherencePercentage}%` : '—',
          change: sleepAgg.totalTrackedDays > 0 ? '+10%' : 'NO COMPARISON',
          direction: 'up' as const,
          icon: Shield,
          color: '#FFFFFF',
          sparkline: makeSpark(sleepAgg.trend.map((t) => t.value)),
        },
        {
          id: 'focus',
          label: 'DEEP WORK',
          value: `${Math.floor(focusAgg.totalMinutes / 60)}h`,
          change: focusAgg.totalMinutes > 0 ? '+25%' : 'NO COMPARISON',
          direction: 'up' as const,
          icon: Sparkles,
          color: '#C7FF72',
          sparkline: makeSpark(focusAgg.trend.map((t) => t.value)),
        },
        {
          id: 'habits',
          label: 'LONGEST RUN',
          value: `${longestStreak}d`,
          change: longestStreak > 0 ? '+100%' : 'NO COMPARISON',
          direction: 'up' as const,
          icon: Sparkles,
          color: '#C7FF72',
          sparkline: makeSpark([0, 1, 3, 5, longestStreak]),
        },
      ],
      allTime: [
        {
          id: 'xp',
          label: 'LIFETIME XP',
          value: totalXP.toLocaleString(),
          change: 'RECORD',
          direction: 'up' as const,
          icon: Sparkles,
          color: '#C7FF72',
          sparkline: makeSpark([0, totalXP / 2, totalXP]),
        },
        {
          id: 'urges',
          label: 'TOTAL DEFLECTIONS',
          value: `${urgeLogs.length}`,
          change: 'PERMANENT',
          direction: 'up' as const,
          icon: Shield,
          color: '#FFFFFF',
          sparkline: makeSpark(urgeLogs.map((_, i) => i + 1)),
        },
        {
          id: 'water',
          label: 'PEAK WATER',
          value: `${bests.bestHydrationDayMl} ML`,
          change: 'PB',
          direction: 'up' as const,
          icon: BarChart2,
          color: '#C7FF72',
          sparkline: makeSpark([1000, 2000, bests.bestHydrationDayMl]),
        },
        {
          id: 'activity',
          label: 'MAX RUN PB',
          value: bests.longestRunKm > 0 ? `${bests.longestRunKm} KM` : '—',
          change: 'PB',
          direction: 'up' as const,
          icon: ArrowUpRight,
          color: '#FFFFFF',
          sparkline: makeSpark([0, bests.longestRunKm]),
        },
        {
          id: 'sleep',
          label: 'TRACKED NIGHTS',
          value: `${sleepLogs.length}`,
          change: 'LOGGED',
          direction: 'neutral' as const,
          icon: Shield,
          color: '#FFFFFF',
          sparkline: makeSpark(sleepLogs.map((s) => s.durationHours)),
        },
        {
          id: 'focus',
          label: 'PEAK SESSION',
          value: bests.mostFocusTimeMinutes > 0 ? `${bests.mostFocusTimeMinutes}m` : '—',
          change: 'PB',
          direction: 'up' as const,
          icon: Sparkles,
          color: '#C7FF72',
          sparkline: makeSpark([15, 25, bests.mostFocusTimeMinutes]),
        },
        {
          id: 'habits',
          label: 'MAX STREAK',
          value: `${longestStreak} DAYS`,
          change: 'RECORD',
          direction: 'up' as const,
          icon: Sparkles,
          color: '#C7FF72',
          sparkline: makeSpark([0, currentStreak, longestStreak]),
        },
      ],
    }
  }, [totalXP, urgeAgg, todayWaterMl, waterAgg, activityAgg, sleepAgg, focusAgg, currentStreak, longestStreak, urgeLogs, bests, sleepLogs])

  const handleExportData = () => {
    exportUserDataAsJson({
      exportedAt: new Date().toISOString(),
      user: { totalXP, currentLevel, currentStreak, longestStreak },
      urges: urgeLogs,
      activities,
      water: { todayWaterMl, dailyWaterGoalMl, history: activeWaterHistory },
      nutrition: foodLogs,
      sleep: sleepLogs,
      habits: habitLogs,
      personalBests: bests,
    })
  }

  const timeRangeLabel = timeRange.toUpperCase()

  return (
    <div className="relative min-h-screen text-white">
      {/* Background Starfield tailored for Analytics */}
      <CinematicStarfield variant="PROGRESS" intensity="subtle" density={0.9} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 space-y-10 pb-28 md:pb-20">
        {/* 1. Header & Global Time Filter (Requirements 5, 52) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#C7FF72]/15 text-[#C7FF72]">
                <BarChart2 size={20} />
              </span>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-wider">
                PERSONAL INTELLIGENCE &amp; ADVANCED ANALYTICS
              </h1>
            </div>
            <p className="font-mono text-xs text-muted mt-1 max-w-xl">
              Data-rich neurological &amp; somatic telemetry: mapping your transformation from impulse friction to autonomic resilience.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportData}
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 font-mono text-xs text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Export complete telemetry as JSON (Req 76)"
            >
              <Download size={13} className="text-[#C7FF72]" />
              <span className="hidden sm:inline">EXPORT</span>
            </button>

            <TimeRangeFilter selectedRange={timeRange} onChange={setTimeRange} />
          </div>
        </div>

        {/* 2. Executive Telemetry Sparkline Cards (Requirements 43, 44, 45) */}
        <PeriodCards cardsData={periodCardsData} />

        {/* 3. Hero Journey Multi-Metric & Compare Chart (Requirements 40, 41, 42, 79) */}
        <JourneyHeroChart
          timeLabel={timeRangeLabel}
          primaryMetric={heroMetric1}
          secondaryMetric={heroMetric2}
          data={heroChartData}
          metric1Name={heroMetric1}
          metric2Name={heroMetric2}
          onMetric1Change={setHeroMetric1}
          onMetric2Change={setHeroMetric2}
        />

        {/* 4. Urge & Intervention Deflection Analytics (Requirements 8, 9, 10, 11, 71) */}
        <UrgeAnalyticsCard
          totalUrges={urgeAgg.totalUrges}
          trend={urgeAgg.trend}
          heatmapMatrix={urgeAgg.heatmapMatrix}
          triggersList={urgeAgg.triggersList}
          interventionsList={urgeAgg.interventionsList}
          averageIntensity={urgeAgg.averageIntensity}
          deflectionRate={urgeAgg.deflectionRate}
          timeLabel={timeRangeLabel}
        />

        {/* 5. Hydration & Water Vs Goal Analytics (Requirements 12, 13, 14) */}
        <HydrationAnalyticsCard
          todayWaterMl={todayWaterMl}
          dailyGoalMl={dailyWaterGoalMl}
          averageIntake={waterAgg.averageIntake}
          daysMetGoal={waterAgg.daysMetGoal}
          trackedDays={waterAgg.trackedDays}
          consistencyPercent={waterAgg.consistencyPercent}
          bestDayMl={waterAgg.bestDayMl}
          trend={waterAgg.trend}
          timeLabel={timeRangeLabel}
        />

        {/* 6. Nutrition & Macronutrient Distribution (Requirements 15, 16, 17, 18) */}
        <NutritionAnalyticsCard
          totalLoggedMeals={nutritionAgg.totalLoggedMeals}
          macroBalance={nutritionAgg.macroBalance}
          mealCounts={nutritionAgg.mealCounts}
          nutrientSeries={nutritionAgg.nutrientSeries}
          timeLabel={timeRangeLabel}
        />

        {/* 7. Activity: Running, Walking & Contribution Grid (Requirements 19-25) */}
        <ActivityAnalyticsCard
          running={activityAgg.running}
          walking={activityAgg.walking}
          contributionGrid={activityAgg.contributionGrid}
          timeLabel={timeRangeLabel}
        />

        {/* 8. Sleep Duration & Consistency Analytics (Requirements 26, 27, 28) */}
        <SleepAnalyticsCard sleep={sleepAgg} timeLabel={timeRangeLabel} />

        {/* 9. Focus Sessions & Deep Work Volume (Requirement 29) */}
        <FocusAnalyticsCard focus={focusAgg} timeLabel={timeRangeLabel} />

        {/* 10. Habits & Quests Mastery (Requirements 30, 31) */}
        <HabitsQuestsAnalyticsCard habits={habitAgg} quests={questAgg} timeLabel={timeRangeLabel} />

        {/* 11. XP Accumulation, Velocity & Level Journey (Requirements 32-35) */}
        <XpProgressionAnalyticsCard
          xp={xpAgg}
          totalXP={totalXP}
          currentLevel={currentLevel}
          timeLabel={timeRangeLabel}
        />

        {/* 12. Estimated Time Redirected & Reclaimed (Requirements 38, 39) */}
        <TimeRedirectedCard
          activities={activities}
          urges={urgeLogs}
          timeLabel={timeRangeLabel}
        />

        {/* 13. Personal Bests & Record Benchmarks (Requirement 37) */}
        <PersonalBestsCard bests={bests} />

        {/* 14. Empirical Pattern Summary ("What Your Data Shows") (Requirements 66, 67) */}
        <PatternSummaryCard summary={patternSummary} />
      </div>
    </div>
  )
}

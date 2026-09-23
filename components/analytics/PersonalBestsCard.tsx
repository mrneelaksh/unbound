'use client'

import React from 'react'
import { Trophy, Flame, Footprints, Clock, Compass, Droplets, Activity } from 'lucide-react'
import type { PersonalBests } from '@/lib/analytics/types'

interface PersonalBestsCardProps {
  bests: PersonalBests
}

export function PersonalBestsCard({ bests }: PersonalBestsCardProps) {
  const records = [
    {
      id: 'streak',
      label: 'LONGEST STREAK',
      value: bests.longestStreakDays > 0 ? `${bests.longestStreakDays} DAYS` : '0 DAYS',
      subtext: 'Unbroken conscious days',
      icon: Flame,
    },
    {
      id: 'xp',
      label: 'PEAK WEEKLY XP',
      value: bests.highestWeeklyXp > 0 ? `+${bests.highestWeeklyXp} XP` : '0 XP',
      subtext: 'Highest 7-day velocity',
      icon: Trophy,
    },
    {
      id: 'run',
      label: 'LONGEST RUN',
      value: bests.longestRunKm > 0 ? `${bests.longestRunKm} KM` : '—',
      subtext: 'Continuous distance PB',
      icon: Footprints,
    },
    {
      id: 'focus',
      label: 'MOST FOCUS TIME',
      value: bests.mostFocusTimeMinutes > 0 ? `${bests.mostFocusTimeMinutes} MIN` : '—',
      subtext: 'Peak single-session focus',
      icon: Clock,
    },
    {
      id: 'quests',
      label: 'DAILY QUEST RECORD',
      value: bests.mostQuestsCompletedInDay > 0 ? `${bests.mostQuestsCompletedInDay} QUESTS` : '0',
      subtext: 'Max cleared in single day',
      icon: Compass,
    },
    {
      id: 'water',
      label: 'BEST HYDRATION DAY',
      value: bests.bestHydrationDayMl > 0 ? `${bests.bestHydrationDayMl} ML` : '0 ML',
      subtext: 'Optimal hydration volume',
      icon: Droplets,
    },
    {
      id: 'steps',
      label: 'HIGHEST STEP DAY',
      value: bests.highestActivitySteps > 0 ? `${bests.highestActivitySteps.toLocaleString()} STEPS` : '0',
      subtext: 'Peak somatic activity',
      icon: Activity,
    },
  ]

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 space-y-6 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#C7FF72]/15 text-[#C7FF72]">
              <Trophy size={16} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
              HALL OF MASTERY
            </span>
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mt-1">
            PERSONAL BESTS &amp; ALL-TIME BENCHMARKS
          </h3>
        </div>

        <div className="font-mono text-xs text-subtle hidden sm:block">
          VERIFIED SYSTEM RECORDS
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {records.map((rec) => {
          const Icon = rec.icon
          return (
            <div
              key={rec.id}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-[#C7FF72]/30 transition-all shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-subtle uppercase tracking-wider">
                  {rec.label}
                </span>
                <Icon size={14} className="text-[#C7FF72]" />
              </div>
              <div>
                <div className="font-numbers text-xl md:text-2xl font-bold text-white tracking-tight">
                  {rec.value}
                </div>
                <div className="font-mono text-[10px] text-muted mt-0.5">{rec.subtext}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-subtle">
        <span>DATA: LIFETIME TELEMETRY BESTS</span>
        <span>RECORDS ARE ONLY UPDATED UPON PROVABLE ATTAINMENT</span>
      </div>
    </div>
  )
}

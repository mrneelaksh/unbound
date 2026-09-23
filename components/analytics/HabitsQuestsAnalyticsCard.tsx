'use client'

import React from 'react'
import { Compass, CheckCircle2, Flame, Award, Sparkles, Target } from 'lucide-react'
import type { HabitMetrics, QuestMetrics } from '@/lib/analytics/types'
import { ChartEmptyState } from './ChartEmptyState'

interface HabitsQuestsAnalyticsCardProps {
  habits: HabitMetrics
  quests: QuestMetrics
  timeLabel: string
}

export function HabitsQuestsAnalyticsCard({
  habits,
  quests,
  timeLabel,
}: HabitsQuestsAnalyticsCardProps) {
  const hasData = habits.totalCompleted > 0 || quests.completedCount > 0

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 space-y-6 shadow-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#C7FF72]/15 text-[#C7FF72]">
              <Compass size={16} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
              HABIT AUTOMATION &amp; MASTERY
            </span>
            <span className="font-mono text-xs text-subtle">· {timeLabel}</span>
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mt-1">
            HABIT EXECUTION &amp; QUEST COMPLETION
          </h3>
        </div>

        <div className="font-mono text-xs text-muted">
          QUEST XP: <span className="text-[#C7FF72] font-bold">+{quests.totalXpFromQuests} XP</span>
        </div>
      </div>

      {!hasData ? (
        <ChartEmptyState
          title="NO HABITS OR QUESTS COMPLETED"
          message="Complete micro-quests like Cold Resets, Box Breathing, or Book Reading to transform conscious interventions into autonomic habits."
          height="220px"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Habits Panel (Req 30) */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <Target size={14} className="text-[#C7FF72]" /> REPLACEMENT HABITS
              </span>
              <span className="font-mono text-[10px] text-[#C7FF72]">
                {habits.totalCompleted} logged
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-subtle block">COMPLETION RATE</span>
                <span className="font-numbers text-xl font-bold text-white">
                  {habits.completionRate}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-subtle block">TOP ANCHOR</span>
                <span className="font-mono text-xs font-bold text-[#C7FF72] truncate block pt-1">
                  {habits.bestHabit || 'Cold Reset'}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1 font-mono text-xs">
              <div className="flex justify-between text-subtle text-[11px]">
                <span>Habit Reliability</span>
                <span className="text-white font-bold">{habits.completionRate}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-[#C7FF72] rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(10, habits.completionRate)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quests Panel (Req 31) */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <Award size={14} className="text-[#C7FF72]" /> DAILY QUESTS
              </span>
              <span className="font-mono text-[10px] text-muted">
                {quests.completedCount} finished
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-subtle block">QUESTS CLEARED</span>
                <span className="font-numbers text-xl font-bold text-white">
                  {quests.completedCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-subtle block">XP EARNED</span>
                <span className="font-numbers text-xl font-bold text-[#C7FF72]">
                  +{quests.totalXpFromQuests}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#C7FF72]" />
                <span className="text-white">Quest Consistency</span>
              </div>
              <span className="text-muted">{quests.completedCount > 0 ? 'Active Arc' : 'Ready'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-subtle">
        <span>DATA: HABIT LOGS &amp; QUEST VERIFICATION</span>
        <span>NEURO-ADAPTIVE DOPAMINE REPLACEMENT</span>
      </div>
    </div>
  )
}

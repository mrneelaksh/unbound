'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Sun, Moon, CloudSun, Shield, AlertTriangle, ArrowRight,
  Sparkles, CheckCircle2, Clock
} from 'lucide-react'
import { useUserStore } from '@/lib/store'

export function DailyBrief({ onOpenCheckin }: { onOpenCheckin: () => void }) {
  const { currentStreak, totalXP, plan } = useUserStore()
  const isNew = totalXP === 0 && currentStreak === 0

  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setTimeOfDay('morning')
    else if (hour < 18) setTimeOfDay('afternoon')
    else setTimeOfDay('evening')
  }, [])

  const briefContent = {
    morning: {
      tag: 'MORNING BRIEFING',
      title: 'FOUNDATION & HYDRATION PROTOCOL',
      desc: 'Front-load 500ml water and complete 10 minutes of morning movement to sensitize dopamine pathways for the day.',
      focus: 'Protect early morning phone-free space.',
      icon: Sun,
      accent: '#F59E0B',
    },
    afternoon: {
      tag: 'MIDDAY PULSE',
      title: 'DOPAMINE STABILITY WINDOW',
      desc: 'High cognitive energy. Optimal window for deep focus sprints or physical cardiovascular resets before evening fatigue.',
      focus: 'Hydrate and schedule your 10-minute focus session.',
      icon: CloudSun,
      accent: '#38BDF8',
    },
    evening: {
      tag: 'EVENING DEFENSE',
      title: 'HIGH-RISK TEMPORAL SHIELD',
      desc: 'Vulnerability peaks between 10 PM and 12 AM. Night Shield is active. Avoid idle scrolling and prepare for restorative sleep.',
      focus: 'Engage Night Shield 60 minutes prior to sleep.',
      icon: Moon,
      accent: '#A78BFA',
    },
  }[timeOfDay]

  const Icon = briefContent.icon

  return (
    <div className="p-6 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 shadow-card relative overflow-hidden space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: `${briefContent.accent}15`,
              color: briefContent.accent,
              borderColor: `${briefContent.accent}35`,
            }}
          >
            <Icon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider bg-white/10 text-white">
                {briefContent.tag}
              </span>
              <span className="font-mono text-xs text-subtle">
                {isNew ? 'Day 0 Baseline' : `Day ${currentStreak} Momentum`}
              </span>
            </div>
            <h3 className="font-display text-base md:text-lg font-bold text-white mt-0.5">
              {briefContent.title}
            </h3>
          </div>
        </div>

        <button
          onClick={onOpenCheckin}
          className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/15 hover:border-white/30 text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Sparkles size={12} className="text-[#C7FF72]" />
          <span>Daily Check-in (+15 XP)</span>
        </button>
      </div>

      <p className="font-sans text-xs text-muted leading-relaxed">
        {briefContent.desc}
      </p>

      <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C7FF72]" />
          <span>Priority: {briefContent.focus}</span>
        </div>

        <Link
          href={timeOfDay === 'evening' ? '/night-shield' : '/wellbeing'}
          className="text-white hover:text-[#C7FF72] transition-colors flex items-center gap-1 font-semibold"
        >
          <span>{timeOfDay === 'evening' ? 'Open Night Shield' : 'View Biological Map'}</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )
}

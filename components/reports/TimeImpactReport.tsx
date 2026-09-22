'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Target, BookOpen, Terminal, Footprints,
  Compass, ArrowRight, RefreshCw, Sparkles, Info, Sliders, Check
} from 'lucide-react'

export interface TimeImpactInputs {
  approxYearsActive?: number // default ~2 to 5 years based on age answers
  sessionsPerWeek?: number // default 5
  minutesPerSession?: number // default 35
}

interface TimeImpactReportProps {
  initialYears?: number
  initialSessionsPerWeek?: number
  initialMinutesPerSession?: number
  className?: string
  showRedirectAction?: boolean
  onContinue?: () => void
}

export function TimeImpactReport({
  initialYears = 3,
  initialSessionsPerWeek = 5,
  initialMinutesPerSession = 35,
  className = '',
  showRedirectAction = true,
  onContinue,
}: TimeImpactReportProps) {
  // User adjustable assumptions
  const [yearsActive, setYearsActive] = useState(initialYears)
  const [sessionsPerWeek, setSessionsPerWeek] = useState(initialSessionsPerWeek)
  const [minutesPerSession, setMinutesPerSession] = useState(initialMinutesPerSession)
  const [activeFactIndex, setActiveFactIndex] = useState(0)

  // Calculations
  const metrics = useMemo(() => {
    const totalWeeks = yearsActive * 52
    const totalSessions = totalWeeks * sessionsPerWeek
    const totalMinutes = totalSessions * minutesPerSession
    const totalHours = Math.round(totalMinutes / 60)
    const totalDays = Number((totalHours / 24).toFixed(1))

    // Illustrative Opportunity Conversions (What could that time represent)
    const focusSessions15 = Math.round(totalMinutes / 15)
    const studySessions30 = Math.round(totalMinutes / 30)
    const deepWork90 = Math.round(totalMinutes / 90)

    // Redirectable potential (e.g. converting next 6 months of consistency: ~60 hours)
    const sixMonthRedirectHours = Math.min(totalHours, Math.round((sessionsPerWeek * minutesPerSession * 26) / 60))

    const codingSessions = Math.round(sixMonthRedirectHours / 3)
    const longRuns5k = Math.round(sixMonthRedirectHours / 1)
    const booksRead = Math.round((sixMonthRedirectHours * 10) / 250) // 10 pages/hr, 250 page book

    return {
      totalSessions,
      totalMinutes,
      totalHours,
      totalDays,
      focusSessions15,
      studySessions30,
      deepWork90,
      sixMonthRedirectHours,
      codingSessions,
      longRuns5k,
      booksRead,
    }
  }, [yearsActive, sessionsPerWeek, minutesPerSession])

  // Rotating Did You Know facts
  const illustrativeFacts = [
    {
      title: 'Deep Focus Equivalent',
      text: `Your estimated time is equivalent to approximately ${metrics.focusSessions15.toLocaleString()} × 15-minute deep focus sprints.`,
      icon: Terminal,
    },
    {
      title: 'Knowledge Compounding',
      text: `Reading at a relaxed 10 pages per hour, that time represents approximately ${Math.round(metrics.totalHours * 10).toLocaleString()} pages of literature or study.`,
      icon: BookOpen,
    },
    {
      title: 'Physical Vitality',
      text: `At an average 5K walking pace (45 minutes), that equals approximately ${Math.round((metrics.totalMinutes / 45)).toLocaleString()} restorative nature walks.`,
      icon: Footprints,
    },
    {
      title: 'Expedition Scale Perspective',
      text: `Using an illustrative 40-day mountaineering expedition timeline, that would represent approximately ${Number((metrics.totalDays / 40).toFixed(1))} expedition-length periods.`,
      icon: Compass,
    },
  ]

  const nextFact = () => {
    setActiveFactIndex((prev) => (prev + 1) % illustrativeFacts.length)
  }

  const currentFact = illustrativeFacts[activeFactIndex]
  const FactIcon = currentFact.icon

  return (
    <div className={`p-6 md:p-8 rounded-3xl bg-card border border-white/10 shadow-card space-y-6 text-left ${className}`}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <span className="font-mono text-[9px] px-2.5 py-0.5 rounded-full bg-[#C7FF72]/15 text-[#C7FF72] border border-[#C7FF72]/30 uppercase font-bold tracking-wider">
            REFLECTIVE PERSPECTIVE
          </span>
          <h3 className="font-display text-lg md:text-xl font-bold text-white mt-1">
            TIME IMPACT &amp; OPPORTUNITY REPORT
          </h3>
          <p className="font-mono text-xs text-muted mt-0.5">
            Here is where your time has been going—and the immense potential you can redirect.
          </p>
        </div>

        <span className="font-mono text-[10px] px-3 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-subtle">
          Illustrative Comparison
        </span>
      </div>

      {/* Main Calculated Metrics Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Metric 1: Estimated Time Spent */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
          <span className="font-mono text-[10px] text-subtle uppercase tracking-wider">
            ESTIMATED TIME SPENT
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-numbers text-3xl md:text-4xl font-bold text-white">
              ~{metrics.totalHours.toLocaleString()}
            </span>
            <span className="font-mono text-sm text-subtle font-bold">HOURS</span>
          </div>
          <div className="font-mono text-xs text-muted flex items-center gap-1.5 pt-1">
            <span>≈ {metrics.totalDays} Full Days</span>
            <span className="text-white/20">·</span>
            <span>~{metrics.totalSessions.toLocaleString()} sessions</span>
          </div>
          <p className="font-sans text-[11px] text-subtle pt-1 leading-relaxed">
            Estimate based on your answers and assumptions. Reflecting on this time builds clarity.
          </p>
        </div>

        {/* Metric 2: Time You Could Redirect */}
        <div className="p-5 rounded-2xl bg-[#C7FF72]/[0.06] border border-[#C7FF72]/30 space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C7FF72]/10 rounded-full blur-2xl pointer-events-none" />
          <span className="font-mono text-[10px] text-[#C7FF72] uppercase font-bold tracking-wider">
            TIME YOU COULD REDIRECT (NEXT 6 MOS)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-numbers text-3xl md:text-4xl font-bold text-white">
              ~{metrics.sixMonthRedirectHours}
            </span>
            <span className="font-mono text-sm text-[#C7FF72] font-bold">HOURS RECLAIMED</span>
          </div>
          <div className="font-mono text-xs text-muted flex items-center gap-1.5 pt-1">
            <span>Building consistency</span>
            <span className="text-white/20">·</span>
            <span className="text-white font-bold">Sovereignty restored</span>
          </div>
          <p className="font-sans text-[11px] text-muted pt-1 leading-relaxed">
            Imagine converting even a fraction of this into your craft, health, and life routines.
          </p>
        </div>
      </div>

      {/* What That Time Represents (Illustrative Alternatives) */}
      <div className="p-5 rounded-2xl bg-card border border-white/10 space-y-3">
        <span className="font-mono text-[10px] text-subtle uppercase tracking-wider">
          WHAT COULD THAT TIME REPRESENT?
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="font-numbers text-lg font-bold text-white">
              {metrics.focusSessions15.toLocaleString()} ×
            </span>
            <div className="text-[11px] text-muted">15-minute focus sprints</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="font-numbers text-lg font-bold text-white">
              {metrics.studySessions30.toLocaleString()} ×
            </span>
            <div className="text-[11px] text-muted">30-minute study blocks</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="font-numbers text-lg font-bold text-white">
              {metrics.deepWork90.toLocaleString()} ×
            </span>
            <div className="text-[11px] text-muted">90-minute deep-work sessions</div>
          </div>
        </div>
      </div>

      {/* Fact Comparison Engine ("Did You Know?") */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-[#C7FF72]" />
            <span className="font-mono text-[10px] text-subtle uppercase tracking-wider">
              FACT COMPARISON ENGINE · DID YOU KNOW?
            </span>
          </div>
          <button
            onClick={nextFact}
            className="font-mono text-[11px] text-subtle hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Next insight</span>
            <RefreshCw size={11} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeFactIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-3 pt-1"
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 text-[#C7FF72] flex items-center justify-center shrink-0 mt-0.5">
              <FactIcon size={16} />
            </div>
            <div>
              <h5 className="font-display text-sm font-bold text-white">
                {currentFact.title}
              </h5>
              <p className="font-sans text-xs text-muted leading-relaxed mt-0.5">
                {currentFact.text}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* User Interactive Assumption Adjuster */}
      <div className="p-5 rounded-2xl bg-card border border-white/5 space-y-4">
        <div className="flex items-center gap-2">
          <Sliders size={14} className="text-subtle" />
          <span className="font-mono text-[10px] text-subtle uppercase tracking-wider">
            ADJUST CALCULATION ASSUMPTIONS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* Slider 1: Years */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-muted">
              <span>Timeframe:</span>
              <span className="text-white font-bold">{yearsActive} {yearsActive === 1 ? 'year' : 'years'}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={yearsActive}
              onChange={(e) => setYearsActive(Number(e.target.value))}
              className="w-full accent-[#C7FF72] bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Slider 2: Sessions per week */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-muted">
              <span>Frequency:</span>
              <span className="text-white font-bold">{sessionsPerWeek} sessions / wk</span>
            </div>
            <input
              type="range"
              min={1}
              max={21}
              value={sessionsPerWeek}
              onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
              className="w-full accent-[#C7FF72] bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Slider 3: Duration per session */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-muted">
              <span>Avg Duration:</span>
              <span className="text-white font-bold">{minutesPerSession} min</span>
            </div>
            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={minutesPerSession}
              onChange={(e) => setMinutesPerSession(Number(e.target.value))}
              className="w-full accent-[#C7FF72] bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Non-shaming Disclaimer */}
      <div className="p-3.5 rounded-xl bg-white/[0.015] border border-white/5 flex items-start gap-2.5">
        <Info size={14} className="text-subtle shrink-0 mt-0.5" />
        <p className="font-sans text-[11px] text-subtle leading-relaxed">
          Estimates are illustrative comparisons based on self-reported patterns, not precise measurements. UNBOUND is designed to empower conscious redirection—every moment forward is yours to build.
        </p>
      </div>

      {/* Optional CTA */}
      {showRedirectAction && onContinue && (
        <button
          onClick={onContinue}
          className="w-full py-3.5 px-6 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-[#C7FF72] text-[#050505] hover:bg-[#D5FFA0] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(199,255,114,0.2)]"
        >
          <span>BEGIN REDIRECTING MY TIME</span>
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  )
}

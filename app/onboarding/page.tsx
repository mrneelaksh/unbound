'use client'

import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Loader2,
  Coffee, Activity, User, Moon, Smartphone, Home, AlertCircle, Repeat, HelpCircle,
  Gamepad2, Target, BookOpen, Terminal, Dumbbell, Headphones, Palette, GraduationCap, Wind, Users,
  MessageSquare, Shield
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useOnboardingStore, useUserStore } from '@/lib/store'
import {
  computePatternScores,
  getTopTriggers,
  shouldRecommendProfessionalSupport,
  type PatternScores,
} from '@/lib/core'
import { createClient } from '@/lib/supabase/client'
import { TimeImpactReport } from '@/components/reports/TimeImpactReport'

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type Direction = 'forward' | 'back'

// Typed cubic-bezier tuple so Framer Motion's Easing type is satisfied
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]
const EASE_SMOOTH = [0.4, 0, 0.2, 1] as [number, number, number, number]

// ─────────────────────────────────────────────────────────────
// ANIMATION VARIANTS
// ─────────────────────────────────────────────────────────────

function getVariants(direction: Direction) {
  const xIn = direction === 'forward' ? '100%' : '-100%'
  const xOut = direction === 'forward' ? '-100%' : '100%'
  return {
    enter: { x: xIn, opacity: 0 },
    center: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring' as const, damping: 30, stiffness: 280, duration: 0.35 },
    },
    exit: {
      x: xOut,
      opacity: 0,
      transition: { duration: 0.25, ease: EASE_SMOOTH },
    },
  }
}

// ─────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────

function QuestionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle mb-4">
      {children}
    </p>
  )
}

function QuestionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-display-md text-text mb-6 leading-tight">{children}</h2>
  )
}

interface OptionCardProps {
  label: string
  selected?: boolean
  onClick: () => void
}

function OptionCard({ label, selected, onClick }: OptionCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left px-4 py-3.5 rounded-md border font-sans text-sm transition-all duration-150
        ${
          selected
            ? 'bg-[#1A1A1A] border-white/50 text-text'
            : 'bg-card border-white/10 text-muted hover:border-white/25 hover:text-text'
        }`}
    >
      {label}
    </motion.button>
  )
}

interface PillChipProps {
  label: string
  selected?: boolean
  onClick: () => void
}

function PillChip({ label, selected, onClick }: PillChipProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`px-4 py-2 rounded-full border text-sm font-sans transition-all duration-150
        ${
          selected
            ? 'bg-[#1A1A1A] border-white/50 text-text'
            : 'bg-card border-white/10 text-muted hover:border-white/25 hover:text-text'
        }`}
    >
      {label}
    </motion.button>
  )
}

function ContinueButton({
  onClick,
  disabled,
  loading,
  label = 'CONTINUE',
}: {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  label?: string
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled ? { scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      className="w-full py-3.5 px-6 mt-6 rounded-md font-sans text-sm font-semibold tracking-wide
        bg-text text-bg
        hover:bg-white
        disabled:opacity-30 disabled:cursor-not-allowed
        transition-all duration-200
        flex items-center justify-center gap-2"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : null}
      {label}
    </motion.button>
  )
}

// ─────────────────────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const total = 16
  const pct = Math.min(100, Math.round((step / total) * 100))
  return (
    <div className="w-full h-[1px] bg-white/[0.07] overflow-hidden">
      <motion.div
        className="h-full bg-text"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// BACK BUTTON
// ─────────────────────────────────────────────────────────────

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-subtle hover:text-muted transition-colors text-xs font-sans"
      aria-label="Go back"
    >
      <ArrowLeft size={14} />
      Back
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// SCREEN 0 — WELCOME
// ─────────────────────────────────────────────────────────────

function WelcomeScreen({ onNext }: { onNext: () => void }) {
  const { displayName } = useUserStore()
  const greeting = displayName ? `Welcome, ${displayName}.` : 'Welcome to UNBOUND.'

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center mb-6"
      >
        <Logo size="xl" showWordmark={false} className="mb-4" />
        <h1 className="font-display text-display-2xl text-text">UNBOUND</h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 0.5, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-display-md text-text mb-10"
      >
        Break the loop. Build yourself.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-2 mb-12"
      >
        <p className="text-text font-display text-lg mb-1">{greeting}</p>
        <p className="text-muted font-sans text-sm">This isn&apos;t about judging you.</p>
        <p className="text-muted font-sans text-sm">It&apos;s about understanding your patterns.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-8 py-4 rounded-md bg-text text-bg
            font-sans text-sm font-semibold tracking-wide hover:bg-white transition-all duration-200"
        >
          Let&apos;s understand your journey
          <ArrowRight size={15} />
        </motion.button>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Q1 — Age range
// ─────────────────────────────────────────────────────────────

const AGE_OPTIONS = ['Under 13', '13–15', '16–17', '18–24', '25–34', '35–44', '45–54', '55+']

function Q1({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { answers, setAnswer } = useOnboardingStore()

  function select(val: string) {
    setAnswer('q1_age_range', val)
    setTimeout(onNext, 220)
  }

  return (
    <div className="flex flex-col">
      <BackButton onClick={onBack} />
      <div className="mt-8">
        <QuestionLabel>HOW OLD ARE YOU?</QuestionLabel>
        <div className="grid grid-cols-2 gap-2">
          {AGE_OPTIONS.map((opt) => (
            <OptionCard
              key={opt}
              label={opt}
              selected={answers.q1_age_range === opt}
              onClick={() => select(opt)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Q2 — First exposure
// ─────────────────────────────────────────────────────────────

const EXPOSURE_OPTIONS = ['Before 13', '13–15', '16–17', '18+', 'Prefer not to say']

function Q2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { answers, setAnswer } = useOnboardingStore()

  function select(val: string) {
    setAnswer('q2_first_exposure', val)
    setTimeout(onNext, 220)
  }

  return (
    <div className="flex flex-col">
      <BackButton onClick={onBack} />
      <div className="mt-8">
        <QuestionLabel>WHEN DID YOU FIRST ENCOUNTER PORNOGRAPHY?</QuestionLabel>
        <p className="text-subtle text-xs font-sans leading-relaxed mb-6">
          Accidental exposure and intentional use are different things. This helps us understand context.
        </p>
        <div className="flex flex-col gap-2">
          {EXPOSURE_OPTIONS.map((opt) => (
            <OptionCard
              key={opt}
              label={opt}
              selected={answers.q2_first_exposure === opt}
              onClick={() => select(opt)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Q3 — Frequency
// ─────────────────────────────────────────────────────────────

const FREQ_OPTIONS = [
  'Rarely',
  '1–2 times/week',
  '3–6 times/week',
  'Daily',
  'Multiple times/day',
  'Prefer not to say',
]

function Q3({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { answers, setAnswer } = useOnboardingStore()

  function select(val: string) {
    setAnswer('q3_frequency', val)
    setTimeout(onNext, 220)
  }

  return (
    <div className="flex flex-col">
      <BackButton onClick={onBack} />
      <div className="mt-8">
        <QuestionLabel>HOW OFTEN DO YOU CURRENTLY USE PORNOGRAPHY?</QuestionLabel>
        <div className="flex flex-col gap-2">
          {FREQ_OPTIONS.map((opt) => (
            <OptionCard
              key={opt}
              label={opt}
              selected={answers.q3_frequency === opt}
              onClick={() => select(opt)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Q4 — Control score (1–5 tiles)
// ─────────────────────────────────────────────────────────────

const CONTROL_LABELS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often']

function Q4({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { answers, setAnswer } = useOnboardingStore()

  function select(val: number) {
    setAnswer('q4_control_score', val)
    setTimeout(onNext, 220)
  }

  return (
    <div className="flex flex-col">
      <BackButton onClick={onBack} />
      <div className="mt-8">
        <QuestionLabel>HOW OFTEN DO YOU FEEL YOU USE IT LONGER THAN INTENDED?</QuestionLabel>
        <div className="flex flex-col gap-2">
          {CONTROL_LABELS.map((label, i) => {
            const val = i + 1
            const selected = answers.q4_control_score === val
            return (
              <motion.button
                key={val}
                onClick={() => select(val)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-md border font-sans transition-all duration-150
                  ${
                    selected
                      ? 'bg-[#1A1A1A] border-white/50 text-text'
                      : 'bg-card border-white/10 text-muted hover:border-white/25 hover:text-text'
                  }`}
              >
                <span className="font-numbers text-2xl font-semibold w-7 shrink-0 text-center">
                  {val}
                </span>
                <span className="text-sm">{label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Q5 — Attempts
// ─────────────────────────────────────────────────────────────

const ATTEMPTS_OPTIONS = ['No', 'Once', 'Several times', 'Many times']

function Q5({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { answers, setAnswer } = useOnboardingStore()

  function select(val: string) {
    setAnswer('q5_attempts', val)
    setTimeout(onNext, 220)
  }

  return (
    <div className="flex flex-col">
      <BackButton onClick={onBack} />
      <div className="mt-8">
        <QuestionLabel>HAVE YOU TRIED TO REDUCE OR STOP BEFORE?</QuestionLabel>
        <div className="flex flex-col gap-2">
          {ATTEMPTS_OPTIONS.map((opt) => (
            <OptionCard
              key={opt}
              label={opt}
              selected={answers.q5_attempts === opt}
              onClick={() => select(opt)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Q6 — Feelings (multi-select)
// ─────────────────────────────────────────────────────────────

const FEELINGS_OPTIONS = [
  'Fine', 'Relaxed', 'Guilty', 'Ashamed', 'Frustrated',
  'Tired', 'Empty', 'Stressed', 'Other',
]

function Q6({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { answers, setAnswer } = useOnboardingStore()
  const selected: string[] = answers.q6_feelings ?? []

  function toggle(val: string) {
    const next = selected.includes(val)
      ? selected.filter((f) => f !== val)
      : [...selected, val]
    setAnswer('q6_feelings', next)
  }

  return (
    <div className="flex flex-col">
      <BackButton onClick={onBack} />
      <div className="mt-8">
        <QuestionLabel>HOW DO YOU USUALLY FEEL AFTERWARD?</QuestionLabel>
        <p className="text-subtle text-xs font-sans mb-5">Select all that apply</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {FEELINGS_OPTIONS.map((opt) => (
            <PillChip
              key={opt}
              label={opt}
              selected={selected.includes(opt)}
              onClick={() => toggle(opt)}
            />
          ))}
        </div>
        {selected.length > 0 && <ContinueButton onClick={onNext} />}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Q7 — Triggers (multi-select with emoji)
// ─────────────────────────────────────────────────────────────

const TRIGGER_OPTIONS = [
  { icon: Coffee, label: 'Boredom' },
  { icon: Activity, label: 'Stress' },
  { icon: User, label: 'Loneliness' },
  { icon: Moon, label: 'Late night' },
  { icon: Smartphone, label: 'Social media' },
  { icon: Home, label: 'Being alone' },
  { icon: AlertCircle, label: 'Frustration' },
  { icon: Repeat, label: 'Habit' },
  { icon: HelpCircle, label: 'Not sure' },
]

function Q7({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { answers, setAnswer } = useOnboardingStore()
  const selected: string[] = answers.q7_triggers ?? []

  function toggle(val: string) {
    const next = selected.includes(val)
      ? selected.filter((f) => f !== val)
      : [...selected, val]
    setAnswer('q7_triggers', next)
  }

  return (
    <div className="flex flex-col">
      <BackButton onClick={onBack} />
      <div className="mt-8">
        <QuestionLabel>WHAT USUALLY TRIGGERS THE URGE?</QuestionLabel>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {TRIGGER_OPTIONS.map(({ icon: Icon, label }) => {
            const isSelected = selected.includes(label)
            return (
              <motion.button
                key={label}
                onClick={() => toggle(label)}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-lg border font-sans text-sm text-left transition-all duration-150
                  ${
                    isSelected
                      ? 'bg-white/10 border-white/40 text-text'
                      : 'bg-card border-white/10 text-muted hover:border-white/25 hover:text-text'
                  }`}
              >
                <Icon size={16} className={isSelected ? 'text-text' : 'text-subtle'} />
                <span>{label}</span>
              </motion.button>
            )
          })}
        </div>
        {selected.length > 0 && <ContinueButton onClick={onNext} />}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Q8 — High-risk time
// ─────────────────────────────────────────────────────────────

const TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Late night']

function Q8({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { answers, setAnswer } = useOnboardingStore()

  function select(val: string) {
    setAnswer('q8_high_risk_time', val)
    setTimeout(onNext, 220)
  }

  return (
    <div className="flex flex-col">
      <BackButton onClick={onBack} />
      <div className="mt-8">
        <QuestionLabel>WHEN ARE URGES STRONGEST?</QuestionLabel>
        <div className="grid grid-cols-2 gap-2">
          {TIME_OPTIONS.map((opt) => (
            <motion.button
              key={opt}
              onClick={() => select(opt)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`py-8 rounded-md border font-sans text-sm transition-all duration-150 flex items-center justify-center
                ${
                  answers.q8_high_risk_time === opt
                    ? 'bg-[#1A1A1A] border-white/50 text-text'
                    : 'bg-card border-white/10 text-muted hover:border-white/25 hover:text-text'
                }`}
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Q9 — Life impact (multi-select)
// ─────────────────────────────────────────────────────────────

const IMPACT_OPTIONS = [
  'Sleep', 'Study', 'Work', 'Relationships',
  'Motivation', 'Mood', 'Nothing', 'Not sure',
]

function Q9({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { answers, setAnswer } = useOnboardingStore()
  const selected: string[] = answers.q9_life_impact ?? []

  function toggle(val: string) {
    const next = selected.includes(val)
      ? selected.filter((f) => f !== val)
      : [...selected, val]
    setAnswer('q9_life_impact', next)
  }

  return (
    <div className="flex flex-col">
      <BackButton onClick={onBack} />
      <div className="mt-8">
        <QuestionLabel>HAS THIS BEHAVIOUR AFFECTED ANYTHING IN YOUR LIFE?</QuestionLabel>
        <div className="flex flex-wrap gap-2 mb-2">
          {IMPACT_OPTIONS.map((opt) => (
            <PillChip
              key={opt}
              label={opt}
              selected={selected.includes(opt)}
              onClick={() => toggle(opt)}
            />
          ))}
        </div>
        {selected.length > 0 && <ContinueButton onClick={onNext} />}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Q10 — Urge resistance (1–10 slider)
// ─────────────────────────────────────────────────────────────

function Q10({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { answers, setAnswer } = useOnboardingStore()
  const value = answers.q10_urge_resistance ?? 5

  return (
    <div className="flex flex-col">
      <BackButton onClick={onBack} />
      <div className="mt-8">
        <QuestionLabel>WHEN AN URGE APPEARS, HOW DIFFICULT IS IT TO RESIST?</QuestionLabel>
        <p className="text-subtle text-xs font-sans mb-8">1 = Very easy&nbsp;&nbsp;·&nbsp;&nbsp;10 = Almost impossible</p>

        {/* Big number display */}
        <div className="flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.span
              key={value}
              initial={{ opacity: 0, y: -12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.9 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-numbers text-stat-xl text-text font-semibold"
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Number stops */}
        <div className="flex gap-1 mb-8">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <motion.button
              key={n}
              onClick={() => setAnswer('q10_urge_resistance', n)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              className={`flex-1 h-11 rounded flex items-center justify-center font-numbers text-sm font-medium transition-all duration-150 border
                ${
                  value === n
                    ? 'bg-text text-bg border-transparent'
                    : n < value
                    ? 'bg-card border-white/20 text-muted'
                    : 'bg-card border-white/[0.07] text-subtle hover:border-white/20 hover:text-muted'
                }`}
            >
              {n}
            </motion.button>
          ))}
        </div>

        <ContinueButton onClick={onNext} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Q11 — Motivations (multi-select)
// ─────────────────────────────────────────────────────────────

const MOTIVATION_OPTIONS = [
  'Better focus', 'Better relationships', 'More energy', 'Better sleep',
  'Personal values', 'Productivity', 'Confidence', 'I want more control', 'Other',
]

function Q11({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { answers, setAnswer } = useOnboardingStore()
  const selected: string[] = answers.q11_motivations ?? []

  function toggle(val: string) {
    const next = selected.includes(val)
      ? selected.filter((f) => f !== val)
      : [...selected, val]
    setAnswer('q11_motivations', next)
  }

  return (
    <div className="flex flex-col">
      <BackButton onClick={onBack} />
      <div className="mt-8">
        <QuestionLabel>WHY DO YOU WANT TO CHANGE?</QuestionLabel>
        <div className="flex flex-wrap gap-2 mb-2">
          {MOTIVATION_OPTIONS.map((opt) => (
            <PillChip
              key={opt}
              label={opt}
              selected={selected.includes(opt)}
              onClick={() => toggle(opt)}
            />
          ))}
        </div>
        {selected.length > 0 && <ContinueButton onClick={onNext} />}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Q12 — Replacement habits (multi-select with emoji)
// ─────────────────────────────────────────────────────────────

const HABIT_OPTIONS = [
  { icon: Gamepad2, label: 'Gaming' },
  { icon: Target, label: 'Chess' },
  { icon: BookOpen, label: 'Reading' },
  { icon: Terminal, label: 'Coding' },
  { icon: Dumbbell, label: 'Fitness' },
  { icon: Headphones, label: 'Music' },
  { icon: Palette, label: 'Creative work' },
  { icon: GraduationCap, label: 'Study' },
  { icon: Wind, label: 'Meditation' },
  { icon: Users, label: 'Socializing' },
]

function Q12({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { answers, setAnswer } = useOnboardingStore()
  const selected: string[] = answers.q12_replacement_habits ?? []

  function toggle(val: string) {
    const next = selected.includes(val)
      ? selected.filter((f) => f !== val)
      : [...selected, val]
    setAnswer('q12_replacement_habits', next)
  }

  return (
    <div className="flex flex-col">
      <BackButton onClick={onBack} />
      <div className="mt-8">
        <QuestionLabel>WHAT WOULD YOU RATHER SPEND THAT TIME DOING?</QuestionLabel>
        <p className="text-subtle text-xs font-sans mb-5">These become your replacement habits.</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {HABIT_OPTIONS.map(({ icon: Icon, label }) => {
            const isSelected = selected.includes(label)
            return (
              <motion.button
                key={label}
                onClick={() => toggle(label)}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-lg border font-sans text-sm text-left transition-all duration-150
                  ${
                    isSelected
                      ? 'bg-white/10 border-white/40 text-text'
                      : 'bg-card border-white/10 text-muted hover:border-white/25 hover:text-text'
                  }`}
              >
                <Icon size={16} className={isSelected ? 'text-text' : 'text-subtle'} />
                <span>{label}</span>
              </motion.button>
            )
          })}
        </div>
        {selected.length > 0 && <ContinueButton onClick={onNext} />}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Q13 — Previous strategies (multi-select)
// ─────────────────────────────────────────────────────────────

const STRATEGY_OPTIONS = [
  'Blocking websites', 'Willpower', 'Deleting apps',
  'Exercise', 'Meditation', 'Accountability', 'Nothing', 'Other',
]

function Q13({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { answers, setAnswer } = useOnboardingStore()
  const selected: string[] = answers.q13_previous_strategies ?? []

  function toggle(val: string) {
    const next = selected.includes(val)
      ? selected.filter((f) => f !== val)
      : [...selected, val]
    setAnswer('q13_previous_strategies', next)
  }

  return (
    <div className="flex flex-col">
      <BackButton onClick={onBack} />
      <div className="mt-8">
        <QuestionLabel>WHAT HAVE YOU ALREADY TRIED?</QuestionLabel>
        <div className="flex flex-wrap gap-2 mb-2">
          {STRATEGY_OPTIONS.map((opt) => (
            <PillChip
              key={opt}
              label={opt}
              selected={selected.includes(opt)}
              onClick={() => toggle(opt)}
            />
          ))}
        </div>
        {selected.length > 0 && <ContinueButton onClick={onNext} />}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Q14 — Support preference
// ─────────────────────────────────────────────────────────────

const SUPPORT_OPTIONS = ['Self-guided', 'AI coach', 'Professional support', 'Not sure']

function Q14({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { answers, setAnswer } = useOnboardingStore()

  function select(val: string) {
    setAnswer('q14_support_preference', val)
    setTimeout(onNext, 220)
  }

  return (
    <div className="flex flex-col">
      <BackButton onClick={onBack} />
      <div className="mt-8">
        <QuestionLabel>WOULD YOU LIKE ADDITIONAL SUPPORT?</QuestionLabel>
        <div className="flex flex-col gap-2">
          {SUPPORT_OPTIONS.map((opt) => (
            <OptionCard
              key={opt}
              label={opt}
              selected={answers.q14_support_preference === opt}
              onClick={() => select(opt)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Q15 — Personal goal (textarea)
// ─────────────────────────────────────────────────────────────

function Q15({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { answers, setAnswer } = useOnboardingStore()
  const value = answers.q15_personal_goal ?? ''
  const MAX = 280

  return (
    <div className="flex flex-col">
      <BackButton onClick={onBack} />
      <div className="mt-8">
        <QuestionLabel>WHAT DOES BEING UNBOUND MEAN TO YOU?</QuestionLabel>
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => setAnswer('q15_personal_goal', e.target.value.slice(0, MAX))}
            placeholder="Write in your own words…"
            rows={5}
            className="w-full px-4 py-3.5 rounded-md font-sans text-sm text-text placeholder:text-subtle
              bg-card border border-white/10
              focus:outline-none focus:border-white/30
              transition-colors duration-200 resize-none leading-relaxed"
          />
          <span className="absolute bottom-3 right-3 font-mono text-[10px] text-subtle">
            {value.length}/{MAX}
          </span>
        </div>
        <ContinueButton onClick={onNext} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// SCREEN 16 — PATTERN REPORT
// ─────────────────────────────────────────────────────────────

const SCORE_LABELS: { key: keyof PatternScores; label: string }[] = [
  { key: 'control', label: 'CONTROL' },
  { key: 'triggerLoad', label: 'TRIGGER LOAD' },
  { key: 'nightRisk', label: 'NIGHT RISK' },
  { key: 'habitStrength', label: 'HABIT STRENGTH' },
  { key: 'motivation', label: 'MOTIVATION' },
  { key: 'recoveryReadiness', label: 'RECOVERY READINESS' },
]

function ScoreBar({ label, value, index }: { label: string; value: number; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
          {label}
        </span>
        <span className="font-numbers text-sm font-semibold text-muted">{value}</span>
      </div>
      <div className="h-[2px] bg-white/[0.07] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-text rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: index * 0.1 + 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  )
}

function triggerContextText(topTriggers: string[]): string {
  if (!topTriggers.length) return 'We noticed you have a unique pattern that we\'ll help you understand over time.'
  const tList = topTriggers.slice(0, 2).join(' and ')
  return `Your strongest triggers appear to be ${tList.toLowerCase()}. These are common, and recognising them is the first step to interrupting the loop.`
}

function focusInsight(scores: PatternScores): string {
  if (scores.motivation > 70 && scores.recoveryReadiness > 60) {
    return 'You show strong motivation and readiness. Your next step is building a consistent daily routine around your replacement habits.'
  }
  if (scores.habitStrength > 70) {
    return 'Your habit pattern is well-established. Focusing on pattern interruption and urge surfing techniques will give you the highest return.'
  }
  if (scores.nightRisk >= 75) {
    return 'Late-night and evening urges are your biggest risk window. Night Shield mode will be your most powerful tool.'
  }
  return 'Building awareness of your triggers is your most important first step. Track each urge — even if you slip — to reveal the pattern.'
}

function PatternReportScreen({
  scores,
  answers,
  onFinish,
  finishing,
}: {
  scores: PatternScores
  answers: import('@/lib/store').OnboardingAnswers
  onFinish: () => void
  finishing: boolean
}) {
  const [activeTab, setActiveTab] = useState<'pattern' | 'time'>('pattern')
  const topTriggers = getTopTriggers(answers.q7_triggers ?? [])
  const needsSupport = shouldRecommendProfessionalSupport(scores, answers.q9_life_impact ?? [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-6"
    >
      {/* Header with Tab Switcher */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-subtle">
            ONBOARDING SYNTHESIS
          </p>
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.04] border border-white/10 font-mono text-[10px]">
            <button
              onClick={() => setActiveTab('pattern')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'pattern'
                  ? 'bg-white/15 text-white font-bold'
                  : 'text-subtle hover:text-white'
              }`}
            >
              PATTERN REPORT
            </button>
            <button
              onClick={() => setActiveTab('time')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'time'
                  ? 'bg-[#C7FF72]/15 text-[#C7FF72] font-bold border border-[#C7FF72]/20'
                  : 'text-subtle hover:text-white'
              }`}
            >
              TIME IMPACT
            </button>
          </div>
        </div>

        <h2 className="font-display text-display-lg text-text mb-1">
          {activeTab === 'pattern' ? 'What we noticed.' : 'Your Time & Opportunity.'}
        </h2>
        <p className="text-subtle text-xs font-sans leading-relaxed">
          {activeTab === 'pattern'
            ? 'This is a self-reported pattern summary, not a medical diagnosis.'
            : 'Illustrative comparisons to inspire conscious time redirection.'}
        </p>
      </div>

      {/* Tab 1: Pattern Scores */}
      {activeTab === 'pattern' ? (
        <>
          {/* Score bars */}
          <div className="flex flex-col gap-5 py-4 px-5 rounded-md bg-card border border-white/[0.07]">
            {SCORE_LABELS.map(({ key, label }, i) => (
              <ScoreBar key={key} label={label} value={scores[key]} index={i} />
            ))}
          </div>

          {/* What we noticed */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col gap-2"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
              KEY PATTERN SIGNALS
            </p>
            <p className="text-muted text-sm font-sans leading-relaxed">
              {triggerContextText(topTriggers)}
            </p>
          </motion.div>

          {/* Current focus */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col gap-2"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
              YOUR INITIAL FOCUS
            </p>
            <p className="text-muted text-sm font-sans leading-relaxed">{focusInsight(scores)}</p>
          </motion.div>

          {/* Professional support */}
          {needsSupport && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="px-4 py-4 rounded-md border border-white/10 bg-white/[0.03] flex items-start gap-3"
            >
              <MessageSquare size={16} className="text-muted shrink-0 mt-0.5" />
              <p className="text-sm font-sans text-muted leading-relaxed">
                <span className="text-text font-medium">
                  Consider speaking with a qualified mental-health professional.
                </span>{' '}
                Based on your answers, additional support could meaningfully help your progress.
              </p>
            </motion.div>
          )}
        </>
      ) : (
        /* Tab 2: Time Impact Report */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <TimeImpactReport
            initialYears={3}
            initialSessionsPerWeek={answers.q3_frequency === 'Daily' ? 7 : answers.q3_frequency === 'Multiple times/day' ? 14 : 4}
            initialMinutesPerSession={35}
            showRedirectAction={false}
          />
        </motion.div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <ContinueButton
          onClick={onFinish}
          loading={finishing}
          label="GO TO DASHBOARD"
        />
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN ONBOARDING PAGE
// ─────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const { step, setStep, answers, complete } = useOnboardingStore()
  const [direction, setDirection] = useState<Direction>('forward')
  const [patternScores, setPatternScores] = useState<PatternScores | null>(null)
  const [finishing, setFinishing] = useState(false)
  const [saving, setSaving] = useState(false)

  const variants = getVariants(direction)

  const goNext = useCallback(async () => {
    setDirection('forward')

    // On completing Q15 (step 15 → 16): save to Supabase + compute scores
    if (step === 15) {
      setSaving(true)
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const scores = computePatternScores(answers)
        setPatternScores(scores)

        if (user) {
          await supabase.from('onboarding_responses').upsert({
            user_id: user.id,
            responses: answers,
            completed_at: new Date().toISOString(),
          })

          await supabase.from('pattern_scores').upsert({
            user_id: user.id,
            control: scores.control,
            trigger_load: scores.triggerLoad,
            night_risk: scores.nightRisk,
            habit_strength: scores.habitStrength,
            motivation: scores.motivation,
            recovery_readiness: scores.recoveryReadiness,
            computed_at: new Date().toISOString(),
          })
        }
      } catch (err) {
        console.error('Failed to save onboarding data:', err)
        // Non-blocking — still advance
      } finally {
        setSaving(false)
      }
    }

    setStep(step + 1)
  }, [step, answers, setStep])

  const goBack = useCallback(() => {
    if (step === 0) return
    setDirection('back')
    setStep(step - 1)
  }, [step, setStep])

  async function handleFinish() {
    setFinishing(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
      }

      // Save computed scores and replacement habits to user store
      useUserStore.getState().setUser({
        patternScores: patternScores || computePatternScores(answers),
        replacementHabits: answers.q12_replacement_habits || ['Chess', 'Reading', 'Running'],
      })
      useUserStore.getState().addXP(100, 'onboarding_completed')

      complete()
      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to mark onboarding complete:', err)
      useUserStore.getState().setUser({
        patternScores: patternScores || computePatternScores(answers),
        replacementHabits: answers.q12_replacement_habits || ['Chess', 'Reading', 'Running'],
      })
      useUserStore.getState().addXP(100, 'onboarding_completed')
      complete()
      router.push('/dashboard')
    }
  }

  // Compute scores if arriving at step 16 without them (e.g. resumed)
  useEffect(() => {
    if (step === 16 && !patternScores) {
      setPatternScores(computePatternScores(answers))
    }
  }, [step, patternScores, answers])

  function renderScreen() {
    switch (step) {
      case 0:  return <WelcomeScreen onNext={goNext} />
      case 1:  return <Q1 onNext={goNext} onBack={goBack} />
      case 2:  return <Q2 onNext={goNext} onBack={goBack} />
      case 3:  return <Q3 onNext={goNext} onBack={goBack} />
      case 4:  return <Q4 onNext={goNext} onBack={goBack} />
      case 5:  return <Q5 onNext={goNext} onBack={goBack} />
      case 6:  return <Q6 onNext={goNext} onBack={goBack} />
      case 7:  return <Q7 onNext={goNext} onBack={goBack} />
      case 8:  return <Q8 onNext={goNext} onBack={goBack} />
      case 9:  return <Q9 onNext={goNext} onBack={goBack} />
      case 10: return <Q10 onNext={goNext} onBack={goBack} />
      case 11: return <Q11 onNext={goNext} onBack={goBack} />
      case 12: return <Q12 onNext={goNext} onBack={goBack} />
      case 13: return <Q13 onNext={goNext} onBack={goBack} />
      case 14: return <Q14 onNext={goNext} onBack={goBack} />
      case 15: return <Q15 onNext={saving ? () => {} : goNext} onBack={goBack} />
      case 16:
        return patternScores ? (
          <PatternReportScreen
            scores={patternScores}
            answers={answers}
            onFinish={handleFinish}
            finishing={finishing}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 size={20} className="animate-spin text-muted" />
          </div>
        )
      default: return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar — full width at very top */}
      {step > 0 && <ProgressBar step={step} />}

      {/* Content area */}
      <div className="flex-1 flex items-start justify-center">
        <div className="w-full max-w-[480px] px-6 py-10 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

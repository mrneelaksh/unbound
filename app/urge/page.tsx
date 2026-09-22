'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, X, Play, Pause, SkipForward,
  Coffee, Activity, User, Moon, Smartphone, Repeat, HelpCircle,
  Target, Footprints, BookOpen, Terminal, Headphones, GraduationCap, Wind, Dumbbell, Shield
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { CinematicStarfield } from '@/components/ui/CinematicStarfield'
import { useUrgeModeStore, useUserStore } from '@/lib/store'

// ============================================================
// Types
// ============================================================
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6

const TRIGGERS = [
  { id: 'boredom', label: 'Boredom', icon: Coffee },
  { id: 'stress', label: 'Stress', icon: Activity },
  { id: 'loneliness', label: 'Loneliness', icon: User },
  { id: 'late_night', label: 'Late night', icon: Moon },
  { id: 'social_media', label: 'Social media', icon: Smartphone },
  { id: 'habit', label: 'Habit', icon: Repeat },
  { id: 'other', label: 'Other', icon: HelpCircle },
]

const REPLACEMENTS = [
  { id: 'chess', label: 'Chess', icon: Target },
  { id: 'walk', label: 'Walk', icon: Footprints },
  { id: 'read', label: 'Read', icon: BookOpen },
  { id: 'code', label: 'Code', icon: Terminal },
  { id: 'music', label: 'Music', icon: Headphones },
  { id: 'study', label: 'Study', icon: GraduationCap },
  { id: 'meditate', label: 'Meditate', icon: Wind },
  { id: 'exercise', label: 'Exercise', icon: Dumbbell },
]

// ============================================================
// Breathing Pacer
// ============================================================
function BreathingPacer({ onComplete }: { onComplete: () => void }) {
  const phases = [
    { label: 'Inhale', duration: 4, color: 'rgba(245,245,245,0.12)', scale: 1.25 },
    { label: 'Hold', duration: 2, color: 'rgba(245,245,245,0.18)', scale: 1.25 },
    { label: 'Exhale', duration: 6, color: 'rgba(245,245,245,0.06)', scale: 0.8 },
  ]
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [countdown, setCountdown] = useState(phases[0].duration)
  const [cycles, setCycles] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const TOTAL_CYCLES = 3

  useEffect(() => {
    if (cycles >= TOTAL_CYCLES) {
      setTimeout(onComplete, 500)
      return
    }
    if (isPaused) return

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          const nextIdx = (phaseIdx + 1) % phases.length
          if (phaseIdx === phases.length - 1) setCycles(c => c + 1)
          setPhaseIdx(nextIdx)
          return phases[nextIdx].duration
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [phaseIdx, cycles, isPaused, onComplete])

  const phase = phases[phaseIdx]

  return (
    <div className="flex flex-col items-center justify-center gap-10 py-6">
      <div className="relative flex items-center justify-center">
        {/* Outer pulse ring */}
        <motion.div
          animate={{ scale: isPaused ? 1 : [1, 1.15, 1], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: phase.duration, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-56 h-56 rounded-full border border-white/10"
        />
        {/* Main breathing circle */}
        <motion.div
          animate={{ scale: isPaused ? 1 : phase.scale, backgroundColor: phase.color }}
          transition={{ duration: phase.duration, ease: phaseIdx === 0 ? 'easeIn' : phaseIdx === 2 ? 'easeOut' : 'linear' }}
          className="w-44 h-44 rounded-full flex flex-col items-center justify-center border border-white/10 shadow-glow-soft"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <span className="font-numbers text-4xl font-bold text-text tabular-nums">{countdown}</span>
          <span className="font-mono text-[11px] text-muted tracking-widest mt-1">{phase.label.toUpperCase()}</span>
        </motion.div>
      </div>

      {/* Phase indicators */}
      <div className="flex gap-4 items-center">
        {phases.map((p, i) => (
          <div key={p.label} className={`flex items-center gap-2 ${i === phaseIdx ? 'opacity-100' : 'opacity-30'} transition-opacity`}>
            <span className="font-mono text-[10px] text-muted">{p.label}</span>
            <span className="font-numbers text-xs text-text">{p.duration}s</span>
          </div>
        ))}
      </div>

      {/* Cycle progress & Controls */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < cycles ? 'bg-text' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => setIsPaused(p => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/5 font-mono text-[11px] text-muted hover:text-text transition-all"
          >
            {isPaused ? <Play size={11} /> : <Pause size={11} />}
            <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>
          <button
            onClick={onComplete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/5 font-mono text-[11px] text-subtle hover:text-text transition-all"
          >
            <SkipForward size={11} />
            <span>SKIP</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Exercise Timer (60-second active move)
// ============================================================
function ExerciseTimer({ onComplete }: { onComplete: () => void }) {
  const [timeLeft, setTimeLeft] = useState(60)
  const pct = ((60 - timeLeft) / 60) * 100

  useEffect(() => {
    if (timeLeft <= 0) { onComplete(); return }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft])

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="relative flex items-center justify-center">
        <svg width={160} height={160} className="rotate-[-90deg]">
          <circle cx={80} cy={80} r={70} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
          <motion.circle
            cx={80} cy={80} r={70} fill="none" stroke="#F5F5F5" strokeWidth={6} strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 70}
            strokeDashoffset={2 * Math.PI * 70 * (1 - pct / 100)}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </svg>
        <div className="absolute text-center">
          <span className="font-numbers text-5xl font-bold text-text">{timeLeft}</span>
          <div className="font-mono text-[10px] text-muted mt-1">SECONDS</div>
        </div>
      </div>
      <div className="text-center">
        <p className="font-display text-2xl font-bold text-text">MOVE</p>
        <p className="font-mono text-xs text-muted mt-2">Push-ups · Jumping jacks · Walk in place</p>
        <p className="font-mono text-xs text-muted">Anything that gets your body moving</p>
      </div>
    </div>
  )
}

// ============================================================
// Urge Surfing (Watch the wave pass)
// ============================================================
function UrgeSurfing({ onComplete }: { onComplete: () => void }) {
  const [timeLeft, setTimeLeft] = useState(120)
  const [phase, setPhase] = useState<'rising' | 'peak' | 'falling'>('rising')

  useEffect(() => {
    if (timeLeft <= 0) { onComplete(); return }
    if (timeLeft > 80) setPhase('rising')
    else if (timeLeft > 40) setPhase('peak')
    else setPhase('falling')
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft])

  const phaseText = { rising: 'Notice the urge rising', peak: 'Observe — don\'t act', falling: 'Feel it starting to pass' }

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      {/* Animated wave SVG */}
      <div className="w-full h-32 relative overflow-hidden">
        <motion.svg
          viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none"
        >
          <motion.path
            animate={{
              d: phase === 'rising'
                ? 'M0,70 C100,40 200,20 400,50'
                : phase === 'peak'
                ? 'M0,60 C100,20 200,10 400,40'
                : 'M0,75 C100,60 200,70 400,80'
            }}
            transition={{ duration: 3, ease: 'easeInOut' }}
            stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} fill="none"
          />
          <motion.path
            animate={{
              d: phase === 'rising'
                ? 'M0,80 C100,50 200,30 400,60 L400,100 L0,100 Z'
                : phase === 'peak'
                ? 'M0,70 C100,30 200,20 400,50 L400,100 L0,100 Z'
                : 'M0,85 C100,70 200,80 400,90 L400,100 L0,100 Z'
            }}
            transition={{ duration: 3, ease: 'easeInOut' }}
            fill="rgba(255,255,255,0.03)"
          />
        </motion.svg>
      </div>

      <div className="text-center">
        <p className="font-numbers text-5xl font-bold text-text">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2,'0')}</p>
        <p className="font-mono text-xs text-muted mt-3">{phaseText[phase]}</p>
        <p className="font-mono text-[10px] text-subtle mt-2">The urge is a wave. It will pass.</p>
      </div>
    </div>
  )
}

// ============================================================
// Step Components
// ============================================================

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-8 py-8">
      {/* Pulsing orb */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-white/5"
        />
        <motion.div
          animate={{ scale: [0.85, 0.95, 0.85] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full bg-white/[0.08] border border-white/15"
        />
      </div>

      <div>
        <p className="font-mono text-[10px] tracking-[0.3em] text-subtle uppercase mb-4">URGE MODE</p>
        <h1 className="font-display text-display-lg font-bold text-text mb-4">
          This moment<br />will pass.
        </h1>
        <p className="font-mono text-sm text-muted max-w-sm">
          You reached out for support. That's already a win.
          Let's work through this together.
        </p>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="flex items-center gap-2 px-8 py-4 rounded-xl bg-text text-bg font-mono text-sm font-medium tracking-wide"
      >
        I'm ready <ArrowRight size={14} />
      </motion.button>
    </div>
  )
}

function StepIntensity({ onNext }: { onNext: (v: number) => void }) {
  const [value, setValue] = useState(5)
  return (
    <div className="flex flex-col gap-8 py-6">
      <div>
        <p className="font-mono text-[10px] tracking-[0.3em] text-subtle uppercase mb-3">STEP 1 OF 4</p>
        <h2 className="font-display text-display-md font-bold text-text">How strong is the urge?</h2>
      </div>

      <div className="flex flex-col items-center gap-6">
        <motion.div
          key={value}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-numbers text-[80px] font-bold text-text leading-none"
        >
          {value}
        </motion.div>

        <div className="w-full">
          <input
            type="range" min={1} max={10} value={value}
            onChange={e => setValue(Number(e.target.value))}
            className="w-full accent-white"
            aria-label="Urge intensity 1 to 10"
          />
          <div className="flex justify-between mt-2">
            <span className="font-mono text-[10px] text-subtle">Mild</span>
            <span className="font-mono text-[10px] text-subtle">Intense</span>
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onNext(value)}
        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-text text-bg font-mono text-sm font-medium"
      >
        Continue <ArrowRight size={14} />
      </motion.button>
    </div>
  )
}

function StepTrigger({ onNext }: { onNext: (t: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <p className="font-mono text-[10px] tracking-[0.3em] text-subtle uppercase mb-3">STEP 2 OF 4</p>
        <h2 className="font-display text-display-md font-bold text-text">What's triggering it?</h2>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {TRIGGERS.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            whileTap={{ scale: 0.96 }}
            onClick={() => setSelected(id)}
            className={`flex items-center gap-3 p-3.5 rounded-lg border transition-colors text-left
              ${selected === id
                ? 'border-white/40 bg-white/10 text-text'
                : 'border-white/10 bg-white/[0.02] text-muted hover:border-white/20 hover:text-text'
              }`}
          >
            <Icon size={16} className={selected === id ? 'text-text' : 'text-subtle'} />
            <span className="font-mono text-xs">{label}</span>
          </motion.button>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => selected && onNext(selected)}
        disabled={!selected}
        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-text text-bg font-mono text-sm font-medium disabled:opacity-40"
      >
        Start intervention <ArrowRight size={14} />
      </motion.button>
    </div>
  )
}

function StepIntervention({ trigger, onNext }: { trigger: string; onNext: () => void }) {
  const [phase, setPhase] = useState<'breathe' | 'move' | 'distance'>('breathe')
  const [phaseComplete, setPhaseComplete] = useState(false)
  const [distanceTimer, setDistanceTimer] = useState(120)

  const handlePhaseComplete = useCallback(() => {
    setPhaseComplete(true)
  }, [])

  useEffect(() => {
    if (phase === 'distance' && !phaseComplete) {
      if (distanceTimer <= 0) { setPhaseComplete(true); return }
      const t = setTimeout(() => setDistanceTimer(p => p - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [phase, distanceTimer, phaseComplete])

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="mb-2">
        <p className="font-mono text-[10px] tracking-[0.3em] text-subtle uppercase mb-2">STEP 3 OF 4</p>
        <div className="flex gap-2">
          {(['breathe', 'move', 'distance'] as const).map((p, i) => (
            <div key={p} className={`h-0.5 flex-1 rounded-full transition-colors ${
              (['breathe','move','distance'].indexOf(phase)) >= i ? 'bg-text' : 'bg-white/10'
            }`} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'breathe' && (
          <motion.div key="breathe" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="text-center mb-4">
              <h2 className="font-display text-2xl font-bold text-text">BREATHE</h2>
              <p className="font-mono text-xs text-muted mt-1">4 seconds in · 2 hold · 6 out</p>
            </div>
            <BreathingPacer onComplete={handlePhaseComplete} />
          </motion.div>
        )}

        {phase === 'move' && (
          <motion.div key="move" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <ExerciseTimer onComplete={handlePhaseComplete} />
          </motion.div>
        )}

        {phase === 'distance' && (
          <motion.div key="distance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="text-center">
                <h2 className="font-display text-2xl font-bold text-text">CREATE DISTANCE</h2>
                <p className="font-mono text-xs text-muted mt-2">Put your phone down for 2 minutes.</p>
                <p className="font-mono text-xs text-subtle mt-1">Walk to another room. Get water.</p>
              </div>
              <div className="font-numbers text-6xl font-bold text-text">
                {Math.floor(distanceTimer / 60)}:{String(distanceTimer % 60).padStart(2, '0')}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phaseComplete && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (phase === 'breathe') { setPhase('move'); setPhaseComplete(false) }
            else if (phase === 'move') { setPhase('distance'); setPhaseComplete(false) }
            else { onNext() }
          }}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-text text-bg font-mono text-sm font-medium"
        >
          {phase === 'distance' ? 'Continue' : 'Next phase'} <ArrowRight size={14} />
        </motion.button>
      )}
    </div>
  )
}

function StepOutcome({ onNext }: { onNext: (o: string) => void }) {
  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <p className="font-mono text-[10px] tracking-[0.3em] text-subtle uppercase mb-3">STEP 4 OF 4</p>
        <h2 className="font-display text-display-md font-bold text-text">Did the urge subside?</h2>
      </div>

      <div className="flex flex-col gap-3">
        {[
          { id: 'resolved', label: 'Yes, I feel better', desc: 'The urge has passed' },
          { id: 'manageable', label: 'Mostly manageable', desc: 'Still there but weaker' },
          { id: 'still_intense', label: 'Still intense', desc: 'The urge is still strong' },
        ].map(o => (
          <motion.button
            key={o.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNext(o.id)}
            className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-white/20 text-left transition-colors"
          >
            <div>
              <div className="font-mono text-sm text-text">{o.label}</div>
              <div className="font-mono text-[11px] text-subtle mt-0.5">{o.desc}</div>
            </div>
            <ArrowRight size={14} className="ml-auto text-subtle" />
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function StepReplacement({ outcome, onComplete }: { outcome: string; onComplete: (habit: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [xpShown, setXpShown] = useState(false)

  const handleContinue = () => {
    if (!selected) return
    setXpShown(true)
    setTimeout(() => onComplete(selected), 2000)
  }

  if (xpShown) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center gap-4 py-16 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.4 }}
          className="font-numbers text-7xl font-bold text-text"
        >
          +50
        </motion.div>
        <p className="font-mono text-lg text-muted">XP</p>
        <p className="font-mono text-sm text-muted mt-2">FOCUS QUEST COMPLETE</p>
        <p className="font-mono text-xs text-subtle mt-1">You interrupted the moment. That takes strength.</p>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <p className="font-mono text-[10px] tracking-[0.3em] text-subtle uppercase mb-3">CHOOSE YOUR NEXT ACTION</p>
        <h2 className="font-display text-display-md font-bold text-text">What's next?</h2>
        {outcome === 'still_intense' && (
          <p className="font-mono text-xs text-muted mt-2">
            That's okay. You showed up. Consider reaching out to your{' '}
            <span className="text-text underline cursor-pointer">AI Coach</span> or a{' '}
            <span className="text-text underline cursor-pointer">professional</span>.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {REPLACEMENTS.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelected(id)}
            className={`flex items-center gap-3 p-4 rounded-lg border transition-colors text-left
              ${selected === id
                ? 'border-white/40 bg-white/10 text-text'
                : 'border-white/10 bg-white/[0.02] text-muted hover:border-white/20 hover:text-text'
              }`}
          >
            <Icon size={18} className={selected === id ? 'text-text' : 'text-subtle'} />
            <span className="font-mono text-xs">{label}</span>
          </motion.button>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleContinue}
        disabled={!selected}
        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-text text-bg font-mono text-sm font-medium disabled:opacity-40"
      >
        I'll do this now <ArrowRight size={14} />
      </motion.button>
    </div>
  )
}

// ============================================================
// Setback Reflection (no shame, private, constructive)
// ============================================================
function SetbackReflection({ onComplete }: { onComplete: () => void }) {
  const [note, setNote] = useState('')
  const [trigger, setTrigger] = useState('')
  const [whatHelped, setWhatHelped] = useState('')

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <p className="font-mono text-[10px] tracking-[0.3em] text-subtle uppercase mb-3">PRIVATE REFLECTION</p>
        <h2 className="font-display text-2xl font-bold text-text">A SETBACK HAPPENED.</h2>
        <p className="font-mono text-xs text-muted mt-2 leading-relaxed">
          That is information — not a verdict. This reflection is private. Only you see it.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase text-subtle">What was happening beforehand?</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Time, place, emotional state, what you were doing..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-text font-sans text-sm placeholder:text-subtle/40 focus:outline-none focus:border-white/20 resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase text-subtle">What might have helped?</label>
          <textarea
            value={whatHelped}
            onChange={e => setWhatHelped(e.target.value)}
            placeholder="A different location? An earlier intervention? Something specific?"
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-text font-sans text-sm placeholder:text-subtle/40 focus:outline-none focus:border-white/20 resize-none"
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/8">
        <p className="font-mono text-[11px] text-subtle leading-relaxed">
          Setbacks happen to everyone working on habit change. What matters is returning — at the next opportunity, not some future restart date. You already showed up by being here.
        </p>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onComplete}
        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-text text-bg font-mono text-sm font-medium"
      >
        Return to dashboard <ArrowRight size={14} />
      </motion.button>
    </div>
  )
}

// ============================================================
// MAIN URGE MODE PAGE
// ============================================================

export default function UrgePage() {
  const router = useRouter()
  const { setIntensity, setTrigger, setOutcome, setReplacementHabit } = useUrgeModeStore()
  const { logUrge, logSetback } = useUserStore()
  const [step, setStep] = useState<Step>(0)
  const [intensity, setLocalIntensity] = useState(5)
  const [trigger, setLocalTrigger] = useState('')
  const [outcome, setLocalOutcome] = useState('')

  const goBack = () => {
    if (step === 0) { router.back(); return }
    setStep(prev => (prev - 1) as Step)
  }

  const handleIntensity = (v: number) => {
    setLocalIntensity(v)
    setIntensity(v)
    setStep(2)
  }

  const handleTrigger = (t: string) => {
    setLocalTrigger(t)
    setTrigger(t)
    setStep(3)
  }

  const handleOutcome = (o: string) => {
    setLocalOutcome(o)
    setOutcome(o)
    setStep(4)
  }

  const handleComplete = async (habit: string) => {
    setReplacementHabit(habit)
    // Log the urge session to store
    logUrge({
      intensity,
      trigger,
      interventionType: '4-2-6 Breathing + Movement',
      outcome,
      replacementHabit: habit,
      xpEarned: outcome === 'deflected' || outcome === 'resolved' ? 50 : 25,
    })
    // If still intense, go to setback reflection
    if (outcome === 'still_intense') {
      setStep(6)
      return
    }
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  const handleSetbackComplete = () => {
    router.push('/dashboard')
  }


  const stepMotion = {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.35, ease: 'easeOut' as const },
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#030303] flex flex-col">
      {/* Meditative Calmer Starfield for Urge Mode */}
      <CinematicStarfield variant="URGE_MODE" intensity="subtle" speed={0.25} opacity={0.8} />

      {/* Background glow */}
      <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-safe-top pt-4 pb-3 relative z-10">
        <button
          onClick={goBack}
          className="p-2 rounded-lg border border-white/10 text-muted hover:text-text transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
        </button>

        {step > 0 && step < 5 ? (
          <div className="flex gap-1.5">
            {([1, 2, 3, 4] as const).map(s => (
              <div key={s} className={`h-0.5 w-8 rounded-full transition-colors ${step >= s ? 'bg-text' : 'bg-white/10'}`} />
            ))}
          </div>
        ) : (
          <Logo size="sm" showWordmark={true} />
        )}

        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 rounded-lg border border-white/10 text-muted hover:text-text transition-colors"
          aria-label="Exit urge mode"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <div className="max-w-md mx-auto h-full">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="welcome" {...stepMotion}>
                <StepWelcome onNext={() => setStep(1)} />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="intensity" {...stepMotion}>
                <StepIntensity onNext={handleIntensity} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="trigger" {...stepMotion}>
                <StepTrigger onNext={handleTrigger} />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="intervention" {...stepMotion}>
                <StepIntervention trigger={trigger} onNext={() => setStep(4)} />
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="outcome" {...stepMotion}>
                <StepOutcome onNext={handleOutcome} />
              </motion.div>
            )}
            {step === 5 && (
              <motion.div key="replacement" {...stepMotion}>
                <StepReplacement outcome={outcome} onComplete={handleComplete} />
              </motion.div>
            )}
            {step === 6 && (
              <motion.div key="setback" {...stepMotion}>
                <SetbackReflection onComplete={handleSetbackComplete} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}


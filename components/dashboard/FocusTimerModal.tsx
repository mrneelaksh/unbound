'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Play, Pause, RotateCcw, Sparkles, Volume2, VolumeX,
  Clock, CheckCircle2, ShieldCheck, Flame, Bell
} from 'lucide-react'
import { useUserStore } from '@/lib/store'

interface FocusTimerModalProps {
  isOpen: boolean
  onClose: () => void
}

const PRESETS = [
  { label: '15 MIN', minutes: 15, xp: 25 },
  { label: '25 MIN', minutes: 25, xp: 40 },
  { label: '45 MIN', minutes: 45, xp: 60 },
  { label: '60 MIN', minutes: 60, xp: 80 },
]

export function FocusTimerModal({ isOpen, onClose }: FocusTimerModalProps) {
  const { addXP, logActivity } = useUserStore()

  const [selectedMinutes, setSelectedMinutes] = useState(25)
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [ambientSound, setAmbientSound] = useState<'mute' | 'theta' | 'rain' | 'whitenoise'>('mute')

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Reset timer when preset changes (if not running)
  const handleSelectPreset = (minutes: number) => {
    if (!isActive) {
      setSelectedMinutes(minutes)
      setSecondsRemaining(minutes * 60)
      setIsCompleted(false)
    }
  }

  // Timer Tick
  useEffect(() => {
    if (isActive && secondsRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setSecondsRemaining((prev) => prev - 1)
      }, 1000)
    } else if (isActive && secondsRemaining === 0) {
      setIsActive(false)
      setIsCompleted(true)
      const currentPreset = PRESETS.find((p) => p.minutes === selectedMinutes) || PRESETS[1]
      addXP(currentPreset.xp, 'focus_session_completed')
      logActivity({
        type: 'focus',
        date: new Date().toISOString().slice(0, 10),
        durationMinutes: selectedMinutes,
        distanceKm: 0,
        steps: 0,
        xpEarned: currentPreset.xp,
      })
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isActive, secondsRemaining, selectedMinutes, addXP, logActivity])

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setIsCompleted(false)
    }
  }, [isOpen])

  const toggleTimer = () => {
    if (isCompleted) {
      setSecondsRemaining(selectedMinutes * 60)
      setIsCompleted(false)
      setIsActive(true)
    } else {
      setIsActive((prev) => !prev)
    }
  }

  const resetTimer = () => {
    setIsActive(false)
    setIsCompleted(false)
    setSecondsRemaining(selectedMinutes * 60)
  }

  const mins = Math.floor(secondsRemaining / 60)
  const secs = secondsRemaining % 60
  const progressPercent = 1 - secondsRemaining / (selectedMinutes * 60)
  const strokeDash = 2 * Math.PI * 110

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="relative w-full max-w-lg p-6 md:p-8 rounded-3xl bg-card border border-white/15 space-y-6 shadow-2xl text-center overflow-hidden"
        >
          {/* Subtle ambient focus glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#C7FF72]/[0.06] rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C7FF72] animate-pulse" />
              <span className="font-mono text-xs text-subtle uppercase tracking-wider">
                DISTRACTION-FREE FOCUS
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-subtle hover:text-white transition-colors cursor-pointer"
              title="Close focus session"
            >
              <X size={18} />
            </button>
          </div>

          {/* Preset Selector */}
          {!isActive && !isCompleted && (
            <div className="flex items-center justify-center gap-2 relative z-10">
              {PRESETS.map((p) => (
                <button
                  key={p.minutes}
                  onClick={() => handleSelectPreset(p.minutes)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                    selectedMinutes === p.minutes
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'bg-white/[0.04] border border-white/10 text-subtle hover:text-white'
                  }`}
                >
                  {p.label} (+{p.xp} XP)
                </button>
              ))}
            </div>
          )}

          {/* Circular Countdown Display */}
          <div className="relative w-64 h-64 mx-auto flex items-center justify-center z-10">
            <svg width={256} height={256} className="rotate-[-90deg]">
              <circle
                cx={128}
                cy={128}
                r={110}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={8}
              />
              <motion.circle
                cx={128}
                cy={128}
                r={110}
                fill="none"
                stroke={isCompleted ? '#34D399' : '#C7FF72'}
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={strokeDash}
                animate={{ strokeDashoffset: strokeDash * (1 - progressPercent) }}
                transition={{ duration: 0.5, ease: 'linear' }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
              {isCompleted ? (
                <div className="space-y-1">
                  <CheckCircle2 size={36} className="text-[#C7FF72] mx-auto animate-bounce" />
                  <div className="font-display text-xl font-bold text-white">FOCUS COMPLETE</div>
                  <span className="font-mono text-xs text-[#C7FF72] font-bold">+40 XP AWARDED</span>
                </div>
              ) : (
                <>
                  <div className="font-numbers text-4xl md:text-5xl font-bold text-white tracking-tight">
                    {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                  </div>
                  <span className="font-mono text-[11px] text-subtle uppercase tracking-widest">
                    {isActive ? 'FLOW STATE ACTIVE' : 'READY TO SPRINT'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Ambient Sound Selector */}
          <div className="flex items-center justify-center gap-2 text-xs font-mono z-10 relative">
            <span className="text-subtle flex items-center gap-1">
              <Volume2 size={13} /> AMBIENT:
            </span>
            {(['mute', 'theta', 'rain', 'whitenoise'] as const).map((snd) => (
              <button
                key={snd}
                onClick={() => setAmbientSound(snd)}
                className={`px-2.5 py-0.5 rounded-lg uppercase text-[10px] transition-colors cursor-pointer ${
                  ambientSound === snd
                    ? 'bg-[#C7FF72]/15 text-[#C7FF72] border border-[#C7FF72]/30 font-bold'
                    : 'text-subtle hover:text-white'
                }`}
              >
                {snd}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2 relative z-10">
            <button
              onClick={toggleTimer}
              className={`px-6 py-3 rounded-2xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                isCompleted
                  ? 'bg-[#C7FF72] text-[#050505] hover:bg-[#D5FFA0]'
                  : isActive
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  : 'bg-[#C7FF72] text-[#050505] hover:bg-[#D5FFA0] shadow-[0_0_20px_rgba(199,255,114,0.3)]'
              }`}
            >
              {isCompleted ? (
                <>
                  <RotateCcw size={15} />
                  <span>START ANOTHER SPRINT</span>
                </>
              ) : isActive ? (
                <>
                  <Pause size={15} />
                  <span>PAUSE TIMER</span>
                </>
              ) : (
                <>
                  <Play size={15} />
                  <span>BEGIN FOCUS (+{PRESETS.find((p) => p.minutes === selectedMinutes)?.xp || 40} XP)</span>
                </>
              )}
            </button>

            {!isCompleted && (
              <button
                onClick={resetTimer}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors cursor-pointer"
                title="Reset session"
              >
                <RotateCcw size={15} />
              </button>
            )}
          </div>

          <p className="font-mono text-[11px] text-subtle max-w-sm mx-auto z-10 relative">
            Deep focus sprints rewire attention spans, replacing passive screen loops with high-agency cognitive engagement.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

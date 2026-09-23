'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, Edit3, Check, X, Sparkles, Target } from 'lucide-react'

interface HydrationRingProps {
  currentMl: number
  goalMl: number
  onUpdateGoal: (newGoal: number) => Promise<void>
  isGoalAchieved?: boolean
}

const EASE = [0.16, 1, 0.3, 1] as const

export function HydrationRing({
  currentMl,
  goalMl,
  onUpdateGoal,
  isGoalAchieved = false,
}: HydrationRingProps) {
  const [showEditGoal, setShowEditGoal] = useState(false)
  const [tempGoal, setTempGoal] = useState(String(goalMl))
  const [savingGoal, setSavingGoal] = useState(false)

  const percent = goalMl > 0 ? Math.min(100, Math.round((currentMl / goalMl) * 100)) : 0
  const remainingMl = Math.max(0, goalMl - currentMl)

  // SVG Ring calculation
  const size = 260
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percent / 100) * circumference

  async function handleSaveGoal(e: React.FormEvent) {
    e.preventDefault()
    const val = parseInt(tempGoal, 10)
    if (isNaN(val) || val < 500 || val > 10000) return

    setSavingGoal(true)
    await onUpdateGoal(val)
    setSavingGoal(false)
    setShowEditGoal(false)
  }

  return (
    <div className="flex flex-col items-center justify-center relative p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 shadow-card">
      {/* Subtle top indicator */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#C7FF72]/15 text-[#C7FF72] flex items-center justify-center border border-[#C7FF72]/30">
            <Droplets size={16} />
          </div>
          <div>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-subtle">HYDRATION PROTOCOL</span>
            <h3 className="font-display text-sm md:text-base font-bold text-white">TODAY&apos;S HYDRATION</h3>
          </div>
        </div>

        <button
          onClick={() => {
            setTempGoal(String(goalMl))
            setShowEditGoal(true)
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/25 text-subtle hover:text-white font-mono text-xs transition-colors cursor-pointer"
          title="Edit Daily Hydration Goal"
        >
          <Edit3 size={11} className="text-[#C7FF72]" />
          <span>Edit Goal</span>
        </button>
      </div>

      {/* Ring Visual Container */}
      <div className="relative my-4 flex items-center justify-center">
        {/* Glow backdrop when close to goal */}
        {percent >= 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.25, scale: 1.1 }}
            className="absolute inset-0 rounded-full bg-[#C7FF72] blur-3xl pointer-events-none"
          />
        )}

        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />

          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={percent >= 100 ? '#C7FF72' : '#C7FF72'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: EASE }}
            className="transition-all"
            style={{
              filter: percent > 0 ? 'drop-shadow(0 0 10px rgba(199, 255, 114, 0.45))' : 'none',
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="font-mono text-xs font-bold text-[#C7FF72] tracking-wider mb-1">
            {percent}%
          </span>

          <motion.div
            key={currentMl}
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-numbers text-4xl md:text-5xl font-bold text-white tracking-tight leading-none"
          >
            {currentMl.toLocaleString()} <span className="font-mono text-lg font-normal text-subtle">ml</span>
          </motion.div>

          <span className="font-mono text-[11px] text-muted mt-1 uppercase tracking-wider">
            {currentMl === 0 ? 'No data yet' : 'consumed'}
          </span>

          <div className="font-mono text-xs text-subtle mt-2 pt-2 border-t border-white/10">
            out of <span className="text-white font-semibold">{goalMl.toLocaleString()} ml</span> goal
          </div>
        </div>
      </div>

      {/* Remaining Callout */}
      <div className="mt-3 flex items-center gap-2 font-mono text-xs">
        {percent >= 100 ? (
          <span className="px-3.5 py-1.5 rounded-full bg-[#C7FF72]/15 text-[#C7FF72] border border-[#C7FF72]/30 font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(199,255,114,0.2)]">
            <Sparkles size={13} />
            <span>DAILY GOAL ACHIEVED (+50 XP)</span>
          </span>
        ) : (
          <span className="text-muted">
            Remaining:{' '}
            <span className="text-white font-bold">{remainingMl.toLocaleString()} ml</span> to daily target
          </span>
        )}
      </div>

      {/* Edit Goal Modal */}
      <AnimatePresence>
        {showEditGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm p-6 rounded-3xl bg-card border border-white/20 space-y-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target size={18} className="text-[#C7FF72]" />
                  <h3 className="font-display text-base font-bold text-white">SET DAILY HYDRATION GOAL</h3>
                </div>
                <button
                  onClick={() => setShowEditGoal(false)}
                  className="p-1 rounded-lg text-subtle hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="font-sans text-xs text-muted leading-relaxed">
                Configure your personal daily water target. Recommended baseline is typically 2,000 to 3,000 ml depending on your activity level.
              </p>

              <form onSubmit={handleSaveGoal} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-subtle">
                    Goal Amount (ml)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={500}
                      max={10000}
                      step={100}
                      value={tempGoal}
                      onChange={(e) => setTempGoal(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-white/30"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-subtle">
                      ml
                    </span>
                  </div>
                </div>

                {/* Preset shortcuts */}
                <div className="flex gap-2 font-mono text-xs">
                  {[2000, 2500, 3000, 3500].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTempGoal(String(preset))}
                      className={`flex-1 py-1.5 rounded-lg border transition-colors ${
                        tempGoal === String(preset)
                          ? 'bg-[#C7FF72]/20 border-[#C7FF72] text-[#C7FF72] font-bold'
                          : 'bg-white/5 border-white/10 text-subtle hover:text-white'
                      }`}
                    >
                      {preset / 1000}L
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditGoal(false)}
                    className="px-4 py-2 rounded-xl text-subtle hover:text-white font-mono text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingGoal}
                    className="px-5 py-2 rounded-xl bg-[#C7FF72] text-[#050505] font-mono text-xs font-bold hover:bg-[#D5FFA0] transition-colors cursor-pointer"
                  >
                    {savingGoal ? 'Saving…' : 'Save Goal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

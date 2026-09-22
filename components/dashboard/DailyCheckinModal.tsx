'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Check, Sparkles, Smile, BatteryMedium, ShieldAlert,
  Zap, Heart, ArrowRight
} from 'lucide-react'
import { useUserStore } from '@/lib/store'

interface DailyCheckinModalProps {
  isOpen: boolean
  onClose: () => void
  onCompleted?: () => void
}

export function DailyCheckinModal({ isOpen, onClose, onCompleted }: DailyCheckinModalProps) {
  const { addXP } = useUserStore()

  const [energyLevel, setEnergyLevel] = useState<'high' | 'moderate' | 'low'>('moderate')
  const [urgePressure, setUrgePressure] = useState<'calm' | 'mild' | 'elevated'>('calm')
  const [mindset, setMindset] = useState<'grounded' | 'focused' | 'restless'>('grounded')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addXP(15, 'daily_checkin_completed')
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      if (onCompleted) onCompleted()
      onClose()
    }, 1400)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md p-6 md:p-8 rounded-3xl bg-card border border-white/15 space-y-6 shadow-2xl relative"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#C7FF72]/15 text-[#C7FF72] border border-[#C7FF72]/30 uppercase font-bold">
                DAILY EQUILIBRIUM
              </span>
              <span className="font-mono text-xs text-subtle">· 1-Tap Pulse</span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-subtle hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {isSubmitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#C7FF72] text-[#050505] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(199,255,114,0.4)]">
                <Check size={28} strokeWidth={3} />
              </div>
              <h3 className="font-display text-xl font-bold text-white">CHECK-IN RECORDED</h3>
              <p className="font-mono text-xs text-[#C7FF72] font-bold">+15 RECOVERY XP AWARDED</p>
              <p className="font-sans text-xs text-muted">
                Your daily pulse helps personalize trigger forecasts and quest recommendations.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h3 className="font-display text-xl font-bold text-white">HOW ARE YOU FEELING RIGHT NOW?</h3>
                <p className="font-sans text-xs text-muted mt-1">
                  100% private. Reflect on your state to calibrate your daily plan.
                </p>
              </div>

              {/* 1. Energy Level */}
              <div className="space-y-2">
                <label className="font-mono text-[10px] text-subtle uppercase tracking-wider flex items-center gap-1.5">
                  <BatteryMedium size={13} className="text-[#C7FF72]" /> ENERGY LEVEL
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  {(['high', 'moderate', 'low'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEnergyLevel(lvl)}
                      className={`p-2.5 rounded-xl border capitalize transition-all cursor-pointer ${
                        energyLevel === lvl
                          ? 'bg-white text-black font-bold border-white'
                          : 'bg-white/[0.02] border-white/10 text-subtle hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Urge Pressure */}
              <div className="space-y-2">
                <label className="font-mono text-[10px] text-subtle uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert size={13} className="text-[#C7FF72]" /> URGE PRESSURE
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  {(['calm', 'mild', 'elevated'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setUrgePressure(p)}
                      className={`p-2.5 rounded-xl border capitalize transition-all cursor-pointer ${
                        urgePressure === p
                          ? p === 'elevated'
                            ? 'bg-amber-400 text-black font-bold border-amber-400'
                            : 'bg-white text-black font-bold border-white'
                          : 'bg-white/[0.02] border-white/10 text-subtle hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Mindset */}
              <div className="space-y-2">
                <label className="font-mono text-[10px] text-subtle uppercase tracking-wider flex items-center gap-1.5">
                  <Heart size={13} className="text-[#C7FF72]" /> MENTAL CLARITY
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  {(['grounded', 'focused', 'restless'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMindset(m)}
                      className={`p-2.5 rounded-xl border capitalize transition-all cursor-pointer ${
                        mindset === m
                          ? 'bg-white text-black font-bold border-white'
                          : 'bg-white/[0.02] border-white/10 text-subtle hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-subtle hover:text-white font-mono text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#C7FF72] text-[#050505] font-mono text-xs font-bold hover:bg-[#D5FFA0] transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(199,255,114,0.25)] cursor-pointer"
                >
                  <span>COMPLETE CHECK-IN (+15 XP)</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

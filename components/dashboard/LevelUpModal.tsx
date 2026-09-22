'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Award, X, ArrowRight, Volume2, VolumeX } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { CinematicStarfield } from '@/components/ui/CinematicStarfield'

interface LevelUpModalProps {
  isOpen: boolean
  onClose: () => void
  levelNumber?: number
  levelTitle?: string
  xpEarned?: number
  badgeTitle?: string
}

export function LevelUpModal({
  isOpen,
  onClose,
  levelNumber = 7,
  levelTitle = 'CONSISTENCY',
  xpEarned = 2840,
  badgeTitle = 'One Week Clean',
}: LevelUpModalProps) {
  const [soundEnabled, setSoundEnabled] = useState(false)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/92 backdrop-blur-2xl">
        {/* Cinematic Starfield Background specifically configured for Level Up */}
        <CinematicStarfield variant="LEVEL_UP" intensity="deep" density={1.2} />

        {/* Animated Background Celestial Constellation Ring */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: [0.6, 1.3, 1.1], opacity: [0, 0.4, 0.15] }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          className="absolute w-[500px] h-[500px] rounded-full border border-[#C7FF72]/20 pointer-events-none"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-[#0E0E0E]/95 border border-white/20 shadow-[0_0_50px_rgba(199,255,114,0.1)] text-center space-y-6"
        >
          {/* Header Action Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl border border-white/10 text-subtle hover:text-white hover:border-white/25 transition-all"
              aria-label={soundEnabled ? 'Disable audio' : 'Enable audio'}
              title={soundEnabled ? 'Sound enabled' : 'Sound disabled (default)'}
            >
              {soundEnabled ? <Volume2 size={14} className="text-[#C7FF72]" /> : <VolumeX size={14} />}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-white/10 text-subtle hover:text-white hover:border-white/25 transition-all"
              aria-label="Close modal"
            >
              <X size={15} />
            </button>
          </div>

          {/* Constellation Star Icon */}
          <div className="flex justify-center">
            <div className="relative w-20 h-20 rounded-2xl bg-white/[0.04] border border-[#C7FF72]/30 flex items-center justify-center shadow-[0_0_30px_rgba(199,255,114,0.18)]">
              <Sparkles size={32} className="text-[#C7FF72] animate-pulse" />
              <div className="absolute inset-0 rounded-2xl border border-white/10 animate-ping opacity-30" />
            </div>
          </div>

          {/* Level & Constellation Title */}
          <div className="space-y-1">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-mono text-[10px] text-[#C7FF72] tracking-[0.3em] uppercase font-bold"
            >
              CONSTELLATION ASCENDED
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight"
            >
              LEVEL {String(levelNumber).padStart(2, '0')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-display text-lg text-muted font-medium tracking-widest uppercase"
            >
              {levelTitle}
            </motion.p>
          </div>

          {/* Reward & XP Settled */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-left"
          >
            <div className="space-y-0.5">
              <div className="font-mono text-[9px] text-subtle uppercase">BADGE REVEALED</div>
              <div className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                <Award size={15} className="text-[#C7FF72]" />
                <span>{badgeTitle}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-numbers text-xl font-bold text-[#C7FF72]">
                +{xpEarned} XP
              </span>
              <div className="font-mono text-[9px] text-subtle">Progress Recorded</div>
            </div>
          </motion.div>

          {/* Continue button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-[#C7FF72] text-[#050505] font-mono text-xs font-bold tracking-wider hover:bg-[#D5FFA0] transition-colors flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(199,255,114,0.2)]"
          >
            <span>RESUME DASHBOARD</span>
            <ArrowRight size={14} />
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

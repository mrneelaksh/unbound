'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Info, CheckCircle2, Lock, ArrowUpRight } from 'lucide-react'
import { LEVELS, type Level } from '@/lib/core'

export interface ConstellationMilestone {
  level: number
  name: string
  minXP: number
  maxXP: number
  x: number // Percentage 0 - 100 on canvas
  y: number // Percentage 0 - 100 on canvas
  principle: string
  starsInCluster: number
}

// 10 Celestial Constellation Nodes positioned in a graceful ascending arc / helix
export const CONSTELLATION_NODES: ConstellationMilestone[] = [
  { level: 1, name: 'Awareness', minXP: 0, maxXP: 100, x: 10, y: 78, principle: 'Recognize the trigger loop without judgment.', starsInCluster: 3 },
  { level: 2, name: 'Control', minXP: 100, maxXP: 300, x: 20, y: 64, principle: 'Active pause and conscious 4-2-6 breathing.', starsInCluster: 4 },
  { level: 3, name: 'Momentum', minXP: 300, maxXP: 700, x: 30, y: 48, principle: 'Three consecutive days of replacement action.', starsInCluster: 4 },
  { level: 4, name: 'Discipline', minXP: 700, maxXP: 1400, x: 42, y: 56, principle: 'Protecting vulnerable temporal night windows.', starsInCluster: 5 },
  { level: 5, name: 'Focus', minXP: 1400, maxXP: 2500, x: 52, y: 36, principle: 'Channeling impulse energy into deep craft.', starsInCluster: 5 },
  { level: 6, name: 'Resilience', minXP: 2500, maxXP: 4200, x: 62, y: 46, principle: 'Unshakable comeback capacity after tension.', starsInCluster: 6 },
  { level: 7, name: 'Consistency', minXP: 4200, maxXP: 7000, x: 72, y: 28, principle: 'Habits operating autonomously as default.', starsInCluster: 6 },
  { level: 8, name: 'UNBOUND', minXP: 7000, maxXP: 11000, x: 80, y: 40, principle: 'Dopamine baseline restored. Full sovereign agency.', starsInCluster: 7 },
  { level: 9, name: 'Elevation', minXP: 11000, maxXP: 18000, x: 88, y: 22, principle: 'Inspiring peers and modeling clarity.', starsInCluster: 8 },
  { level: 10, name: 'Ascend', minXP: 18000, maxXP: Infinity, x: 94, y: 12, principle: 'Transcendence beyond behavioral dependency.', starsInCluster: 9 },
]

interface ProgressConstellationProps {
  currentLevel: number
  totalXP: number
  compact?: boolean
  className?: string
}

export function ProgressConstellation({
  currentLevel,
  totalXP,
  compact = false,
  className = '',
}: ProgressConstellationProps) {
  const [selectedNode, setSelectedNode] = useState<ConstellationMilestone | null>(null)

  // Find active node
  const activeMilestone =
    CONSTELLATION_NODES.find((m) => m.level === currentLevel) || CONSTELLATION_NODES[0]

  return (
    <div
      className={`relative w-full rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 overflow-hidden shadow-card transition-all ${
        compact ? 'p-5 md:p-6' : 'p-6 md:p-8'
      } ${className}`}
    >
      {/* Subtle cosmic background glow */}
      <div className="absolute inset-0 bg-radial-glow opacity-40 pointer-events-none" />
      <div
        className="absolute w-72 h-72 rounded-full blur-[100px] pointer-events-none"
        style={{
          left: `${activeMilestone.x}%`,
          top: `${activeMilestone.y}%`,
          background: 'rgba(199, 255, 114, 0.08)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 mb-4 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-[#C7FF72]/15 text-[#C7FF72] border border-[#C7FF72]/30 uppercase font-bold tracking-wider">
              CONSTELLATION SYSTEM
            </span>
            <span className="font-mono text-[11px] text-subtle">
              Level {String(currentLevel).padStart(2, '0')} · {activeMilestone.name}
            </span>
          </div>
          <h3 className="font-display text-base md:text-lg font-bold text-white tracking-tight">
            PROGRESS CONSTELLATION
          </h3>
          <p className="font-mono text-xs text-muted max-w-lg mt-0.5">
            Every healthy action earns XP to light stars and forge connecting filaments across your journey.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono">
            <div className="text-[10px] text-subtle uppercase">TOTAL XP IGNITED</div>
            <div className="font-numbers text-sm font-bold text-[#C7FF72]">
              {totalXP.toLocaleString()} XP
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Constellation SVG & Canvas Map */}
      <div
        className={`relative w-full select-none ${
          compact ? 'h-[220px] md:h-[260px]' : 'h-[300px] md:h-[380px]'
        }`}
      >
        <svg
          viewBox="0 0 1000 500"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full overflow-visible"
        >
          <defs>
            {/* Active connecting line gradient */}
            <linearGradient id="unlockedLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C7FF72" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="lockedLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
            </linearGradient>
            {/* Glow Filter */}
            <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Background guide arcs and stellar grid lines */}
          <path
            d="M 50 420 Q 300 350, 500 240 T 950 80"
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />

          {/* 2. Connecting Lines between Milestone Stars */}
          {CONSTELLATION_NODES.map((node, i) => {
            if (i === CONSTELLATION_NODES.length - 1) return null
            const nextNode = CONSTELLATION_NODES[i + 1]

            const x1 = (node.x / 100) * 1000
            const y1 = (node.y / 100) * 500
            const x2 = (nextNode.x / 100) * 1000
            const y2 = (nextNode.y / 100) * 500

            const isPassed = currentLevel > node.level
            const isCurrentConnecting = currentLevel === node.level

            return (
              <g key={`line-${node.level}`}>
                {/* Underline halo for active paths */}
                {isPassed && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(199, 255, 114, 0.15)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                )}
                {/* Main line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={
                    isPassed
                      ? 'url(#unlockedLineGrad)'
                      : isCurrentConnecting
                      ? 'rgba(199, 255, 114, 0.4)'
                      : 'url(#lockedLineGrad)'
                  }
                  strokeWidth={isPassed ? 1.8 : 1}
                  strokeDasharray={isPassed ? 'none' : '3 6'}
                  strokeLinecap="round"
                />
              </g>
            )
          })}

          {/* 3. Render Node Stars */}
          {CONSTELLATION_NODES.map((node) => {
            const cx = (node.x / 100) * 1000
            const cy = (node.y / 100) * 500
            const isUnlocked = currentLevel >= node.level
            const isCurrent = currentLevel === node.level
            const isSelected = selectedNode?.level === node.level

            return (
              <g
                key={`node-${node.level}`}
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => setSelectedNode(node)}
                tabIndex={0}
                role="button"
                aria-label={`Milestone Level ${node.level}: ${node.name}`}
              >
                {/* Outer Pulsing Halo on Current Level */}
                {isCurrent && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={22}
                    fill="none"
                    stroke="#C7FF72"
                    strokeWidth="1.2"
                    opacity="0.4"
                    className="animate-ping"
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                  />
                )}

                {/* Ambient Halo for Unlocked Nodes */}
                {isUnlocked && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isCurrent ? 14 : 9}
                    fill={isCurrent ? 'rgba(199, 255, 114, 0.25)' : 'rgba(255, 255, 255, 0.08)'}
                    filter="url(#starGlow)"
                  />
                )}

                {/* Core Star Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isCurrent ? 6 : isUnlocked ? 4.5 : 3.5}
                  fill={isCurrent ? '#C7FF72' : isUnlocked ? '#FFFFFF' : '#444444'}
                  stroke={isCurrent ? '#FFFFFF' : isUnlocked ? '#C7FF72' : '#222222'}
                  strokeWidth={isCurrent ? 2 : 1}
                />

                {/* Level Label in SVG */}
                <text
                  x={cx}
                  y={cy + (node.y > 60 ? -14 : 20)}
                  textAnchor="middle"
                  fill={isCurrent ? '#C7FF72' : isUnlocked ? '#C5C5C5' : '#555555'}
                  fontSize={isCurrent ? '11' : '9'}
                  fontFamily="monospace"
                  fontWeight={isCurrent ? 'bold' : 'normal'}
                  className="pointer-events-none tracking-wider uppercase"
                >
                  {node.name}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Selected Milestone Tooltip / Detail Card */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute z-30 bottom-2 right-2 max-w-xs p-4 rounded-2xl bg-[#0D0D0D]/95 border border-white/15 backdrop-blur-xl shadow-2xl space-y-2 text-left"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white font-bold uppercase">
                  LEVEL {String(selectedNode.level).padStart(2, '0')}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedNode(null)
                  }}
                  className="text-subtle hover:text-white font-mono text-xs px-1"
                >
                  ×
                </button>
              </div>

              <div>
                <h4 className="font-display text-sm font-bold text-white uppercase flex items-center gap-1.5">
                  <span>{selectedNode.name}</span>
                  {currentLevel >= selectedNode.level ? (
                    <CheckCircle2 size={13} className="text-[#C7FF72]" />
                  ) : (
                    <Lock size={12} className="text-subtle" />
                  )}
                </h4>
                <p className="font-sans text-xs text-muted mt-1 leading-relaxed">
                  {selectedNode.principle}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between font-mono text-[10px] text-subtle">
                <span>XP Requirement:</span>
                <span className="text-white font-bold">
                  {selectedNode.minXP.toLocaleString()} XP
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Constellation Progression Footer */}
      <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-subtle">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C7FF72]" />
          <span className="text-white font-medium">
            Active Constellation: Level {currentLevel} {activeMilestone.name}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span>
            {currentLevel < 10
              ? `${CONSTELLATION_NODES[currentLevel]?.minXP - totalXP > 0 ? (CONSTELLATION_NODES[currentLevel].minXP - totalXP).toLocaleString() : 0} XP to next constellation`
              : 'Max Constellation Ascended'}
          </span>
          <span className="text-white/20">|</span>
          <span className="text-muted">Tap stars to preview principles</span>
        </div>
      </div>
    </div>
  )
}

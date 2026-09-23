'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coffee, GlassWater, Milk, Plus, X, Sparkles } from 'lucide-react'

interface QuickWaterAddProps {
  onAddWater: (amountMl: number) => Promise<void>
  disabled?: boolean
}

const PRESETS = [
  { amount: 100, label: '100 ml', name: 'Cup', icon: Coffee },
  { amount: 250, label: '250 ml', name: 'Glass', icon: GlassWater },
  { amount: 500, label: '500 ml', name: 'Bottle', icon: Milk },
  { amount: 750, label: '750 ml', name: 'Flask', icon: GlassWater },
]

export function QuickWaterAdd({ onAddWater, disabled = false }: QuickWaterAddProps) {
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customAmount, setCustomAmount] = useState('350')
  const [activeLog, setActiveLog] = useState<number | null>(null)

  async function handleQuickAdd(amount: number) {
    if (disabled) return
    setActiveLog(amount)
    await onAddWater(amount)
    setTimeout(() => setActiveLog(null), 800)
  }

  async function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault()
    const val = parseInt(customAmount, 10)
    if (isNaN(val) || val <= 0 || val > 5000) return

    setShowCustomModal(false)
    await handleQuickAdd(val)
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
          QUICK LOG WATER
        </span>
        <span className="font-mono text-[10px] text-[#C7FF72] flex items-center gap-1 font-bold">
          <Sparkles size={11} /> +5 XP per log
        </span>
      </div>

      {/* Grid of quick action buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {PRESETS.map((preset) => {
          const Icon = preset.icon
          const isLogging = activeLog === preset.amount

          return (
            <motion.button
              key={preset.amount}
              type="button"
              disabled={disabled}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAdd(preset.amount)}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer shadow-sm relative overflow-hidden ${
                isLogging
                  ? 'bg-[#C7FF72] text-[#050505] border-[#C7FF72]'
                  : 'bg-card/85 backdrop-blur-md border-white/10 hover:border-[#C7FF72]/50 hover:bg-white/[0.04] text-white'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  isLogging
                    ? 'bg-[#050505] text-[#C7FF72]'
                    : 'bg-white/5 text-[#C7FF72] group-hover:bg-[#C7FF72]/15'
                }`}
              >
                <Icon size={18} />
              </div>

              <div className="text-center">
                <div className={`font-mono text-xs font-bold leading-tight ${isLogging ? 'text-[#050505]' : 'text-white'}`}>
                  +{preset.amount} ml
                </div>
                <div className={`font-mono text-[9px] ${isLogging ? 'text-[#050505]/80' : 'text-subtle'}`}>
                  {preset.name}
                </div>
              </div>
            </motion.button>
          )
        })}

        {/* Custom button */}
        <motion.button
          type="button"
          disabled={disabled}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCustomModal(true)}
          className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-card/85 backdrop-blur-md border border-white/10 hover:border-[#C7FF72]/50 hover:bg-white/[0.04] text-white transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer shadow-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-white/5 text-white group-hover:bg-[#C7FF72]/15 group-hover:text-[#C7FF72] flex items-center justify-center transition-colors">
            <Plus size={18} />
          </div>

          <div className="text-center">
            <div className="font-mono text-xs font-bold text-white leading-tight">
              Custom
            </div>
            <div className="font-mono text-[9px] text-subtle">
              Exact ml
            </div>
          </div>
        </motion.button>
      </div>

      {/* Custom Amount Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm p-6 rounded-3xl bg-card border border-white/20 space-y-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-white">LOG CUSTOM WATER</h3>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="p-1 rounded-lg text-subtle hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-subtle">
                    Amount (ml)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    step={10}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    required
                    placeholder="350"
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="px-4 py-2 rounded-xl text-subtle hover:text-white font-mono text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#C7FF72] text-[#050505] font-mono text-xs font-bold hover:bg-[#D5FFA0] transition-colors cursor-pointer"
                  >
                    Log Water (+5 XP)
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

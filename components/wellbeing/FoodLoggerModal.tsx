'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Utensils, Plus, Sparkles, Check } from 'lucide-react'

interface FoodLoggerModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveMeal: (meal: {
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    foodName: string
    serving?: string
    calories?: number
    proteinG?: number
    carbsG?: number
    fatG?: number
    fiberG?: number
    notes?: string
  }) => Promise<void>
}

const PRESET_FOODS = [
  { name: 'Eggs (2 Boiled)', type: 'breakfast', protein: 12, carbs: 1, fat: 10, fiber: 0, cal: 155, serving: '2 eggs' },
  { name: 'Greek Yogurt / Curd', type: 'breakfast', protein: 15, carbs: 6, fat: 4, fiber: 0, cal: 120, serving: '150g' },
  { name: 'Dal / Lentils (1 bowl)', type: 'lunch', protein: 14, carbs: 28, fat: 3, fiber: 8, cal: 210, serving: '1 bowl cooked' },
  { name: 'Paneer (Grilled/Cooked)', type: 'dinner', protein: 18, carbs: 4, fat: 20, fiber: 0, cal: 260, serving: '100g' },
  { name: 'Chicken / Fish (Grilled)', type: 'dinner', protein: 26, carbs: 0, fat: 5, fiber: 0, cal: 165, serving: '120g' },
  { name: 'Seasonal Fruit Bowl', type: 'snack', protein: 1, carbs: 22, fat: 0.5, fiber: 4, cal: 95, serving: '1 medium bowl' },
  { name: 'Oatmeal & Almonds', type: 'breakfast', protein: 10, carbs: 32, fat: 8, fiber: 6, cal: 240, serving: '1 bowl' },
  { name: 'Mixed Vegetables & Roti', type: 'lunch', protein: 7, carbs: 35, fat: 4, fiber: 6, cal: 220, serving: '1 plate' },
]

export function FoodLoggerModal({ isOpen, onClose, onSaveMeal }: FoodLoggerModalProps) {
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast')
  const [foodName, setFoodName] = useState('')
  const [serving, setServing] = useState('')
  const [proteinG, setProteinG] = useState('')
  const [carbsG, setCarbsG] = useState('')
  const [fatG, setFatG] = useState('')
  const [fiberG, setFiberG] = useState('')
  const [calories, setCalories] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  function applyPreset(p: typeof PRESET_FOODS[0]) {
    setFoodName(p.name)
    setMealType(p.type as any)
    setServing(p.serving)
    setProteinG(String(p.protein))
    setCarbsG(String(p.carbs))
    setFatG(String(p.fat))
    setFiberG(String(p.fiber))
    setCalories(String(p.cal))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!foodName.trim()) return

    setSubmitting(true)
    await onSaveMeal({
      mealType,
      foodName: foodName.trim(),
      serving: serving.trim() || undefined,
      calories: calories ? parseInt(calories, 10) : undefined,
      proteinG: proteinG ? parseFloat(proteinG) : 0,
      carbsG: carbsG ? parseFloat(carbsG) : 0,
      fatG: fatG ? parseFloat(fatG) : 0,
      fiberG: fiberG ? parseFloat(fiberG) : 0,
      notes: notes.trim() || undefined,
    })

    setSubmitting(false)
    // Reset form
    setFoodName('')
    setServing('')
    setProteinG('')
    setCarbsG('')
    setFatG('')
    setFiberG('')
    setCalories('')
    setNotes('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg p-6 rounded-3xl bg-card border border-white/20 space-y-6 shadow-2xl relative my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C7FF72]/15 text-[#C7FF72] flex items-center justify-center">
              <Utensils size={16} />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white">LOG CONSCIOUS NOURISHMENT</h3>
              <p className="font-mono text-[10px] text-muted">Track meals to observe whole food nourishment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-subtle hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Meal Type Selector */}
        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase tracking-wider text-subtle">
            MEAL CATEGORY
          </label>
          <div className="grid grid-cols-4 gap-2 font-mono text-xs">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setMealType(t)}
                className={`py-2 rounded-xl capitalize font-semibold border transition-all cursor-pointer ${
                  mealType === t
                    ? 'bg-[#C7FF72] text-[#050505] border-[#C7FF72] shadow-sm font-bold'
                    : 'bg-white/[0.03] border-white/10 text-muted hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Preset suggestions */}
        <div className="space-y-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-subtle">
            QUICK WHOLE FOOD PRESETS
          </span>
          <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
            {PRESET_FOODS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#C7FF72]/20 hover:text-[#C7FF72] border border-white/10 text-subtle transition-colors cursor-pointer"
              >
                + {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-mono text-[10px] uppercase tracking-wider text-subtle">
                Food / Dish Name *
              </label>
              <input
                type="text"
                required
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. Dal with Brown Rice"
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[10px] uppercase tracking-wider text-subtle">
                Serving Size (Optional)
              </label>
              <input
                type="text"
                value={serving}
                onChange={(e) => setServing(e.target.value)}
                placeholder="e.g. 1 bowl (200g)"
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {/* Macronutrients Grid */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center justify-between font-mono text-[10px] text-subtle">
              <span className="uppercase tracking-wider">OPTIONAL MACRONUTRIENTS (GRAMS)</span>
              <span>General Guidance</span>
            </div>

            <div className="grid grid-cols-4 gap-2 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-blue-300">Protein (g)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={proteinG}
                  onChange={(e) => setProteinG(e.target.value)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-amber-300">Carbs (g)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={carbsG}
                  onChange={(e) => setCarbsG(e.target.value)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-purple-300">Fat (g)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={fatG}
                  onChange={(e) => setFatG(e.target.value)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#C7FF72]">Fiber (g)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={fiberG}
                  onChange={(e) => setFiberG(e.target.value)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="font-mono text-[10px] uppercase tracking-wider text-subtle">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Prepared with minimal oil; felt energized afterwards"
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-subtle hover:text-white font-mono text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#C7FF72] text-[#050505] font-mono text-xs font-bold hover:bg-[#D5FFA0] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles size={13} />
              <span>{submitting ? 'Saving…' : 'Log Meal (+10 XP)'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

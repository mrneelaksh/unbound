'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Droplets, Apple, Moon, Activity, Sparkles, Plus, Minus,
  Info, Check, ChevronRight, Wind
} from 'lucide-react'
import { useUserStore } from '@/lib/store'
import { CinematicStarfield } from '@/components/ui/CinematicStarfield'

// ============================================================
// Nutrition Matrix — educational statuses only, no percentages
// ============================================================
type NutrientStatus = 'GOOD' | 'MODERATE' | 'NEEDS ATTENTION' | 'NOT TRACKED'

interface NutrientEntry {
  id: string
  name: string
  status: NutrientStatus
  insight: string
  foodSources: string[]
}

const STATUS_STYLES: Record<NutrientStatus, { pill: string; dot: string }> = {
  GOOD: { pill: 'bg-[#C7FF72]/15 text-[#C7FF72] border-[#C7FF72]/30', dot: 'bg-[#C7FF72]' },
  MODERATE: { pill: 'bg-amber-400/15 text-amber-300 border-amber-400/30', dot: 'bg-amber-400' },
  'NEEDS ATTENTION': { pill: 'bg-orange-400/15 text-orange-300 border-orange-400/30', dot: 'bg-orange-400' },
  'NOT TRACKED': { pill: 'bg-white/10 text-white/40 border-white/10', dot: 'bg-white/20' },
}

const DEFAULT_NUTRIENTS: NutrientEntry[] = [
  {
    id: 'protein',
    name: 'Protein',
    status: 'MODERATE',
    insight: 'Supports muscle maintenance and neurotransmitter production. Found in most meals.',
    foodSources: ['Eggs', 'Dal', 'Paneer', 'Chicken', 'Soy', 'Beans'],
  },
  {
    id: 'fiber',
    name: 'Fiber',
    status: 'MODERATE',
    insight: 'Supports digestion and steady energy levels throughout the day.',
    foodSources: ['Whole grains', 'Fruits', 'Vegetables', 'Beans', 'Dal'],
  },
  {
    id: 'calcium',
    name: 'Calcium',
    status: 'NOT TRACKED',
    insight: 'Important for bone health and nerve signaling. Log dairy or fortified foods to track.',
    foodSources: ['Milk', 'Curd', 'Paneer', 'Leafy greens', 'Sesame'],
  },
  {
    id: 'iron',
    name: 'Iron',
    status: 'NOT TRACKED',
    insight: 'Supports energy and oxygen transport. Common in plant and animal foods.',
    foodSources: ['Spinach', 'Beans', 'Dal', 'Chicken', 'Fortified cereals'],
  },
  {
    id: 'vitd',
    name: 'Vitamin D',
    status: 'NEEDS ATTENTION',
    insight: 'Mainly produced by sunlight exposure. Many people benefit from spending time outdoors daily.',
    foodSources: ['Sunlight', 'Eggs', 'Milk', 'Fish', 'Fortified foods'],
  },
  {
    id: 'b12',
    name: 'B12',
    status: 'NOT TRACKED',
    insight: 'Essential for nerve function and red blood cell formation. Primarily found in animal products.',
    foodSources: ['Milk', 'Curd', 'Eggs', 'Chicken', 'Fish'],
  },
  {
    id: 'zinc',
    name: 'Zinc',
    status: 'MODERATE',
    insight: 'Supports immune function and is involved in many cellular processes.',
    foodSources: ['Pumpkin seeds', 'Beans', 'Chicken', 'Paneer', 'Whole grains'],
  },
]

// ============================================================
// Recommended Foods — whole foods, Indian-context
// ============================================================
interface FoodCard {
  id: string
  name: string
  portion: string
  category: 'protein' | 'grain' | 'fruit' | 'vegetable' | 'dairy'
  note: string
  tags: string[]
}

const RECOMMENDED_FOODS: FoodCard[] = [
  { id: 'eggs', name: 'Eggs', portion: '2 boiled or scrambled', category: 'protein', note: 'A complete protein source. Rich in choline and B vitamins.', tags: ['Protein', 'B12'] },
  { id: 'milk', name: 'Milk', portion: '1 glass (250ml)', category: 'dairy', note: 'Good source of calcium and B12. Works as a pre-sleep drink.', tags: ['Calcium', 'B12'] },
  { id: 'curd', name: 'Curd / Yogurt', portion: '1 bowl (150g)', category: 'dairy', note: 'Probiotic-rich. Supports gut health and digestion.', tags: ['Calcium', 'Probiotics'] },
  { id: 'paneer', name: 'Paneer', portion: '80g serving', category: 'dairy', note: 'High protein, calcium-rich vegetarian staple.', tags: ['Protein', 'Calcium'] },
  { id: 'dal', name: 'Dal / Lentils', portion: '1 bowl cooked', category: 'protein', note: 'Excellent plant protein and fiber. Core of a balanced Indian diet.', tags: ['Protein', 'Fiber', 'Iron'] },
  { id: 'beans', name: 'Rajma / Beans', portion: '3/4 bowl cooked', category: 'protein', note: 'Protein and fiber-dense. Great for sustained energy.', tags: ['Protein', 'Fiber'] },
  { id: 'soy', name: 'Soy / Tofu', portion: '100g', category: 'protein', note: 'Complete vegetarian protein with all essential amino acids.', tags: ['Protein', 'Calcium'] },
  { id: 'chicken', name: 'Chicken / Fish', portion: '120g grilled', category: 'protein', note: 'Lean protein source. Fish provides omega-3 fatty acids.', tags: ['Protein', 'B12', 'Iron'] },
  { id: 'fruits', name: 'Seasonal Fruits', portion: '1-2 pieces', category: 'fruit', note: 'Natural vitamins, antioxidants, and fiber. Variety is key.', tags: ['Fiber', 'Vitamins'] },
  { id: 'vegetables', name: 'Mixed Vegetables', portion: '2+ servings', category: 'vegetable', note: 'Micronutrient dense. Aim for variety across colors.', tags: ['Fiber', 'Iron', 'Vitamins'] },
  { id: 'wholegrains', name: 'Whole Grains', portion: '1-2 portions daily', category: 'grain', note: 'Brown rice, roti, oats. Slow-digesting for steady energy.', tags: ['Fiber', 'B Vitamins'] },
]

const CATEGORY_COLORS: Record<FoodCard['category'], string> = {
  protein: 'text-blue-300',
  dairy: 'text-purple-300',
  fruit: 'text-amber-300',
  vegetable: 'text-[#C7FF72]',
  grain: 'text-orange-300',
}

// ============================================================
// Main Page
// ============================================================
export default function WellbeingPage() {
  const { addXP, urgeLogs, activities } = useUserStore()

  // Hydration logger
  const [hydrationGlasses, setHydrationGlasses] = useState(4)
  const HYDRATION_TARGET = 8
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Sleep logger
  const [sleepHours, setSleepHours] = useState(7)

  // Nutrient statuses
  const [nutrients, setNutrients] = useState<NutrientEntry[]>(DEFAULT_NUTRIENTS)
  const [expandedNutrient, setExpandedNutrient] = useState<string | null>(null)

  // Food log
  const [loggedFoods, setLoggedFoods] = useState<string[]>([])
  const [showAllFoods, setShowAllFoods] = useState(false)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const logWater = (delta: number) => {
    const next = Math.max(0, Math.min(12, hydrationGlasses + delta))
    setHydrationGlasses(next)
    if (delta > 0) {
      addXP(5, 'hydration_logged')
      showToast('+1 glass logged · +5 XP')
    }
  }

  const toggleFood = (food: FoodCard) => {
    if (loggedFoods.includes(food.id)) {
      setLoggedFoods(prev => prev.filter(id => id !== food.id))
    } else {
      setLoggedFoods(prev => [...prev, food.id])
      addXP(10, 'food_logged')
      showToast(`${food.name} logged · +10 XP`)
    }
  }

  const cycleNutrientStatus = (id: string) => {
    const order: NutrientStatus[] = ['NOT TRACKED', 'NEEDS ATTENTION', 'MODERATE', 'GOOD']
    setNutrients(prev => prev.map(n => {
      if (n.id !== id) return n
      const next = order[(order.indexOf(n.status) + 1) % order.length]
      return { ...n, status: next }
    }))
  }

  // Real data from store
  const recentUrges = urgeLogs.filter(u => Date.now() - u.timestamp < 7 * 86400000)
  const deflectedUrges = recentUrges.filter(u => u.outcome === 'deflected')
  const recentActivities = activities.filter(a => Date.now() - a.timestamp < 7 * 86400000)
  const focusSessions = recentActivities.filter(a => a.type === 'focus')

  const visibleFoods = showAllFoods ? RECOMMENDED_FOODS : RECOMMENDED_FOODS.slice(0, 6)

  return (
    <div className="relative min-h-screen text-white">
      <CinematicStarfield variant="WELLBEING" intensity="medium" density={1.1} />

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 md:bottom-8 right-4 z-50 px-4 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#C7FF72]/40 text-white font-mono text-xs shadow-2xl flex items-center gap-2"
          >
            <Sparkles size={13} className="text-[#C7FF72]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 space-y-8 pb-28 md:pb-16">

        {/* HERO */}
        <div className="pb-6 border-b border-white/8">
          <span className="font-mono text-[10px] tracking-[0.2em] text-[#C7FF72] uppercase">Body &amp; Wellbeing</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mt-2 tracking-tight">
            UNDERSTAND YOUR HABITS
          </h1>
          <p className="font-sans text-sm text-muted max-w-xl mt-2 leading-relaxed">
            Understand the everyday habits that support your wellbeing — hydration, balanced nutrition,
            rest, and physical movement. No medical claims. Your data stays private.
          </p>
        </div>

        {/* TODAY'S NUTRITION MATRIX */}
        <section className="rounded-2xl bg-[#0B0B0B]/80 backdrop-blur-md border border-white/8 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] tracking-[0.15em] text-subtle uppercase">Today</span>
              <h2 className="font-display text-lg font-bold text-white mt-0.5">NUTRITION CHECK-IN</h2>
            </div>
            <div className="font-mono text-[10px] text-subtle text-right">
              <div>Tap to expand · Tap status to update</div>
              <div className="text-[9px] text-white/25 mt-0.5">Educational only — not a diagnosis</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {nutrients.map(n => {
              const style = STATUS_STYLES[n.status]
              const isExpanded = expandedNutrient === n.id
              return (
                <div key={n.id} className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
                  <button
                    className="w-full text-left p-4 space-y-2"
                    onClick={() => setExpandedNutrient(isExpanded ? null : n.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-bold text-white">{n.name}</span>
                      <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase tracking-wider ${style.pill}`}>
                      {n.status}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                          <p className="font-sans text-[11px] text-muted leading-relaxed">{n.insight}</p>
                          <div>
                            <div className="font-mono text-[9px] text-subtle uppercase mb-1">Food Sources</div>
                            <div className="flex flex-wrap gap-1">
                              {n.foodSources.map(f => (
                                <span key={f} className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/8 font-mono text-[9px] text-muted">{f}</span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => cycleNutrientStatus(n.id)}
                            className="w-full py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] font-mono text-[10px] text-muted hover:text-text transition-colors"
                          >
                            Update Status
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          <p className="font-mono text-[10px] text-subtle/60 italic">
            Status reflects your own self-assessment. UNBOUND does not diagnose deficiencies.
          </p>
        </section>

        {/* HYDRATION + SLEEP ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Hydration */}
          <section className="rounded-2xl bg-[#0B0B0B]/80 backdrop-blur-md border border-white/8 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <Droplets size={18} className="text-blue-400" />
              <div>
                <span className="font-mono text-[10px] tracking-[0.15em] text-subtle uppercase">Hydration</span>
                <h3 className="font-display text-base font-bold text-white">WATER INTAKE</h3>
              </div>
            </div>

            <div>
              <div className="flex gap-1 flex-wrap mb-2">
                {Array.from({ length: HYDRATION_TARGET }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-8 rounded border transition-colors ${i < hydrationGlasses
                      ? 'bg-blue-400/40 border-blue-400/50'
                      : 'bg-white/[0.03] border-white/10'
                      }`}
                  />
                ))}
              </div>
              <div className="font-mono text-[11px] text-muted">
                {hydrationGlasses} of {HYDRATION_TARGET} glasses &middot; ~{hydrationGlasses * 250}ml
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => logWater(-1)}
                className="w-9 h-9 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
              >
                <Minus size={14} />
              </button>
              <button
                onClick={() => logWater(1)}
                className="flex-1 py-2.5 rounded-lg bg-blue-400/20 border border-blue-400/30 hover:bg-blue-400/30 text-blue-300 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={13} /> LOG A GLASS (+5 XP)
              </button>
            </div>

            <p className="font-sans text-[11px] text-subtle leading-relaxed">
              Aim for 6-8 glasses daily. Needs vary by activity, climate, and diet.
            </p>
          </section>

          {/* Sleep */}
          <section className="rounded-2xl bg-[#0B0B0B]/80 backdrop-blur-md border border-white/8 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <Moon size={18} className="text-purple-400" />
              <div>
                <span className="font-mono text-[10px] tracking-[0.15em] text-subtle uppercase">Rest</span>
                <h3 className="font-display text-base font-bold text-white">SLEEP LOG</h3>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <span className="font-numbers text-5xl font-bold text-white">{sleepHours}</span>
              <span className="font-mono text-sm text-muted mb-1.5">hrs last night</span>
            </div>

            <input
              type="range" min={4} max={12} step={0.5} value={sleepHours}
              onChange={e => setSleepHours(Number(e.target.value))}
              className="w-full accent-purple-400"
              aria-label="Sleep hours"
            />
            <div className="flex justify-between font-mono text-[10px] text-subtle">
              <span>4 hrs</span>
              <span>12 hrs</span>
            </div>

            <div className={`px-3 py-2 rounded-lg border font-mono text-[11px] ${sleepHours >= 8
              ? 'bg-[#C7FF72]/10 border-[#C7FF72]/20 text-[#C7FF72]'
              : sleepHours >= 7
                ? 'bg-[#C7FF72]/8 border-[#C7FF72]/15 text-[#C7FF72]/80'
                : sleepHours >= 6
                  ? 'bg-amber-400/10 border-amber-400/20 text-amber-300'
                  : 'bg-orange-400/10 border-orange-400/20 text-orange-300'
              }`}>
              {sleepHours >= 8 ? 'Well-rested range'
                : sleepHours >= 7 ? 'Within healthy range for most adults'
                  : sleepHours >= 6 ? 'Slightly below recommended for most adults'
                    : 'Below recommended — prioritize rest tonight'}
            </div>
          </section>
        </div>

        {/* ACTIVITY SUMMARY — from real store data */}
        <section className="rounded-2xl bg-[#0B0B0B]/80 backdrop-blur-md border border-white/8 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Activity size={18} className="text-[#C7FF72]" />
            <div>
              <span className="font-mono text-[10px] tracking-[0.15em] text-subtle uppercase">This Week</span>
              <h3 className="font-display text-base font-bold text-white">MOVEMENT &amp; FOCUS</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8 space-y-1">
              <div className="font-mono text-[10px] text-subtle uppercase">Activities</div>
              <div className="font-numbers text-2xl font-bold text-white">{recentActivities.length}</div>
              <div className="font-mono text-[10px] text-muted">past 7 days</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8 space-y-1">
              <div className="font-mono text-[10px] text-subtle uppercase">Focus Sessions</div>
              <div className="font-numbers text-2xl font-bold text-[#C7FF72]">{focusSessions.length}</div>
              <div className="font-mono text-[10px] text-muted">past 7 days</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8 space-y-1">
              <div className="font-mono text-[10px] text-subtle uppercase">Urges Noticed</div>
              <div className="font-numbers text-2xl font-bold text-white">{recentUrges.length}</div>
              <div className="font-mono text-[10px] text-muted">past 7 days</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8 space-y-1">
              <div className="font-mono text-[10px] text-subtle uppercase">Deflected</div>
              <div className="font-numbers text-2xl font-bold text-[#C7FF72]">{deflectedUrges.length}</div>
              <div className="font-mono text-[10px] text-muted">of {recentUrges.length} noticed</div>
            </div>
          </div>

          {recentActivities.length === 0 && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <p className="font-mono text-xs text-subtle">No activity logged yet this week. Use the Activity tab to log a walk, run, or focus session.</p>
            </div>
          )}
        </section>

        {/* RECOMMENDED FOOD ENGINE */}
        <section className="rounded-2xl bg-[#0B0B0B]/80 backdrop-blur-md border border-white/8 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Apple size={18} className="text-amber-400" />
              <div>
                <span className="font-mono text-[10px] tracking-[0.15em] text-subtle uppercase">Nutrition</span>
                <h3 className="font-display text-base font-bold text-white">RECOMMENDED WHOLE FOODS</h3>
              </div>
            </div>
            <div className="font-mono text-[10px] text-subtle hidden sm:block">Tap to mark as eaten today</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleFoods.map(food => {
              const isLogged = loggedFoods.includes(food.id)
              return (
                <motion.button
                  key={food.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleFood(food)}
                  className={`text-left p-4 rounded-xl border transition-all ${isLogged
                    ? 'bg-[#C7FF72]/8 border-[#C7FF72]/30'
                    : 'bg-white/[0.02] border-white/8 hover:border-white/15'
                    }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className={`font-mono text-[9px] uppercase font-bold ${CATEGORY_COLORS[food.category]}`}>{food.category}</div>
                      <div className="font-display text-sm font-bold text-white mt-0.5">{food.name}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors mt-0.5 ${isLogged ? 'bg-[#C7FF72] border-[#C7FF72]' : 'border-white/20'}`}>
                      {isLogged && <Check size={11} strokeWidth={3} className="text-[#050505]" />}
                    </div>
                  </div>
                  <p className="font-sans text-[11px] text-muted leading-relaxed mb-2">{food.note}</p>
                  <div className="font-mono text-[10px] text-subtle">{food.portion}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {food.tags.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/8 font-mono text-[9px] text-muted">{tag}</span>
                    ))}
                  </div>
                </motion.button>
              )
            })}
          </div>

          {!showAllFoods && RECOMMENDED_FOODS.length > 6 && (
            <button
              onClick={() => setShowAllFoods(true)}
              className="w-full py-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] font-mono text-xs text-muted hover:text-text transition-colors flex items-center justify-center gap-2"
            >
              Show all foods <ChevronRight size={13} />
            </button>
          )}

          {loggedFoods.length > 0 && (
            <div className="p-3 rounded-lg bg-[#C7FF72]/8 border border-[#C7FF72]/20 font-mono text-[11px] text-[#C7FF72]">
              {loggedFoods.length} food{loggedFoods.length > 1 ? 's' : ''} marked today. Keep building the habit.
            </div>
          )}
        </section>

        {/* YOUR WELLBEING INSIGHT — real data driven */}
        <section className="rounded-2xl bg-[#0B0B0B]/80 backdrop-blur-md border border-white/8 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-[#C7FF72]" />
            <div>
              <span className="font-mono text-[10px] tracking-[0.15em] text-subtle uppercase">Insight</span>
              <h3 className="font-display text-base font-bold text-white">YOUR WELLBEING INSIGHT</h3>
            </div>
          </div>

          <div className="space-y-3">
            {recentActivities.length >= 2 && (
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8">
                <div className="font-mono text-[10px] text-[#C7FF72] uppercase mb-1">Movement</div>
                <p className="font-sans text-sm text-text leading-relaxed">You have completed {recentActivities.length} activity sessions this week. Physical movement supports mood regulation and sleep quality.</p>
              </div>
            )}

            {deflectedUrges.length > 0 && (
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8">
                <div className="font-mono text-[10px] text-[#C7FF72] uppercase mb-1">Resilience</div>
                <p className="font-sans text-sm text-text leading-relaxed">You deflected {deflectedUrges.length} of {recentUrges.length} urges this week. Each intentional pause builds stronger impulse-regulation patterns over time.</p>
              </div>
            )}

            {hydrationGlasses >= HYDRATION_TARGET && (
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8">
                <div className="font-mono text-[10px] text-[#C7FF72] uppercase mb-1">Hydration</div>
                <p className="font-sans text-sm text-text leading-relaxed">Daily hydration goal reached. Proper hydration supports cognitive function and energy throughout the day.</p>
              </div>
            )}

            {recentActivities.length === 0 && deflectedUrges.length === 0 && hydrationGlasses < 2 && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="font-sans text-sm text-muted leading-relaxed">Log your hydration, food, and activity to build a picture of your wellbeing patterns. Insights appear as you track.</p>
              </div>
            )}
          </div>
        </section>

        {/* RECOVERY HABITS */}
        <section className="rounded-2xl bg-[#0B0B0B]/80 backdrop-blur-md border border-white/8 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Wind size={18} className="text-blue-300" />
            <h3 className="font-display text-base font-bold text-white">RECOVERY HABITS</h3>
          </div>

          <div className="space-y-2">
            {[
              { label: '20+ minutes of natural light daily', sub: 'Supports circadian rhythm and Vitamin D synthesis' },
              { label: 'Screen-free wind-down (30 min before sleep)', sub: 'Blue light reduces melatonin production' },
              { label: '7-9 hours of sleep (most adults)', sub: 'Memory consolidation and cellular repair occur during sleep' },
              { label: 'Daily movement — any form', sub: 'Reduces baseline stress hormones over time' },
              { label: 'Consistent wake time', sub: 'The strongest anchor for a healthy circadian rhythm' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/6">
                <div className="w-5 h-5 rounded-full border border-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                </div>
                <div>
                  <div className="font-mono text-xs text-text">{item.label}</div>
                  <div className="font-sans text-[11px] text-subtle mt-0.5">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DISCLAIMER */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/8 flex items-start gap-3">
          <Info size={14} className="text-subtle shrink-0 mt-0.5" />
          <p className="font-sans text-[11px] text-subtle leading-relaxed">
            UNBOUND provides general wellbeing education and self-tracking tools. Nothing here constitutes medical advice, clinical diagnosis, or personalized health treatment.
            Consult a qualified healthcare professional for individualized guidance.
          </p>
        </div>

      </div>
    </div>
  )
}

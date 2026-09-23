'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Droplets, Apple, Moon, Activity, Sparkles, Plus,
  ShieldCheck, ArrowRight, Heart, Footprints
} from 'lucide-react'
import Link from 'next/link'
import { useUserStore } from '@/lib/store'
import { CinematicStarfield } from '@/components/ui/CinematicStarfield'
import { HydrationRing } from '@/components/wellbeing/HydrationRing'
import { QuickWaterAdd } from '@/components/wellbeing/QuickWaterAdd'
import { HydrationHistory } from '@/components/wellbeing/HydrationHistory'
import { NutritionDashboard } from '@/components/wellbeing/NutritionDashboard'
import { FoodLoggerModal } from '@/components/wellbeing/FoodLoggerModal'
import { FoodRecommendations } from '@/components/wellbeing/FoodRecommendations'

export default function WellbeingPage() {
  const {
    todayWaterMl,
    dailyWaterGoalMl,
    waterHistory7d,
    waterHistory30d,
    waterHistory90d,
    foodLogs,
    nutritionTotals,
    activities,
    syncWithServer,
    addWater,
    updateWaterGoal,
    logFood,
    deleteFood,
  } = useUserStore()

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'water' | 'nutrition' | 'recovery'>('all')
  const [showFoodModal, setShowFoodModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [sleepHours, setSleepHours] = useState(7.5)

  useEffect(() => {
    syncWithServer()
  }, [syncWithServer])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleAddWater = async (amount: number) => {
    await addWater(amount)
    showToast(`+${amount} ml logged · +5 XP`)
  }

  const handleSaveMeal = async (meal: any) => {
    await logFood(meal)
    showToast(`Logged ${meal.foodName} · +10 XP`)
  }

  const handleDeleteFood = async (id: string) => {
    await deleteFood(id)
    showToast('Meal log deleted.')
  }

  const isGoalAchieved = todayWaterMl >= dailyWaterGoalMl && dailyWaterGoalMl > 0
  const recentActivities = activities.slice(0, 5)
  const totalStepsToday = recentActivities
    .filter((a) => a.date === new Date().toISOString().split('T')[0])
    .reduce((acc, a) => acc + a.steps, 0)

  return (
    <div className="relative min-h-screen text-white">
      {/* Background Starfield: Dynamic brightness when hydration goal is achieved */}
      <CinematicStarfield
        variant="WELLBEING"
        intensity={isGoalAchieved ? 'deep' : 'medium'}
        density={isGoalAchieved ? 1.4 : 1.1}
        speed={isGoalAchieved ? 1.2 : 1}
      />

      {/* Floating Action Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 md:bottom-8 right-4 z-50 px-4 py-2.5 rounded-xl bg-[#0E0E0E] border border-[#C7FF72]/40 text-white font-mono text-xs shadow-2xl flex items-center gap-2"
          >
            <Sparkles size={14} className="text-[#C7FF72]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 space-y-8 pb-28 md:pb-16">
        {/* 1. Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C7FF72] animate-pulse" />
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#C7FF72] uppercase font-bold">
                BIOLOGICAL LIVING SYSTEM
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mt-1 tracking-tight">
              BODY &amp; WELLBEING
            </h1>
            <p className="font-sans text-xs md:text-sm text-muted max-w-xl mt-1 leading-relaxed">
              Balanced hydration, whole-food nourishment, restorative sleep, and physical movement work together to restore prefrontal autonomy.
            </p>
          </div>

          {/* Sub-view Navigation Filter */}
          <div className="flex items-center gap-1 font-mono text-xs p-1 rounded-xl bg-card border border-white/10 self-start sm:self-auto">
            {(['all', 'water', 'nutrition', 'recovery'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                  activeSubTab === tab
                    ? 'bg-white text-black font-bold'
                    : 'text-subtle hover:text-white'
                }`}
              >
                {tab === 'all' ? 'Overview' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Water / Hydration Section (HydroTrack UX Inspiration) */}
        {(activeSubTab === 'all' || activeSubTab === 'water') && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Large Hydration Ring (Section 19 & 22) */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <HydrationRing
                  currentMl={todayWaterMl}
                  goalMl={dailyWaterGoalMl}
                  onUpdateGoal={updateWaterGoal}
                  isGoalAchieved={isGoalAchieved}
                />
              </div>

              {/* Quick Water Add Actions (Section 20) */}
              <div className="lg:col-span-7 flex flex-col justify-between p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 shadow-card space-y-6">
                <div className="space-y-1">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-subtle">
                    HYDROTRACK PROTOCOL
                  </span>
                  <h3 className="font-display text-lg font-bold text-white">
                    ONE-TAP HYDRATION LOGGING
                  </h3>
                  <p className="font-mono text-xs text-muted leading-relaxed">
                    Consistent fluid intake maintains cerebral blood flow and eases impulsive agitation. Tap any preset below to add to your daily volume.
                  </p>
                </div>

                <QuickWaterAdd onAddWater={handleAddWater} />

                {/* Hydration Guidance Note */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between font-mono text-xs text-subtle">
                  <span>Daily Goal Progress:</span>
                  <span className="text-[#C7FF72] font-bold">
                    {todayWaterMl.toLocaleString()} / {dailyWaterGoalMl.toLocaleString()} ml
                  </span>
                </div>
              </div>
            </div>

            {/* Hydration History, Consistency, and Heatmap (Section 23, 24, 25) */}
            <HydrationHistory
              history7d={waterHistory7d}
              history30d={waterHistory30d}
              history90d={waterHistory90d}
              dailyGoalMl={dailyWaterGoalMl}
              totalLogsCount={todayWaterMl > 0 || waterHistory7d.some((d) => d.amountMl > 0) ? 1 : 0}
            />
          </section>
        )}

        {/* 3. Nutrition & Food Logging Dashboard (Section 26, 27, 28, 29, 33) */}
        {(activeSubTab === 'all' || activeSubTab === 'nutrition') && (
          <section className="space-y-6">
            <NutritionDashboard
              logs={foodLogs}
              totals={nutritionTotals}
              onOpenLogModal={() => setShowFoodModal(true)}
              onDeleteLog={handleDeleteFood}
            />

            {/* Food Recommendations & Safety (Section 30, 31, 32) */}
            <FoodRecommendations />
          </section>
        )}

        {/* 4. Sleep & Physical Movement Modules (Section 34 & 61) */}
        {(activeSubTab === 'all' || activeSubTab === 'recovery') && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sleep & Restorative Window */}
              <div className="p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 shadow-card space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon size={18} className="text-[#A78BFA]" />
                      <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
                        SLEEP &amp; RESTORATION
                      </h3>
                    </div>
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-subtle border border-white/10 uppercase">
                      RECOVERY
                    </span>
                  </div>
                  <p className="font-mono text-xs text-muted mt-1 leading-relaxed">
                    High quality REM and deep sleep protect dopamine receptors and reduce late-night impulsivity.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-subtle uppercase">REST DURATION</span>
                    <div className="font-numbers text-3xl font-bold text-white">{sleepHours} HRS</div>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <button
                      onClick={() => setSleepHours((prev) => Math.max(4, Math.round((prev - 0.5) * 10) / 10))}
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-white border border-white/10 flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      onClick={() => setSleepHours((prev) => Math.min(12, Math.round((prev + 0.5) * 10) / 10))}
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-white border border-white/10 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 font-mono text-xs text-subtle">
                  <span>Night Shield Protected:</span>
                  <Link href="/night-shield" className="text-[#C7FF72] hover:underline flex items-center gap-1 font-bold">
                    <span>Manage Window</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>

              {/* Physical Activity Connection (Section 61, 62) */}
              <div className="p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 shadow-card space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Footprints size={18} className="text-[#C7FF72]" />
                      <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
                        PHYSICAL MOVEMENT
                      </h3>
                    </div>
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-subtle border border-white/10 uppercase">
                      LOGGED
                    </span>
                  </div>
                  <p className="font-mono text-xs text-muted mt-1 leading-relaxed">
                    Cardiovascular resets dissipate physical restlessness and boost circulating endorphins.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-subtle uppercase">TODAY&apos;S MOVEMENT</span>
                    <div className="font-numbers text-3xl font-bold text-white">
                      {totalStepsToday > 0 ? `${totalStepsToday.toLocaleString()} STEPS` : '0 STEPS'}
                    </div>
                  </div>
                  <span className="font-mono text-xs text-[#C7FF72] font-bold">
                    {totalStepsToday > 0 ? 'Active' : 'Ready'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 font-mono text-xs text-subtle">
                  <span>Outdoor GPS &amp; Pacer:</span>
                  <Link href="/activity" className="text-[#C7FF72] hover:underline flex items-center gap-1 font-bold">
                    <span>Open Activity Tracker</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Food Logger Modal */}
      <FoodLoggerModal
        isOpen={showFoodModal}
        onClose={() => setShowFoodModal(false)}
        onSaveMeal={handleSaveMeal}
      />
    </div>
  )
}

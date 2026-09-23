'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts'
import { Utensils, Plus, Trash2, Apple, AlertCircle, Info, Sparkles } from 'lucide-react'

export interface FoodLogEntry {
  id: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food_name: string
  serving?: string | null
  calories?: number | null
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  notes?: string | null
  logged_at: string
}

interface NutritionDashboardProps {
  logs: FoodLogEntry[]
  totals: {
    calories: number
    proteinG: number
    carbsG: number
    fatG: number
    fiberG: number
  }
  onOpenLogModal: () => void
  onDeleteLog: (id: string) => Promise<void>
}

const MACRO_COLORS = {
  Protein: '#60A5FA', // Blue
  Carbs: '#FBBF24',   // Amber
  Fat: '#C084FC',     // Purple
}

export function NutritionDashboard({
  logs,
  totals,
  onOpenLogModal,
  onDeleteLog,
}: NutritionDashboardProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'>('all')

  const filteredLogs = activeTab === 'all' ? logs : logs.filter((l) => l.meal_type === activeTab)
  const hasLogs = logs.length > 0

  // Macro pie data
  const totalMacroGrams = totals.proteinG + totals.carbsG + totals.fatG
  const hasEnoughMacroData = totalMacroGrams >= 5

  const macroData = [
    { name: 'Protein', value: totals.proteinG, color: MACRO_COLORS.Protein },
    { name: 'Carbs', value: totals.carbsG, color: MACRO_COLORS.Carbs },
    { name: 'Fat', value: totals.fatG, color: MACRO_COLORS.Fat },
  ].filter((m) => m.value > 0)

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Add */}
      <div className="p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Apple size={18} className="text-[#C7FF72]" />
              <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
                CONSCIOUS NUTRITION
              </h3>
            </div>
            <p className="font-mono text-xs text-muted mt-0.5">
              Balanced whole foods support dopamine regulation, cognitive endurance, and steady energy.
            </p>
          </div>

          <button
            onClick={onOpenLogModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C7FF72] text-[#050505] font-mono text-xs font-bold hover:bg-[#D5FFA0] transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>LOG A MEAL</span>
          </button>
        </div>

        {/* 2. Today's Nutrition Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Macro Donut Chart or Empty state */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-subtle uppercase tracking-wider">
                TODAY&apos;S NUTRITION BALANCE
              </span>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-subtle border border-white/10">
                LOGGED
              </span>
            </div>

            {!hasEnoughMacroData ? (
              <div className="py-8 text-center space-y-2">
                <Utensils size={22} className="mx-auto text-subtle/50" />
                <p className="font-mono text-xs text-muted max-w-xs mx-auto">
                  LOG MORE MEALS TO SEE YOUR NUTRITION BREAKDOWN.
                </p>
                <button
                  onClick={onOpenLogModal}
                  className="font-mono text-xs text-[#C7FF72] hover:underline cursor-pointer"
                >
                  Log your first meal →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-44 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0E0E0E',
                          borderColor: 'rgba(255,255,255,0.15)',
                          borderRadius: '12px',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          color: '#FFF',
                        }}
                        formatter={(val: any, name: any) => [`${val} g`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="font-numbers text-xl font-bold text-white leading-none">
                      {Math.round(totalMacroGrams)}g
                    </span>
                    <span className="font-mono text-[9px] text-subtle mt-0.5">TOTAL MACROS</span>
                  </div>
                </div>

                {/* Macro Legend */}
                <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs">
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-blue-300 block">PROTEIN</span>
                    <span className="font-bold text-white">{totals.proteinG}g</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-amber-300 block">CARBS</span>
                    <span className="font-bold text-white">{totals.carbsG}g</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-purple-300 block">FAT</span>
                    <span className="font-bold text-white">{totals.fatG}g</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 29: Daily Nutrients Matrix */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-subtle uppercase tracking-wider">
                DAILY NUTRIENTS
              </span>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-subtle border border-white/10">
                GENERAL GUIDANCE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-subtle uppercase">PROTEIN</span>
                <div className="text-base font-bold text-white">
                  {totals.proteinG > 0 ? `${totals.proteinG} g` : 'NOT TRACKED'}
                </div>
                <p className="text-[9px] text-muted">Supports neurotransmitter synthesis</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-subtle uppercase">FIBER</span>
                <div className="text-base font-bold text-[#C7FF72]">
                  {totals.fiberG > 0 ? `${totals.fiberG} g` : 'NOT TRACKED'}
                </div>
                <p className="text-[9px] text-muted">Digestive &amp; microbiome stability</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-subtle uppercase">CALCIUM</span>
                <div className="text-base font-bold text-white/40">NOT TRACKED</div>
                <p className="text-[9px] text-muted">Dairy, sesame, fortified whole foods</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-subtle uppercase">IRON</span>
                <div className="text-base font-bold text-white/40">NOT TRACKED</div>
                <p className="text-[9px] text-muted">Lentils, spinach, seeds, poultry</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-subtle uppercase">VITAMIN D</span>
                <div className="text-base font-bold text-white/40">NOT TRACKED</div>
                <p className="text-[9px] text-muted">Morning sunlight exposure &amp; eggs</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-subtle uppercase">VITAMIN B12</span>
                <div className="text-base font-bold text-white/40">NOT TRACKED</div>
                <p className="text-[9px] text-muted">Dairy, eggs, nutritional yeast</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Logged Food Entries List */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              TODAY&apos;S LOGGED FOODS ({logs.length})
            </h4>

            {/* Meal Filter Tabs */}
            <div className="flex items-center gap-1 font-mono text-[10px] p-1 rounded-xl bg-white/[0.04] border border-white/10 overflow-x-auto">
              {(['all', 'breakfast', 'lunch', 'dinner', 'snack'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-1 rounded-lg uppercase transition-colors cursor-pointer ${
                    activeTab === tab
                      ? 'bg-white text-black font-bold'
                      : 'text-subtle hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {!hasLogs ? (
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-3">
              <Utensils size={24} className="mx-auto text-subtle/50" />
              <div className="space-y-1">
                <h5 className="font-display text-sm font-bold text-white">NO NUTRITION DATA YET</h5>
                <p className="font-mono text-xs text-muted max-w-sm mx-auto">
                  Log your breakfast, lunch, or dinner to start monitoring your conscious nourishment.
                </p>
              </div>
              <button
                onClick={onOpenLogModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs border border-white/10 transition-colors font-bold cursor-pointer"
              >
                <Plus size={13} />
                <span>LOG A MEAL</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {filteredLogs.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] uppercase tracking-wider text-[#C7FF72] font-bold">
                      {entry.meal_type}
                    </span>
                    <div>
                      <div className="text-white font-semibold">{entry.food_name}</div>
                      <div className="text-[10px] text-muted">
                        {entry.serving ? `${entry.serving} · ` : ''}
                        {entry.protein_g > 0 ? `P: ${entry.protein_g}g ` : ''}
                        {entry.carbs_g > 0 ? `C: ${entry.carbs_g}g ` : ''}
                        {entry.fat_g > 0 ? `F: ${entry.fat_g}g ` : ''}
                        {entry.calories ? `· ${entry.calories} kcal` : ''}
                      </div>
                      {entry.notes && (
                        <div className="text-[10px] text-subtle italic mt-0.5">&quot;{entry.notes}&quot;</div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteLog(entry.id)}
                    className="p-1.5 rounded-lg text-subtle hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
                    title="Delete entry"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

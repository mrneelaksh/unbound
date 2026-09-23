'use client'

import React, { useState } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { Apple, Utensils, Award, Sparkles } from 'lucide-react'
import type { MacroBalance, TimeSeriesPoint } from '@/lib/analytics/types'
import { ChartEmptyState } from './ChartEmptyState'

interface NutritionAnalyticsCardProps {
  totalLoggedMeals: number
  macroBalance: MacroBalance
  mealCounts: { breakfast: number; lunch: number; dinner: number; snack: number }
  nutrientSeries: Record<string, TimeSeriesPoint[]>
  timeLabel: string
}

export function NutritionAnalyticsCard({
  totalLoggedMeals,
  macroBalance,
  mealCounts,
  nutrientSeries,
  timeLabel,
}: NutritionAnalyticsCardProps) {
  const [selectedNutrient, setSelectedNutrient] = useState<'Protein' | 'Fiber'>('Protein')

  const hasData = totalLoggedMeals > 0
  const macroData = [
    { name: 'Protein', value: macroBalance.proteinG, color: '#C7FF72' },
    { name: 'Carbohydrates', value: macroBalance.carbsG, color: '#FFFFFF' },
    { name: 'Healthy Fats', value: macroBalance.fatG, color: '#777777' },
  ].filter((m) => m.value > 0)

  const activeSeries = nutrientSeries[selectedNutrient] || []

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 space-y-6 shadow-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#C7FF72]/15 text-[#C7FF72]">
              <Apple size={16} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
              NEURO-NUTRITIONAL EQUILIBRIUM
            </span>
            <span className="font-mono text-xs text-subtle">· {timeLabel}</span>
          </div>
          <h3 className="font-display text-lg font-bold text-white uppercase tracking-wider mt-1">
            NUTRITION &amp; MACRO BALANCE
          </h3>
        </div>

        <div className="font-mono text-xs text-muted">
          TOTAL LOGGED: <span className="text-white font-bold">{totalLoggedMeals} meals</span>
        </div>
      </div>

      {!hasData ? (
        <ChartEmptyState
          title="NO NUTRITION LOGGED YET"
          message="Log whole meals or snack entries in the Wellbeing tab to generate your macronutrient distribution and micronutrient trends."
          height="240px"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Donut Chart (Macro Balance - Req 16) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <div className="text-center">
              <span className="font-mono text-[10px] text-subtle uppercase tracking-wider">
                TODAY&apos;S MACRO BALANCE
              </span>
              <h4 className="font-display text-sm font-bold text-white uppercase">
                PROTEIN · CARBS · FATS
              </h4>
            </div>

            <div className="h-44 w-full relative flex items-center justify-center">
              {macroData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroData}
                        innerRadius={52}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111',
                          borderColor: 'rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                        }}
                        formatter={(val: any, name: any) => [`${val}g`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Donut Center Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="font-numbers text-xl font-bold text-white">
                      {macroBalance.totalCalories}
                    </span>
                    <span className="font-mono text-[9px] text-subtle uppercase">KCAL</span>
                  </div>
                </>
              ) : (
                <div className="text-center font-mono text-xs text-subtle">No meals today</div>
              )}
            </div>

            {/* Macro Legend */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center font-mono text-xs">
              <div>
                <span className="text-[10px] text-[#C7FF72] block">Protein</span>
                <span className="font-bold text-white">{macroBalance.proteinG}g</span>
              </div>
              <div>
                <span className="text-[10px] text-white block">Carbs</span>
                <span className="font-bold text-white">{macroBalance.carbsG}g</span>
              </div>
              <div>
                <span className="text-[10px] text-[#777] block">Fat</span>
                <span className="font-bold text-white">{macroBalance.fatG}g</span>
              </div>
            </div>
          </div>

          {/* Nutrient Trends Selector & Graph (Req 17) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-subtle uppercase tracking-wider">
                  NUTRIENT HISTORY ({timeLabel})
                </span>
                <h4 className="font-display text-sm font-bold text-white uppercase">
                  {selectedNutrient} INTAKE OVER TIME
                </h4>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px]">
                {(['Protein', 'Fiber'] as const).map((nutrient) => (
                  <button
                    key={nutrient}
                    onClick={() => setSelectedNutrient(nutrient)}
                    className={`px-3 py-1 rounded-lg uppercase transition-colors cursor-pointer ${
                      selectedNutrient === nutrient
                        ? 'bg-[#C7FF72]/15 text-[#C7FF72] font-bold'
                        : 'text-subtle hover:text-white'
                    }`}
                  >
                    {nutrient}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-44 w-full">
              {activeSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeSeries} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="nutrientGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C7FF72" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#C7FF72" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 10, fill: '#888' }} />
                    <YAxis stroke="#444" tick={{ fontSize: 10, fill: '#888' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111',
                        borderColor: 'rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                      }}
                      formatter={(val: any) => [`${val}g`, selectedNutrient]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#C7FF72"
                      strokeWidth={2}
                      fill="url(#nutrientGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center font-mono text-xs text-subtle border border-dashed border-white/10 rounded-xl">
                  Awaiting multi-day nutrient logs
                </div>
              )}
            </div>

            {/* Meal Logging Consistency Bars (Req 18) */}
            <div className="pt-2 border-t border-white/5 space-y-1.5 font-mono text-xs">
              <span className="text-[10px] text-subtle uppercase">MEAL LOGGING CONSISTENCY</span>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] text-subtle block">BREAKFAST</span>
                  <span className="font-bold text-white">{mealCounts.breakfast} logged</span>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] text-subtle block">LUNCH</span>
                  <span className="font-bold text-white">{mealCounts.lunch} logged</span>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] text-subtle block">DINNER</span>
                  <span className="font-bold text-white">{mealCounts.dinner} logged</span>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] text-subtle block">SNACK</span>
                  <span className="font-bold text-white">{mealCounts.snack} logged</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-subtle">
        <span>DATA: STRUCTURED WHOLE FOOD LOGS</span>
        <span>NEURO-TRANSMITTER PRECURSOR SUPPORT</span>
      </div>
    </div>
  )
}

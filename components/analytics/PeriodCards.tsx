'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, ResponsiveContainer
} from 'recharts'
import {
  TrendingUp, TrendingDown, Minus, Zap, Droplets,
  Footprints, Moon, Clock, Compass, Shield
} from 'lucide-react'

interface PeriodCardData {
  id: string
  label: string
  value: string
  change: string
  direction: 'up' | 'down' | 'neutral'
  icon: React.ElementType
  color: string
  sparkline: { val: number }[]
}

interface PeriodCardsProps {
  cardsData: {
    week: PeriodCardData[]
    month: PeriodCardData[]
    allTime: PeriodCardData[]
  }
}

export function PeriodCards({ cardsData }: PeriodCardsProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'allTime'>('week')
  const currentList = cardsData[period] || []

  return (
    <div className="space-y-4">
      {/* Section Header & Sub-Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] text-subtle uppercase tracking-[0.2em]">
            EXECUTIVE TELEMETRY
          </span>
          <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
            {period === 'week' ? 'THIS WEEK' : period === 'month' ? 'THIS MONTH' : 'ALL TIME OVERVIEW'}
          </h3>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-card border border-white/10 font-mono text-[11px]">
          {(['week', 'month', 'allTime'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
                period === p
                  ? 'bg-white/15 text-white font-bold'
                  : 'text-subtle hover:text-white'
              }`}
            >
              {p === 'week' ? 'THIS WEEK' : p === 'month' ? 'THIS MONTH' : 'ALL TIME'}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {currentList.map((card) => {
          const Icon = card.icon
          const isUp = card.direction === 'up'
          const isDown = card.direction === 'down'

          return (
            <div
              key={card.id}
              className="p-4 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 flex flex-col justify-between space-y-3 shadow-card hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-subtle uppercase tracking-wider">
                  {card.label}
                </span>
                <Icon size={14} className="text-[#C7FF72]" />
              </div>

              <div>
                <div className="font-numbers text-xl md:text-2xl font-bold text-white tracking-tight">
                  {card.value}
                </div>
                <div className="flex items-center gap-1 mt-1 font-mono text-[10px]">
                  {card.change === 'NO COMPARISON' ? (
                    <span className="text-subtle flex items-center gap-0.5">
                      <Minus size={10} /> NO COMPARISON
                    </span>
                  ) : (
                    <span
                      className={`flex items-center gap-0.5 font-bold ${
                        isUp ? 'text-[#C7FF72]' : isDown ? 'text-white/70' : 'text-subtle'
                      }`}
                    >
                      {isUp && <TrendingUp size={10} />}
                      {isDown && <TrendingDown size={10} />}
                      {card.change}
                    </span>
                  )}
                </div>
              </div>

              {/* Mini Sparkline */}
              <div className="h-9 w-full pt-1">
                {card.sparkline && card.sparkline.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={card.sparkline}>
                      <defs>
                        <linearGradient id={`sparkGrad-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C7FF72" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#C7FF72" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="val"
                        stroke="#C7FF72"
                        strokeWidth={1.5}
                        fill={`url(#sparkGrad-${card.id})`}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full border-b border-dashed border-white/10" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

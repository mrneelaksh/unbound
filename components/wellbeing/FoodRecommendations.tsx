'use client'

import React from 'react'
import { Sparkles, ShieldCheck, Heart, Apple, Check } from 'lucide-react'

interface FoodItem {
  name: string
  category: 'protein' | 'dairy' | 'fiber' | 'grain'
  portion: string
  benefit: string
  tags: string[]
}

const RECOMMENDATIONS: FoodItem[] = [
  {
    name: 'GREEK YOGURT / CURD',
    category: 'dairy',
    portion: '1 bowl (150g)',
    benefit: 'Protein-rich food & natural probiotics for gut microbiome and cognitive stability.',
    tags: ['Protein', 'Probiotics', 'Calcium'],
  },
  {
    name: 'EGGS',
    category: 'protein',
    portion: '2 boiled or poached',
    benefit: 'Complete amino acid profile rich in choline for prefrontal brain health.',
    tags: ['Protein', 'Choline', 'B12'],
  },
  {
    name: 'DAL / LENTILS',
    category: 'fiber',
    portion: '1 bowl cooked',
    benefit: 'Core plant protein and slow-digesting soluble fiber for steady glucose.',
    tags: ['Protein', 'Fiber', 'Iron'],
  },
  {
    name: 'SEASONAL FRUIT',
    category: 'fiber',
    portion: '1-2 pieces (Apple, Berries, Banana)',
    benefit: 'Natural antioxidants, micronutrients, and hydration support.',
    tags: ['Fiber', 'Micronutrients', 'Hydration'],
  },
  {
    name: 'PANEER / TOFU',
    category: 'protein',
    portion: '80g - 100g serving',
    benefit: 'High-density protein and sustained satiety during demanding focus windows.',
    tags: ['Protein', 'Calcium'],
  },
  {
    name: 'WHOLE GRAINS (OATS / ROTI)',
    category: 'grain',
    portion: '1-2 servings daily',
    benefit: 'Complex carbohydrates sustaining steady cerebral glycogen without dopamine spikes.',
    tags: ['Slow Energy', 'B Vitamins'],
  },
]

export function FoodRecommendations() {
  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 shadow-card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#C7FF72]" />
            <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
              RECOMMENDED WHOLE FOODS
            </h3>
          </div>
          <p className="font-mono text-xs text-muted mt-0.5">
            Nutrient-dense options supporting autonomic recovery and dopamine equilibrium.
          </p>
        </div>

        <span className="font-mono text-[9px] px-2.5 py-1 rounded-full bg-white/5 text-subtle border border-white/10 uppercase self-start sm:self-auto">
          GENERAL GUIDANCE
        </span>
      </div>

      {/* Food Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {RECOMMENDATIONS.map((food) => (
          <div
            key={food.name}
            className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-white tracking-wide">
                  {food.name}
                </span>
                <span className="font-mono text-[9px] text-[#C7FF72] uppercase font-bold">
                  {food.category}
                </span>
              </div>
              <p className="font-sans text-xs text-muted leading-relaxed">
                {food.benefit}
              </p>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-subtle">
              <span>Portion: {food.portion}</span>
              <div className="flex gap-1">
                {food.tags.map((t) => (
                  <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-white/70">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section 31: Minor Safety & Evidence-Based Disclaimer */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-[#C7FF72]/20 flex items-start gap-3">
        <ShieldCheck size={18} className="text-[#C7FF72] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-mono text-xs text-white font-bold">
            HEALTH &amp; ADOLESCENT SAFETY PRINCIPLES
          </div>
          <p className="font-sans text-xs text-muted leading-relaxed">
            UNBOUND strictly advocates for wholesome nourishing foods, ample hydration, sound sleep, and joyful physical movement. We strictly reject extreme dieting, appearance comparisons, or speculative clinical deficiency assertions. Consult licensed medical professionals for individualized dietary needs.
          </p>
        </div>
      </div>
    </div>
  )
}

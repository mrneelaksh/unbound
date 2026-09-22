// ============================================================
// UNBOUND — Centralized Plan Entitlements & Pricing Engine
// ============================================================

export type PlanType = 'free' | 'trial' | 'pro' | 'max'

export interface PricingTier {
  id: PlanType
  name: string
  tagline: string
  priceMonthly: number // in INR (₹)
  priceYearly: number // in INR (₹)
  currency: string
  popular?: boolean
  description: string
  features: string[]
}

export const PLAN_PRICING: Record<PlanType, PricingTier> = {
  free: {
    id: 'free',
    name: 'FREE',
    tagline: 'Foundational Awareness',
    priceMonthly: 0,
    priceYearly: 0,
    currency: '₹',
    description: 'Foundational habit awareness, daily streaks, basic XP, and core urge interruption tools.',
    features: [
      'Basic onboarding pattern assessment',
      'Non-diagnostic pattern report',
      'Daily recovery streak & check-in',
      'Basic Urge Mode (5-minute reset)',
      'Starter quests & basic XP progression',
      'Basic activity summary (steps & distance)',
      'Access to 24/7 global crisis directory',
    ],
  },
  trial: {
    id: 'trial',
    name: '7-DAY TRIAL',
    tagline: 'Pro Preview Period',
    priceMonthly: 0,
    priceYearly: 0,
    currency: '₹',
    description: 'Full preview of Pro features for 7 days. Automatically reverts to Free unless upgraded.',
    features: [
      'All Pro features unlocked during trial window',
      'Full AI Accountability Coach',
      'Night Shield temporal defense',
      'Advanced 8-week trend analytics',
      'Full achievement badge unlocks',
    ],
  },
  pro: {
    id: 'pro',
    name: 'PRO',
    tagline: 'Full Behavior Operating System',
    priceMonthly: 1000,
    priceYearly: 9600, // 20% discount (₹800/mo effective)
    currency: '₹',
    popular: true,
    description: 'Comprehensive recovery OS: AI coach, Night Shield, advanced temporal insights, and full activity tracking.',
    features: [
      'Everything in Free',
      'Full AI Accountability Coach (expanded usage)',
      'Automated Night Shield distraction barrier',
      '8-week urge journey & impulse control arc gauge',
      'Advanced personal insights & trigger triage',
      'Full 10-level progression & achievement badge unlocks',
      'Weekly AI behavioral synthesis reports',
      'Advanced physical activity & running tracking',
    ],
  },
  max: {
    id: 'max',
    name: 'MAX',
    tagline: 'Deep Personalization & Concierge Mastery',
    priceMonthly: 5000,
    priceYearly: 48000, // 20% discount (₹4000/mo effective)
    currency: '₹',
    description: 'Maximum AI allowance, deep psychological pattern evolution modeling, and priority support.',
    features: [
      'Everything in Pro',
      'Maximum AI coaching allowance & context memory',
      'Deep personalization & custom habit blueprints',
      'Multi-device synchronization & companion extension',
      'Advanced long-term trend modeling & predictive risk alerts',
      'Priority support access & roadmap voting',
      'Dedicated 1-on-1 account onboarding concierge',
    ],
  },
}

export type FeatureKey =
  | 'basic_onboarding'
  | 'basic_dashboard'
  | 'standard_urge_mode'
  | 'expanded_urge_mode'
  | 'full_ai_coach'
  | 'advanced_analytics'
  | 'advanced_insights'
  | 'night_shield'
  | 'weekly_ai_reports'
  | 'advanced_activity'
  | 'full_achievements'
  | 'max_personalization'
  | 'deep_trend_analysis'
  | 'priority_support'
  | 'premium_education'
  | 'advanced_wellbeing'
  | 'community_accountability'

const FEATURE_MATRIX: Record<FeatureKey, PlanType[]> = {
  basic_onboarding: ['free', 'trial', 'pro', 'max'],
  basic_dashboard: ['free', 'trial', 'pro', 'max'],
  standard_urge_mode: ['free', 'trial', 'pro', 'max'],
  expanded_urge_mode: ['trial', 'pro', 'max'],
  full_ai_coach: ['trial', 'pro', 'max'],
  advanced_analytics: ['trial', 'pro', 'max'],
  advanced_insights: ['trial', 'pro', 'max'],
  night_shield: ['trial', 'pro', 'max'],
  weekly_ai_reports: ['trial', 'pro', 'max'],
  advanced_activity: ['trial', 'pro', 'max'],
  full_achievements: ['trial', 'pro', 'max'],
  max_personalization: ['max'],
  deep_trend_analysis: ['max'],
  priority_support: ['max'],
  // Education, Advanced Wellbeing, Community
  premium_education: ['pro', 'max'],
  advanced_wellbeing: ['trial', 'pro', 'max'],
  community_accountability: ['pro', 'max'],
}

/**
 * Check if a plan has access to a specific feature
 */
export function hasFeature(feature: FeatureKey, currentPlan: PlanType = 'free'): boolean {
  const allowed = FEATURE_MATRIX[feature]
  if (!allowed) return false
  return allowed.includes(currentPlan)
}

/**
 * Helper to format price in INR
 */
export function formatPrice(amount: number): string {
  if (amount === 0) return '₹0'
  return `₹${amount.toLocaleString('en-IN')}`
}

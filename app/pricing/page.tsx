'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, Sparkles, Shield, ArrowRight, X, CreditCard,
  Lock, CheckCircle2, AlertCircle, Loader2, RefreshCw, Zap
} from 'lucide-react'
import { useUserStore } from '@/lib/store'
import { PLAN_PRICING, type PlanType } from '@/lib/entitlements'
import type { CheckoutSession, VerificationResult } from '@/lib/payment'

export default function PricingPage() {
  const [yearly, setYearly] = useState(false)
  const { plan: currentPlan, setPlan } = useUserStore()

  // Checkout Modal State
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanType | null>(null)
  const [isTrialSelected, setIsTrialSelected] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'review' | 'processing' | 'success' | 'error'>('review')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi')
  const [simulateFailure, setSimulateFailure] = useState(false)

  const handleOpenCheckout = (tierId: PlanType, isTrial: boolean = false) => {
    if (tierId === 'free') {
      setPlan('free')
      return
    }
    setSelectedPlanForCheckout(tierId)
    setIsTrialSelected(isTrial)
    setCheckoutStep('review')
    setCheckoutError(null)
  }

  const handleExecutePayment = async () => {
    if (!selectedPlanForCheckout) return
    setCheckoutStep('processing')
    setCheckoutError(null)

    try {
      // 1. Call server API to initialize order session
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlanForCheckout,
          billingCycle: yearly ? 'annual' : 'monthly',
          isTrial: isTrialSelected,
        }),
      })

      if (!checkoutRes.ok) {
        throw new Error('Failed to create secure checkout session.')
      }

      const session: CheckoutSession = await checkoutRes.json()

      // 2. Gateway Processing Simulation (1.2s delay for realistic banking communication)
      await new Promise((resolve) => setTimeout(resolve, 1200))

      const paymentId = simulateFailure
        ? 'pay_simulated_failure'
        : `pay_unbound_${Date.now().toString(36)}`

      // 3. Call server API to verify payment and signature
      const verifyRes = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: session.orderId,
          paymentId,
          signature: `sig_${session.orderId}_verified`,
          planId: selectedPlanForCheckout,
        }),
      })

      const verifyData: VerificationResult = await verifyRes.json()

      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Payment authorization was declined.')
      }

      // 4. Update store and transition to success
      setPlan(selectedPlanForCheckout)
      setVerificationResult(verifyData)
      setCheckoutStep('success')
    } catch (err: any) {
      setCheckoutError(err.message || 'Payment processing error.')
      setCheckoutStep('error')
    }
  }

  const tiers = [
    {
      id: 'free' as PlanType,
      name: 'FREE',
      tagline: 'Foundational Awareness',
      priceMonthly: '₹0',
      priceYearly: '₹0',
      billed: 'Forever free',
      description: 'Foundational habit awareness, daily streaks, basic XP, and core urge interruption tools.',
      features: [
        'Complete 15-question pattern assessment',
        'Non-diagnostic pattern report',
        'Daily recovery streak & check-in',
        'Standard Urge Mode (5-min interventions)',
        'Starter quests & basic XP progression',
        'Basic activity summary (steps & distance)',
        'Access to full 24/7 crisis directory',
      ],
      highlighted: false,
    },
    {
      id: 'pro' as PlanType,
      name: 'PRO',
      tagline: 'Full Behavior Operating System',
      priceMonthly: '₹1,000',
      priceYearly: '₹800',
      billed: yearly ? '₹9,600 billed annually (Save 20%)' : 'Billed monthly',
      description: 'AI accountability coach, Night Shield, advanced temporal analytics, and physical activity tracking.',
      features: [
        'Everything in Free',
        'Full AI Accountability Coach (expanded usage)',
        'Automated Night Shield & distraction barrier',
        '8-week urge journey & impulse control arc gauge',
        'Advanced personal insights & trigger triage',
        'Full 10-level progression & achievement badge unlocks',
        'Weekly AI behavioral synthesis reports',
        'Live GPS & step physical activity tracking',
      ],
      highlighted: true,
    },
    {
      id: 'max' as PlanType,
      name: 'MAX',
      tagline: 'Deep Personalization & Mastery',
      priceMonthly: '₹5,000',
      priceYearly: '₹4,000',
      billed: yearly ? '₹48,000 billed annually (Save 20%)' : 'Billed monthly',
      description: 'Maximum AI allowance, deep psychological pattern evolution modeling, and priority concierge.',
      features: [
        'Everything in Pro',
        'Maximum AI coaching allowance & context memory',
        'Deep personalization & custom habit blueprints',
        'Advanced long-term trend modeling & predictive risk alerts',
        'Multi-device synchronization & companion extension',
        'Priority support access & roadmap voting',
        'Dedicated 1-on-1 account onboarding concierge',
      ],
      highlighted: false,
    },
  ]

  const comparisonRows = [
    { feature: 'Onboarding & Pattern Audit', free: 'Included', pro: 'Included', max: 'Included' },
    { feature: 'Daily Streak & Check-in', free: 'Included', pro: 'Included', max: 'Included' },
    { feature: 'Urge Mode Interventions', free: 'Standard (5/day)', pro: 'Unlimited', max: 'Unlimited' },
    { feature: 'AI Accountability Coach', free: 'Preview (3/day)', pro: 'Expanded (50/day)', max: 'Maximum (Unlimited)' },
    { feature: 'Night Shield Temporal Defense', free: 'Locked', pro: 'Full Protocol', max: 'Full Protocol' },
    { feature: 'Transformation Growth Analytics', free: '7-Day Summary', pro: '8-Week Deep Dive', max: 'Lifetime Modeling' },
    { feature: 'Personal Trigger & Habit Insights', free: 'Locked', pro: 'Full Triage', max: 'Predictive Modeling' },
    { feature: 'Physical Activity & Running Tracker', free: 'Basic Totals', pro: 'Full GPS & Steps', max: 'Full GPS & Advanced' },
    { feature: 'Weekly AI Behavioral Reports', free: 'Locked', pro: 'Weekly Synthesis', max: 'Executive Deep Dive' },
    { feature: 'Achievement Badges', free: 'Basic', pro: 'All 8 Badges', max: 'All 8 Badges' },
    { feature: 'Deep Personalization Blueprints', free: 'Locked', pro: 'Locked', max: 'Included' },
    { feature: 'Priority Concierge Support', free: 'Standard', pro: 'Standard', max: 'Priority 1-on-1' },
  ]

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-12 space-y-16">
      {/* Top Heading */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="font-mono text-xs tracking-[0.3em] uppercase text-subtle">
          TRANSPARENT VALUE
        </span>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight">
          Invest in your autonomy.
        </h1>
        <p className="font-sans text-sm md:text-base text-muted leading-relaxed">
          Zero dark patterns. Zero deceptive renewal fees. Choose the tier of support that accelerates your personal growth.
        </p>

        {/* 7-Day Trial Callout Banner */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C7FF72]/15 border border-[#C7FF72]/30 text-[#C7FF72] font-mono text-xs font-bold">
            <Sparkles size={13} />
            <span>New users: 7-day full trial available on PRO</span>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`font-mono text-xs ${!yearly ? 'text-white font-bold' : 'text-subtle'}`}>
            Monthly
          </span>
          <button
            onClick={() => setYearly(!yearly)}
            className="w-14 h-7 rounded-full bg-card border border-white/20 p-1 flex items-center transition-colors"
            aria-label="Toggle annual billing"
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`w-5 h-5 rounded-full bg-white transition-transform ${yearly ? 'translate-x-7' : 'translate-x-0'}`}
            />
          </button>
          <span className={`font-mono text-xs ${yearly ? 'text-white font-bold' : 'text-subtle'} flex items-center gap-1.5`}>
            <span>Yearly</span>
            <span className="px-1.5 py-0.5 rounded bg-[#C7FF72]/20 text-[10px] text-[#C7FF72] font-bold">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((t) => {
          const isCurrent = currentPlan === t.id
          return (
            <div
              key={t.id}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all relative ${
                t.highlighted
                  ? 'bg-card border-2 border-[#C7FF72] shadow-[0_0_30px_rgba(199,255,114,0.18)]'
                  : 'bg-card border border-white/10 hover:border-white/20'
              }`}
            >
              {t.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#C7FF72] text-[#050505] font-mono text-[10px] font-bold tracking-wider uppercase shadow-md">
                  RECOMMENDED
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-white">{t.name}</h3>
                  <p className="font-mono text-xs text-subtle mt-1">{t.tagline}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="font-numbers text-4xl font-bold text-white">
                      {yearly ? t.priceYearly : t.priceMonthly}
                    </span>
                    <span className="font-mono text-xs text-muted">/ month</span>
                  </div>
                  <p className="font-mono text-[10px] text-subtle">{t.billed}</p>
                </div>

                <p className="font-sans text-xs text-muted leading-relaxed">
                  {t.description}
                </p>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <span className="font-mono text-[10px] uppercase text-subtle tracking-wider">
                    INCLUDED CAPABILITIES
                  </span>
                  <ul className="space-y-2.5">
                    {t.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 font-sans text-xs text-white">
                        <Check size={14} className={`shrink-0 mt-0.5 ${t.highlighted ? 'text-[#C7FF72]' : 'text-white'}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8 space-y-2">
                <button
                  onClick={() => handleOpenCheckout(t.id)}
                  disabled={isCurrent}
                  className={`w-full py-3.5 px-6 rounded-xl font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-white/10 border border-white/20 text-muted cursor-default'
                      : t.highlighted
                      ? 'bg-[#C7FF72] text-[#050505] hover:bg-[#D5FFA0] shadow-[0_0_20px_rgba(199,255,114,0.2)]'
                      : 'bg-white text-black hover:bg-[#E5E5E5]'
                  }`}
                >
                  <span>{isCurrent ? 'CURRENT PLAN' : `UPGRADE TO ${t.name}`}</span>
                  {!isCurrent && <ArrowRight size={14} />}
                </button>

                {t.highlighted && !isCurrent && (
                  <button
                    onClick={() => handleOpenCheckout(t.id, true)}
                    className="w-full py-2 text-center font-mono text-[11px] text-muted hover:text-white transition-colors"
                  >
                    Or start with 7-Day Free Trial →
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="p-8 rounded-3xl bg-card border border-white/10 space-y-6 shadow-card">
        <div>
          <h2 className="font-display text-xl font-bold text-white">DETAILED PLAN COMPARISON</h2>
          <p className="font-mono text-xs text-muted mt-1">
            Compare features across Free, Pro (₹1,000/mo), and Max (₹5,000/mo).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 text-subtle text-[11px]">
                <th className="pb-3 font-normal">CAPABILITY</th>
                <th className="pb-3 font-normal text-center">FREE</th>
                <th className="pb-3 font-normal text-center text-[#C7FF72] font-bold">PRO (₹1,000)</th>
                <th className="pb-3 font-normal text-center">MAX (₹5,000)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.01]">
                  <td className="py-3 text-white font-sans">{row.feature}</td>
                  <td className="py-3 text-center text-muted">{row.free}</td>
                  <td className="py-3 text-center text-[#C7FF72] font-bold">{row.pro}</td>
                  <td className="py-3 text-center text-muted">{row.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CHECKOUT MODAL & TRANSACTION FLOW */}
      {/* ============================================================ */}
      <AnimatePresence>
        {selectedPlanForCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 md:p-8 rounded-3xl bg-card border border-white/20 space-y-6 shadow-2xl relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#C7FF72]/15 text-[#C7FF72]">
                    <Shield size={18} />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-subtle uppercase">SECURE PAYMENT</span>
                    <h3 className="font-display text-lg font-bold text-white">
                      UNBOUND {selectedPlanForCheckout.toUpperCase()} CHECKOUT
                    </h3>
                  </div>
                </div>
                {checkoutStep !== 'processing' && (
                  <button
                    onClick={() => setSelectedPlanForCheckout(null)}
                    className="p-1 rounded-lg text-subtle hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* STEP 1: REVIEW ORDER */}
              {checkoutStep === 'review' && (
                <div className="space-y-6">
                  {/* Order Summary Box */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center text-subtle">
                      <span>PLAN</span>
                      <span className="text-white font-bold uppercase">{selectedPlanForCheckout} OPERATING SYSTEM</span>
                    </div>
                    <div className="flex justify-between items-center text-subtle">
                      <span>BILLING CYCLE</span>
                      <span className="text-white">{yearly ? 'Annual (20% Discount applied)' : 'Monthly'}</span>
                    </div>
                    <div className="flex justify-between items-center text-subtle">
                      <span>PRICE</span>
                      <span className="text-white">
                        {isTrialSelected
                          ? '₹0 (7-Day Trial, then billed monthly)'
                          : selectedPlanForCheckout === 'pro'
                          ? yearly ? '₹9,600 / year' : '₹1,000 / month'
                          : yearly ? '₹48,000 / year' : '₹5,000 / month'}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm font-bold">
                      <span className="text-white">TOTAL DUE NOW</span>
                      <span className="text-[#C7FF72]">
                        {isTrialSelected
                          ? '₹0'
                          : selectedPlanForCheckout === 'pro'
                          ? yearly ? '₹9,600' : '₹1,000'
                          : yearly ? '₹48,000' : '₹5,000'}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2 font-mono text-xs">
                    <label className="text-subtle uppercase text-[10px]">SELECT PAYMENT METHOD</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          paymentMethod === 'upi'
                            ? 'bg-white text-black font-bold border-white'
                            : 'bg-white/[0.02] border-white/10 text-muted hover:text-white'
                        }`}
                      >
                        UPI / QR
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          paymentMethod === 'card'
                            ? 'bg-white text-black font-bold border-white'
                            : 'bg-white/[0.02] border-white/10 text-muted hover:text-white'
                        }`}
                      >
                        Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('netbanking')}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          paymentMethod === 'netbanking'
                            ? 'bg-white text-black font-bold border-white'
                            : 'bg-white/[0.02] border-white/10 text-muted hover:text-white'
                        }`}
                      >
                        NetBanking
                      </button>
                    </div>
                  </div>

                  {/* QA Sandbox Simulator Toggle */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between font-mono text-[11px]">
                    <div className="space-y-0.5">
                      <span className="text-white">Test Mode Simulator</span>
                      <p className="text-subtle text-[10px]">Toggle to test gateway rejection</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSimulateFailure(!simulateFailure)}
                      className={`px-2.5 py-1 rounded border text-[10px] font-bold transition-colors ${
                        simulateFailure
                          ? 'bg-red-500/20 text-red-300 border-red-500/30'
                          : 'bg-white/5 text-muted border-white/10'
                      }`}
                    >
                      {simulateFailure ? 'FAIL SIMULATION ON' : 'SUCCESS NORMAL'}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlanForCheckout(null)}
                      className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-muted hover:text-white font-mono text-xs transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExecutePayment}
                      className="px-6 py-2.5 rounded-xl bg-[#C7FF72] text-[#050505] font-bold hover:bg-[#D5FFA0] font-mono text-xs transition-colors shadow-[0_0_20px_rgba(199,255,114,0.22)]"
                    >
                      {isTrialSelected ? 'Start 7-Day Free Trial' : 'Authorize & Pay Securely'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PROCESSING */}
              {checkoutStep === 'processing' && (
                <div className="py-12 text-center space-y-4">
                  <Loader2 size={36} className="animate-spin text-[#C7FF72] mx-auto" />
                  <div className="space-y-1">
                    <h4 className="font-display text-base font-bold text-white">
                      AUTHORIZING TRANSACTION
                    </h4>
                    <p className="font-mono text-xs text-muted">
                      Verifying cryptographic signature with payment gateway...
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: SUCCESS */}
              {checkoutStep === 'success' && verificationResult && (
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 rounded-full bg-[#C7FF72]/15 border border-[#C7FF72]/30 text-[#C7FF72] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(199,255,114,0.25)]">
                    <CheckCircle2 size={32} />
                  </div>

                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-[#C7FF72] uppercase font-bold tracking-widest">
                      PAYMENT VERIFIED &amp; ACTIVATED
                    </span>
                    <h4 className="font-display text-xl font-bold text-white">
                      WELCOME TO UNBOUND {verificationResult.planId.toUpperCase()}
                    </h4>
                    <p className="font-mono text-xs text-muted">
                      All advanced analytics, AI coach memory, and Night Shield protocols are now unlocked.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 font-mono text-xs text-left space-y-2">
                    <div className="flex justify-between text-subtle">
                      <span>TRANSACTION ID</span>
                      <span className="text-white font-bold">{verificationResult.transactionId}</span>
                    </div>
                    <div className="flex justify-between text-subtle">
                      <span>ACTIVATION DATE</span>
                      <span className="text-white">{new Date(verificationResult.activatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-subtle">
                      <span>NEXT RENEWAL</span>
                      <span className="text-white">{new Date(verificationResult.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setSelectedPlanForCheckout(null)}
                    className="w-full py-3.5 px-6 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-[#E5E5E5] transition-colors inline-block"
                  >
                    GO TO DASHBOARD
                  </Link>
                </div>
              )}

              {/* STEP 4: ERROR */}
              {checkoutStep === 'error' && (
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 rounded-full bg-red-950/30 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
                    <AlertCircle size={32} />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-display text-lg font-bold text-white">PAYMENT DECLINED</h4>
                    <p className="font-mono text-xs text-red-300">
                      {checkoutError || 'The transaction could not be authorized.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setCheckoutStep('review')}
                      className="px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => setSelectedPlanForCheckout(null)}
                      className="px-5 py-2.5 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-[#E5E5E5] transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

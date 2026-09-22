'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight, Shield, Zap, Sparkles, Brain, Clock, Activity,
  Lock, Globe, Compass, CheckCircle2, ChevronDown, Moon, LifeBuoy, Check
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { CinematicStarfield } from '@/components/ui/CinematicStarfield'
import { HeroHeadlineTyping } from '@/components/landing/HeroHeadlineTyping'
import Footer from '@/components/layout/Footer'

export default function LandingPage() {
  const [headlineComplete, setHeadlineComplete] = useState(false)

  const faqs = [
    {
      q: 'Is UNBOUND just a porn blocker?',
      a: 'No. Traditional blockers simply close browser tabs without addressing the root psychological trigger. UNBOUND is a behavioral operating system that helps you identify why urges happen (boredom, stress, loneliness), interrupts the impulse with 5-minute active cognitive exercises, and channels dopamine into constructive replacement habits.',
    },
    {
      q: 'Is UNBOUND considered medical treatment or clinical diagnosis?',
      a: 'No. UNBOUND provides educational self-reflection frameworks, habit tracking, and cognitive tools grounded in behavioral science. We never claim to cure disorders or provide formal psychiatric diagnoses. If you are experiencing severe distress or impairment, we provide direct links to certified sexual health clinicians and crisis helplines.',
    },
    {
      q: 'How is my privacy protected?',
      a: 'UNBOUND is built with a zero-knowledge local-first architecture. Your urge reflections, journal entries, and personal triggers remain strictly confidential. If you choose to participate in the Global Challenge, only an anonymous handle and healthy-action XP are displayed.',
    },
    {
      q: 'What happens if I experience a setback or slip up?',
      a: 'UNBOUND has zero shame mechanics. A setback is treated as data, not a moral failure. Our algorithms analyze the time and trigger of the urge to help you safeguard that window tomorrow, and your consistency scores accommodate recovery resets.',
    },
  ]

  return (
    <div className="min-h-dvh bg-bg text-text selection:bg-white/20 selection:text-white relative">
      <CinematicStarfield variant="LANDING" intensity="deep" density={1.2} opacity={0.85} />

      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md" asLink href="/" />
          <div className="hidden md:flex items-center gap-8 font-mono text-xs text-muted">
            <a href="#problem" className="hover:text-text transition-colors">Problem</a>
            <a href="#loop" className="hover:text-text transition-colors">Behavior Loop</a>
            <a href="#features" className="hover:text-text transition-colors">Features</a>
            <Link href="/pricing" className="hover:text-text transition-colors">Pricing</Link>
            <Link href="/support" className="hover:text-text transition-colors">Support</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="font-mono text-xs px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-white/25 active:scale-95 transition-all text-muted hover:text-text">
              Sign in
            </Link>
            <Link href="/auth/signup" className="font-mono text-xs px-4 py-1.5 rounded-lg bg-text text-bg font-bold hover:opacity-90 active:scale-95 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow opacity-60 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          {/* UNBOUND Branding / Pill appears first */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.05] border border-white/10 font-mono text-xs text-muted"
          >
            <Sparkles size={12} className="text-white" />
            <span>A Behavioral OS for Habit Transformation</span>
          </motion.div>

          {/* Main Headline Typing Animation: 50ms per character, accessible, smooth */}
          <HeroHeadlineTyping
            startDelay={200}
            charDelay={50}
            onComplete={() => setHeadlineComplete(true)}
          />

          {/* Supporting text fades in after headline completes */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={headlineComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-base md:text-lg text-muted max-w-2xl mx-auto leading-relaxed"
          >
            Understand your patterns. Interrupt urges in real time. Build positive replacement habits. Reclaim your focus, autonomy, and mental clarity.
          </motion.p>

          {/* CTA Buttons appear with a small stagger */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={headlineComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 font-mono text-xs"
          >
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-text text-bg font-bold tracking-wider hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7FF72] transition-all flex items-center justify-center gap-2 shadow-glow-soft"
            >
              <span>START YOUR JOURNEY</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/30 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all text-text flex items-center justify-center"
            >
              EXPLORE DASHBOARD
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={headlineComplete ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-mono text-[10px] text-subtle tracking-widest pt-2"
          >
            100% PRIVATE · LOCAL-FIRST ENCRYPTION · NON-JUDGMENTAL
          </motion.p>
        </div>
      </section>

      {/* 2. THE PROBLEM */}
      <section id="problem" className="py-20 border-t border-white/5 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-3">
            <span className="font-mono text-xs text-subtle uppercase tracking-widest">01 / THE EVIDENCE</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-text">
              The problem isn't lack of willpower.<br />It's an unrecognized emotional loop.
            </h2>
            <p className="font-sans text-sm text-muted leading-relaxed max-w-2xl">
              Research consistently indicates that compulsive pornography consumption is rarely about physical desire in isolation. It functions as an avoidant coping mechanism for acute stress, loneliness, fatigue, and boredom.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-2">
              <span className="font-numbers text-3xl font-bold text-text">63%+</span>
              <h3 className="font-display text-sm font-bold text-text">The Guilt Spiral</h3>
              <p className="font-sans text-xs text-muted leading-relaxed">
                Shame-based approaches amplify anxiety (r = 0.16–0.24), which perversely triggers the exact same urge loop.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-2">
              <span className="font-numbers text-3xl font-bold text-text">10 Min</span>
              <h3 className="font-display text-sm font-bold text-text">The Urge Horizon</h3>
              <p className="font-sans text-xs text-muted leading-relaxed">
                Neurobiological cravings peak and subside like ocean waves. Interrupting the first 5 to 10 minutes successfully halts the cycle.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-2">
              <span className="font-numbers text-3xl font-bold text-text">30%+</span>
              <h3 className="font-display text-sm font-bold text-text">The Treatment Gap</h3>
              <p className="font-sans text-xs text-muted leading-relaxed">
                Over a third of people desire behavioral change but are held back by stigma, high clinical costs, or fear of exposure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE COMPLETE BEHAVIORAL LOOP */}
      <section id="loop" className="py-20 border-t border-white/5 px-6 bg-surface/30">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="font-mono text-xs text-subtle uppercase tracking-widest">02 / ARCHITECTURE</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-text">
              The UNBOUND Behavioral Loop
            </h2>
            <p className="font-sans text-sm text-muted max-w-xl mx-auto">
              Moving your life from impulse obsession to active self-construction.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            {[
              { step: '01', title: 'DISCOVER', desc: 'Identify emotional triggers' },
              { step: '02', title: 'DETECT', desc: 'Pinpoint late-night vulnerability' },
              { step: '03', title: 'INTERRUPT', desc: '5-min guided Urge Mode' },
              { step: '04', title: 'REPLACE', desc: 'Chess, Coding, Physical reset' },
              { step: '05', title: 'BUILD', desc: 'Earn XP & Level progression' },
              { step: '06', title: 'MEASURE', desc: 'Longitudinal trend analytics' },
              { step: '07', title: 'CONNECT', desc: 'Supportive AI & Clinicians' },
              { step: '08', title: 'GROW', desc: 'Full autonomous mastery' },
            ].map((s) => (
              <div key={s.step} className="p-4 rounded-xl bg-card border border-white/10 space-y-1">
                <span className="text-[10px] text-subtle">{s.step}</span>
                <div className="font-bold text-text">{s.title}</div>
                <div className="text-muted text-[11px] font-sans">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CORE FEATURES (URGE MODE, COACH, NIGHT SHIELD) */}
      <section id="features" className="py-20 border-t border-white/5 px-6">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="font-mono text-xs text-subtle uppercase">SIGNATURE PROTOCOL</span>
              <h3 className="font-display text-3xl font-bold text-text flex items-center gap-2.5">
                <Zap size={24} className="text-white shrink-0" />
                <span>5-Minute Urge Mode</span>
              </h3>
              <p className="font-sans text-sm text-muted leading-relaxed">
                When an urge hits, one tap launches an immediate distraction-free sanctuary. Follow our rhythmic 4-2-6 breathing pacer, complete a 60-second physical reset, or ride the urge surfing wave until the dopamine spike subsides.
              </p>
              <ul className="space-y-2 font-mono text-xs text-muted">
                <li className="flex items-center gap-2.5">
                  <Check size={13} className="text-white shrink-0" />
                  <span>Dynamic 1-10 intensity measurement</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={13} className="text-white shrink-0" />
                  <span>Automatic trigger triage (stress, boredom, fatigue)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={13} className="text-white shrink-0" />
                  <span>Seamless pivot into positive replacement quests</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-card border border-white/10 shadow-card flex flex-col items-center text-center space-y-4">
              <div className="w-28 h-28 rounded-full border border-white/20 bg-white/5 flex flex-col items-center justify-center animate-pulse-slow">
                <span className="font-numbers text-3xl font-bold text-text">04</span>
                <span className="font-mono text-[9px] text-muted">INHALE</span>
              </div>
              <p className="font-display text-lg font-bold text-text">This moment will pass.</p>
              <p className="font-mono text-xs text-subtle">+50 XP rewarded upon successful deflection</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center md:flex-row-reverse">
            <div className="p-8 rounded-3xl bg-card border border-white/10 shadow-card space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-text">
                <span className="text-subtle block text-[10px]">YOU:</span>
                "I'm getting an urge after a stressful workday."
              </div>
              <div className="p-3 rounded-xl bg-white/10 border border-white/15 text-text">
                <span className="text-subtle block text-[10px]">UNBOUND COACH:</span>
                "I hear you. Work stress is your primary reported trigger. Let's interrupt this pattern before making any decision. Start a 3-minute breath reset?"
              </div>
            </div>

            <div className="space-y-4">
              <span className="font-mono text-xs text-subtle uppercase">GROUNDED INTELLIGENCE</span>
              <h3 className="font-display text-3xl font-bold text-text flex items-center gap-2.5">
                <Sparkles size={24} className="text-white shrink-0" />
                <span>Pattern-Aware AI Coach</span>
              </h3>
              <p className="font-sans text-sm text-muted leading-relaxed">
                Not a generic chatbot. UNBOUND Coach references your specific vulnerability profile, understands your high-risk hours, and never shames or lectures you. It offers concise, actionable micro-interventions when you need them most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING & TIERS */}
      <section className="py-20 border-t border-white/5 px-6 bg-surface/20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="font-mono text-xs text-subtle uppercase tracking-widest">TRANSPARENCY</span>
          <h2 className="font-display text-3xl font-bold text-text">Simple, Ethical Membership</h2>
          <p className="font-sans text-sm text-muted max-w-xl mx-auto">
            Free forever for core recovery tools. Upgrade for unlimited AI coaching, temporal night shields, and longitudinal analytics.
          </p>
          <div className="pt-4">
            <Link href="/pricing" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-text text-bg font-mono text-xs font-bold hover:opacity-90 transition-opacity shadow-glow-soft">
              <span>EXPLORE ALL TIERS</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-20 border-t border-white/5 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="font-mono text-xs text-subtle uppercase tracking-widest">CLARITY</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-text">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((f, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-card border border-white/10 space-y-2">
                <h4 className="font-display text-base font-bold text-text">{f.q}</h4>
                <p className="font-sans text-xs text-muted leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="py-24 border-t border-white/5 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow opacity-50 pointer-events-none" />
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text leading-tight">
            Your habits don't define you.<br />Your next choice does.
          </h2>
          <p className="font-sans text-sm text-muted">
            Take the first step toward self-mastery today. Free, private, and non-judgmental.
          </p>
          <div className="pt-2">
            <Link href="/auth/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-text text-bg font-mono text-xs font-bold hover:opacity-90 transition-opacity shadow-glow-soft">
              <span>START YOUR JOURNEY →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  )
}

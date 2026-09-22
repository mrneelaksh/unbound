'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, AlertTriangle, ArrowRight, ShieldCheck, Sparkles, RefreshCw, Zap, MessageSquare, Compass, Target } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { CinematicStarfield } from '@/components/ui/CinematicStarfield'
import { useUserStore, useOnboardingStore } from '@/lib/store'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function CoachPage() {
  const { currentStreak, currentLevel } = useUserStore()
  const { answers } = useOnboardingStore()

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Welcome back. I see you're on day ${currentStreak || 1} of your journey. I'm your accountability partner—here whenever an urge surfaces or when you want to plan your next constructive move. How are you feeling right now?`,
      timestamp: 'Just now',
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input
    if (!textToSend.trim() || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!customMessage) setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: {
            triggers: answers?.q7_triggers,
            goal: answers?.q15_personal_goal,
            replacementHabits: answers?.q12_replacement_habits,
            currentStreak,
            level: currentLevel,
          },
        }),
      })

      const data = await res.json()
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || "Let's interrupt this moment together. Would you like to launch Urge Mode for a 5-minute reset?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Coach is temporarily resetting. Let's interrupt this pattern immediately—take 3 slow, deep breaths or launch Urge Mode.",
          timestamp: 'Just now',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { label: 'START RESET', action: () => handleSend("I'm getting an intense urge right now.") },
    { label: 'TALK TO ME', action: () => handleSend('Can you guide me through a quick 3-minute mental reset?') },
    { label: 'DISTRACT ME', action: () => handleSend("I'm feeling bored and alone. What replacement habit can I start right now?") },
    { label: 'GO TO FOCUS', action: () => handleSend('Help me plan my bedtime routine so I avoid my late-night triggers.') },
  ]

  return (
    <div className="relative flex flex-col h-[calc(100dvh-5rem)] md:h-dvh max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      <CinematicStarfield variant="COACH" intensity="subtle" density={0.8} opacity={0.6} />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size="sm" showWordmark={false} />
            <h1 className="font-display text-xl font-bold text-text">UNBOUND COACH</h1>
            <span className="flex items-center gap-1 font-mono text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-text border border-white/10">
              <Sparkles size={10} /> AI PARTNER
            </span>
          </div>
          <p className="font-mono text-xs text-muted mt-0.5">
            Non-judgmental, pattern-aware accountability. Never shaming, never clinical.
          </p>
        </div>

        <Link href="/urge">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 font-mono text-xs text-text transition-colors"
          >
            <AlertTriangle size={13} />
            <span>URGE MODE</span>
          </motion.button>
        </Link>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 text-sm font-sans leading-relaxed ${
                m.role === 'user'
                  ? 'bg-white text-black rounded-br-none font-medium'
                  : 'bg-card border border-white/10 text-white rounded-bl-none shadow-card backdrop-blur-md'
              }`}
            >
              <p className="whitespace-pre-line">{m.content}</p>
              <span
                className={`block mt-2 font-mono text-[9px] ${
                  m.role === 'user' ? 'text-black/60 text-right' : 'text-subtle'
                }`}
              >
                {m.timestamp}
              </span>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-muted font-mono text-xs p-3 rounded-xl bg-white/[0.03] border border-white/5 w-fit"
          >
            <RefreshCw size={13} className="animate-spin" />
            <span>Analyzing pattern and preparing response...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {quickActions.map((qa, i) => (
          <button
            key={i}
            onClick={qa.action}
            className="whitespace-nowrap font-mono text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] hover:border-white/30 text-muted hover:text-white transition-all"
          >
            {qa.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="pt-2"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell your coach how you're feeling or what triggered you..."
            className="w-full py-3.5 pl-4 pr-12 rounded-xl bg-card border border-white/15 text-white placeholder:text-subtle text-sm font-sans focus:outline-none focus:border-white/40 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="absolute right-2 p-2 rounded-lg bg-[#C7FF72] text-[#050505] hover:bg-[#D5FFA0] disabled:opacity-30 transition-all shadow-sm"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="font-mono text-[9px] text-subtle text-center mt-2 flex items-center justify-center gap-1">
          <ShieldCheck size={11} /> End-to-end private. UNBOUND Coach is an educational partner and does not diagnose or replace professional healthcare.
        </p>
      </form>
    </div>
  )
}

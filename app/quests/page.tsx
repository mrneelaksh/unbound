'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Compass, CheckCircle2, Circle, Sparkles, Clock, Flame,
  Plus, Trophy, Award, Filter, Target, Dumbbell, BookOpen, Wind, Terminal, PenLine, Zap,
  type LucideIcon
} from 'lucide-react'
import { useUserStore } from '@/lib/store'

interface Quest {
  id: string
  title: string
  description: string
  category: 'focus' | 'fitness' | 'learning' | 'mindfulness' | 'creative'
  durationMinutes: number
  xpReward: number
  icon: LucideIcon
  completed: boolean
}

const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: '10-Minute Chess Challenge',
    description: 'Play a rapid game or solve tactical puzzles to redirect mental energy into deliberate calculation.',
    category: 'focus',
    durationMinutes: 10,
    xpReward: 50,
    icon: Target,
    completed: false,
  },
  {
    id: 'q2',
    title: '20 Push-ups + Cold Reset',
    description: 'Break dopamine anticipation through physical exertion and cold water face splash.',
    category: 'fitness',
    durationMinutes: 5,
    xpReward: 40,
    icon: Dumbbell,
    completed: true,
  },
  {
    id: 'q3',
    title: 'Read 5 Pages',
    description: 'Engage sustained cognitive focus with a physical book or educational article.',
    category: 'learning',
    durationMinutes: 10,
    xpReward: 30,
    icon: BookOpen,
    completed: false,
  },
  {
    id: 'q4',
    title: '5-Minute Box Breathing',
    description: 'Perform 4-4-4-4 rhythm grounding to calm autonomic nervous system excitation.',
    category: 'mindfulness',
    durationMinutes: 5,
    xpReward: 50,
    icon: Wind,
    completed: false,
  },
  {
    id: 'q5',
    title: '15-Minute Code Sprint',
    description: 'Build a small utility, fix a bug, or solve a coding algorithm with complete phone isolation.',
    category: 'focus',
    durationMinutes: 15,
    xpReward: 60,
    icon: Terminal,
    completed: false,
  },
  {
    id: 'q6',
    title: 'Gratitude Triad',
    description: 'Handwrite three specific things you are grateful for today to counter negativity bias.',
    category: 'mindfulness',
    durationMinutes: 4,
    xpReward: 30,
    icon: PenLine,
    completed: false,
  },
]

export default function QuestsPage() {
  const { totalXP, addXP, completeQuest, completedQuestIds } = useUserStore()
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS)
  const [activeTab, setActiveTab] = useState<'all' | 'focus' | 'fitness' | 'learning' | 'mindfulness'>('all')
  const [celebrationXP, setCelebrationXP] = useState<number | null>(null)

  const toggleQuest = (id: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const nextState = !q.completed
          if (nextState) {
            setCelebrationXP(q.xpReward)
            addXP(q.xpReward, 'quest_completed')
            completeQuest(id, q.xpReward)
            setTimeout(() => setCelebrationXP(null), 2500)
          }
          return { ...q, completed: nextState }
        }
        return q
      })
    )
  }

  const filteredQuests = activeTab === 'all' ? quests : quests.filter((q) => q.category === activeTab)
  const completedCount = quests.filter((q) => q.completed).length

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Compass size={20} className="text-text" />
            <h1 className="font-display text-2xl font-bold text-text">REPLACEMENT QUESTS</h1>
          </div>
          <p className="font-mono text-xs text-muted mt-1">
            Redirect impulse energy into tangible, dopamine-restorative positive habits.
          </p>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="px-4 py-2 rounded-xl bg-card border border-white/10">
            <span className="text-subtle">COMPLETED: </span>
            <span className="text-text font-bold">
              {completedCount} / {quests.length}
            </span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-card border border-white/10">
            <span className="text-subtle">EARNED TODAY: </span>
            <span className="text-text font-bold">
              +{quests.filter((q) => q.completed).reduce((acc, c) => acc + c.xpReward, 0)} XP
            </span>
          </div>
        </div>
      </div>

      {/* Floating XP Reward Popup */}
      <AnimatePresence>
        {celebrationXP && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-text text-bg font-mono font-bold text-sm shadow-glow-medium flex items-center gap-2"
          >
            <Sparkles size={16} />
            <span>QUEST ACCOMPLISHED! +{celebrationXP} RECOVERY XP</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5">
        {(['all', 'focus', 'fitness', 'learning', 'mindfulness'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-mono text-xs px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-all ${
              activeTab === tab
                ? 'bg-white/10 text-text border border-white/20'
                : 'text-subtle hover:text-muted hover:bg-white/[0.03]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Quests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuests.map((quest) => (
          <motion.div
            key={quest.id}
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative p-5 rounded-2xl border transition-all ${
              quest.completed
                ? 'bg-card/40 border-white/5 opacity-60'
                : 'bg-card border-white/10 hover:border-white/20 shadow-card'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                  <quest.icon size={18} className="text-text" />
                </div>
                <div>
                  <h3
                    className={`font-display text-base font-bold ${
                      quest.completed ? 'text-subtle line-through' : 'text-text'
                    }`}
                  >
                    {quest.title}
                  </h3>
                  <div className="flex items-center gap-3 font-mono text-[10px] text-muted mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {quest.durationMinutes} min
                    </span>
                    <span>·</span>
                    <span className="text-text">+{quest.xpReward} XP</span>
                    <span>·</span>
                    <span className="uppercase text-subtle">{quest.category}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleQuest(quest.id)}
                className={`p-2 rounded-xl border transition-all ${
                  quest.completed
                    ? 'bg-white/10 border-white/20 text-text'
                    : 'border-white/15 text-subtle hover:text-text hover:border-white/30'
                }`}
                aria-label={quest.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {quest.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </button>
            </div>

            <p className="font-sans text-xs text-muted leading-relaxed mt-3">{quest.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Replacement Habit Engine Statement */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-display text-sm font-bold text-text">THE REPLACEMENT PRINCIPLE</h4>
          <p className="font-mono text-xs text-muted mt-1 max-w-xl">
            Behavioral science proves that urges cannot simply be suppressed—they must be displaced. Every completed quest reinforces alternative dopaminergic pathways.
          </p>
        </div>
        <button
          onClick={() => {
            const customTitle = prompt('Enter a healthy replacement activity (e.g., Play Guitar, Draw, 10 min Walk):')
            if (customTitle && customTitle.trim()) {
              const newQ: Quest = {
                id: 'custom-' + Date.now(),
                title: customTitle.trim(),
                description: 'Custom self-chosen recovery habit.',
                category: 'focus',
                durationMinutes: 10,
                xpReward: 40,
                icon: Zap,
                completed: false,
              }
              setQuests((prev) => [newQ, ...prev])
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-text text-bg font-mono text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Plus size={14} />
          <span>CREATE CUSTOM HABIT</span>
        </button>
      </div>
    </div>
  )
}

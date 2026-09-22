'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Trophy, Flag, Target, Lock, Shield,
  Sparkles, ChevronRight, CheckCircle2, Plus, X, MessageSquare
} from 'lucide-react'
import { useUserStore } from '@/lib/store'
import { hasFeature } from '@/lib/entitlements'
import Link from 'next/link'

// ============================================================
// Community Groups
// ============================================================
const GROUPS = [
  { id: 'focus', label: 'Focus & Deep Work', members: '4.2K', desc: 'Building sustained attention and reducing distraction.' },
  { id: 'consistency', label: 'Consistency', members: '6.8K', desc: 'Daily routines and habit maintenance strategies.' },
  { id: 'digital', label: 'Digital Wellbeing', members: '3.9K', desc: 'Healthy relationships with technology and screens.' },
  { id: 'fitness', label: 'Fitness & Movement', members: '5.1K', desc: 'Physical activity as a foundation for mental clarity.' },
  { id: 'study', label: 'Study & Learning', members: '2.7K', desc: 'Academic focus, memory, and learning habits.' },
  { id: 'coding', label: 'Coding & Building', members: '1.8K', desc: 'Deep work in technical and creative projects.' },
  { id: 'morning', label: 'Morning Routine', members: '7.3K', desc: 'Intentional mornings as a foundation for the day.' },
  { id: 'night', label: 'Night Routine', members: '4.6K', desc: 'Evening wind-down, sleep hygiene, and recovery.' },
]

// ============================================================
// Community Challenges
// ============================================================
const CHALLENGES = [
  { id: 'ch1', title: '7-Day Focus Sprint', desc: 'One 25-minute deep focus session per day for 7 days.', duration: '7 days', participants: '1.2K', tag: 'Focus', xp: 200 },
  { id: 'ch2', title: '30-Day Consistency', desc: 'Log your daily check-in for 30 consecutive days.', duration: '30 days', participants: '3.4K', tag: 'Habit', xp: 500 },
  { id: 'ch3', title: 'Morning Routine Launch', desc: 'Complete your morning routine before 9 AM for 14 days.', duration: '14 days', participants: '876', tag: 'Routine', xp: 300 },
  { id: 'ch4', title: 'Move Daily', desc: 'Log any physical activity every day for 21 days.', duration: '21 days', participants: '2.1K', tag: 'Movement', xp: 350 },
  { id: 'ch5', title: 'Deep Work Month', desc: '3+ focus sessions per week for 4 weeks.', duration: '28 days', participants: '654', tag: 'Focus', xp: 450 },
]

// ============================================================
// Anonymous Stories (sample — private by default)
// ============================================================
const STORIES = [
  {
    id: 's1',
    alias: 'quietmind_42',
    timeAgo: '2h ago',
    text: 'Week 3. The urges are shorter now. Not gone — just smaller. I didn\'t think that would happen this fast.',
    reactions: 48,
  },
  {
    id: 's2',
    alias: 'focus_architect',
    timeAgo: '5h ago',
    text: 'Used the breathing reset this morning. First time I didn\'t just give in automatically. Still surprised it worked.',
    reactions: 72,
  },
  {
    id: 's3',
    alias: 'dawn_routine',
    timeAgo: '1d ago',
    text: 'The thing nobody tells you: it\'s not about motivation. It\'s about the first 60 seconds. If I make it past that, I\'m usually fine.',
    reactions: 134,
  },
  {
    id: 's4',
    alias: 'resilient_cycle',
    timeAgo: '2d ago',
    text: 'Had a setback after 11 days. Back to day 1. But I noticed something — it felt different. Less shame, more curiosity. Progress.',
    reactions: 201,
  },
  {
    id: 's5',
    alias: 'stillwater_07',
    timeAgo: '3d ago',
    text: 'Replaced the habit with coding. Been building something for 3 weeks. Still distracted sometimes, but the ratio is shifting.',
    reactions: 89,
  },
]

// ============================================================
// Leaderboard (opt-in anonymous)
// ============================================================
const LEADERBOARD_ENTRIES = [
  { rank: 1, alias: 'focus_prime', xp: 8420, badge: '⭐ MAX' },
  { rank: 2, alias: 'deep_work_92', xp: 7180, badge: '⚡ PRO' },
  { rank: 3, alias: 'quietmind_42', xp: 6340, badge: '⚡ PRO' },
  { rank: 4, alias: 'morning_arc', xp: 5910, badge: '⭐ MAX' },
  { rank: 5, alias: 'resilient_01', xp: 5200, badge: '⚡ PRO' },
  { rank: 6, alias: 'stillwater_07', xp: 4780, badge: '⚡ PRO' },
  { rank: 7, alias: 'dawn_routine', xp: 3960, badge: '⚡ PRO' },
  { rank: 8, alias: 'focus_arc_44', xp: 3200, badge: 'FREE' },
]

// ============================================================
// MAIN PAGE
// ============================================================
type Tab = 'stories' | 'groups' | 'challenges' | 'leaderboard'

export default function CommunityPage() {
  const { plan, leaderboardOptIn, setUser, totalXP } = useUserStore()
  const [activeTab, setActiveTab] = useState<Tab>('stories')
  const [joinedGroups, setJoinedGroups] = useState<string[]>([])
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>([])
  const [reactions, setReactions] = useState<Record<string, boolean>>({})
  const [showStoryModal, setShowStoryModal] = useState(false)

  const hasCommunity = hasFeature('community_accountability', plan)

  const toggleGroup = (id: string) => {
    setJoinedGroups(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  const joinChallenge = (id: string) => {
    setJoinedChallenges(prev => prev.includes(id) ? prev : [...prev, id])
  }

  const toggleReaction = (storyId: string) => {
    setReactions(prev => ({ ...prev, [storyId]: !prev[storyId] }))
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'stories', label: 'Stories', icon: <MessageSquare size={14} /> },
    { id: 'groups', label: 'Groups', icon: <Users size={14} /> },
    { id: 'challenges', label: 'Challenges', icon: <Target size={14} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={14} /> },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6 pb-28 md:pb-12">

      {/* Header */}
      <div className="pb-6 border-b border-white/8">
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#C7FF72] uppercase">Community</span>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white mt-2">UNBOUND COMMUNITY</h1>
        <p className="font-sans text-sm text-muted max-w-xl mt-2 leading-relaxed">
          Anonymous peer support, shared challenges, and opt-in accountability.
          Your private data is never shared. Stories are shared only with your explicit consent.
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 rounded-xl bg-[#0B0B0B] border border-white/8 flex items-start gap-3">
        <Shield size={15} className="text-[#C7FF72] shrink-0 mt-0.5" />
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#C7FF72] mb-1">Privacy First</div>
          <p className="font-sans text-[11px] text-muted leading-relaxed">
            Your journal, urge logs, and private trigger data are never shared — even with your accountability partner.
            Community participation is anonymous by default. You choose your alias and what to share.
          </p>
        </div>
      </div>

      {/* Pro Gate */}
      {!hasCommunity && (
        <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-white/8 flex items-start gap-4">
          <Lock size={18} className="text-subtle shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-display text-sm font-bold text-white mb-1">COMMUNITY REQUIRES PRO</div>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Community groups, accountability challenges, and leaderboard participation require a Pro or Max plan.
              Stories and the privacy notice are visible to all users.
            </p>
            <Link href="/pricing">
              <button className="mt-3 px-4 py-2 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-[#E5E5E5] transition-colors">
                UPGRADE TO PRO
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Tab Nav */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/8">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-mono text-[11px] transition-colors ${activeTab === tab.id
              ? 'bg-white/10 text-white font-bold'
              : 'text-subtle hover:text-text'
              }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB: Stories */}
      <AnimatePresence mode="wait">
        {activeTab === 'stories' && (
          <motion.div key="stories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-white">ANONYMOUS STORIES</h2>
                <p className="font-mono text-[11px] text-subtle mt-0.5">Community members share their real experiences.</p>
              </div>
              {hasCommunity && (
                <button
                  onClick={() => setShowStoryModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-muted hover:text-text font-mono text-[11px] transition-colors"
                >
                  <Plus size={13} /> Share
                </button>
              )}
            </div>

            {STORIES.map(story => (
              <div key={story.id} className="p-5 rounded-2xl bg-[#0B0B0B] border border-white/8 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center font-mono text-[10px] text-subtle">
                      {story.alias[0].toUpperCase()}
                    </div>
                    <span className="font-mono text-[11px] text-muted">{story.alias}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-subtle">{story.timeAgo}</span>
                    <button className="p-1 text-subtle hover:text-muted transition-colors" title="Report">
                      <Flag size={11} />
                    </button>
                  </div>
                </div>
                <p className="font-sans text-sm text-text leading-relaxed">{story.text}</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleReaction(story.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-colors ${reactions[story.id]
                      ? 'bg-[#C7FF72]/10 border-[#C7FF72]/30 text-[#C7FF72]'
                      : 'border-white/10 bg-white/[0.02] text-subtle hover:text-text'
                      }`}
                  >
                    <Sparkles size={11} />
                    {story.reactions + (reactions[story.id] ? 1 : 0)}
                  </button>
                  <span className="font-mono text-[10px] text-subtle">I relate to this</span>
                </div>
              </div>
            ))}

            <p className="font-mono text-[10px] text-subtle/60 text-center">
              Stories are moderated. Any harmful, identifying, or sexually explicit content is removed.
            </p>
          </motion.div>
        )}

        {/* TAB: Groups */}
        {activeTab === 'groups' && (
          <motion.div key="groups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div>
              <h2 className="font-display text-base font-bold text-white">COMMUNITY GROUPS</h2>
              <p className="font-mono text-[11px] text-subtle mt-0.5">Join groups aligned with your goals.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GROUPS.map(group => {
                const joined = joinedGroups.includes(group.id)
                const blocked = !hasCommunity
                return (
                  <div key={group.id} className={`p-4 rounded-2xl border transition-all ${joined ? 'bg-[#C7FF72]/8 border-[#C7FF72]/25' : 'bg-[#0B0B0B] border-white/8'}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="font-display text-sm font-bold text-white">{group.label}</div>
                        <div className="font-mono text-[10px] text-subtle mt-0.5">{group.members} members</div>
                      </div>
                      {joined && <CheckCircle2 size={16} className="text-[#C7FF72] flex-shrink-0 mt-0.5" />}
                    </div>
                    <p className="font-sans text-[11px] text-muted leading-relaxed mb-3">{group.desc}</p>
                    <button
                      onClick={() => !blocked && toggleGroup(group.id)}
                      disabled={blocked}
                      className={`w-full py-1.5 rounded-lg font-mono text-[11px] font-bold transition-colors ${joined
                        ? 'bg-[#C7FF72]/15 text-[#C7FF72] border border-[#C7FF72]/30'
                        : blocked
                          ? 'bg-white/[0.02] text-subtle border border-white/8 cursor-not-allowed opacity-50'
                          : 'bg-white/[0.04] text-text border border-white/10 hover:bg-white/[0.08]'
                        }`}
                    >
                      {joined ? 'JOINED' : blocked ? 'PRO REQUIRED' : 'JOIN GROUP'}
                    </button>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* TAB: Challenges */}
        {activeTab === 'challenges' && (
          <motion.div key="challenges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div>
              <h2 className="font-display text-base font-bold text-white">COMMUNITY CHALLENGES</h2>
              <p className="font-mono text-[11px] text-subtle mt-0.5">Join a challenge and build consistency with others.</p>
            </div>

            <div className="space-y-3">
              {CHALLENGES.map(ch => {
                const joined = joinedChallenges.includes(ch.id)
                const blocked = !hasCommunity
                return (
                  <div key={ch.id} className={`p-5 rounded-2xl border transition-all ${joined ? 'bg-[#C7FF72]/8 border-[#C7FF72]/25' : 'bg-[#0B0B0B] border-white/8'}`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-white/8 text-subtle uppercase font-bold">{ch.tag}</span>
                          <span className="font-mono text-[9px] text-subtle">{ch.duration}</span>
                          <span className="font-mono text-[9px] text-subtle">· {ch.participants} joined</span>
                        </div>
                        <div className="font-display text-sm font-bold text-white">{ch.title}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-numbers text-lg font-bold text-[#C7FF72]">+{ch.xp}</div>
                        <div className="font-mono text-[9px] text-subtle">XP</div>
                      </div>
                    </div>
                    <p className="font-sans text-[11px] text-muted leading-relaxed mb-3">{ch.desc}</p>
                    <button
                      onClick={() => !blocked && joinChallenge(ch.id)}
                      disabled={blocked || joined}
                      className={`w-full py-2 rounded-xl font-mono text-xs font-bold transition-colors ${joined
                        ? 'bg-[#C7FF72]/15 text-[#C7FF72] border border-[#C7FF72]/30'
                        : blocked
                          ? 'bg-white/[0.02] text-subtle border border-white/8 cursor-not-allowed opacity-50'
                          : 'bg-white text-black hover:bg-[#E5E5E5]'
                        }`}
                    >
                      {joined ? 'CHALLENGE JOINED' : blocked ? 'PRO REQUIRED' : 'JOIN CHALLENGE'}
                    </button>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* TAB: Leaderboard */}
        {activeTab === 'leaderboard' && (
          <motion.div key="leaderboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-white">GLOBAL LEADERBOARD</h2>
                <p className="font-mono text-[11px] text-subtle mt-0.5">Opt-in anonymous ranking by XP.</p>
              </div>
              <button
                onClick={() => setUser({ leaderboardOptIn: !leaderboardOptIn })}
                className={`px-3 py-1.5 rounded-xl border font-mono text-[11px] font-bold transition-colors ${leaderboardOptIn
                  ? 'bg-[#C7FF72]/15 text-[#C7FF72] border-[#C7FF72]/30'
                  : 'bg-white/[0.04] text-subtle border-white/10 hover:text-text'
                  }`}
              >
                {leaderboardOptIn ? 'PARTICIPATING' : 'OPT IN'}
              </button>
            </div>

            {!leaderboardOptIn && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/8 font-mono text-[11px] text-subtle">
                You are not currently on the leaderboard. Toggle &quot;Opt In&quot; to participate anonymously using your chosen alias.
              </div>
            )}

            <div className="space-y-2">
              {LEADERBOARD_ENTRIES.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${entry.rank <= 3 ? 'bg-white/[0.03] border-white/10' : 'bg-white/[0.01] border-white/5'}`}
                >
                  <div className={`w-8 font-numbers text-sm font-bold text-center ${entry.rank === 1 ? 'text-amber-300' : entry.rank === 2 ? 'text-white/60' : entry.rank === 3 ? 'text-amber-600' : 'text-subtle'}`}>
                    {entry.rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-sm text-text">{entry.alias}</div>
                    <div className="font-mono text-[10px] text-subtle">{entry.badge}</div>
                  </div>
                  <div className="font-numbers text-base font-bold text-white">{entry.xp.toLocaleString()}</div>
                  <div className="font-mono text-[10px] text-subtle">XP</div>
                </div>
              ))}
            </div>

            {leaderboardOptIn && (
              <div className="p-4 rounded-xl bg-[#0B0B0B] border border-white/8 flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] text-subtle uppercase">Your position</div>
                  <div className="font-display text-sm font-bold text-white mt-0.5">Not yet ranked</div>
                </div>
                <div className="font-numbers text-lg font-bold text-[#C7FF72]">{totalXP.toLocaleString()} XP</div>
              </div>
            )}

            <p className="font-mono text-[10px] text-subtle/60">
              Leaderboard shows XP and plan tier only. No personal data, no private habit data is ever shared.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Story Modal */}
      <AnimatePresence>
        {showStoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#050505]/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0B0B0B] border border-white/10 rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-white">SHARE A STORY</h3>
                <button onClick={() => setShowStoryModal(false)} className="p-1.5 rounded-lg border border-white/10 text-muted hover:text-text transition-colors">
                  <X size={14} />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#C7FF72]/8 border border-[#C7FF72]/20 font-mono text-[11px] text-[#C7FF72]">
                Anonymous. Your name is never shown — only your chosen alias.
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase text-subtle">Your alias (anonymous)</label>
                <input
                  type="text"
                  placeholder="e.g. focus_builder_42"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-sm placeholder:text-subtle/50 focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase text-subtle">Your story (max 280 characters)</label>
                <textarea
                  placeholder="Share a moment, insight, or win — anything that might help someone else."
                  maxLength={280}
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-sans text-sm placeholder:text-subtle/50 focus:outline-none focus:border-white/20 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/8 font-mono text-[11px] text-subtle">
                Do not include identifying information, explicit content, or harm-inducing content.
                Stories are reviewed before appearing publicly.
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowStoryModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-muted hover:text-text font-mono text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowStoryModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-[#E5E5E5] transition-colors"
                >
                  Submit for Review
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

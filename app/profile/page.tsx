'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Award, Shield, Sparkles, CheckCircle,
  Clock, Lock, Globe, Eye, EyeOff, Compass, Zap, Activity, Moon, Target,
  Footprints, ChevronRight, Plus, X, Upload, Check, Settings, Edit3,
  LogOut, Trash2, Key, AlertTriangle, RefreshCw, ArrowRight, CreditCard,
  FileText, Download, CheckCircle2, Star, ShieldCheck
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useUserStore } from '@/lib/store'
import { LEVELS, getXPProgress } from '@/lib/core'
import { PLAN_PRICING, hasFeature } from '@/lib/entitlements'

interface BadgeDef {
  id: string
  name: string
  desc: string
  icon: any
  category: string
}

const ALL_BADGES: BadgeDef[] = [
  { id: 'b1', name: 'First Step', desc: 'Completed onboarding pattern audit', icon: Compass, category: 'Awareness' },
  { id: 'b2', name: 'Moment Interrupted', desc: 'Successfully deflected first active urge', icon: Zap, category: 'Resilience' },
  { id: 'b3', name: '3-Day Momentum', desc: 'Maintained 3 consecutive days of conscious control', icon: Activity, category: 'Consistency' },
  { id: 'b4', name: 'One Week Clean', desc: 'Logged 7 days of pattern awareness', icon: Shield, category: 'Consistency' },
  { id: 'b5', name: 'Night Guardian', desc: 'Protected temporal window with Night Shield', icon: Moon, category: 'Habits' },
  { id: 'b6', name: 'Dopamine Master', desc: 'Completed 10 healthy replacement quests', icon: Target, category: 'Quests' },
  { id: 'b7', name: 'Physical Reset', desc: 'Completed first 2+ km run / walk workout', icon: Footprints, category: 'Activity' },
  { id: 'b8', name: 'Ascended Mind', desc: 'Reached Level 10 Ascend mastery', icon: Sparkles, category: 'Mastery' },
]

export default function ProfilePage() {
  const router = useRouter()
  const {
    displayName,
    email,
    avatarUrl,
    memberSince,
    plan,
    totalXP,
    currentLevel,
    currentStreak,
    longestStreak,
    goals,
    replacementHabits,
    leaderboardOptIn,
    completedQuestIds,
    unlockedBadgeIds,
    activities,
    urgeLogs,
    setUser,
    setSeedState,
    setPlan,
    reset,
  } = useUserStore()

  // State for modals and inputs
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [invoiceToast, setInvoiceToast] = useState<string | null>(null)

  // Profile Edit fields
  const [editName, setEditName] = useState(displayName || '')
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(avatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Goal & Habit inputs
  const [newGoalInput, setNewGoalInput] = useState('')
  const [newHabitInput, setNewHabitInput] = useState('')
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showAddHabit, setShowAddHabit] = useState(false)

  const name = displayName || 'Seeker'
  const userInitials = name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'UN'

  const xpProgress = getXPProgress(totalXP)
  const totalKm = activities.reduce((acc, a) => acc + a.distanceKm, 0)
  const totalSteps = activities.reduce((acc, a) => acc + a.steps, 0)
  const totalMinutes = activities.reduce((acc, a) => acc + a.durationMinutes, 0)
  const tierInfo = PLAN_PRICING[plan] || PLAN_PRICING.free

  const triggerInvoiceDownload = (id: string) => {
    setInvoiceToast(`Receipt ${id}.pdf downloaded successfully`)
    setTimeout(() => setInvoiceToast(null), 3000)
  }

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).')
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      alert('Image size exceeds 4MB. Please select a smaller photo.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setEditAvatarPreview(event.target.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanName = editName.trim() || 'Seeker'
    setUser({
      displayName: cleanName,
      avatarUrl: editAvatarPreview,
    })
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: cleanName, avatarUrl: editAvatarPreview }),
      })
    } catch {}
    setShowEditProfile(false)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long.')
      return
    }
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to update password.')
        return
      }
      setPasswordSuccess(true)
      setTimeout(() => {
        setPasswordSuccess(false)
        setShowChangePassword(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }, 1500)
    } catch {
      alert('Network error updating password.')
    }
  }

  const handleLogout = async () => {
    setShowLogoutConfirm(false)
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
    } catch {}
    reset()
    router.push('/auth/login')
    router.refresh()
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') return
    try {
      await fetch('/api/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      })
    } catch {}
    reset()
    try {
      localStorage.clear()
    } catch {}
    router.push('/auth/login')
    router.refresh()
  }

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGoalInput.trim()) return
    setUser({ goals: [...goals, newGoalInput.trim()] })
    setNewGoalInput('')
    setShowAddGoal(false)
  }

  const handleRemoveGoal = (index: number) => {
    setUser({ goals: goals.filter((_, i) => i !== index) })
  }

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitInput.trim()) return
    setUser({ replacementHabits: [...replacementHabits, newHabitInput.trim()] })
    setNewHabitInput('')
    setShowAddHabit(false)
  }

  const handleRemoveHabit = (index: number) => {
    setUser({ replacementHabits: replacementHabits.filter((_, i) => i !== index) })
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-10">
      {/* Toast Notification */}
      <AnimatePresence>
        {invoiceToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-card border border-[#C7FF72]/40 text-white font-mono text-xs shadow-2xl flex items-center gap-2"
          >
            <Download size={14} className="text-[#C7FF72]" />
            <span>{invoiceToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 1. PERSONAL IDENTITY HEADER (Compact, Personal, No Giant Billing Card) */}
      {/* ============================================================ */}
      <div className="p-6 md:p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-white/10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 shadow-card relative overflow-hidden">
        {/* Subtle accent corner glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C7FF72]/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left z-10 w-full sm:w-auto">
          {/* Avatar display with photo or initials + hover edit badge */}
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.08] border border-white/20 flex items-center justify-center font-display text-2xl font-bold text-white tracking-wide shadow-glow-soft overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{userInitials}</span>
              )}
            </div>
            <button
              onClick={() => {
                setEditName(displayName || '')
                setEditAvatarPreview(avatarUrl)
                setShowEditProfile(true)
              }}
              className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-full bg-[#C7FF72] text-[#050505] hover:bg-[#D5FFA0] shadow-md transition-all cursor-pointer"
              title="Edit Profile & Photo"
              aria-label="Edit Profile & Photo"
            >
              <Edit3 size={13} />
            </button>
          </div>

          {/* User Details with Compact Pill Badge */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white">{name}</h1>

              {/* Compact Plan Pill Badge strictly formatted per V4 specification */}
              {plan === 'max' ? (
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 uppercase font-bold inline-flex items-center gap-1 shadow-sm">
                  ⭐ MAX
                </span>
              ) : plan === 'pro' ? (
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#C7FF72]/15 text-[#C7FF72] border border-[#C7FF72]/30 uppercase font-bold inline-flex items-center gap-1 shadow-sm">
                  ⚡ PRO
                </span>
              ) : (
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-subtle border border-white/15 uppercase font-bold">
                  FREE
                </span>
              )}
            </div>

            <p className="font-mono text-xs text-muted">
              {email || 'user@unbound.app'} · Member since {memberSince || 'September 2026'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1.5">
              <button
                onClick={() => {
                  setEditName(displayName || '')
                  setEditAvatarPreview(avatarUrl)
                  setShowEditProfile(true)
                }}
                className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 size={12} />
                <span>Edit Profile</span>
              </button>
              <span className="font-mono text-xs text-subtle hidden md:inline">
                &quot;Your past does not define you. Your next action matters.&quot;
              </span>
            </div>
          </div>
        </div>

        {/* Quick Identity Status Pill (Compact, NOT a billing box) */}
        <div className="flex sm:flex-col items-center sm:items-end justify-center gap-1 text-center sm:text-right z-10 font-mono text-xs text-subtle">
          <span className="text-[10px] uppercase tracking-wider text-muted">ACCOUNT STATUS</span>
          <span className="text-white font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C7FF72]" /> Verified Member
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. PROGRESSION & STREAKS (Level, XP, Current Streak, Longest) */}
      {/* ============================================================ */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-center">
          <div className="p-5 rounded-2xl bg-card border border-white/10 space-y-1">
            <span className="text-[10px] text-subtle uppercase">CURRENT LEVEL</span>
            <div className="font-display text-lg font-bold text-white">
              LVL {String(xpProgress.level.level).padStart(2, '0')} {xpProgress.level.name.toUpperCase()}
            </div>
            <p className="text-[10px] text-muted">{xpProgress.xpIntoLevel} / {xpProgress.xpNeededForNext || 100} XP</p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-white/10 space-y-1">
            <span className="text-[10px] text-subtle uppercase">RECOVERY XP</span>
            <div className="font-numbers text-2xl font-bold text-[#C7FF72]">
              {totalXP.toLocaleString()}
            </div>
            <p className="text-[10px] text-muted">Lifetime consistency points</p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-white/10 space-y-1">
            <span className="text-[10px] text-subtle uppercase">CURRENT STREAK</span>
            <div className="font-numbers text-2xl font-bold text-white">
              {currentStreak} DAYS
            </div>
            <p className="text-[10px] text-muted">Conscious clean momentum</p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-white/10 space-y-1">
            <span className="text-[10px] text-subtle uppercase">LONGEST STREAK</span>
            <div className="font-numbers text-2xl font-bold text-white">
              {longestStreak || currentStreak} DAYS
            </div>
            <p className="text-[10px] text-muted">Personal record</p>
          </div>
        </div>

        {/* Progression Roadmap Strip */}
        <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-white">PROGRESSION ROADMAP</h2>
              <p className="font-mono text-xs text-muted">
                10-phase milestone path tracking conscious autonomy and self-mastery.
              </p>
            </div>
            <span className="font-mono text-xs text-[#C7FF72] font-bold">
              {xpProgress.xpIntoLevel} / {xpProgress.xpNeededForNext || 100} XP
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-[#C7FF72] rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(199,255,114,0.4)]"
              style={{ width: `${xpProgress.progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 pt-2">
            {LEVELS.map((lvl) => {
              const isCurrent = xpProgress.level.level === lvl.level
              const isUnlocked = totalXP >= lvl.minXP
              return (
                <div
                  key={lvl.level}
                  className={`p-2.5 rounded-xl border text-center font-mono transition-all ${
                    isCurrent
                      ? 'bg-[#C7FF72] text-[#050505] font-bold border-[#C7FF72] shadow-[0_0_15px_rgba(199,255,114,0.25)]'
                      : isUnlocked
                      ? 'bg-white/[0.04] border-white/15 text-white'
                      : 'bg-transparent border-white/5 text-subtle opacity-40'
                  }`}
                >
                  <div className="text-[9px] uppercase tracking-wider">
                    {String(lvl.level).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-bold truncate mt-0.5">
                    {lvl.name}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. PERSONAL BESTS & TOTALS */}
      {/* ============================================================ */}
      <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
        <h2 className="font-display text-base font-bold text-white">PERSONAL BESTS &amp; TOTALS</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-subtle uppercase">QUESTS COMPLETED</span>
            <div className="font-numbers text-xl font-bold text-white mt-1">
              {completedQuestIds.length}
            </div>
            <p className="text-[10px] text-muted mt-0.5">Habit interventions</p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-subtle uppercase">URGES DEFLECTED</span>
            <div className="font-numbers text-xl font-bold text-white mt-1">
              {urgeLogs.length}
            </div>
            <p className="text-[10px] text-muted mt-0.5">5-min resets completed</p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-subtle uppercase">PHYSICAL MOVEMENT</span>
            <div className="font-numbers text-xl font-bold text-white mt-1">
              {totalKm.toFixed(2)} KM
            </div>
            <p className="text-[10px] text-muted mt-0.5">{totalSteps.toLocaleString()} total steps</p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-subtle uppercase">ACTIVITY SESSIONS</span>
            <div className="font-numbers text-xl font-bold text-white mt-1">
              {activities.length}
            </div>
            <p className="text-[10px] text-muted mt-0.5">{totalMinutes} active minutes</p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. DYNAMIC ACHIEVEMENTS / BADGES */}
      {/* ============================================================ */}
      <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-white">ACHIEVEMENTS &amp; BADGES</h3>
            <p className="font-mono text-xs text-muted">
              {unlockedBadgeIds.length} of {ALL_BADGES.length} unlocked. Each unlock awards +50 Recovery XP.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {ALL_BADGES.map((b) => {
            const isUnlocked = unlockedBadgeIds.includes(b.id)
            const Icon = b.icon
            return (
              <div
                key={b.id}
                className={`p-4 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-white/[0.04] border-white/20 text-white shadow-sm'
                    : 'bg-white/[0.01] border-white/5 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-[#C7FF72] text-[#050505]' : 'bg-white/5 text-subtle'}`}>
                    <Icon size={16} />
                  </div>
                  <span className={`font-mono text-[9px] uppercase tracking-wider ${isUnlocked ? 'text-[#C7FF72] font-bold' : 'text-subtle'}`}>
                    {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>
                <h4 className="font-display text-xs font-bold text-white">{b.name}</h4>
                <p className="font-sans text-[11px] text-muted mt-1 leading-snug">{b.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. GOALS & REPLACEMENT HABITS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Goals */}
        <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-white">YOUR CORE GOALS</h3>
            <button
              onClick={() => setShowAddGoal(!showAddGoal)}
              className="text-subtle hover:text-white font-mono text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus size={12} />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {goals.map((goal, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between group"
              >
                <span className="text-white">{goal}</span>
                <button
                  onClick={() => handleRemoveGoal(idx)}
                  className="opacity-0 group-hover:opacity-100 text-subtle hover:text-white transition-opacity cursor-pointer"
                  aria-label="Remove goal"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {showAddGoal && (
            <form onSubmit={handleAddGoal} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newGoalInput}
                onChange={(e) => setNewGoalInput(e.target.value)}
                placeholder="New goal..."
                className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-white/30"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer"
              >
                Save
              </button>
            </form>
          )}
        </div>

        {/* Replacement Habits */}
        <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-white">DOPAMINE REPLACEMENTS</h3>
            <button
              onClick={() => setShowAddHabit(!showAddHabit)}
              className="text-subtle hover:text-white font-mono text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus size={12} />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {replacementHabits.map((habit, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between group"
              >
                <span className="text-white">{habit}</span>
                <button
                  onClick={() => handleRemoveHabit(idx)}
                  className="opacity-0 group-hover:opacity-100 text-subtle hover:text-white transition-opacity cursor-pointer"
                  aria-label="Remove habit"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {showAddHabit && (
            <form onSubmit={handleAddHabit} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newHabitInput}
                onChange={(e) => setNewHabitInput(e.target.value)}
                placeholder="New replacement habit..."
                className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-white/30"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer"
              >
                Save
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. PHYSICAL ACTIVITY SUMMARY */}
      {/* ============================================================ */}
      <div className="p-6 rounded-2xl bg-card border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Footprints size={18} className="text-[#C7FF72]" />
            <h3 className="font-display text-sm font-bold text-white">CARDIOVASCULAR &amp; STEP TRACKING</h3>
          </div>
          <p className="font-sans text-xs text-muted">
            {totalKm.toFixed(2)} km logged across {activities.length} sessions. Cardiovascular resets naturally upregulate dopamine sensitivity.
          </p>
        </div>

        <Link
          href="/activity"
          className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/15 hover:border-white/30 text-white font-mono text-xs font-bold transition-colors inline-flex items-center gap-2 shrink-0"
        >
          <span>VIEW ACTIVITY LOG</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* ============================================================ */}
      {/* 7. DEDICATED PLAN & BILLING SECTION (Placed lower down) */}
      {/* ============================================================ */}
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-white/10 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <span className="font-mono text-[10px] text-subtle uppercase tracking-wider">
              MEMBERSHIP &amp; BILLING
            </span>
            <h2 className="font-display text-lg md:text-xl font-bold text-white">
              SUBSCRIPTION &amp; PLAN STATUS
            </h2>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            {plan === 'free' ? (
              <span className="px-3 py-1 rounded-full bg-white/10 text-subtle border border-white/10 font-bold">
                FREE ACCOUNT
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-[#C7FF72]/15 text-[#C7FF72] border border-[#C7FF72]/30 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C7FF72] animate-pulse" />
                ACTIVE · RENEWS OCT 22, 2026
              </span>
            )}
          </div>
        </div>

        {/* Current Plan Overview Card */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold text-white">
                {tierInfo.name} Tier
              </span>
              <span className="font-mono text-xs text-[#C7FF72] font-bold">
                {tierInfo.priceMonthly === 0 ? '₹0 / Free' : `₹${tierInfo.priceMonthly.toLocaleString('en-IN')} / month`}
              </span>
            </div>
            <p className="font-sans text-xs text-muted max-w-xl">
              {plan === 'free'
                ? 'Essential conscious tracking, 5-minute resets, and 7-day progress logs. Upgrade to unlock AI Coach, Night Shield, and full analytics.'
                : plan === 'pro'
                ? 'Full access to AI Coach, Night Shield, 8-week biometric trajectories, and comprehensive habit analysis.'
                : 'Maximum VIP tier: all Pro features plus dedicated priority WhatsApp line, 1-on-1 monthly strategy, and custom protocols.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/pricing"
              className="px-5 py-2.5 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-[#E5E5E5] transition-colors shadow-sm flex items-center gap-1.5"
            >
              <CreditCard size={14} />
              <span>{plan === 'free' ? 'UPGRADE PLAN' : 'CHANGE PLAN'}</span>
            </Link>
          </div>
        </div>

        {/* Invoices & Billing Receipts (Simulated real records) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              BILLING HISTORY &amp; RECEIPTS
            </h4>
            <span className="font-mono text-[10px] text-subtle">GST / Tax compliant receipts</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {plan === 'free' ? (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-subtle text-center">
                No billing history for free accounts. Upgraded plans will show monthly invoices and downloadable tax receipts here.
              </div>
            ) : (
              <>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-subtle" />
                    <div>
                      <div className="text-white font-bold">INV-2026-0901 · {tierInfo.name} Tier</div>
                      <div className="text-[10px] text-subtle">Sep 01, 2026 · ₹{tierInfo.priceMonthly.toLocaleString('en-IN')} · Paid (Razorpay)</div>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerInvoiceDownload('INV-2026-0901')}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                    title="Download Receipt"
                  >
                    <Download size={14} />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-subtle" />
                    <div>
                      <div className="text-white font-bold">INV-2026-0801 · {tierInfo.name} Tier</div>
                      <div className="text-[10px] text-subtle">Aug 01, 2026 · ₹{tierInfo.priceMonthly.toLocaleString('en-IN')} · Paid (Razorpay)</div>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerInvoiceDownload('INV-2026-0801')}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                    title="Download Receipt"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 8. PRIVACY SETTINGS & LEADERBOARD OPT-IN */}
      {/* ============================================================ */}
      <div className="p-6 rounded-2xl bg-card border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-white" />
            <h3 className="font-display text-sm font-bold text-white">ANONYMOUS GLOBAL LEADERBOARD</h3>
          </div>
          <p className="font-sans text-xs text-muted">
            Display your anonymous Recovery XP on the public community leaderboard. Zero sensitive logs are ever shared.
          </p>
        </div>

        <button
          onClick={() => setUser({ leaderboardOptIn: !leaderboardOptIn })}
          className={`px-4 py-2 rounded-xl font-mono text-xs transition-colors shrink-0 cursor-pointer ${
            leaderboardOptIn
              ? 'bg-[#C7FF72] text-[#050505] font-bold shadow-[0_0_15px_rgba(199,255,114,0.18)]'
              : 'bg-white/[0.04] border border-white/15 text-muted hover:text-white'
          }`}
        >
          {leaderboardOptIn ? 'PARTICIPATING (OPT-IN)' : 'PRIVATE (HIDDEN)'}
        </button>
      </div>

      {/* ============================================================ */}
      {/* 9. OFFICIAL UNBOUND SUPPORT RESOURCES */}
      {/* ============================================================ */}
      <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
        <div>
          <span className="font-mono text-[10px] text-subtle uppercase tracking-widest">OFFICIAL SUPPORT</span>
          <h3 className="font-display text-base font-bold text-white mt-0.5">NEED ASSISTANCE OR FEEDBACK?</h3>
          <p className="font-mono text-xs text-muted">
            Connect directly with the UNBOUND human support team across verified official channels.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <a
            href="mailto:genyoa.digital@gmail.com"
            className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group"
          >
            <div>
              <div className="font-mono text-xs font-bold text-white">Email Support</div>
              <div className="font-mono text-[11px] text-muted">genyoa.digital@gmail.com</div>
            </div>
            <ArrowRight size={14} className="text-subtle group-hover:text-white transition-colors" />
          </a>

          <a
            href="https://www.instagram.com/genyoa.digital/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group"
          >
            <div>
              <div className="font-mono text-xs font-bold text-white">Instagram</div>
              <div className="font-mono text-[11px] text-muted">@genyoa.digital</div>
            </div>
            <ArrowRight size={14} className="text-subtle group-hover:text-white transition-colors" />
          </a>

          {process.env.NEXT_PUBLIC_X_URL ? (
            <a
              href={process.env.NEXT_PUBLIC_X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-mono text-xs font-bold text-white">Official X</div>
                <div className="font-mono text-[11px] text-muted">Follow updates</div>
              </div>
              <ArrowRight size={14} className="text-subtle group-hover:text-white transition-colors" />
            </a>
          ) : (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-mono text-xs font-bold text-white">Human Concierge</div>
                <div className="font-mono text-[11px] text-muted">9am – 9pm IST active</div>
              </div>
              <ShieldCheck size={16} className="text-[#C7FF72]" />
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 10. ACCOUNT & SECURITY CONTROLS */}
      {/* ============================================================ */}
      <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
        <h3 className="font-display text-base font-bold text-white">ACCOUNT SECURITY &amp; ACTIONS</h3>
        <p className="font-mono text-xs text-muted">
          Manage credentials, active authentication sessions, or permanently delete your account data.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => setShowChangePassword(true)}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 text-left transition-colors flex items-center gap-3 group cursor-pointer"
          >
            <div className="p-2.5 rounded-lg bg-white/5 text-white group-hover:bg-white/10 transition-colors">
              <Key size={18} />
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-white">Change Password</div>
              <div className="font-mono text-[10px] text-muted">Update login credentials</div>
            </div>
          </button>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 text-left transition-colors flex items-center gap-3 group cursor-pointer"
          >
            <div className="p-2.5 rounded-lg bg-white/5 text-white group-hover:bg-white/10 transition-colors">
              <LogOut size={18} />
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-white">Log Out</div>
              <div className="font-mono text-[10px] text-muted">End current session</div>
            </div>
          </button>

          <button
            onClick={() => setShowDeleteAccount(true)}
            className="p-4 rounded-xl bg-red-950/15 border border-red-500/25 hover:border-red-500/40 text-left transition-colors flex items-center gap-3 group cursor-pointer"
          >
            <div className="p-2.5 rounded-lg bg-red-900/30 text-red-400 group-hover:bg-red-900/40 transition-colors">
              <Trash2 size={18} />
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-red-300">Delete Account</div>
              <div className="font-mono text-[10px] text-red-400/80">Permanent removal</div>
            </div>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 11. TESTING SIMULATOR BAR */}
      {/* ============================================================ */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] text-subtle">
        <span>QA / Profile State Simulator:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSeedState('new')}
            className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
              totalXP === 0 ? 'bg-white text-black font-bold border-white' : 'hover:text-white border-white/10'
            }`}
          >
            Switch to New User (0 XP)
          </button>
          <button
            onClick={() => setSeedState('active')}
            className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
              totalXP > 0 ? 'bg-white text-black font-bold border-white' : 'hover:text-white border-white/10'
            }`}
          >
            Switch to Active User (17D, 2840 XP)
          </button>
          <span className="text-white/20">|</span>
          <button
            onClick={() => setPlan('free')}
            className={`px-2 py-1 rounded border transition-colors cursor-pointer ${
              plan === 'free' ? 'bg-[#C7FF72] text-[#050505] font-bold border-[#C7FF72]' : 'hover:text-white border-white/10'
            }`}
          >
            Free
          </button>
          <button
            onClick={() => setPlan('pro')}
            className={`px-2 py-1 rounded border transition-colors cursor-pointer ${
              plan === 'pro' ? 'bg-[#C7FF72] text-[#050505] font-bold border-[#C7FF72]' : 'hover:text-white border-white/10'
            }`}
          >
            Pro
          </button>
          <button
            onClick={() => setPlan('max')}
            className={`px-2 py-1 rounded border transition-colors cursor-pointer ${
              plan === 'max' ? 'bg-[#C7FF72] text-[#050505] font-bold border-[#C7FF72]' : 'hover:text-white border-white/10'
            }`}
          >
            Max
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: EDIT PROFILE & PHOTO UPLOAD */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showEditProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-card border border-white/20 space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-white">EDIT PROFILE</h3>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="p-1 rounded-lg text-subtle hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Photo Upload & Preview Section */}
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="relative w-24 h-24 rounded-2xl bg-white/[0.08] border border-white/20 flex items-center justify-center overflow-hidden">
                  {editAvatarPreview ? (
                    <img
                      src={editAvatarPreview}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-display text-3xl font-bold text-white">
                      {userInitials}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload size={12} />
                    <span>Upload Photo</span>
                  </button>
                  {editAvatarPreview && (
                    <button
                      type="button"
                      onClick={() => setEditAvatarPreview(null)}
                      className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-950/20 text-red-300 font-mono text-xs hover:bg-red-950/40 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-subtle uppercase">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white font-sans text-sm focus:outline-none focus:border-[#C7FF72]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditProfile(false)}
                    className="px-4 py-2 rounded-xl text-subtle hover:text-white font-mono text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#C7FF72] text-[#050505] font-mono text-xs font-bold hover:bg-[#D5FFA0] transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODAL 2: CHANGE PASSWORD */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showChangePassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-card border border-white/20 space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-white">CHANGE PASSWORD</h3>
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="p-1 rounded-lg text-subtle hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {passwordSuccess ? (
                <div className="p-4 rounded-xl bg-[#C7FF72]/10 border border-[#C7FF72]/30 flex items-center gap-3 text-[#C7FF72]">
                  <Check size={18} />
                  <span className="font-mono text-xs">Password updated successfully.</span>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="font-mono text-xs text-subtle uppercase">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-xs text-subtle uppercase">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Min 8 characters"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-xs text-subtle uppercase">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(false)}
                      className="px-4 py-2 rounded-xl text-subtle hover:text-white font-mono text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODAL 3: LOGOUT CONFIRMATION */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm p-6 rounded-3xl bg-card border border-white/20 space-y-5 shadow-2xl relative text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-white">
                <LogOut size={22} />
              </div>

              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-white">LOG OUT OF UNBOUND?</h3>
                <p className="font-sans text-xs text-muted">
                  Are you sure you want to end your current session? You will need to sign in again to access your dashboard.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 rounded-xl text-subtle hover:text-white font-mono text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODAL 4: DELETE ACCOUNT CONFIRMATION */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showDeleteAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-card border border-red-500/30 space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-950/40 text-red-400 border border-red-500/30">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-red-200">DELETE ACCOUNT</h3>
                  <p className="font-mono text-[11px] text-red-400">Irreversible action</p>
                </div>
              </div>

              <p className="font-sans text-xs text-muted leading-relaxed">
                This will permanently delete your UNBOUND account, reset your streak to 0, clear your Recovery XP, and purge all offline and synced telemetry. This action cannot be undone.
              </p>

              <div className="space-y-1.5">
                <label className="font-mono text-[11px] text-subtle">
                  Type <span className="font-bold text-white">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-2.5 rounded-xl bg-red-950/20 border border-red-500/30 text-red-200 font-mono text-sm focus:outline-none focus:border-red-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteAccount(false)}
                  className="px-4 py-2 rounded-xl text-subtle hover:text-white font-mono text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmationText.trim().toUpperCase() !== 'DELETE'}
                  className="px-5 py-2 rounded-xl bg-red-600 disabled:opacity-40 disabled:hover:bg-red-600 text-white font-mono text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

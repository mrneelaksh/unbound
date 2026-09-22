import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PatternScores } from '@/lib/core'
import { getLevelFromXP } from '@/lib/core'
import type { PlanType } from '@/lib/entitlements'

// ============================================================
// ONBOARDING STORE
// ============================================================
export interface OnboardingAnswers {
  q1_age_range?: string
  q2_first_exposure?: string
  q3_frequency?: string
  q4_control_score?: number
  q5_attempts?: string
  q6_feelings?: string[]
  q7_triggers?: string[]
  q8_high_risk_time?: string
  q9_life_impact?: string[]
  q10_urge_resistance?: number
  q11_motivations?: string[]
  q12_replacement_habits?: string[]
  q13_previous_strategies?: string[]
  q14_support_preference?: string
  q15_personal_goal?: string
}

interface OnboardingStore {
  step: number
  answers: OnboardingAnswers
  isCompleted: boolean
  setStep: (step: number) => void
  setAnswer: <K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => void
  complete: () => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      step: 0,
      answers: {},
      isCompleted: false,
      setStep: (step) => set({ step }),
      setAnswer: (key, value) =>
        set((state) => ({ answers: { ...state.answers, [key]: value } })),
      complete: () => set({ isCompleted: true }),
      reset: () => set({ step: 0, answers: {}, isCompleted: false }),
    }),
    {
      name: 'unbound-onboarding',
    }
  )
)

// ============================================================
// ACTIVITY & URGE MODELS
// ============================================================
export interface ActivityRecord {
  id: string
  type: 'walk' | 'run' | 'focus'
  date: string // YYYY-MM-DD
  durationMinutes: number
  distanceKm: number
  steps: number
  pace?: string
  calories?: number
  xpEarned: number
  timestamp: number
}

export interface UrgeRecord {
  id: string
  timestamp: number
  intensity: number
  trigger: string
  interventionType: string
  outcome: string
  replacementHabit: string
  xpEarned: number
}

export interface SetbackRecord {
  id: string
  timestamp: number
  note: string // private reflection note
  trigger: string
  whatHelped: string
}

// ============================================================
// USER STORE (REAL, DYNAMIC STATE)
// ============================================================
interface UserStore {
  userId: string | null
  displayName: string | null
  email: string | null
  avatarUrl: string | null
  memberSince: string
  plan: PlanType
  trialEndsAt: string | null
  totalXP: number
  currentLevel: number
  currentStreak: number
  longestStreak: number
  patternScores: PatternScores | null
  goals: string[]
  replacementHabits: string[]
  leaderboardOptIn: boolean
  completedQuestIds: string[]
  unlockedBadgeIds: string[]
  activities: ActivityRecord[]
  urgeLogs: UrgeRecord[]
  setbacks: SetbackRecord[]
  completedLessonIds: string[]

  // Actions
  setUser: (data: Partial<UserStore>) => void
  addXP: (amount: number, reason?: string) => { newXP: number; newLevel: number; didLevelUp: boolean }
  logUrge: (record: Omit<UrgeRecord, 'id' | 'timestamp'>) => void
  logActivity: (record: Omit<ActivityRecord, 'id' | 'timestamp'>) => void
  logSetback: (record: Omit<SetbackRecord, 'id' | 'timestamp'>) => void
  completeLesson: (lessonId: string, xpReward: number) => void
  completeQuest: (questId: string, xpReward: number) => void
  setPlan: (plan: PlanType) => void
  setSeedState: (type: 'new' | 'active') => void
  reset: () => void
}

const NEW_USER_DEFAULTS = {
  userId: null,
  displayName: null,
  email: null,
  avatarUrl: null,
  memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  plan: 'free' as PlanType,
  trialEndsAt: null,
  totalXP: 0,
  currentLevel: 1,
  currentStreak: 0,
  longestStreak: 0,
  patternScores: null,
  goals: ['Restore dopamine sensitivity', 'Build high-focus replacement routines', 'Safeguard sleep schedule'],
  replacementHabits: ['Chess', 'Reading', 'Running'],
  leaderboardOptIn: false,
  completedQuestIds: [],
  unlockedBadgeIds: [],
  activities: [],
  urgeLogs: [],
  setbacks: [],
  completedLessonIds: [],
}

const ACTIVE_DEMO_ACTIVITIES: ActivityRecord[] = [
  {
    id: 'act-1',
    type: 'run',
    date: new Date().toISOString().split('T')[0],
    durationMinutes: 24,
    distanceKm: 2.84,
    steps: 3842,
    pace: '8:32 / km',
    calories: 195,
    xpEarned: 80,
    timestamp: Date.now() - 3600000 * 4,
  },
  {
    id: 'act-2',
    type: 'walk',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    durationMinutes: 30,
    distanceKm: 2.2,
    steps: 3100,
    pace: '13:38 / km',
    calories: 130,
    xpEarned: 20,
    timestamp: Date.now() - 86400000,
  },
  {
    id: 'act-3',
    type: 'run',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    durationMinutes: 35,
    distanceKm: 4.1,
    steps: 5400,
    pace: '8:32 / km',
    calories: 280,
    xpEarned: 80,
    timestamp: Date.now() - 86400000 * 3,
  },
]

const ACTIVE_DEMO_URGES: UrgeRecord[] = [
  {
    id: 'urg-1',
    timestamp: Date.now() - 86400000 * 1,
    intensity: 6,
    trigger: 'Late night',
    interventionType: '4-2-6 Breathing',
    outcome: 'deflected',
    replacementHabit: 'Chess',
    xpEarned: 50,
  },
  {
    id: 'urg-2',
    timestamp: Date.now() - 86400000 * 2,
    intensity: 7,
    trigger: 'Boredom',
    interventionType: '60s Movement',
    outcome: 'deflected',
    replacementHabit: 'Reading',
    xpEarned: 50,
  },
  {
    id: 'urg-3',
    timestamp: Date.now() - 86400000 * 4,
    intensity: 5,
    trigger: 'Stress',
    interventionType: '4-2-6 Breathing',
    outcome: 'deflected',
    replacementHabit: 'Coding',
    xpEarned: 50,
  },
  {
    id: 'urg-4',
    timestamp: Date.now() - 86400000 * 6,
    intensity: 8,
    trigger: 'Late night',
    interventionType: 'Phone-Away',
    outcome: 'deflected',
    replacementHabit: 'Running',
    xpEarned: 50,
  },
]

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...NEW_USER_DEFAULTS,

      setUser: (data) => set((state) => ({ ...state, ...data })),

      addXP: (amount, reason) => {
        const currentXP = get().totalXP
        const prevLevel = get().currentLevel
        const newXP = currentXP + amount
        const levelObj = getLevelFromXP(newXP)
        const newLevel = levelObj.level
        const didLevelUp = newLevel > prevLevel

        set({
          totalXP: newXP,
          currentLevel: newLevel,
        })

        // Check for first step badge
        if (!get().unlockedBadgeIds.includes('b1')) {
          set((state) => ({ unlockedBadgeIds: [...state.unlockedBadgeIds, 'b1'] }))
        }

        return { newXP, newLevel, didLevelUp }
      },

      logUrge: (record) => {
        const id = `urge-${Date.now()}`
        const timestamp = Date.now()
        const newLog: UrgeRecord = { ...record, id, timestamp }
        const currentLogs = get().urgeLogs
        const currentStreak = get().currentStreak

        // Add XP for intervention
        get().addXP(record.xpEarned || 50, 'urge_deflected')

        // Update badge unlocks
        const badges = [...get().unlockedBadgeIds]
        if (!badges.includes('b2')) badges.push('b2') // Moment Interrupted

        set({
          urgeLogs: [newLog, ...currentLogs],
          currentStreak: currentStreak === 0 ? 1 : currentStreak,
          longestStreak: Math.max(get().longestStreak, currentStreak === 0 ? 1 : currentStreak),
          unlockedBadgeIds: badges,
        })
      },

      logActivity: (record) => {
        const id = `act-${Date.now()}`
        const timestamp = Date.now()
        const newActivity: ActivityRecord = { ...record, id, timestamp }
        const currentActivities = get().activities

        // Award activity XP
        get().addXP(record.xpEarned || (record.type === 'run' ? 80 : 20), `activity_${record.type}`)

        set({
          activities: [newActivity, ...currentActivities],
        })
      },

      logSetback: (record) => {
        const id = `setback-${Date.now()}`
        const timestamp = Date.now()
        const newSetback: SetbackRecord = { ...record, id, timestamp }
        set((state) => ({ setbacks: [newSetback, ...state.setbacks] }))
      },

      completeLesson: (lessonId, xpReward) => {
        const completed = get().completedLessonIds
        if (completed.includes(lessonId)) return
        get().addXP(xpReward, 'lesson_completed')
        set({ completedLessonIds: [...completed, lessonId] })
      },

      completeQuest: (questId, xpReward) => {
        const completed = get().completedQuestIds
        if (completed.includes(questId)) return

        get().addXP(xpReward, 'quest_completed')
        set({ completedQuestIds: [...completed, questId] })
      },

      setPlan: (plan) => set({ plan }),


      setSeedState: (type) => {
        if (type === 'new') {
          set({
            ...NEW_USER_DEFAULTS,
            displayName: get().displayName || 'Neelaksh',
          })
        } else {
          // Simulated 17-day active user
          set({
            displayName: get().displayName || 'Neelaksh',
            totalXP: 2840,
            currentLevel: 7,
            currentStreak: 17,
            longestStreak: 21,
            plan: 'pro',
            completedQuestIds: ['q-focus-10'],
            unlockedBadgeIds: ['b1', 'b2', 'b3', 'b4'],
            activities: ACTIVE_DEMO_ACTIVITIES,
            urgeLogs: ACTIVE_DEMO_URGES,
          })
        }
      },

      reset: () => set(NEW_USER_DEFAULTS),
    }),
    {
      name: 'unbound-user',
    }
  )
)

// ============================================================
// URGE MODE STORE (ephemeral — active reset session)
// ============================================================
interface UrgeModeStore {
  isActive: boolean
  step: number
  intensity: number | null
  trigger: string | null
  interventionType: string | null
  outcome: string | null
  replacementHabit: string | null
  startTime: number | null
  activate: () => void
  deactivate: () => void
  setStep: (step: number) => void
  setIntensity: (v: number) => void
  setTrigger: (v: string) => void
  setInterventionType: (v: string) => void
  setOutcome: (v: string) => void
  setReplacementHabit: (v: string) => void
  reset: () => void
}

export const useUrgeModeStore = create<UrgeModeStore>()((set) => ({
  isActive: false,
  step: 0,
  intensity: null,
  trigger: null,
  interventionType: null,
  outcome: null,
  replacementHabit: null,
  startTime: null,
  activate: () => set({ isActive: true, step: 0, startTime: Date.now() }),
  deactivate: () => set({ isActive: false }),
  setStep: (step) => set({ step }),
  setIntensity: (intensity) => set({ intensity }),
  setTrigger: (trigger) => set({ trigger }),
  setInterventionType: (interventionType) => set({ interventionType }),
  setOutcome: (outcome) => set({ outcome }),
  setReplacementHabit: (replacementHabit) => set({ replacementHabit }),
  reset: () =>
    set({
      isActive: false,
      step: 0,
      intensity: null,
      trigger: null,
      interventionType: null,
      outcome: null,
      replacementHabit: null,
      startTime: null,
    }),
}))

// ============================================================
// DASHBOARD STORE (cached metrics)
// ============================================================
interface DashboardStore {
  todayFocus: number
  todaySleep: number
  todayHabits: number
  todayConsistency: number
  weeklyUrgeData: { day: string; urges: number; streak: number }[]
  isLoading: boolean
  lastFetchedAt: number | null
  setDashboardData: (data: Partial<DashboardStore>) => void
}

export const useDashboardStore = create<DashboardStore>()((set) => ({
  todayFocus: 0,
  todaySleep: 0,
  todayHabits: 0,
  todayConsistency: 0,
  weeklyUrgeData: [],
  isLoading: false,
  lastFetchedAt: null,
  setDashboardData: (data) => set((state) => ({ ...state, ...data })),
}))

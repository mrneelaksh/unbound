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

export interface FoodLogItem {
  id: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food_name: string
  serving?: string | null
  calories?: number | null
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  notes?: string | null
  logged_at: string
}

export interface WaterDayItem {
  date: string
  day: string
  amountMl: number
  goalMet: boolean
  percentOfGoal: number
}

export interface SleepRecord {
  id: string
  date: string // YYYY-MM-DD
  durationHours: number
  bedtime?: string
  wakeTime?: string
  quality?: 'deep' | 'restful' | 'interrupted'
  timestamp: number
}

export interface HabitLogRecord {
  id: string
  habit: string
  date: string // YYYY-MM-DD
  completed: boolean
  timestamp: number
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

  // Hydration & Nutrition Slices
  todayWaterMl: number
  dailyWaterGoalMl: number
  waterHistory7d: WaterDayItem[]
  waterHistory30d: WaterDayItem[]
  waterHistory90d: WaterDayItem[]
  foodLogs: FoodLogItem[]
  nutritionTotals: {
    calories: number
    proteinG: number
    carbsG: number
    fatG: number
    fiberG: number
  }

  // Sleep & Habit Slices
  sleepLogs: SleepRecord[]
  habitLogs: HabitLogRecord[]

  // Actions
  setUser: (data: Partial<UserStore>) => void
  addXP: (amount: number, reason?: string) => { newXP: number; newLevel: number; didLevelUp: boolean }
  logUrge: (record: Omit<UrgeRecord, 'id' | 'timestamp'>) => void
  logActivity: (record: Omit<ActivityRecord, 'id' | 'timestamp'>) => void
  logSetback: (record: Omit<SetbackRecord, 'id' | 'timestamp'>) => void
  logSleep: (record: Omit<SleepRecord, 'id' | 'timestamp'>) => void
  logHabit: (habit: string, date?: string, completed?: boolean) => void
  completeLesson: (lessonId: string, xpReward: number) => void
  completeQuest: (questId: string, xpReward: number) => void
  setPlan: (plan: PlanType) => void
  setSeedState: (type: 'new' | 'active') => void
  reset: () => void

  // Backend Sync Actions
  syncWithServer: () => Promise<void>
  addWater: (amountMl: number) => Promise<void>
  updateWaterGoal: (goalMl: number) => Promise<void>
  logFood: (meal: any) => Promise<void>
  deleteFood: (id: string) => Promise<void>
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

  todayWaterMl: 0,
  dailyWaterGoalMl: 2500,
  waterHistory7d: [],
  waterHistory30d: [],
  waterHistory90d: [],
  foodLogs: [],
  nutritionTotals: {
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    fiberG: 0,
  },
  sleepLogs: [],
  habitLogs: [],
}

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

      logSleep: (record) => {
        const id = `sleep-${Date.now()}`
        const timestamp = Date.now()
        const newSleep: SleepRecord = { ...record, id, timestamp }
        get().addXP(25, 'sleep_logged')
        set((state) => ({
          sleepLogs: [newSleep, ...state.sleepLogs.filter((s) => s.date !== record.date)],
        }))
      },

      logHabit: (habit, date, completed = true) => {
        const habitDate = date || new Date().toISOString().slice(0, 10)
        const id = `habit-${Date.now()}`
        const timestamp = Date.now()
        const newHabitLog: HabitLogRecord = { id, habit, date: habitDate, completed, timestamp }
        if (completed) get().addXP(30, 'habit_completed')
        set((state) => ({
          habitLogs: [newHabitLog, ...state.habitLogs],
        }))
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
            displayName: get().displayName || 'Seeker',
          })
        } else {
          set({
            displayName: get().displayName || 'Seeker',
            totalXP: 2840,
            currentLevel: 7,
            currentStreak: 17,
            longestStreak: 21,
            plan: 'pro',
            todayWaterMl: 1700,
            dailyWaterGoalMl: 2500,
          })
        }
      },

      reset: () => set(NEW_USER_DEFAULTS),

      // Server Data Sync
      syncWithServer: async () => {
        try {
          // 1. Session & Profile
          const sessionRes = await fetch('/api/auth/session')
          if (sessionRes.ok) {
            const { user } = await sessionRes.json()
            if (user) {
              set({
                userId: user.id,
                email: user.email,
                displayName: user.displayName || user.firstName,
                totalXP: user.totalXP || 0,
                currentLevel: user.currentLevel || 1,
                currentStreak: user.currentStreak || 0,
                longestStreak: user.longestStreak || 0,
                dailyWaterGoalMl: user.dailyWaterGoalMl || 2500,
              })
            }
          }

          // 2. Hydration
          const waterRes = await fetch('/api/water')
          if (waterRes.ok) {
            const data = await waterRes.json()
            set({
              todayWaterMl: data.todayTotalMl || 0,
              dailyWaterGoalMl: data.dailyGoalMl || 2500,
              waterHistory7d: data.history7d || [],
              waterHistory30d: data.history30d || [],
              waterHistory90d: data.history90d || [],
            })
          }

          // 3. Nutrition
          const nutRes = await fetch('/api/nutrition')
          if (nutRes.ok) {
            const data = await nutRes.json()
            set({
              foodLogs: data.logs || [],
              nutritionTotals: data.totals || {
                calories: 0,
                proteinG: 0,
                carbsG: 0,
                fatG: 0,
                fiberG: 0,
              },
            })
          }
        } catch {
          // Graceful fallback to offline cached Zustand state
        }
      },

      addWater: async (amountMl: number) => {
        const prevTotal = get().todayWaterMl
        const newTotal = prevTotal + amountMl
        set({ todayWaterMl: newTotal })
        get().addXP(5, 'water_logged')

        try {
          const res = await fetch('/api/water', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amountMl }),
          })
          if (res.ok) {
            const data = await res.json()
            if (data.todayTotalMl !== undefined) {
              set({ todayWaterMl: data.todayTotalMl })
            }
            // Refresh history
            const refreshRes = await fetch('/api/water')
            if (refreshRes.ok) {
              const hist = await refreshRes.json()
              set({
                waterHistory7d: hist.history7d || [],
                waterHistory30d: hist.history30d || [],
                waterHistory90d: hist.history90d || [],
              })
            }
          }
        } catch {
          // Kept in optimistic client state
        }
      },

      updateWaterGoal: async (goalMl: number) => {
        set({ dailyWaterGoalMl: goalMl })
        try {
          await fetch('/api/water/goal', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dailyGoalMl: goalMl }),
          })
        } catch {}
      },

      logFood: async (mealData: any) => {
        try {
          const res = await fetch('/api/nutrition', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mealData),
          })
          if (res.ok) {
            get().addXP(10, 'conscious_meal')
            const nutRes = await fetch('/api/nutrition')
            if (nutRes.ok) {
              const data = await nutRes.json()
              set({
                foodLogs: data.logs || [],
                nutritionTotals: data.totals || {
                  calories: 0,
                  proteinG: 0,
                  carbsG: 0,
                  fatG: 0,
                  fiberG: 0,
                },
              })
            }
          }
        } catch {}
      },

      deleteFood: async (id: string) => {
        try {
          const res = await fetch(`/api/nutrition?id=${id}`, {
            method: 'DELETE',
          })
          if (res.ok) {
            const nutRes = await fetch('/api/nutrition')
            if (nutRes.ok) {
              const data = await nutRes.json()
              set({
                foodLogs: data.logs || [],
                nutritionTotals: data.totals || {
                  calories: 0,
                  proteinG: 0,
                  carbsG: 0,
                  fatG: 0,
                  fiberG: 0,
                },
              })
            }
          }
        } catch {}
      },
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

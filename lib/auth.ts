import crypto from 'node:crypto'
import { cookies } from 'next/headers'
import { isSupabaseConfigured } from './supabase/config'
import { createClient as createSupabaseServerClient } from './supabase/server'
import {
  dbFindSession,
  dbCreateSession,
  dbDeleteSession,
  dbFindUserById,
  dbGetProfile,
  dbGetUserStats,
  dbGetWaterGoal,
} from './db'

export const AUTH_COOKIE_NAME = 'unbound_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

// Secret for HMAC signing of session cookies
const AUTH_SECRET = process.env.AUTH_SECRET || 'unbound_local_dev_secret_key_8492049103'

// ============================================================
// PASSWORD HASHING (scrypt + random salt)
// ============================================================
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return `${salt}:${derivedKey.toString('hex')}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':')
    if (!salt || !key) return false
    const keyBuffer = Buffer.from(key, 'hex')
    const derivedKey = crypto.scryptSync(password, salt, 64)
    return crypto.timingSafeEqual(keyBuffer, derivedKey)
  } catch {
    return false
  }
}

// ============================================================
// SIGNED COOKIES (HMAC-SHA256)
// ============================================================
export function signCookie(value: string): string {
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(value)
    .digest('hex')
  return `${value}.${signature}`
}

export function unsignCookie(signedValue: string): string | null {
  const lastDot = signedValue.lastIndexOf('.')
  if (lastDot === -1) return null

  const value = signedValue.slice(0, lastDot)
  const signature = signedValue.slice(lastDot + 1)

  const expectedSignature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(value)
    .digest('hex')

  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expectedSignature)

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null
  }

  return value
}

// ============================================================
// RATE LIMITING (In-Memory per IP / Key)
// ============================================================
interface RateLimitEntry {
  count: number
  firstAttempt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export function checkRateLimit(key: string, limit: number = 5, windowMs: number = 60000): {
  allowed: boolean
  remaining: number
  resetInSeconds: number
} {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now - entry.firstAttempt > windowMs) {
    rateLimitStore.set(key, { count: 1, firstAttempt: now })
    return { allowed: true, remaining: limit - 1, resetInSeconds: Math.ceil(windowMs / 1000) }
  }

  if (entry.count >= limit) {
    const resetInSeconds = Math.ceil((entry.firstAttempt + windowMs - now) / 1000)
    return { allowed: false, remaining: 0, resetInSeconds }
  }

  entry.count++
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetInSeconds: Math.ceil((entry.firstAttempt + windowMs - now) / 1000),
  }
}

// ============================================================
// SESSION MANAGEMENT (Serverless-Resilient Signed Payload)
// ============================================================
export interface SessionPayload {
  userId: string
  email?: string
  firstName?: string
  displayName?: string
  totalXP?: number
  currentLevel?: number
  currentStreak?: number
  longestStreak?: number
  dailyWaterGoalMl?: number
  onboardingCompleted?: boolean
  createdAt: number
}

export async function createLocalSession(
  userId: string,
  extraData?: Partial<SessionPayload>
): Promise<string> {
  const user = dbFindUserById(userId)
  const profile = dbGetProfile(userId)
  const stats = dbGetUserStats(userId)
  const goal = dbGetWaterGoal(userId)

  const payload: SessionPayload = {
    userId,
    email: user?.email || extraData?.email || '',
    firstName: user?.first_name || extraData?.firstName || 'Seeker',
    displayName: profile?.display_name || user?.first_name || extraData?.displayName || 'Seeker',
    totalXP: stats?.total_xp ?? extraData?.totalXP ?? 0,
    currentLevel: stats?.current_level ?? extraData?.currentLevel ?? 1,
    currentStreak: stats?.current_streak ?? extraData?.currentStreak ?? 0,
    longestStreak: stats?.longest_streak ?? extraData?.longestStreak ?? 0,
    dailyWaterGoalMl: goal ?? extraData?.dailyWaterGoalMl ?? 2500,
    onboardingCompleted: !!profile?.onboarding_completed,
    createdAt: Date.now(),
  }

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const randomSuffix = crypto.randomBytes(16).toString('hex')
  const token = `${payloadB64}_${randomSuffix}`

  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString()
  try {
    dbCreateSession(token, userId, expiresAt)
  } catch {
    // If SQLite is read-only or in ephemeral lambda, token payload is self-authenticating
  }

  const cookieStore = await cookies()
  const signed = signCookie(token)

  cookieStore.set(AUTH_COOKIE_NAME, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })

  return token
}

export async function clearLocalSession(): Promise<void> {
  const cookieStore = await cookies()
  const rawCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (rawCookie) {
    const token = unsignCookie(rawCookie)
    if (token) {
      try {
        dbDeleteSession(token)
      } catch {}
    }
  }

  cookieStore.delete(AUTH_COOKIE_NAME)
}

// ============================================================
// UNIFIED AUTH USER RETRIEVAL (Server-Side)
// ============================================================
export interface AuthUser {
  id: string
  email: string
  displayName: string
  firstName: string
  avatarUrl: string | null
  totalXP: number
  currentLevel: number
  currentStreak: number
  longestStreak: number
  dailyWaterGoalMl: number
  onboardingCompleted: boolean
  isSupabase: boolean
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  // If Supabase is configured, use Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return null

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      const { data: waterGoal } = await supabase
        .from('water_goals')
        .select('daily_goal_ml')
        .eq('user_id', user.id)
        .single()

      const firstName =
        user.user_metadata?.first_name ||
        profile?.display_name ||
        user.email?.split('@')[0] ||
        'Seeker'

      return {
        id: user.id,
        email: user.email || '',
        displayName: profile?.display_name || firstName,
        firstName,
        avatarUrl: profile?.avatar_url || null,
        totalXP: stats?.total_xp || 0,
        currentLevel: stats?.current_level || 1,
        currentStreak: stats?.current_streak || 0,
        longestStreak: stats?.longest_streak || 0,
        dailyWaterGoalMl: waterGoal?.daily_goal_ml || 2500,
        onboardingCompleted: !!profile?.onboarding_completed,
        isSupabase: true,
      }
    } catch {
      return null
    }
  }

  // Local / Serverless standalone auth
  const cookieStore = await cookies()
  const rawCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value
  if (!rawCookie) return null

  const token = unsignCookie(rawCookie)
  if (!token) return null

  // 1. Parse embedded cryptographically verified payload
  let embeddedPayload: SessionPayload | null = null
  try {
    const payloadPart = token.split('_')[0]
    if (payloadPart) {
      embeddedPayload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf-8'))
    }
  } catch {}

  // 2. Attempt SQLite database lookup
  let dbUser: any = null
  let dbProf: any = null
  let dbStats: any = null
  let dbGoal: number | null = null

  try {
    const session = dbFindSession(token)
    const targetUserId = session?.user_id || embeddedPayload?.userId
    if (targetUserId) {
      dbUser = dbFindUserById(targetUserId)
      dbProf = dbGetProfile(targetUserId)
      dbStats = dbGetUserStats(targetUserId)
      dbGoal = dbGetWaterGoal(targetUserId)
    }
  } catch {
    // If SQLite is unavailable, fallback entirely to verified token payload
  }

  const userId = dbUser?.id || embeddedPayload?.userId
  if (!userId) return null

  const email = dbUser?.email || embeddedPayload?.email || ''
  const firstName = dbUser?.first_name || embeddedPayload?.firstName || 'Seeker'
  const displayName = dbProf?.display_name || dbUser?.first_name || embeddedPayload?.displayName || firstName
  const totalXP = dbStats?.total_xp ?? embeddedPayload?.totalXP ?? 0
  const currentLevel = dbStats?.current_level ?? embeddedPayload?.currentLevel ?? 1
  const currentStreak = dbStats?.current_streak ?? embeddedPayload?.currentStreak ?? 0
  const longestStreak = dbStats?.longest_streak ?? embeddedPayload?.longestStreak ?? 0
  const dailyWaterGoalMl = dbGoal ?? embeddedPayload?.dailyWaterGoalMl ?? 2500
  const onboardingCompleted = dbProf?.onboarding_completed !== undefined
    ? !!dbProf.onboarding_completed
    : !!embeddedPayload?.onboardingCompleted

  return {
    id: userId,
    email,
    displayName,
    firstName,
    avatarUrl: dbProf?.avatar_url || null,
    totalXP,
    currentLevel,
    currentStreak,
    longestStreak,
    dailyWaterGoalMl,
    onboardingCompleted,
    isSupabase: false,
  }
}

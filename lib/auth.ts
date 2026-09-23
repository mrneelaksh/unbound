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
// SESSION MANAGEMENT
// ============================================================
export async function createLocalSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString()
  dbCreateSession(token, userId, expiresAt)

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
      dbDeleteSession(token)
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

  // Local development auth via local SQLite
  const cookieStore = await cookies()
  const rawCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value
  if (!rawCookie) return null

  const token = unsignCookie(rawCookie)
  if (!token) return null

  const session = dbFindSession(token)
  if (!session) return null

  const user = dbFindUserById(session.user_id)
  if (!user) return null

  const profile = dbGetProfile(user.id)
  const stats = dbGetUserStats(user.id)
  const goal = dbGetWaterGoal(user.id)

  return {
    id: user.id,
    email: user.email,
    displayName: profile?.display_name || user.first_name,
    firstName: user.first_name,
    avatarUrl: profile?.avatar_url || null,
    totalXP: stats?.total_xp || 0,
    currentLevel: stats?.current_level || 1,
    currentStreak: stats?.current_streak || 0,
    longestStreak: stats?.longest_streak || 0,
    dailyWaterGoalMl: goal,
    onboardingCompleted: !!profile?.onboarding_completed,
    isSupabase: false,
  }
}

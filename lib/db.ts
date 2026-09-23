import path from 'node:path'
import fs from 'node:fs'
import { DatabaseSync } from 'node:sqlite'

const isServerless = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME
const DATA_DIR = isServerless ? '/tmp' : path.join(process.cwd(), 'data')
if (!isServerless && !fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const DB_PATH = path.join(DATA_DIR, 'unbound_local.db')

let dbInstance: DatabaseSync | null = null

export function getLocalDb(): DatabaseSync {
  if (dbInstance) return dbInstance

  dbInstance = new DatabaseSync(DB_PATH)
  dbInstance.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      first_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      display_name TEXT NOT NULL,
      avatar_url TEXT,
      age_range TEXT,
      is_minor INTEGER DEFAULT 0,
      onboarding_completed INTEGER DEFAULT 0,
      onboarding_step INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      user_id TEXT PRIMARY KEY,
      total_xp INTEGER DEFAULT 0,
      current_level INTEGER DEFAULT 1,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_checkin_date TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS water_goals (
      user_id TEXT PRIMARY KEY,
      daily_goal_ml INTEGER DEFAULT 2500,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS water_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount_ml INTEGER NOT NULL,
      logged_at TEXT NOT NULL,
      source TEXT DEFAULT 'quick_add',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON water_logs(user_id, logged_at DESC);

    CREATE TABLE IF NOT EXISTS food_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      food_name TEXT NOT NULL,
      serving TEXT,
      calories INTEGER,
      protein_g REAL DEFAULT 0,
      carbs_g REAL DEFAULT 0,
      fat_g REAL DEFAULT 0,
      fiber_g REAL DEFAULT 0,
      notes TEXT,
      logged_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, logged_at DESC);

    CREATE TABLE IF NOT EXISTS activity_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      duration_minutes REAL DEFAULT 0,
      distance_km REAL DEFAULT 0,
      steps INTEGER DEFAULT 0,
      calories INTEGER DEFAULT 0,
      xp_earned INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_activity_user_date ON activity_sessions(user_id, date DESC);

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)

  return dbInstance
}

export interface LocalUserRecord {
  id: string
  email: string
  first_name: string
  password_hash: string
  created_at: string
}

export interface LocalProfileRecord {
  id: string
  username: string | null
  display_name: string
  avatar_url: string | null
  age_range: string | null
  is_minor: number
  onboarding_completed: number
  onboarding_step: number
  created_at: string
  updated_at: string
}

export interface LocalWaterLogRecord {
  id: string
  user_id: string
  amount_ml: number
  logged_at: string
  source: string
  created_at: string
}

export interface LocalFoodLogRecord {
  id: string
  user_id: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food_name: string
  serving: string | null
  calories: number | null
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  notes: string | null
  logged_at: string
  created_at: string
}

// User & Auth Operations
export function dbCreateUser(params: {
  id: string
  email: string
  firstName: string
  passwordHash: string
}): { id: string; email: string; firstName: string } {
  const db = getLocalDb()
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, first_name, password_hash)
    VALUES (?, ?, ?, ?)
  `)
  insertUser.run(params.id, params.email.toLowerCase().trim(), params.firstName.trim(), params.passwordHash)

  const insertProfile = db.prepare(`
    INSERT INTO profiles (id, display_name)
    VALUES (?, ?)
  `)
  insertProfile.run(params.id, params.firstName.trim())

  const insertStats = db.prepare(`
    INSERT INTO user_stats (user_id, total_xp, current_level, current_streak, longest_streak)
    VALUES (?, 0, 1, 0, 0)
  `)
  insertStats.run(params.id)

  const insertGoal = db.prepare(`
    INSERT INTO water_goals (user_id, daily_goal_ml)
    VALUES (?, 2500)
  `)
  insertGoal.run(params.id)

  return { id: params.id, email: params.email, firstName: params.firstName }
}

export function dbFindUserByEmail(email: string): LocalUserRecord | null {
  const db = getLocalDb()
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
  const row = stmt.get(email.toLowerCase().trim()) as LocalUserRecord | undefined
  return row || null
}

export function dbFindUserById(id: string): LocalUserRecord | null {
  const db = getLocalDb()
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
  const row = stmt.get(id) as LocalUserRecord | undefined
  return row || null
}

export function dbGetProfile(userId: string): LocalProfileRecord | null {
  const db = getLocalDb()
  const stmt = db.prepare('SELECT * FROM profiles WHERE id = ?')
  const row = stmt.get(userId) as LocalProfileRecord | undefined
  return row || null
}

export function dbUpdateProfile(
  userId: string,
  updates: { display_name?: string; avatar_url?: string | null; onboarding_completed?: number }
) {
  const db = getLocalDb()
  const current = dbGetProfile(userId)
  if (!current) return

  const displayName = updates.display_name !== undefined ? updates.display_name : current.display_name
  const avatarUrl = updates.avatar_url !== undefined ? updates.avatar_url : current.avatar_url
  const onboarding = updates.onboarding_completed !== undefined ? updates.onboarding_completed : current.onboarding_completed

  const stmt = db.prepare(`
    UPDATE profiles
    SET display_name = ?, avatar_url = ?, onboarding_completed = ?, updated_at = datetime('now')
    WHERE id = ?
  `)
  stmt.run(displayName, avatarUrl, onboarding, userId)
}

// Session Operations
export function dbCreateSession(token: string, userId: string, expiresAt: string) {
  const db = getLocalDb()
  const stmt = db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
  stmt.run(token, userId, expiresAt)
}

export function dbFindSession(token: string): { user_id: string; expires_at: string } | null {
  const db = getLocalDb()
  const stmt = db.prepare('SELECT user_id, expires_at FROM sessions WHERE token = ?')
  const row = stmt.get(token) as { user_id: string; expires_at: string } | undefined
  if (!row) return null

  if (new Date(row.expires_at).getTime() < Date.now()) {
    dbDeleteSession(token)
    return null
  }
  return row
}

export function dbDeleteSession(token: string) {
  const db = getLocalDb()
  const stmt = db.prepare('DELETE FROM sessions WHERE token = ?')
  stmt.run(token)
}

export function dbDeleteAllUserSessions(userId: string) {
  const db = getLocalDb()
  const stmt = db.prepare('DELETE FROM sessions WHERE user_id = ?')
  stmt.run(userId)
}

// Water Operations
export function dbGetWaterGoal(userId: string): number {
  const db = getLocalDb()
  const stmt = db.prepare('SELECT daily_goal_ml FROM water_goals WHERE user_id = ?')
  const row = stmt.get(userId) as { daily_goal_ml: number } | undefined
  return row?.daily_goal_ml ?? 2500
}

export function dbSetWaterGoal(userId: string, goalMl: number) {
  const db = getLocalDb()
  const stmt = db.prepare(`
    INSERT INTO water_goals (user_id, daily_goal_ml, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET daily_goal_ml = excluded.daily_goal_ml, updated_at = datetime('now')
  `)
  stmt.run(userId, Math.max(500, Math.min(10000, goalMl)))
}

export function dbLogWater(params: {
  id: string
  userId: string
  amountMl: number
  source?: string
  loggedAt?: string
}): LocalWaterLogRecord {
  const db = getLocalDb()
  const loggedAt = params.loggedAt || new Date().toISOString()
  const source = params.source || 'quick_add'

  const stmt = db.prepare(`
    INSERT INTO water_logs (id, user_id, amount_ml, logged_at, source)
    VALUES (?, ?, ?, ?, ?)
  `)
  stmt.run(params.id, params.userId, params.amountMl, loggedAt, source)

  // Award user 5 XP
  dbAddUserXP(params.userId, 5)

  return {
    id: params.id,
    user_id: params.userId,
    amount_ml: params.amountMl,
    logged_at: loggedAt,
    source,
    created_at: new Date().toISOString(),
  }
}

export function dbGetTodayWaterTotal(userId: string, datePrefix: string): number {
  const db = getLocalDb()
  const stmt = db.prepare(`
    SELECT SUM(amount_ml) as total
    FROM water_logs
    WHERE user_id = ? AND logged_at LIKE ?
  `)
  const row = stmt.get(userId, `${datePrefix}%`) as { total: number | null } | undefined
  return row?.total || 0
}

export function dbGetWaterLogs(userId: string, days: number = 7): LocalWaterLogRecord[] {
  const db = getLocalDb()
  const stmt = db.prepare(`
    SELECT *
    FROM water_logs
    WHERE user_id = ?
    ORDER BY logged_at DESC
    LIMIT ?
  `)
  return (stmt.all(userId, days * 20) as LocalWaterLogRecord[]) || []
}

// Nutrition Operations
export function dbLogFood(params: {
  id: string
  userId: string
  mealType: string
  foodName: string
  serving?: string
  calories?: number
  proteinG?: number
  carbsG?: number
  fatG?: number
  fiberG?: number
  notes?: string
  loggedAt?: string
}): LocalFoodLogRecord {
  const db = getLocalDb()
  const loggedAt = params.loggedAt || new Date().toISOString()

  const stmt = db.prepare(`
    INSERT INTO food_logs (
      id, user_id, meal_type, food_name, serving, calories,
      protein_g, carbs_g, fat_g, fiber_g, notes, logged_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    params.id,
    params.userId,
    params.mealType,
    params.foodName,
    params.serving || null,
    params.calories ?? null,
    params.proteinG ?? 0,
    params.carbsG ?? 0,
    params.fatG ?? 0,
    params.fiberG ?? 0,
    params.notes || null,
    loggedAt
  )

  // Award XP for logging a conscious meal
  dbAddUserXP(params.userId, 10)

  return {
    id: params.id,
    user_id: params.userId,
    meal_type: params.mealType as any,
    food_name: params.foodName,
    serving: params.serving || null,
    calories: params.calories ?? null,
    protein_g: params.proteinG ?? 0,
    carbs_g: params.carbsG ?? 0,
    fat_g: params.fatG ?? 0,
    fiber_g: params.fiberG ?? 0,
    notes: params.notes || null,
    logged_at: loggedAt,
    created_at: new Date().toISOString(),
  }
}

export function dbGetFoodLogs(userId: string, datePrefix?: string): LocalFoodLogRecord[] {
  const db = getLocalDb()
  if (datePrefix) {
    const stmt = db.prepare(`
      SELECT *
      FROM food_logs
      WHERE user_id = ? AND logged_at LIKE ?
      ORDER BY logged_at DESC
    `)
    return (stmt.all(userId, `${datePrefix}%`) as LocalFoodLogRecord[]) || []
  }

  const stmt = db.prepare(`
    SELECT *
    FROM food_logs
    WHERE user_id = ?
    ORDER BY logged_at DESC
    LIMIT 100
  `)
  return (stmt.all(userId) as LocalFoodLogRecord[]) || []
}

export function dbDeleteFoodLog(userId: string, foodId: string): boolean {
  const db = getLocalDb()
  const stmt = db.prepare('DELETE FROM food_logs WHERE id = ? AND user_id = ?')
  stmt.run(foodId, userId)
  return true
}

// XP & Level calculations
export function dbAddUserXP(userId: string, amount: number) {
  const db = getLocalDb()
  const stmt = db.prepare(`
    UPDATE user_stats
    SET total_xp = total_xp + ?,
        updated_at = datetime('now')
    WHERE user_id = ?
  `)
  stmt.run(amount, userId)
}

export function dbGetUserStats(userId: string) {
  const db = getLocalDb()
  const stmt = db.prepare('SELECT * FROM user_stats WHERE user_id = ?')
  return stmt.get(userId) as {
    user_id: string
    total_xp: number
    current_level: number
    current_streak: number
    longest_streak: number
    last_checkin_date: string | null
    updated_at: string
  } | undefined
}

// Password Reset
export function dbCreatePasswordReset(token: string, userId: string, expiresAt: string) {
  const db = getLocalDb()
  const stmt = db.prepare('INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)')
  stmt.run(token, userId, expiresAt)
}

export function dbVerifyPasswordReset(token: string): { user_id: string } | null {
  const db = getLocalDb()
  const stmt = db.prepare('SELECT user_id, expires_at FROM password_resets WHERE token = ?')
  const row = stmt.get(token) as { user_id: string; expires_at: string } | undefined
  if (!row) return null

  if (new Date(row.expires_at).getTime() < Date.now()) {
    dbDeletePasswordReset(token)
    return null
  }
  return { user_id: row.user_id }
}

export function dbDeletePasswordReset(token: string) {
  const db = getLocalDb()
  const stmt = db.prepare('DELETE FROM password_resets WHERE token = ?')
  stmt.run(token)
}

export function dbUpdateUserPassword(userId: string, newPasswordHash: string) {
  const db = getLocalDb()
  const stmt = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
  stmt.run(newPasswordHash, userId)
  dbDeleteAllUserSessions(userId)
}

// Account Deletion
export function dbDeleteAccount(userId: string) {
  const db = getLocalDb()
  const stmt = db.prepare('DELETE FROM users WHERE id = ?')
  stmt.run(userId)
}

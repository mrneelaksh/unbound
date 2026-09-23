import { NextResponse, type NextRequest } from 'next/server'
import crypto from 'node:crypto'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import {
  dbGetWaterGoal,
  dbLogWater,
  dbGetTodayWaterTotal,
  dbGetWaterLogs,
} from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientDate = searchParams.get('date') || new Date().toISOString().split('T')[0]

    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient()

      // Goal
      const { data: goalData } = await supabase
        .from('water_goals')
        .select('daily_goal_ml')
        .eq('user_id', user.id)
        .single()
      const dailyGoalMl = goalData?.daily_goal_ml || 2500

      // Logs
      const { data: logsData } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(200)

      const logs = logsData || []
      const todayLogs = logs.filter((l: any) => l.logged_at.startsWith(clientDate))
      const todayTotalMl = todayLogs.reduce((acc: number, l: any) => acc + (l.amount_ml || 0), 0)

      // Calculate history
      const history7d = buildHistory(logs, 7, dailyGoalMl)
      const history30d = buildHistory(logs, 30, dailyGoalMl)
      const history90d = buildHistory(logs, 90, dailyGoalMl)

      return NextResponse.json({
        todayTotalMl,
        dailyGoalMl,
        logs: todayLogs,
        history7d,
        history30d,
        history90d,
        allLogsCount: logs.length,
      })
    }

    // Local DB
    const dailyGoalMl = dbGetWaterGoal(user.id)
    const todayTotalMl = dbGetTodayWaterTotal(user.id, clientDate)
    const logs = dbGetWaterLogs(user.id, 90)

    const history7d = buildHistory(logs, 7, dailyGoalMl)
    const history30d = buildHistory(logs, 30, dailyGoalMl)
    const history90d = buildHistory(logs, 90, dailyGoalMl)

    return NextResponse.json({
      todayTotalMl,
      dailyGoalMl,
      logs: logs.filter((l) => l.logged_at.startsWith(clientDate)),
      history7d,
      history30d,
      history90d,
      allLogsCount: logs.length,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to fetch hydration data.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await request.json()
    const { amountMl, source, loggedAt } = body

    if (!amountMl || typeof amountMl !== 'number' || amountMl <= 0 || amountMl > 5000) {
      return NextResponse.json(
        { error: 'Water amount must be between 1 and 5000 ml.' },
        { status: 400 }
      )
    }

    const logId = crypto.randomUUID()
    const timestamp = loggedAt || new Date().toISOString()
    const cleanSource = source || 'quick_add'

    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient()
      const { data, error } = await supabase
        .from('water_logs')
        .insert({
          id: logId,
          user_id: user.id,
          amount_ml: amountMl,
          logged_at: timestamp,
          source: cleanSource,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, log: data })
    }

    const record = dbLogWater({
      id: logId,
      userId: user.id,
      amountMl,
      source: cleanSource,
      loggedAt: timestamp,
    })

    const todayDate = timestamp.split('T')[0]
    const updatedToday = dbGetTodayWaterTotal(user.id, todayDate)

    return NextResponse.json({
      success: true,
      log: record,
      todayTotalMl: updatedToday,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to log hydration.' },
      { status: 500 }
    )
  }
}

function buildHistory(logs: any[], daysCount: number, goalMl: number) {
  const result: {
    date: string
    day: string
    amountMl: number
    goalMet: boolean
    percentOfGoal: number
  }[] = []

  const today = new Date()

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayName = getDayName(dateStr)

    const dayLogs = logs.filter((l: any) => l.logged_at.startsWith(dateStr))
    const totalMl = dayLogs.reduce((acc: number, l: any) => acc + (l.amount_ml || 0), 0)

    result.push({
      date: dateStr,
      day: dayName,
      amountMl: totalMl,
      goalMet: totalMl >= goalMl,
      percentOfGoal: goalMl > 0 ? Math.round((totalMl / goalMl) * 100) : 0,
    })
  }

  return result
}

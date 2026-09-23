import { NextResponse, type NextRequest } from 'next/server'
import crypto from 'node:crypto'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { dbLogFood, dbGetFoodLogs, dbDeleteFoodLog } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientDate = searchParams.get('date') || new Date().toISOString().split('T')[0]

    let logs: any[] = []

    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient()
      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      logs = data || []
    } else {
      logs = dbGetFoodLogs(user.id)
    }

    const todayLogs = logs.filter((l) => l.logged_at.startsWith(clientDate))

    const totals = todayLogs.reduce(
      (acc, l) => ({
        calories: acc.calories + (l.calories || 0),
        proteinG: Number((acc.proteinG + (Number(l.protein_g) || 0)).toFixed(1)),
        carbsG: Number((acc.carbsG + (Number(l.carbs_g) || 0)).toFixed(1)),
        fatG: Number((acc.fatG + (Number(l.fat_g) || 0)).toFixed(1)),
        fiberG: Number((acc.fiberG + (Number(l.fiber_g) || 0)).toFixed(1)),
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 }
    )

    const mealCounts = {
      breakfast: todayLogs.filter((l) => l.meal_type === 'breakfast').length,
      lunch: todayLogs.filter((l) => l.meal_type === 'lunch').length,
      dinner: todayLogs.filter((l) => l.meal_type === 'dinner').length,
      snack: todayLogs.filter((l) => l.meal_type === 'snack').length,
    }

    return NextResponse.json({
      logs: todayLogs,
      allLogsCount: logs.length,
      totals,
      mealCounts,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to fetch nutrition logs.' },
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
    const mealType = body.mealType || body.meal_type
    const foodName = body.foodName || body.food_name
    const serving = body.serving
    const calories = body.calories
    const proteinG = body.proteinG ?? body.protein_g ?? 0
    const carbsG = body.carbsG ?? body.carbs_g ?? 0
    const fatG = body.fatG ?? body.fat_g ?? 0
    const fiberG = body.fiberG ?? body.fiber_g ?? 0
    const notes = body.notes
    const loggedAt = body.loggedAt || body.logged_at

    if (!mealType || !['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType)) {
      return NextResponse.json({ error: 'Valid meal type is required.' }, { status: 400 })
    }

    if (!foodName || typeof foodName !== 'string' || !foodName.trim()) {
      return NextResponse.json({ error: 'Food name is required.' }, { status: 400 })
    }

    const logId = crypto.randomUUID()
    const timestamp = loggedAt || new Date().toISOString()

    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient()
      const { data, error } = await supabase
        .from('food_logs')
        .insert({
          id: logId,
          user_id: user.id,
          meal_type: mealType,
          food_name: foodName.trim(),
          serving: serving?.trim() || null,
          calories: calories ? Number(calories) : null,
          protein_g: proteinG ? Number(proteinG) : 0,
          carbs_g: carbsG ? Number(carbsG) : 0,
          fat_g: fatG ? Number(fatG) : 0,
          fiber_g: fiberG ? Number(fiberG) : 0,
          notes: notes?.trim() || null,
          logged_at: timestamp,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      return NextResponse.json({ success: true, log: data })
    }

    const record = dbLogFood({
      id: logId,
      userId: user.id,
      mealType,
      foodName: foodName.trim(),
      serving: serving?.trim(),
      calories: calories ? Number(calories) : undefined,
      proteinG: proteinG ? Number(proteinG) : 0,
      carbsG: carbsG ? Number(carbsG) : 0,
      fatG: fatG ? Number(fatG) : 0,
      fiberG: fiberG ? Number(fiberG) : 0,
      notes: notes?.trim(),
      loggedAt: timestamp,
    })

    return NextResponse.json({ success: true, log: record })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to log nutrition.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const logId = searchParams.get('id')

    if (!logId) {
      return NextResponse.json({ error: 'Log ID is required.' }, { status: 400 })
    }

    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient()
      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      return NextResponse.json({ success: true })
    }

    dbDeleteFoodLog(user.id, logId)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete food log.' }, { status: 500 })
  }
}

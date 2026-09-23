import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { dbSetWaterGoal } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { dailyGoalMl } = await request.json()
    const goalNumber = Number(dailyGoalMl)

    if (isNaN(goalNumber) || goalNumber < 500 || goalNumber > 10000) {
      return NextResponse.json(
        { error: 'Daily hydration goal must be between 500 ml and 10,000 ml.' },
        { status: 400 }
      )
    }

    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient()
      const { data, error } = await supabase
        .from('water_goals')
        .upsert({
          user_id: user.id,
          daily_goal_ml: goalNumber,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      return NextResponse.json({ success: true, dailyGoalMl: data.daily_goal_ml })
    }

    dbSetWaterGoal(user.id, goalNumber)

    return NextResponse.json({ success: true, dailyGoalMl: goalNumber })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to update hydration goal.' },
      { status: 500 }
    )
  }
}

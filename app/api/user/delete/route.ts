import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { dbDeleteAccount } from '@/lib/db'
import { getCurrentUser, clearLocalSession } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { confirmation } = await request.json()
    if (confirmation?.trim()?.toUpperCase() !== 'DELETE') {
      return NextResponse.json(
        { error: 'Explicit confirmation "DELETE" is required.' },
        { status: 400 }
      )
    }

    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient()
      // Delete user cascades to profile, user_stats, water_logs, food_logs, etc.
      await supabase.from('profiles').delete().eq('id', user.id)
      await supabase.auth.admin.deleteUser(user.id).catch(() => {})
      await supabase.auth.signOut()
    } else {
      dbDeleteAccount(user.id)
    }

    await clearLocalSession()

    return NextResponse.json({
      success: true,
      message: 'Account and associated records permanently deleted.',
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to delete account.' },
      { status: 500 }
    )
  }
}

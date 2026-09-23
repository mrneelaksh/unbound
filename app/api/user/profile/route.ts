import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { dbUpdateProfile, dbGetProfile } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      return NextResponse.json({ profile })
    }

    const profile = dbGetProfile(user.id)
    return NextResponse.json({ profile })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch profile.' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await request.json()
    const { displayName, avatarUrl, onboardingCompleted } = body

    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient()
      const updates: any = { updated_at: new Date().toISOString() }
      if (displayName !== undefined) updates.display_name = displayName
      if (avatarUrl !== undefined) updates.avatar_url = avatarUrl
      if (onboardingCompleted !== undefined) updates.onboarding_completed = onboardingCompleted

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      return NextResponse.json({ success: true, profile: data })
    }

    dbUpdateProfile(user.id, {
      display_name: displayName,
      avatar_url: avatarUrl,
      onboarding_completed: onboardingCompleted ? 1 : (onboardingCompleted === false ? 0 : undefined),
    })

    const updated = dbGetProfile(user.id)
    return NextResponse.json({ success: true, profile: updated })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 })
  }
}

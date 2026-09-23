import { NextResponse } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { clearLocalSession } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient()
      await supabase.auth.signOut()
    }

    await clearLocalSession()

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: true })
  }
}

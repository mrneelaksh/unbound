import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { dbVerifyPasswordReset, dbDeletePasswordReset, dbUpdateUserPassword } from '@/lib/db'
import { hashPassword, createLocalSession } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { token, password, confirmPassword } = await request.json()

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 }
      )
    }

    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      return NextResponse.json({ success: true, message: 'Password updated successfully.' })
    }

    if (!token) {
      return NextResponse.json({ error: 'Reset token is required.' }, { status: 400 })
    }

    const resetRecord = dbVerifyPasswordReset(token)
    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset token.' },
        { status: 400 }
      )
    }

    const passwordHash = hashPassword(password)
    dbUpdateUserPassword(resetRecord.user_id, passwordHash)
    dbDeletePasswordReset(token)

    // Log the user into their account with a fresh session
    await createLocalSession(resetRecord.user_id)

    return NextResponse.json({
      success: true,
      message: 'Password successfully updated.',
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to reset password.' },
      { status: 500 }
    )
  }
}

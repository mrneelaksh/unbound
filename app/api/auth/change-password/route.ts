import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { dbFindUserById, dbUpdateUserPassword } from '@/lib/db'
import { getCurrentUser, verifyPassword, hashPassword, createLocalSession } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json()

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long.' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New passwords do not match.' },
        { status: 400 }
      )
    }

    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      return NextResponse.json({ success: true, message: 'Password updated.' })
    }

    const dbUser = dbFindUserById(user.id)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    if (!verifyPassword(currentPassword, dbUser.password_hash)) {
      return NextResponse.json(
        { error: 'Current password is incorrect.' },
        { status: 400 }
      )
    }

    const newHash = hashPassword(newPassword)
    dbUpdateUserPassword(user.id, newHash)
    await createLocalSession(user.id)

    return NextResponse.json({ success: true, message: 'Password updated successfully.' })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 })
  }
}

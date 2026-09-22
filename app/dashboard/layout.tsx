import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import UrgeFloatingButton from '@/components/dashboard/UrgeFloatingButton'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/auth/login')
    }

    // Check if onboarding is completed
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    if (profile && !profile.onboarding_completed) {
      redirect('/onboarding')
    }
  }

  return (
    <div className="flex min-h-dvh bg-bg">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0 overflow-y-auto">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />

      {/* Persistent Urge Button (mobile floating) */}
      <UrgeFloatingButton />
    </div>
  )
}

import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import UrgeFloatingButton from '@/components/dashboard/UrgeFloatingButton'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login?next=/dashboard')
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

import { redirect } from 'next/navigation'
import LandingPage from '@/components/landing/LandingPage'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function RootPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect('/dashboard')
  }

  return <LandingPage />
}

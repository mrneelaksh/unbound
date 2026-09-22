import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/landing/LandingPage'

export default async function RootPage() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      redirect('/dashboard')
    }
  }

  return <LandingPage />
}

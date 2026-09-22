'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { useUserStore } from '@/lib/store'
import { Logo } from '@/components/ui/Logo'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE, staggerChildren: 0.07 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!isSupabaseConfigured()) {
      useUserStore.getState().setUser({ userId: 'demo-user', displayName: email ? email.split('@')[0] : 'Demo User' })
      router.push('/dashboard')
      return
    }

    const supabase = createClient()

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Check if onboarding has been completed
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (profile?.onboarding_completed) {
        router.push('/dashboard')
      } else {
        router.push('/onboarding')
      }
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <motion.div
      className="w-full max-w-[420px] mx-auto px-6 py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Logo */}
      <motion.div variants={itemVariants} className="mb-10 flex items-center justify-start">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <Logo size="md" showWordmark />
        </Link>
      </motion.div>

      {/* Heading */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="font-display text-display-lg text-text mb-2">Welcome back.</h1>
        <p className="text-muted text-sm font-sans">Continue your journey.</p>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email */}
        <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="w-full px-4 py-3 rounded-md text-sm font-sans text-text placeholder:text-subtle
              bg-card border border-white/10
              focus:outline-none focus:border-white/30
              transition-colors duration-200"
          />
        </motion.div>

        {/* Password */}
        <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 pr-11 rounded-md text-sm font-sans text-text placeholder:text-subtle
                bg-card border border-white/10
                focus:outline-none focus:border-white/30
                transition-colors duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-muted transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 px-4 py-3 rounded-md bg-white/[0.04] border border-white/10"
          >
            <AlertCircle size={14} className="shrink-0 text-muted mt-0.5" />
            <p className="text-sm text-muted font-sans">{error}</p>
          </motion.div>
        )}

        {/* Submit */}
        <motion.div variants={itemVariants}>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 rounded-md font-sans text-sm font-semibold tracking-wide
              bg-text text-bg
              hover:bg-white
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Signing in…
              </>
            ) : (
              'SIGN IN'
            )}
          </button>
        </motion.div>
      </form>

      {/* Footer link */}
      <motion.p
        variants={itemVariants}
        className="mt-8 text-center text-sm text-subtle font-sans"
      >
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/signup"
          className="text-muted hover:text-text transition-colors underline underline-offset-2"
        >
          Start your journey
        </Link>
      </motion.p>
    </motion.div>
  )
}

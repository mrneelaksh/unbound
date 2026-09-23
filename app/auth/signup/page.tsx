'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, Loader2, ShieldCheck, Check } from 'lucide-react'
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

export default function SignupPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Password strength checks
  const hasMinLength = password.length >= 8
  const hasNumberOrSymbol = /[\d!@#$%^&*(),.?":{}|<>]/.test(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!firstName.trim()) {
      setError('Please enter your first name.')
      return
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim(),
          password,
          confirmPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to create account. Please try again.')
        setLoading(false)
        return
      }

      // Initialize fresh store strictly in true zero state
      useUserStore.getState().reset()
      useUserStore.getState().setUser({
        userId: data.user.id,
        displayName: firstName.trim(),
        email: email.trim(),
        totalXP: 0,
        currentStreak: 0,
        longestStreak: 0,
        currentLevel: 1,
        activities: [],
        urgeLogs: [],
        completedQuestIds: [],
        unlockedBadgeIds: [],
      })

      router.push('/onboarding')
      router.refresh()
    } catch {
      setError('Network error occurred during signup. Please try again.')
      setLoading(false)
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
        <h1 className="font-display text-display-lg text-text mb-2">Create Account.</h1>
        <p className="text-muted text-sm font-sans">Begin your conscious journey from Day 0.</p>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g. Neelaksh"
            required
            autoComplete="given-name"
            className="w-full px-4 py-3 rounded-md text-sm font-sans text-text placeholder:text-subtle
              bg-card border border-white/10
              focus:outline-none focus:border-white/30
              transition-colors duration-200"
          />
        </motion.div>

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
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
              className="w-full px-4 py-3 pr-11 rounded-md text-sm font-sans text-text placeholder:text-subtle
                bg-card border border-white/10
                focus:outline-none focus:border-white/30
                transition-colors duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-muted transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Real-time strength cues */}
          {password && (
            <div className="flex items-center gap-3 pt-1 font-mono text-[10px]">
              <span className={`flex items-center gap-1 ${hasMinLength ? 'text-[#C7FF72]' : 'text-subtle'}`}>
                <Check size={10} /> 8+ chars
              </span>
              <span className={`flex items-center gap-1 ${hasNumberOrSymbol ? 'text-[#C7FF72]' : 'text-subtle'}`}>
                <Check size={10} /> number/symbol
              </span>
            </div>
          )}
        </motion.div>

        {/* Confirm Password */}
        <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              autoComplete="new-password"
              className="w-full px-4 py-3 pr-11 rounded-md text-sm font-sans text-text placeholder:text-subtle
                bg-card border border-white/10
                focus:outline-none focus:border-white/30
                transition-colors duration-200"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-muted transition-colors cursor-pointer"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 px-4 py-3 rounded-md bg-white/[0.04] border border-red-500/30"
          >
            <AlertCircle size={14} className="shrink-0 text-red-400 mt-0.5" />
            <p className="text-sm text-red-300 font-sans">{error}</p>
          </motion.div>
        )}

        {/* Privacy note */}
        <motion.div
          variants={itemVariants}
          className="flex items-start gap-2.5 px-4 py-3 rounded-md bg-white/[0.03] border border-white/[0.06]"
        >
          <ShieldCheck size={14} className="shrink-0 text-[#C7FF72] mt-0.5" />
          <p className="text-xs text-subtle font-sans leading-relaxed">
            Your data stays private. We never sell or share your personal information.
          </p>
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants}>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 rounded-md font-sans text-sm font-semibold tracking-wide
              bg-text text-bg
              hover:bg-white
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 cursor-pointer
              flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Creating account…
              </>
            ) : (
              'CREATE ACCOUNT'
            )}
          </button>
        </motion.div>
      </form>

      {/* Footer link */}
      <motion.p
        variants={itemVariants}
        className="mt-8 text-center text-sm text-subtle font-sans"
      >
        Already have an account?{' '}
        <Link
          href="/auth/login"
          className="text-white hover:text-[#C7FF72] transition-colors underline underline-offset-2 font-medium"
        >
          Sign in
        </Link>
      </motion.p>
    </motion.div>
  )
}

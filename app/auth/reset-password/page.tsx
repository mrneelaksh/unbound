'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
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

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to reset password.')
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)
    } catch {
      setError('Failed to process reset. Please try again.')
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
        <h1 className="font-display text-display-lg text-text mb-2">Set New Password.</h1>
        <p className="text-muted text-sm font-sans">
          Choose a secure password of at least 8 characters.
        </p>
      </motion.div>

      {success ? (
        <motion.div
          variants={itemVariants}
          className="p-5 rounded-2xl bg-card border border-[#C7FF72]/30 space-y-3 text-center"
        >
          <CheckCircle2 size={24} className="mx-auto text-[#C7FF72]" />
          <h3 className="font-display text-base font-bold text-white">Password Updated!</h3>
          <p className="font-mono text-xs text-muted">
            Redirecting to your dashboard…
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
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
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
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
                  Updating password…
                </>
              ) : (
                'SET NEW PASSWORD'
              )}
            </button>
          </motion.div>
        </form>
      )}
    </motion.div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[420px] mx-auto px-6 py-12 flex justify-center items-center">
          <Loader2 className="animate-spin text-[#C7FF72]" size={28} />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}


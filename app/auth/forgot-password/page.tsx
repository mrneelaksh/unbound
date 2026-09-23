'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [devResetLink, setDevResetLink] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to process request.')
        setLoading(false)
        return
      }

      setSuccessMessage(data.message)
      if (data.devResetLink) {
        setDevResetLink(data.devResetLink)
      }
    } catch {
      setError('Unable to send request. Please try again.')
    } finally {
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
        <h1 className="font-display text-display-lg text-text mb-2">Forgot Password.</h1>
        <p className="text-muted text-sm font-sans">
          Enter your registered email to receive password reset instructions.
        </p>
      </motion.div>

      {successMessage ? (
        <motion.div
          variants={itemVariants}
          className="p-5 rounded-2xl bg-card border border-[#C7FF72]/30 space-y-4"
        >
          <div className="flex items-start gap-3 text-[#C7FF72]">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <p className="font-sans text-xs text-white leading-relaxed">{successMessage}</p>
          </div>

          {devResetLink && (
            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="font-mono text-[10px] text-[#C7FF72] uppercase font-bold">
                Local Development Link:
              </span>
              <Link
                href={devResetLink}
                className="block text-center py-2.5 px-4 rounded-xl bg-[#C7FF72] text-[#050505] font-mono text-xs font-bold hover:bg-[#D5FFA0] transition-colors"
              >
                PROCEED TO RESET PASSWORD
              </Link>
            </div>
          )}

          <div className="pt-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-white transition-colors"
            >
              <ArrowLeft size={12} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  Sending link…
                </>
              ) : (
                'SEND RESET LINK'
              )}
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-white transition-colors"
            >
              <ArrowLeft size={12} />
              <span>Back to Sign In</span>
            </Link>
          </motion.div>
        </form>
      )}
    </motion.div>
  )
}

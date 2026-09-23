'use client'

import React, { useEffect } from 'react'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard Error Boundary caught an error:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 relative z-20">
      <div className="w-full max-w-md p-8 rounded-3xl bg-card/90 backdrop-blur-xl border border-white/10 shadow-card text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
          <AlertCircle size={28} />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-subtle uppercase tracking-wider font-bold">
            RECOVERY SAFEGUARD
          </span>
          <h2 className="font-display text-xl md:text-2xl font-bold text-white tracking-tight">
            Unable to load your dashboard right now.
          </h2>
          <p className="font-sans text-xs text-muted max-w-sm mx-auto leading-relaxed">
            Your progress, XP, and streak data remain completely safe. A temporary telemetry synchronization issue occurred.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#C7FF72] text-[#050505] font-mono text-xs font-bold hover:bg-[#D5FFA0] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(199,255,114,0.3)]"
          >
            <RotateCcw size={14} />
            <span>RETRY</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-semibold transition-all border border-white/10 flex items-center justify-center gap-2"
          >
            <Home size={14} />
            <span>HOME</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

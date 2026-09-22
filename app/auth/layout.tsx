import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">
      {/* Radial background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.045) 0%, transparent 70%)',
        }}
      />
      {/* Secondary subtle glow at bottom */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255,255,255,0.02) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full">{children}</div>
    </div>
  )
}

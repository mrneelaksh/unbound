import type { ReactNode } from 'react'

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Radial gradient — top */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 50% at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 65%)',
        }}
      />
      {/* Radial gradient — bottom subtle */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 40% at 50% 100%, rgba(255,255,255,0.015) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  )
}

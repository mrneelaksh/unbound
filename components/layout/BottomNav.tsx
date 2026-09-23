'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Zap, BarChart2, Footprints, Heart, User,
  BookOpen, Users, Compass, MessageSquare, X, ChevronUp, TrendingUp
} from 'lucide-react'

const PRIMARY_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/activity', icon: Footprints, label: 'Activity' },
  { href: '/urge', icon: Zap, label: 'Reset' },
  { href: '/wellbeing', icon: Heart, label: 'Wellbeing' },
  { href: '/profile', icon: User, label: 'Profile' },
]

const MORE_ITEMS = [
  { href: '/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/progress', icon: TrendingUp, label: 'Progress' },
  { href: '/learn', icon: BookOpen, label: 'Learn' },
  { href: '/community', icon: Users, label: 'Community' },
  { href: '/quests', icon: Compass, label: 'Quests' },
  { href: '/coach', icon: MessageSquare, label: 'AI Coach' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const isMoreActive = MORE_ITEMS.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))

  return (
    <>
      {/* More drawer */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="md:hidden fixed bottom-16 inset-x-0 z-50 bg-[#0B0B0B] border-t border-white/10 px-4 pt-4 pb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">More</span>
              <button onClick={() => setMoreOpen(false)} className="p-1 text-subtle">
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MORE_ITEMS.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors ${isActive ? 'bg-white/8 border-white/15' : 'border-white/8 hover:bg-white/[0.04]'}`}
                  >
                    <item.icon size={18} className={isActive ? 'text-[#C7FF72]' : 'text-subtle'} />
                    <span className={`font-mono text-[9px] ${isActive ? 'text-white font-bold' : 'text-subtle'}`}>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-surface/90 backdrop-blur-xl"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-stretch h-16">
          {PRIMARY_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const isUrge = item.href === '/urge'

            if (isUrge) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex-1 flex flex-col items-center justify-center"
                  aria-label="Start Urge Mode"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 rounded-full bg-[#C7FF72] text-[#050505] flex items-center justify-center shadow-[0_0_20px_rgba(199,255,114,0.35)]"
                  >
                    <item.icon size={20} className="text-[#050505]" />
                  </motion.div>
                </Link>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-1 relative"
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon
                  size={18}
                  className={`transition-colors ${isActive ? 'text-[#C7FF72]' : 'text-subtle'}`}
                />
                <span className={`font-mono text-[9px] tracking-wide transition-colors ${isActive ? 'text-white font-bold' : 'text-subtle'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute top-0 inset-x-[20%] h-[2px] bg-[#C7FF72] rounded-full shadow-[0_0_6px_rgba(199,255,114,0.8)]"
                  />
                )}
              </Link>
            )
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(o => !o)}
            className="flex-1 flex flex-col items-center justify-center gap-1 relative"
            aria-label="More navigation"
          >
            <motion.div animate={{ rotate: moreOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronUp
                size={18}
                className={`transition-colors ${isMoreActive ? 'text-[#C7FF72]' : moreOpen ? 'text-white' : 'text-subtle'}`}
              />
            </motion.div>
            <span className={`font-mono text-[9px] tracking-wide transition-colors ${isMoreActive ? 'text-white font-bold' : moreOpen ? 'text-white' : 'text-subtle'}`}>
              More
            </span>
            {isMoreActive && (
              <motion.div
                layoutId="bottom-nav-indicator"
                className="absolute top-0 inset-x-[20%] h-[2px] bg-[#C7FF72] rounded-full shadow-[0_0_6px_rgba(199,255,114,0.8)]"
              />
            )}
          </button>
        </div>
      </nav>
    </>
  )
}

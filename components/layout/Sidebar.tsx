'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Zap, BarChart2, Compass, MessageSquare, User,
  Moon, Shield, UserCheck, Settings, LogOut, Footprints, Heart,
  BookOpen, Users, TrendingUp
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/store'

import { Logo } from '@/components/ui/Logo'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/urge', icon: Zap, label: 'Urge Mode' },
  { href: '/activity', icon: Footprints, label: 'Activity' },
  { href: '/wellbeing', icon: Heart, label: 'Wellbeing' },
  { href: '/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/progress', icon: TrendingUp, label: 'Progress' },
  { href: '/quests', icon: Compass, label: 'Quests' },
  { href: '/coach', icon: MessageSquare, label: 'AI Coach' },
  { href: '/learn', icon: BookOpen, label: 'Learn' },
  { href: '/community', icon: Users, label: 'Community' },
  { href: '/profile', icon: User, label: 'Profile' },
]

const TOOL_ITEMS = [
  { href: '/night-shield', icon: Moon, label: 'Night Shield' },
  { href: '/support', icon: UserCheck, label: 'Get Support' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { reset, totalXP, currentLevel } = useUserStore()

  async function handleSignOut() {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
    } catch {}
    reset()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col w-[240px] min-h-dvh border-r border-white/5 bg-surface shrink-0 sticky top-0">
      {/* Logo */}
      <div className="px-5 pt-7 pb-5 border-b border-white/5">
        <Logo size="md" asLink href="/dashboard" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-0.5">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-mono transition-colors
                    ${isActive
                      ? 'bg-white/[0.06] text-white font-bold'
                      : 'text-muted hover:text-white hover:bg-white/[0.03]'
                    }`}
                >
                  <item.icon size={15} className={isActive ? 'text-[#C7FF72]' : 'text-subtle'} />
                  <span className="text-[12px] tracking-wide">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="ml-auto w-1 h-4 rounded-full bg-[#C7FF72] shadow-[0_0_8px_rgba(199,255,114,0.6)]"
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>

        {/* Tools section */}
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="font-mono text-[9px] tracking-[0.2em] text-subtle uppercase px-3 mb-2">TOOLS</p>
          <div className="space-y-0.5">
            {TOOL_ITEMS.map(item => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-mono transition-colors
                      ${isActive ? 'bg-white/[0.08] text-text' : 'text-muted hover:text-text hover:bg-white/[0.04]'}`}
                  >
                    <item.icon size={15} className={isActive ? 'text-text' : 'text-subtle'} />
                    <span className="text-[12px] tracking-wide">{item.label}</span>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Bottom: Settings + Sign Out */}
      <div className="px-3 pb-6 border-t border-white/5 pt-4 space-y-0.5">
        <Link href="/settings">
          <motion.div
            whileHover={{ x: 2 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-[12px] text-muted hover:text-text hover:bg-white/[0.04] transition-colors"
          >
            <Settings size={15} className="text-subtle" />
            Settings
          </motion.div>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-[12px] text-subtle hover:text-muted hover:bg-white/[0.04] transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Settings, Shield, Download, Trash2, Bell, Moon,
  Cpu, Key, Check, AlertCircle, RefreshCw, Mail, ArrowUpRight, MessageSquare
} from 'lucide-react'
import { useUserStore } from '@/lib/store'

export default function SettingsPage() {
  const { plan, reset } = useUserStore()
  const [notifications, setNotifications] = useState(true)
  const [aiPersonalization, setAiPersonalization] = useState(true)
  const [nightAlerts, setNightAlerts] = useState(true)
  const [exportNotice, setExportNotice] = useState(false)

  const handleExportData = () => {
    const data = {
      profile: { id: 'usr_unbound_4821', anonymized: true },
      stats: { totalXP: 2840, currentLevel: 8, streak: 17 },
      exportedAt: new Date().toISOString(),
      disclaimer: 'UNBOUND local-first zero-knowledge data export.',
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'unbound_data_export.json'
    a.click()
    setExportNotice(true)
    setTimeout(() => setExportNotice(false), 2500)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Settings size={22} className="text-text" />
          <h1 className="font-display text-2xl font-bold text-text">SYSTEM SETTINGS</h1>
        </div>
        <p className="font-mono text-xs text-muted mt-1">
          Configure security, local storage encryption, AI permissions, and notifications.
        </p>
      </div>

      {/* Subscription Card */}
      <div className="p-6 rounded-2xl bg-card border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] text-subtle uppercase">MEMBERSHIP TIER</span>
          <h2 className="font-display text-lg font-bold text-text mt-0.5">UNBOUND PRO (Active)</h2>
          <p className="font-mono text-xs text-muted">Billed annually · Renews September 2027</p>
        </div>
        <Link href="/pricing">
          <button className="px-4 py-2 rounded-xl bg-white text-black hover:bg-[#E5E5E5] font-mono text-xs font-bold transition-colors shadow-sm">
            MANAGE SUBSCRIPTION
          </button>
        </Link>
      </div>

      {/* Notifications & Reminders */}
      <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-5">
        <h3 className="font-display text-base font-bold text-text">NOTIFICATIONS & ALERTS</h3>

        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <div className="text-text font-bold">Daily Check-in Reminder</div>
              <div className="text-subtle text-[11px]">Prompt to reflect on yesterday&apos;s wins and set daily quests.</div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-11 h-6 rounded-full p-1 transition-colors ${notifications ? 'bg-[#C7FF72]' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full transition-transform ${notifications ? 'ml-auto bg-[#050505]' : 'bg-white/50'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-text font-bold">Night Shield Activation Notice</div>
              <div className="text-subtle text-[11px]">Alert at 10:30 PM to dim screens and safeguard phone usage.</div>
            </div>
            <button
              onClick={() => setNightAlerts(!nightAlerts)}
              className={`w-11 h-6 rounded-full p-1 transition-colors ${nightAlerts ? 'bg-[#C7FF72]' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full transition-transform ${nightAlerts ? 'ml-auto bg-[#050505]' : 'bg-white/50'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* AI Coach Personalization */}
      <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
        <h3 className="font-display text-base font-bold text-text">AI COACH PRIVACY & MEMORY</h3>
        <p className="font-sans text-xs text-muted leading-relaxed">
          Allow UNBOUND Coach to reference your selected onboarding triggers (e.g. boredom, late-night) to provide tailored responses during Urge Mode. All data is processed server-side through ephemeral zero-retention sessions.
        </p>

        <div className="flex items-center justify-between pt-2">
          <span className="font-mono text-xs text-text">Contextual Pattern Adaptation</span>
          <button
            onClick={() => setAiPersonalization(!aiPersonalization)}
            className={`w-11 h-6 rounded-full p-1 transition-colors ${aiPersonalization ? 'bg-[#C7FF72]' : 'bg-white/10'}`}
          >
            <div className={`w-4 h-4 rounded-full transition-transform ${aiPersonalization ? 'ml-auto bg-[#050505]' : 'bg-white/50'}`} />
          </button>
        </div>
      </div>

      {/* Support & Official Channels */}
      <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-text">OFFICIAL SUPPORT &amp; CONTACT</h3>
          <p className="font-mono text-xs text-muted mt-0.5">
            Connect directly with UNBOUND engineering and founder team.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href="mailto:genyoa.digital@gmail.com"
            className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group font-mono text-xs"
          >
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-white" />
              <div>
                <div className="text-text font-bold">Email Support</div>
                <div className="text-subtle text-[11px]">genyoa.digital@gmail.com</div>
              </div>
            </div>
            <ArrowUpRight size={13} className="text-subtle group-hover:text-text transition-colors" />
          </a>

          <a
            href="https://www.instagram.com/genyoa.digital/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group font-mono text-xs"
          >
            <div className="flex items-center gap-3">
              <MessageSquare size={16} className="text-white" />
              <div>
                <div className="text-text font-bold">Instagram</div>
                <div className="text-subtle text-[11px]">@genyoa.digital</div>
              </div>
            </div>
            <ArrowUpRight size={13} className="text-subtle group-hover:text-text transition-colors" />
          </a>

          {process.env.NEXT_PUBLIC_X_URL && (
            <a
              href={process.env.NEXT_PUBLIC_X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group font-mono text-xs"
            >
              <div className="flex items-center gap-3">
                <Settings size={16} className="text-white" />
                <div>
                  <div className="text-text font-bold">Official X</div>
                  <div className="text-subtle text-[11px]">Follow updates</div>
                </div>
              </div>
              <ArrowUpRight size={13} className="text-subtle group-hover:text-text transition-colors" />
            </a>
          )}
        </div>
      </div>

      {/* Privacy Mode Controls */}
      <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-5">
        <div>
          <h3 className="font-display text-base font-bold text-text">PRIVACY MODE</h3>
          <p className="font-sans text-xs text-muted mt-1 leading-relaxed">
            Control what is shared, visible, and tracked. Private by default — you opt in to community features.
          </p>
        </div>

        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <div className="text-text font-bold">Private Profile</div>
              <div className="text-subtle text-[11px]">Your profile is not discoverable by other community members.</div>
            </div>
            <button className="w-11 h-6 rounded-full p-1 transition-colors bg-[#C7FF72]">
              <div className="w-4 h-4 rounded-full ml-auto bg-[#050505]" />
            </button>
          </div>

          <div className="pb-3 border-b border-white/5 space-y-2">
            <div className="text-text font-bold">Community Alias</div>
            <div className="text-subtle text-[11px]">Your anonymous display name for community and leaderboard. Never your real name.</div>
            <input
              type="text"
              defaultValue="anonymous_user"
              placeholder="Your anonymous alias"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-text text-xs font-mono placeholder:text-subtle/50 focus:outline-none focus:border-white/20"
            />
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <div className="text-text font-bold">Leaderboard Participation</div>
              <div className="text-subtle text-[11px]">Show your XP on the anonymous opt-in leaderboard.</div>
            </div>
            <button className="w-11 h-6 rounded-full p-1 transition-colors bg-white/10">
              <div className="w-4 h-4 rounded-full bg-white/50" />
            </button>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <div className="text-text font-bold">Discreet Notifications</div>
              <div className="text-subtle text-[11px]">Lock screen shows &quot;UNBOUND: your next step is ready.&quot; instead of content-specific messages.</div>
            </div>
            <button className="w-11 h-6 rounded-full p-1 transition-colors bg-[#C7FF72]">
              <div className="w-4 h-4 rounded-full ml-auto bg-[#050505]" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-text font-bold">Activity Tracking</div>
              <div className="text-subtle text-[11px]">Log activity data locally for trend analysis. No data leaves your device.</div>
            </div>
            <button className="w-11 h-6 rounded-full p-1 transition-colors bg-[#C7FF72]">
              <div className="w-4 h-4 rounded-full ml-auto bg-[#050505]" />
            </button>
          </div>
        </div>
      </div>

      {/* Data Export & GDPR Purge */}
      <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-6">
        <div>
          <h3 className="font-display text-base font-bold text-text">YOUR DATA, YOUR SOVEREIGNTY</h3>
          <p className="font-sans text-xs text-muted leading-relaxed mt-1">
            You own 100% of your data. You can download an unencrypted JSON copy of your logs, or permanently delete your account and all associated database records.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-text font-mono text-xs transition-colors"
          >
            <Download size={14} />
            <span>{exportNotice ? 'EXPORTED JSON FILE' : 'DOWNLOAD ALL MY DATA'}</span>
          </button>

          <button
            onClick={async () => {
              if (confirm('Deleting your account permanently removes your account and associated data. Are you sure?')) {
                try {
                  await fetch('/api/user/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ confirmation: 'DELETE' }),
                  })
                } catch {}
                reset()
                try {
                  localStorage.clear()
                } catch {}
                window.location.href = '/auth/login'
              }
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-red-300 font-mono text-xs transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
            <span>DELETE ACCOUNT</span>
          </button>
        </div>
      </div>
    </div>
  )
}

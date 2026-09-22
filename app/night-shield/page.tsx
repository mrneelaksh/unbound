'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Moon, Shield, Clock, BookOpen, Music, Bed, Sparkles,
  CheckCircle, AlertCircle
} from 'lucide-react'

export default function NightShieldPage() {
  const [enabled, setEnabled] = useState(true)
  const [startTime, setStartTime] = useState('22:30')
  const [endTime, setEndTime] = useState('06:30')
  const [activeMode, setActiveMode] = useState<'sleep' | 'focus' | 'read' | 'music'>('sleep')
  const [savedNotice, setSavedNotice] = useState(false)

  const modes = [
    {
      id: 'sleep',
      title: 'Sleep Sanctum',
      desc: 'Dim interface, zero notifications, guided 4-7-8 twilight breathing pacer.',
      icon: Bed,
    },
    {
      id: 'focus',
      title: 'Deep Focus',
      desc: 'Single-task timer with phone-away enforcement and zero distraction tabs.',
      icon: Shield,
    },
    {
      id: 'read',
      title: 'Night Reading',
      desc: 'Warm sepia text display for e-books or Kindle synchronizing.',
      icon: BookOpen,
    },
    {
      id: 'music',
      title: 'Binaural & Ambient',
      desc: 'Alpha & theta wave auditory stimulation to quiet active racing thoughts.',
      icon: Music,
    },
  ]

  const handleSave = () => {
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Moon size={22} className="text-text" />
            <h1 className="font-display text-2xl font-bold text-text">NIGHT SHIELD</h1>
          </div>
          <p className="font-mono text-xs text-muted mt-1">
            Safeguarding your high-risk temporal window with low-stimulation protection.
          </p>
        </div>

        <button
          onClick={() => setEnabled(!enabled)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs transition-all ${
            enabled
              ? 'bg-text text-bg font-bold shadow-glow-soft'
              : 'bg-card border border-white/20 text-muted'
          }`}
        >
          <Shield size={14} />
          <span>{enabled ? 'SHIELD ENGAGED' : 'SHIELD DISABLED'}</span>
        </button>
      </div>

      {/* Main Configuration Card */}
      <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-bold text-text">HIGH-RISK DEFENSE WINDOW</h2>
            <p className="font-mono text-xs text-muted mt-0.5">
              Automatically triggers calm mode and distraction safeguards when the clock strikes your vulnerability window.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10">
              <Clock size={13} className="text-subtle" />
              <span>START:</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-transparent text-text border-none focus:outline-none"
              />
            </div>
            <span className="text-subtle">→</span>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10">
              <span>END:</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-transparent text-text border-none focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Protection Modes */}
        <div className="space-y-3 pt-2">
          <label className="font-mono text-xs uppercase tracking-wider text-subtle block">
            DEFAULT NIGHT MODE PROTOCOL
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {modes.map((m) => {
              const Icon = m.icon
              const isSelected = activeMode === m.id
              return (
                <div
                  key={m.id}
                  onClick={() => setActiveMode(m.id as any)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white/10 border-white/40 text-text'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-white text-black' : 'bg-white/5 text-muted'}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-text">{m.title}</h3>
                      <p className="font-sans text-xs text-subtle mt-0.5">{m.desc}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-white/5">
          <span className="font-mono text-[10px] text-subtle">
            Settings persist locally to your device encryption storage.
          </span>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-text text-bg font-mono text-xs font-bold hover:opacity-90 transition-opacity"
          >
            {savedNotice ? <CheckCircle size={14} /> : <Sparkles size={14} />}
            <span>{savedNotice ? 'SAVED' : 'SAVE PROTOCOL'}</span>
          </button>
        </div>
      </div>

      {/* Extension & Transparency Notice */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-text font-display text-sm font-bold">
          <AlertCircle size={16} className="text-muted" />
          <span>TRANSPARENT SYSTEM ARCHITECTURE</span>
        </div>
        <p className="font-sans text-xs text-muted leading-relaxed">
          UNBOUND never installs hidden surveillance or covert tracking software. In-app Night Shield provides an active visual, behavioral, and auditory distraction barrier. For system-wide DNS or browser blocking, the optional UNBOUND Companion Extension can be paired with your device under your explicit control.
        </p>
      </div>
    </div>
  )
}

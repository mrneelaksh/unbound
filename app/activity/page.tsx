'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Footprints, Play, Square, Pause, RotateCcw,
  Sparkles, Award, ArrowLeft, Plus, CheckCircle, Info, Smartphone
} from 'lucide-react'
import Link from 'next/link'
import { CinematicStarfield } from '@/components/ui/CinematicStarfield'
import { useUserStore, type ActivityRecord } from '@/lib/store'

export default function ActivityPage() {
  const { activities, logActivity, plan } = useUserStore()

  // Live session state
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [activityType, setActivityType] = useState<'walk' | 'run'>('run')
  const [seconds, setSeconds] = useState(0)
  const [distanceKm, setDistanceKm] = useState(0)
  const [steps, setSteps] = useState(0)
  const [geoWatchId, setGeoWatchId] = useState<number | null>(null)
  const [lastPos, setLastPos] = useState<{ lat: number; lng: number } | null>(null)
  const [completedSummary, setCompletedSummary] = useState<ActivityRecord | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)

  // Manual log state
  const [showManual, setShowManual] = useState(false)
  const [manualType, setManualType] = useState<'walk' | 'run'>('walk')
  const [manualDuration, setManualDuration] = useState('20')
  const [manualDistance, setManualDistance] = useState('1.5')
  const [manualSteps, setManualSteps] = useState('2200')

  useEffect(() => {
    // Detect desktop vs mobile device
    if (typeof window !== 'undefined') {
      setIsDesktop(window.innerWidth >= 768)
    }
  }, [])

  // Timer loop
  useEffect(() => {
    let interval: any = null
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isRunning, isPaused])

  // GPS distance calculation
  const startGpsTracking = () => {
    if ('geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
          if (lastPos) {
            // Haversine distance
            const R = 6371 // km
            const dLat = ((lat - lastPos.lat) * Math.PI) / 180
            const dLng = ((lng - lastPos.lng) * Math.PI) / 180
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((lastPos.lat * Math.PI) / 180) *
                Math.cos((lat * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            const deltaKm = R * c
            if (deltaKm > 0.005 && deltaKm < 0.1) {
              setDistanceKm((prev) => Number((prev + deltaKm).toFixed(2)))
              // Estimate steps: ~1300 steps per km for running, ~1400 for walking
              const stepFactor = activityType === 'run' ? 1300 : 1400
              setSteps((prev) => Math.round(prev + deltaKm * stepFactor))
            }
          }
          setLastPos({ lat, lng })
        },
        () => {
          // GPS denied or failed — fallback timer-based simulation
        },
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
      )
      setGeoWatchId(id)
    }
  }

  const stopGpsTracking = () => {
    if (geoWatchId !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(geoWatchId)
      setGeoWatchId(null)
    }
    setLastPos(null)
  }

  const handleStart = (type: 'walk' | 'run') => {
    setActivityType(type)
    setSeconds(0)
    setDistanceKm(0)
    setSteps(0)
    setIsRunning(true)
    setIsPaused(false)
    startGpsTracking()
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const handleFinish = () => {
    stopGpsTracking()
    setIsRunning(false)
    setIsPaused(false)

    // Calculate final metrics
    const durationMinutes = Math.max(1, Math.round(seconds / 60))
    // Fallback if GPS was stationary
    const finalDistance = distanceKm > 0 ? distanceKm : activityType === 'run' ? Number(((durationMinutes * 0.12)).toFixed(2)) : Number(((durationMinutes * 0.07)).toFixed(2))
    const finalSteps = steps > 0 ? steps : Math.round(finalDistance * (activityType === 'run' ? 1300 : 1400))
    const paceMin = finalDistance > 0 ? (durationMinutes / finalDistance).toFixed(1) : '8:30'
    const pace = `${paceMin} / km`
    const calories = Math.round(finalDistance * (activityType === 'run' ? 65 : 45))
    const xpEarned = activityType === 'run' ? 80 : 20

    const record = {
      type: activityType,
      date: new Date().toISOString().split('T')[0],
      durationMinutes,
      distanceKm: finalDistance,
      steps: finalSteps,
      pace,
      calories,
      xpEarned,
    }

    logActivity(record)
    setCompletedSummary({
      ...record,
      id: `act-${Date.now()}`,
      timestamp: Date.now(),
    })
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const durationMinutes = Number(manualDuration) || 15
    const finalDistance = Number(manualDistance) || 1.2
    const finalSteps = Number(manualSteps) || 1600
    const pace = `${(durationMinutes / finalDistance).toFixed(1)} / km`
    const calories = Math.round(finalDistance * (manualType === 'run' ? 65 : 45))
    const xpEarned = manualType === 'run' ? 80 : 20

    const record = {
      type: manualType,
      date: new Date().toISOString().split('T')[0],
      durationMinutes,
      distanceKm: finalDistance,
      steps: finalSteps,
      pace,
      calories,
      xpEarned,
    }

    logActivity(record)
    setShowManual(false)
    setCompletedSummary({
      ...record,
      id: `act-${Date.now()}`,
      timestamp: Date.now(),
    })
  }

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Computed summary totals
  const totalKm = activities.reduce((acc, a) => acc + a.distanceKm, 0)
  const totalSteps = activities.reduce((acc, a) => acc + a.steps, 0)
  const totalMinutes = activities.reduce((acc, a) => acc + a.durationMinutes, 0)

  return (
    <div className="relative max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      <CinematicStarfield variant="PROGRESS" intensity="subtle" opacity={0.65} />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Footprints size={22} className="text-text" />
            <h1 className="font-display text-2xl font-bold text-text">PHYSICAL ACTIVITY</h1>
          </div>
          <p className="font-mono text-xs text-muted mt-1">
            Restore dopamine sensitivity through real-world movement and outdoor exercise.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowManual(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-white/10 text-muted hover:text-text font-mono text-xs transition-colors"
          >
            <Plus size={14} />
            <span>MANUAL LOG</span>
          </button>
        </div>
      </div>

      {/* Advisory Banner for Desktop */}
      {isDesktop && (
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-start gap-3">
          <Smartphone size={16} className="text-muted shrink-0 mt-0.5" />
          <p className="font-sans text-xs text-muted leading-relaxed">
            Live GPS and pedometer sensors are best experienced on mobile devices. You can start a live timer here or log completed walks and runs using the <strong>Manual Log</strong> button.
          </p>
        </div>
      )}

      {/* Live Tracker Card */}
      {!isRunning ? (
        <div className="p-8 rounded-3xl bg-card border border-white/10 text-center space-y-6 shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/15 flex items-center justify-center mx-auto text-text">
            <Footprints size={28} />
          </div>

          <div className="space-y-1">
            <h2 className="font-display text-xl font-bold text-text">START LIVE MOVEMENT</h2>
            <p className="font-mono text-xs text-muted">
              Choose your workout. Movement immediately clears mental fog and resets impulse tension.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => handleStart('walk')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Play size={14} />
              <span>START WALK (+20 XP)</span>
            </button>

            <button
              onClick={() => handleStart('run')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#C7FF72] text-[#050505] hover:bg-[#D5FFA0] font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(199,255,114,0.18)]"
            >
              <Play size={14} />
              <span>START RUN (+80 XP)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Running Display */
        <div className="p-8 rounded-3xl bg-card border border-white/20 space-y-8 shadow-card text-center relative overflow-hidden">
          <div className="absolute top-4 left-6">
            <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-text border border-white/15 uppercase tracking-wider animate-pulse">
              LIVE {activityType}
            </span>
          </div>

          <div className="pt-6 space-y-2">
            <div className="font-numbers text-5xl md:text-6xl font-bold text-text tracking-tight">
              {formatTime(seconds)}
            </div>
            <p className="font-mono text-xs text-subtle uppercase">ELAPSED TIME</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
            <div className="space-y-0.5">
              <span className="font-mono text-[10px] text-subtle uppercase">DISTANCE</span>
              <div className="font-numbers text-2xl font-bold text-text">
                {distanceKm > 0 ? distanceKm.toFixed(2) : '0.00'} KM
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="font-mono text-[10px] text-subtle uppercase">STEPS</span>
              <div className="font-numbers text-2xl font-bold text-text">
                {steps.toLocaleString()}
              </div>
            </div>

            <div className="space-y-0.5 col-span-2 md:col-span-1">
              <span className="font-mono text-[10px] text-subtle uppercase">ESTIMATED XP</span>
              <div className="font-numbers text-2xl font-bold text-white">
                +{activityType === 'run' ? 80 : 20} XP
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={handlePause}
              className="px-6 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-text font-mono text-xs transition-colors flex items-center gap-2"
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
              <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
            </button>

            <button
              onClick={handleFinish}
              className="px-8 py-3 rounded-xl bg-white text-black hover:bg-[#E5E5E5] active:bg-[#CCCCCC] font-mono text-xs font-bold transition-colors flex items-center gap-2"
            >
              <Square size={14} />
              <span>FINISH WORKOUT</span>
            </button>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      <AnimatePresence>
        {completedSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-card border border-white/20 text-center space-y-6 shadow-2xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#C7FF72] text-[#050505] flex items-center justify-center mx-auto">
                <CheckCircle size={28} />
              </div>

              <div className="space-y-1">
                <h3 className="font-display text-xl font-bold text-text uppercase">
                  {completedSummary.type} COMPLETE
                </h3>
                <p className="font-mono text-xs text-muted">
                  Your physical activity has been logged and your mind reset.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-center">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[10px] text-subtle">DISTANCE</span>
                  <div className="font-numbers text-lg font-bold text-text">
                    {completedSummary.distanceKm} KM
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[10px] text-subtle">STEPS</span>
                  <div className="font-numbers text-lg font-bold text-text">
                    {completedSummary.steps.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#C7FF72]/10 border border-[#C7FF72]/20 font-mono text-sm font-bold text-[#C7FF72] flex items-center justify-center gap-2">
                <Sparkles size={16} />
                <span>+{completedSummary.xpEarned} RECOVERY XP EARNED</span>
              </div>

              <button
                onClick={() => setCompletedSummary(null)}
                className="w-full py-3 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-[#E5E5E5] transition-colors"
              >
                RETURN TO DASHBOARD
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Log Modal */}
      <AnimatePresence>
        {showManual && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-card border border-white/20 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-display text-base font-bold text-text">MANUAL ACTIVITY LOG</h3>
                <button
                  onClick={() => setShowManual(false)}
                  className="font-mono text-xs text-subtle hover:text-text"
                >
                  CANCEL
                </button>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4 font-mono text-xs">
                <div className="space-y-1.5">
                  <label className="text-subtle">ACTIVITY TYPE</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setManualType('walk')}
                      className={`p-2.5 rounded-xl border text-center transition-colors ${
                        manualType === 'walk'
                          ? 'bg-white text-black font-bold border-white'
                          : 'bg-white/[0.02] border-white/10 text-muted'
                      }`}
                    >
                      WALK (+20 XP)
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualType('run')}
                      className={`p-2.5 rounded-xl border text-center transition-colors ${
                        manualType === 'run'
                          ? 'bg-[#C7FF72] text-[#050505] font-bold border-[#C7FF72]'
                          : 'bg-white/[0.02] border-white/10 text-muted'
                      }`}
                    >
                      RUN (+80 XP)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-subtle">DURATION (MINUTES)</label>
                  <input
                    type="number"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(e.target.value)}
                    required
                    min="1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-text focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-subtle">DISTANCE (KM)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualDistance}
                    onChange={(e) => setManualDistance(e.target.value)}
                    required
                    min="0.1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-text focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-subtle">ESTIMATED STEPS</label>
                  <input
                    type="number"
                    value={manualSteps}
                    onChange={(e) => setManualSteps(e.target.value)}
                    required
                    min="100"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-text focus:outline-none focus:border-white/30"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl bg-[#C7FF72] text-[#050505] font-bold hover:bg-[#D5FFA0] transition-colors shadow-[0_0_20px_rgba(199,255,114,0.18)]"
                >
                  SAVE WORKOUT
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Aggregate Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-white/10 space-y-1">
          <span className="font-mono text-[10px] text-subtle uppercase">TOTAL DISTANCE</span>
          <div className="font-numbers text-3xl font-bold text-text">
            {totalKm > 0 ? totalKm.toFixed(2) : '0.00'} KM
          </div>
          <p className="font-mono text-[10px] text-muted">Accumulated active movement</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-white/10 space-y-1">
          <span className="font-mono text-[10px] text-subtle uppercase">TOTAL STEPS</span>
          <div className="font-numbers text-3xl font-bold text-text">
            {totalSteps.toLocaleString()}
          </div>
          <p className="font-mono text-[10px] text-muted">Real registered footsteps</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-white/10 space-y-1">
          <span className="font-mono text-[10px] text-subtle uppercase">ACTIVE DURATION</span>
          <div className="font-numbers text-3xl font-bold text-text">
            {totalMinutes} MIN
          </div>
          <p className="font-mono text-[10px] text-muted">Mind-clearing physical resets</p>
        </div>
      </div>

      {/* Activity History List */}
      <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-4">
        <h3 className="font-display text-base font-bold text-text">RECENT SESSIONS</h3>

        {activities.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Footprints size={24} className="mx-auto text-subtle" />
            <p className="font-mono text-xs text-muted">
              Your first activity will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.slice(0, 8).map((act) => (
              <div
                key={act.id}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between font-mono text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-text uppercase font-bold text-[10px]">
                    {act.type === 'run' ? 'RUN' : 'WALK'}
                  </div>
                  <div>
                    <div className="text-text font-bold">
                      {act.distanceKm} km · {act.durationMinutes} min
                    </div>
                    <div className="text-subtle text-[10px]">
                      {act.steps.toLocaleString()} steps · {act.date}
                    </div>
                  </div>
                </div>

                <div className="text-white font-bold text-xs">
                  +{act.xpEarned} XP
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

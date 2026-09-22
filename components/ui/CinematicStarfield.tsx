'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'

export type StarfieldVariant =
  | 'LANDING'
  | 'DASHBOARD'
  | 'PROGRESS'
  | 'LEVEL_UP'
  | 'WELLBEING'
  | 'URGE_MODE'
  | 'COACH'

export interface CinematicStarfieldProps {
  variant?: StarfieldVariant
  intensity?: 'subtle' | 'medium' | 'deep'
  density?: number // Multiplier, default 1
  parallax?: boolean
  glow?: boolean
  speed?: number // Multiplier, default 1
  opacity?: number // 0 to 1, default 1
  className?: string
}

interface Star {
  x: number
  y: number
  z: number // Depth layer: 1 (distant), 2 (mid), 3 (foreground)
  radius: number
  baseAlpha: number
  twinkleSpeed: number
  twinklePhase: number
  color: string
}

export function CinematicStarfield({
  variant = 'DASHBOARD',
  intensity = 'medium',
  density = 1,
  parallax = true,
  glow = true,
  speed = 1,
  opacity = 1,
  className = '',
}: CinematicStarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })
  const [reducedMotion, setReducedMotion] = useState(false)

  // Configure variant-specific parameters
  const config = useMemo(() => {
    switch (variant) {
      case 'URGE_MODE':
        // Deep, serene, slower, meditative with calming cyan/green undertone
        return {
          starCount: Math.round(90 * density),
          speedFactor: 0.25 * speed,
          nebulaOpacity: 0.12,
          glowSize: 1.4,
          driftAngle: 0.05,
          colorPalette: ['#FFFFFF', '#C5C5C5', '#C7FF72', '#E0F7D4'],
        }
      case 'WELLBEING':
        // Atmospheric, orbital, cosmic living-system backdrop
        return {
          starCount: Math.round(140 * density),
          speedFactor: 0.4 * speed,
          nebulaOpacity: 0.18,
          glowSize: 1.6,
          driftAngle: 0.1,
          colorPalette: ['#FFFFFF', '#C7FF72', '#A8EA5D', '#D0D0D0'],
        }
      case 'PROGRESS':
        // Crisp, constellation-supporting stars
        return {
          starCount: Math.round(150 * density),
          speedFactor: 0.5 * speed,
          nebulaOpacity: 0.15,
          glowSize: 1.5,
          driftAngle: 0.08,
          colorPalette: ['#FFFFFF', '#F0F0F0', '#C7FF72', '#858585'],
        }
      case 'LEVEL_UP':
        // Dynamic, cinematic, higher brightness and twinkle
        return {
          starCount: Math.round(180 * density),
          speedFactor: 0.8 * speed,
          nebulaOpacity: 0.22,
          glowSize: 2.0,
          driftAngle: 0.15,
          colorPalette: ['#FFFFFF', '#C7FF72', '#A8EA5D', '#FFFFFF'],
        }
      case 'LANDING':
        // Grand, deep Milky Way presence
        return {
          starCount: Math.round(160 * density),
          speedFactor: 0.45 * speed,
          nebulaOpacity: 0.2,
          glowSize: 1.6,
          driftAngle: 0.06,
          colorPalette: ['#FFFFFF', '#C5C5C5', '#E5E5E5', '#C7FF72'],
        }
      case 'COACH':
        // Minimal, calm, unobtrusive
        return {
          starCount: Math.round(100 * density),
          speedFactor: 0.3 * speed,
          nebulaOpacity: 0.1,
          glowSize: 1.3,
          driftAngle: 0.04,
          colorPalette: ['#FFFFFF', '#C5C5C5', '#858585'],
        }
      case 'DASHBOARD':
      default:
        // Balanced editorial depth
        return {
          starCount: Math.round(130 * density),
          speedFactor: 0.4 * speed,
          nebulaOpacity: 0.14,
          glowSize: 1.5,
          driftAngle: 0.07,
          colorPalette: ['#FFFFFF', '#C5C5C5', '#858585', '#C7FF72'],
        }
    }
  }, [variant, density, speed])

  // Check for prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setReducedMotion(mediaQuery.matches)
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [])

  // Mouse move handler for subtle parallax
  useEffect(() => {
    if (!parallax || reducedMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      // Normalize to -1 to 1
      mouseRef.current.targetX = (e.clientX / innerWidth - 0.5) * 20
      mouseRef.current.targetY = (e.clientY / innerHeight - 0.5) * 20
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [parallax, reducedMotion])

  // Canvas starfield simulation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      initStars()
    }
    window.addEventListener('resize', handleResize)

    // Generate stars across 3 depth layers
    let stars: Star[] = []
    const initStars = () => {
      stars = []
      const count = config.starCount
      for (let i = 0; i < count; i++) {
        // z-layer: 1 (far, tiny, slow), 2 (mid), 3 (near, brighter)
        const randZ = Math.random()
        const z = randZ < 0.6 ? 1 : randZ < 0.9 ? 2 : 3
        const radius = z === 1 ? Math.random() * 0.7 + 0.3 : z === 2 ? Math.random() * 0.9 + 0.6 : Math.random() * 1.3 + 1.0
        const baseAlpha = z === 1 ? Math.random() * 0.4 + 0.2 : z === 2 ? Math.random() * 0.5 + 0.35 : Math.random() * 0.6 + 0.4

        const color = config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)]

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z,
          radius,
          baseAlpha,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          color,
        })
      }
    }
    initStars()

    let lastTime = performance.now()

    // Draw nebula clouds (Milky-Way diffuse dust)
    const drawNebula = (offsetX: number, offsetY: number) => {
      if (!glow) return

      // Primary diagonal Milky Way band
      const grad = ctx.createLinearGradient(
        0 + offsetX * 0.5,
        0 + offsetY * 0.5,
        width + offsetX * 0.5,
        height + offsetY * 0.5
      )
      grad.addColorStop(0, 'rgba(5, 10, 15, 0)')
      grad.addColorStop(0.35, `rgba(20, 26, 32, ${config.nebulaOpacity * 0.4})`)
      grad.addColorStop(0.5, `rgba(199, 255, 114, ${config.nebulaOpacity * 0.05})`)
      grad.addColorStop(0.65, `rgba(25, 30, 45, ${config.nebulaOpacity * 0.5})`)
      grad.addColorStop(1, 'rgba(5, 10, 15, 0)')

      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      // Diffuse soft cosmic dust clouds
      const radialGrad = ctx.createRadialGradient(
        width * 0.55 + offsetX,
        height * 0.4 + offsetY,
        50,
        width * 0.55 + offsetX,
        height * 0.4 + offsetY,
        Math.min(width, height) * 0.6
      )
      radialGrad.addColorStop(0, `rgba(255, 255, 255, ${config.nebulaOpacity * 0.06})`)
      radialGrad.addColorStop(0.5, `rgba(199, 255, 114, ${config.nebulaOpacity * 0.02})`)
      radialGrad.addColorStop(1, 'transparent')

      ctx.fillStyle = radialGrad
      ctx.fillRect(0, 0, width, height)
    }

    const render = (time: number) => {
      const delta = (time - lastTime) / 1000
      lastTime = time

      // Smooth mouse parallax lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05

      ctx.clearRect(0, 0, width, height)

      // 1. Draw diffuse nebula band
      drawNebula(mouseRef.current.x, mouseRef.current.y)

      // 2. Render and drift stars
      const driftSpeed = reducedMotion ? 0 : config.speedFactor * 6 * delta
      const parallaxFactor = reducedMotion ? 0 : 0.6

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i]

        // Drift slowly upwards and slightly diagonal
        if (!reducedMotion) {
          star.y -= driftSpeed * (star.z * 0.5)
          star.x += driftSpeed * config.driftAngle * (star.z * 0.5)
          star.twinklePhase += star.twinkleSpeed

          // Wrap edges
          if (star.y < 0) {
            star.y = height
            star.x = Math.random() * width
          }
          if (star.x > width) {
            star.x = 0
          }
        }

        // Parallax position offset based on z-depth
        const px = star.x + mouseRef.current.x * (star.z * 0.03 * parallaxFactor)
        const py = star.y + mouseRef.current.y * (star.z * 0.03 * parallaxFactor)

        // Calculate opacity with gentle sinusoidal twinkling
        const twinkle = Math.sin(star.twinklePhase) * 0.25 + 0.75
        const currentAlpha = Math.min(1, Math.max(0.1, star.baseAlpha * twinkle))

        ctx.save()
        ctx.globalAlpha = currentAlpha

        // Soft star core
        ctx.beginPath()
        ctx.arc(px, py, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = star.color
        ctx.fill()

        // Occasional halo glow for prominent stars (Layer 3)
        if (glow && star.z === 3 && star.radius > 1.2) {
          ctx.beginPath()
          ctx.arc(px, py, star.radius * config.glowSize * 2, 0, Math.PI * 2)
          ctx.fillStyle = star.color === '#C7FF72' ? 'rgba(199, 255, 114, 0.15)' : 'rgba(255, 255, 255, 0.1)'
          ctx.fill()
        }

        ctx.restore()
      }

      if (!reducedMotion) {
        animationFrameId = requestAnimationFrame(render)
      }
    }

    if (reducedMotion) {
      // Single static render pass for reduced motion
      render(performance.now())
    } else {
      animationFrameId = requestAnimationFrame(render)
    }

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [config, glow, parallax, reducedMotion])

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden select-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          filter: intensity === 'deep' ? 'contrast(1.15)' : 'none',
        }}
      />
    </div>
  )
}

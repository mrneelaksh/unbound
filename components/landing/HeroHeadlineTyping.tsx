'use client'

import { useState, useEffect, useRef } from 'react'

interface HeroHeadlineTypingProps {
  onComplete?: () => void
  startDelay?: number // ms before typing begins
  charDelay?: number // ms per character (50ms required)
  className?: string
}

const LINE_1 = 'Break the loop.'
const LINE_2 = 'Build yourself.'
const TOTAL_CHARS = LINE_1.length + LINE_2.length

export function HeroHeadlineTyping({
  onComplete,
  startDelay = 250,
  charDelay = 50,
  className = '',
}: HeroHeadlineTypingProps) {
  const [charCount, setCharCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    // 1. Accessibility: Respect prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) {
        setCharCount(TOTAL_CHARS)
        setIsComplete(true)
        setCursorVisible(false)
        onCompleteRef.current?.()
        return
      }
    }

    let intervalId: NodeJS.Timeout | null = null

    // 2. Start delay before typing commences
    const startTimeout = setTimeout(() => {
      let current = 0
      intervalId = setInterval(() => {
        current += 1
        setCharCount(current)

        if (current >= TOTAL_CHARS) {
          if (intervalId) clearInterval(intervalId)
          setIsComplete(true)
          onCompleteRef.current?.()

          // Gracefully fade out cursor after typing finishes
          setTimeout(() => {
            setCursorVisible(false)
          }, 450)
        }
      }, charDelay)
    }, startDelay)

    return () => {
      clearTimeout(startTimeout)
      if (intervalId) clearInterval(intervalId)
    }
  }, [charDelay, startDelay])

  // Compute displayed slices for each line
  const displayedLine1 = LINE_1.slice(0, Math.min(charCount, LINE_1.length))
  const isTypingLine1 = charCount < LINE_1.length && cursorVisible

  const line2Chars = Math.max(0, charCount - LINE_1.length)
  const displayedLine2 = LINE_2.slice(0, Math.min(line2Chars, LINE_2.length))
  const isTypingLine2 =
    charCount >= LINE_1.length && charCount <= TOTAL_CHARS && cursorVisible

  return (
    <h1
      className={`font-display text-[clamp(2.1rem,7.5vw,4.5rem)] md:text-[clamp(3.5rem,7.5vw,6.5rem)] font-bold tracking-tight text-text leading-[1.04] min-h-[2.1em] flex flex-col items-center justify-center select-none ${className}`}
    >
      {/* 100% accessible to screen readers: complete headline available immediately */}
      <span className="sr-only">
        {LINE_1} {LINE_2}
      </span>

      {/* Visual character-by-character reveal with exact 50ms delay */}
      <span aria-hidden="true" className="block min-h-[1.04em] whitespace-nowrap">
        {displayedLine1}
        {isTypingLine1 && (
          <span
            className="inline-block w-[3px] md:w-[4px] h-[0.78em] bg-[#C7FF72] ml-1.5 align-baseline animate-pulse shadow-[0_0_10px_rgba(199,255,114,0.65)] rounded-[1px]"
            style={{ animationDuration: '650ms' }}
          />
        )}
      </span>

      <span aria-hidden="true" className="block min-h-[1.04em] whitespace-nowrap">
        {displayedLine2}
        {isTypingLine2 && (
          <span
            className="inline-block w-[3px] md:w-[4px] h-[0.78em] bg-[#C7FF72] ml-1.5 align-baseline animate-pulse shadow-[0_0_10px_rgba(199,255,114,0.65)] rounded-[1px]"
            style={{ animationDuration: '650ms' }}
          />
        )}
      </span>
    </h1>
  )
}

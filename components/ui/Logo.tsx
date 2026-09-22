import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from './cn'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number
  showWordmark?: boolean
  wordmarkClassName?: string
  className?: string
  asLink?: boolean
  href?: string
}

const SIZE_MAP = {
  sm: { width: 20, height: 28, text: 'text-sm' },
  md: { width: 26, height: 36, text: 'text-base' },
  lg: { width: 36, height: 50, text: 'text-xl' },
  xl: { width: 48, height: 67, text: 'text-2xl' },
}

export function Logo({
  size = 'md',
  showWordmark = true,
  wordmarkClassName,
  className,
  asLink = false,
  href = '/',
}: LogoProps) {
  const dims = typeof size === 'number'
    ? { width: Math.round(size * 0.72), height: size, text: 'text-base' }
    : SIZE_MAP[size]

  const content = (
    <div className={cn('inline-flex items-center gap-2.5 select-none group', className)}>
      <div
        className="relative shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.03]"
        style={{ width: dims.width, height: dims.height }}
      >
        <Image
          src="/logo-white.png"
          alt="UNBOUND emblem"
          width={dims.width}
          height={dims.height}
          priority
          className="object-contain w-full h-full filter drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]"
        />
      </div>

      {showWordmark && (
        <span
          className={cn(
            'font-display font-bold tracking-[-0.03em] text-[#F5F5F5] uppercase leading-none',
            dims.text,
            wordmarkClassName
          )}
        >
          UNBOUND
        </span>
      )}
    </div>
  )

  if (asLink) {
    return (
      <Link href={href} className="inline-flex items-center focus-visible:outline-none">
        {content}
      </Link>
    )
  }

  return content
}

'use client';

import { cn } from './cn';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'muted';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-white/8 text-[#F5F5F5] border border-white/10',
  success:
    'bg-white/6 text-[#D4D4D4] border border-white/12',
  warning:
    'bg-white/5 text-[#A0A0A0] border border-white/8',
  muted:
    'bg-white/4 text-[#555555] border border-white/6',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px] tracking-wide',
  md: 'px-2.5 py-1 text-[11px] tracking-wide',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-sans font-medium uppercase',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}

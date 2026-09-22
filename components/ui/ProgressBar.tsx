'use client';

import { motion } from 'framer-motion';
import { cn } from './cn';

interface ProgressBarProps {
  value: number;           // 0–100
  label?: string;
  showValue?: boolean;
  animated?: boolean;
  height?: number;         // px, default 6
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
}

export function ProgressBar({
  value,
  label,
  showValue = false,
  animated = true,
  height = 6,
  className,
  trackClassName,
  fillClassName,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <span className="font-sans text-[#A0A0A0] text-[12px]">{label}</span>
          )}
          {showValue && (
            <span className="font-numbers text-[#555555] text-[12px] tabular-nums">
              {clamped}%
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-white/6',
          trackClassName,
        )}
        style={{ height }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <motion.div
          className={cn('h-full rounded-full bg-[#F5F5F5]', fillClassName)}
          initial={{ width: animated ? '0%' : `${clamped}%` }}
          animate={{ width: `${clamped}%` }}
          transition={
            animated
              ? { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }
              : { duration: 0 }
          }
        />
      </div>
    </div>
  );
}

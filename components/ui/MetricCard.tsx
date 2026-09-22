'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AnimatedCounter } from './AnimatedCounter';
import { cn } from './cn';

interface MetricCardProps {
  label: string;
  value: number;
  unit?: string;
  change?: number;        // percentage, positive = up
  changeLabel?: string;   // e.g. "vs last week"
  subtitle?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
  delay?: number;
}

export function MetricCard({
  label,
  value,
  unit,
  change,
  changeLabel,
  subtitle,
  prefix,
  decimals = 0,
  className,
  delay = 0,
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const hasChange = change !== undefined;

  return (
    <GlassCard
      variant="elevated"
      delay={delay}
      className={cn('p-5 flex flex-col gap-3', className)}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-sans text-[#555555] text-[11px] uppercase tracking-widest">
          {label}
        </span>
        {hasChange && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[11px] font-sans font-medium px-2 py-0.5 rounded-full',
              isPositive
                ? 'text-[#D4D4D4] bg-white/6 border border-white/10'
                : 'text-[#888] bg-white/3 border border-white/6',
            )}
          >
            {isPositive ? (
              <TrendingUp size={10} aria-hidden />
            ) : (
              <TrendingDown size={10} aria-hidden />
            )}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>

      <div className="flex items-end gap-1.5 leading-none">
        <AnimatedCounter
          value={value}
          prefix={prefix}
          decimals={decimals}
          className="text-stat-lg text-[#F5F5F5] font-semibold"
        />
        {unit && (
          <span className="font-sans text-[#555555] text-[13px] mb-1">{unit}</span>
        )}
      </div>

      {(subtitle || changeLabel) && (
        <p className="font-sans text-[#555555] text-[11px] leading-snug">
          {subtitle ?? changeLabel}
        </p>
      )}
    </GlassCard>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from './cn';

interface ProgressRingProps {
  value: number;          // 0–100
  size?: number;          // diameter in px, default 120
  strokeWidth?: number;   // default 6
  label?: string;         // override the centre text (default: percentage)
  sublabel?: string;      // small text below label
  className?: string;
  trackColor?: string;
  ringColor?: string;
}

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 6,
  label,
  sublabel,
  className,
  trackColor = 'rgba(255,255,255,0.08)',
  ringColor = '#F5F5F5',
}: ProgressRingProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animate the dash offset
  const motionValue = useMotionValue(circumference);
  const spring = useSpring(motionValue, { stiffness: 80, damping: 20, mass: 1 });
  const dashOffset = useTransform(spring, (v) => v);

  // Animate the displayed number
  const displayValue = useMotionValue(0);
  const displaySpring = useSpring(displayValue, { stiffness: 80, damping: 20, mass: 1 });
  const displayInt = useTransform(displaySpring, Math.round);

  const mounted = useRef(false);

  useEffect(() => {
    // Small delay so the animation plays visibly on mount
    const offset = circumference - (clampedValue / 100) * circumference;
    if (!mounted.current) {
      setTimeout(() => {
        motionValue.set(offset);
        displayValue.set(clampedValue);
        mounted.current = true;
      }, 100);
    } else {
      motionValue.set(offset);
      displayValue.set(clampedValue);
    }
  }, [clampedValue, circumference, motionValue, displayValue]);

  const [count, setCount] = useState(0);

  useEffect(() => {
    return displayInt.on('change', (latest) => {
      setCount(latest);
    });
  }, [displayInt]);

  const centre = size / 2;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${clampedValue}%`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={centre}
          cy={centre}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={centre}
          cy={centre}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>

      {/* Centre label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label ? (
          <span
            className="font-numbers text-[#F5F5F5] font-semibold leading-none"
            style={{ fontSize: size * 0.18 }}
          >
            {label}
          </span>
        ) : (
          <span
            className="font-numbers text-[#F5F5F5] font-semibold leading-none"
            style={{ fontSize: size * 0.18 }}
          >
            {count}
            <span className="opacity-60" style={{ fontSize: size * 0.11 }}>%</span>
          </span>
        )}
        {sublabel && (
          <span
            className="font-sans text-[#555555] mt-0.5 leading-none"
            style={{ fontSize: size * 0.11 }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

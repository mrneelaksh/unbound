'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import { cn } from './cn';

interface AnimatedCounterProps {
  value: number;
  duration?: number;   // seconds, default 1.2
  prefix?: string;
  suffix?: string;
  decimals?: number;   // decimal places to show, default 0
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1.2,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    stiffness: 60,
    damping: 18,
    mass: 0.8,
  });
  const display = useTransform(spring, (v) => v.toFixed(decimals));

  const prevValue = useRef(0);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      from: prevValue.current,
    });
    prevValue.current = value;
    return () => controls.stop();
  }, [value, duration, motionValue]);

  return (
    <span className={cn('font-numbers tabular-nums', className)}>
      {prefix && <span>{prefix}</span>}
      <motion.span>{display}</motion.span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
}

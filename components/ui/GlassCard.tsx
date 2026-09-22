'use client';

import { type ElementType, type ComponentPropsWithRef, type MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from './cn';

export type GlassCardVariant = 'default' | 'elevated' | 'bordered';

// Polymorphic component helper types
type AsProp<C extends ElementType> = { as?: C };
type PolymorphicProps<C extends ElementType, P = Record<string, unknown>> = P &
  AsProp<C> &
  Omit<ComponentPropsWithRef<C>, keyof (P & AsProp<C>)>;

interface GlassCardOwnProps {
  variant?: GlassCardVariant;
  className?: string;
  children?: React.ReactNode;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  animateEntry?: boolean;
  delay?: number;
}

type GlassCardProps<C extends ElementType = 'div'> = PolymorphicProps<C, GlassCardOwnProps>;

const variantStyles: Record<GlassCardVariant, string> = {
  default:
    'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] backdrop-blur-[24px]',
  elevated:
    'bg-[#171717] border border-[rgba(255,255,255,0.10)] shadow-card',
  bordered:
    'bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.12)] backdrop-blur-[24px]',
};

const hoverStyles: Record<GlassCardVariant, string> = {
  default:
    'hover:border-[rgba(255,255,255,0.14)] hover:bg-[rgba(255,255,255,0.06)]',
  elevated:
    'hover:border-[rgba(255,255,255,0.16)] hover:bg-[#1a1a1a]',
  bordered:
    'hover:border-[rgba(255,255,255,0.20)]',
};

export function GlassCard<C extends ElementType = 'div'>({
  as,
  variant = 'default',
  className,
  children,
  onClick,
  animateEntry = true,
  delay = 0,
  ...rest
}: GlassCardProps<C>) {
  const Component = (as ?? 'div') as ElementType;

  const isInteractive = Boolean(onClick || as === 'button' || as === 'a');

  return (
    <motion.div
      initial={animateEntry ? { opacity: 0, y: 12 } : false}
      animate={animateEntry ? { opacity: 1, y: 0 } : false}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        'rounded-xl transition-colors duration-200',
        variantStyles[variant],
        isInteractive && hoverStyles[variant],
        isInteractive && 'cursor-pointer',
        className,
      )}
    >
      <Component onClick={onClick} {...rest}>
        {children}
      </Component>
    </motion.div>
  );
}

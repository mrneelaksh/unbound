'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#F6F6F6] text-[#050505] hover:bg-white active:bg-[#E5E5E5] shadow-inner-glow font-semibold',
  accent:
    'bg-[#C7FF72] text-[#050505] hover:bg-[#D5FFA0] active:bg-[#B5F55A] font-semibold shadow-[0_0_20px_rgba(199,255,114,0.18)]',
  secondary:
    'bg-white/[0.04] border border-white/10 text-[#F5F5F5] hover:bg-white/[0.08] hover:border-white/20 active:bg-white/[0.12] backdrop-blur-xl',
  ghost:
    'bg-transparent text-[#A1A1A1] hover:bg-white/[0.05] hover:text-[#F5F5F5] active:bg-white/[0.08]',
  danger:
    'bg-red-950/20 border border-red-500/25 text-red-200 hover:bg-red-950/40 hover:border-red-500/40 active:bg-red-950/60',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[12px] gap-1.5 rounded-md',
  md: 'h-10 px-4 text-[13px] gap-2 rounded-lg',
  lg: 'h-12 px-6 text-[14px] gap-2.5 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    // Cast to HTMLMotionProps to avoid forwardRef conflicts
    const motionProps = {
      whileHover: isDisabled ? {} : { scale: 0.98 },
      whileTap: isDisabled ? {} : { scale: 0.96 },
      transition: { type: 'spring', stiffness: 400, damping: 25 },
    } satisfies Partial<HTMLMotionProps<'button'>>;

    return (
      <motion.button
        ref={ref}
        {...(rest as HTMLMotionProps<'button'>)}
        {...motionProps}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(
          'relative inline-flex items-center justify-center font-sans',
          'select-none outline-none',
          'transition-colors duration-150',
          'focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-1 focus-visible:ring-offset-[#050505]',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
      >
        {isLoading && (
          <Loader2
            className="absolute animate-spin"
            size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
            aria-hidden
          />
        )}
        <span className={cn('flex items-center gap-inherit', isLoading && 'invisible')}>
          {leftIcon}
          {children}
          {rightIcon}
        </span>
      </motion.button>
    );
  },
);

Button.displayName = 'Button';

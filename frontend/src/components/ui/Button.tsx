'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type Size    = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:   [
    'bg-[#ede6ff] text-[#14092b] font-semibold',
    'shadow-[0_10px_36px_-10px_rgba(168,85,247,0.7)]',
    'hover:bg-white hover:shadow-[0_12px_44px_-8px_rgba(168,85,247,0.8)]',
    'active:shadow-none',
  ].join(' '),
  secondary: [
    'bg-white/[0.04] border border-white/10 backdrop-blur-md',
    'text-slate-200',
    'hover:bg-white/12 hover:border-white/18 hover:text-white',
    'active:bg-white/15',
  ].join(' '),
  outline:   [
    'border border-white/15 bg-white/[0.03] text-slate-100 backdrop-blur-md',
    'hover:bg-white/[0.07] hover:border-white/30 hover:text-white',
    'active:bg-white/10',
  ].join(' '),
  ghost:     [
    'text-slate-400',
    'hover:text-white hover:bg-white/7',
    'active:bg-white/10',
  ].join(' '),
  danger:    [
    'bg-red-500/15 border border-red-500/30 text-red-400',
    'hover:bg-red-500/25 hover:border-red-400 hover:text-red-300',
    'active:bg-red-500/30',
  ].join(' '),
  success:   [
    'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400',
    'hover:bg-emerald-500/25 hover:border-emerald-400 hover:text-emerald-300',
    'active:bg-emerald-500/30',
  ].join(' '),
};

const sizes: Record<Size, string> = {
  xs: 'px-3   py-1.5 text-xs rounded-full min-h-[32px] gap-1.5',
  sm: 'px-4   py-2   text-xs rounded-full min-h-[36px] gap-1.5',
  md: 'px-5   py-2.5 text-sm rounded-full min-h-[44px] gap-2',
  lg: 'px-7   py-3.5 text-sm sm:text-base rounded-full min-h-[48px] gap-2',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, fullWidth, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold',
          'transition-all duration-150',
          'cursor-pointer select-none',
          'active:scale-[0.97] active:opacity-90',
          'focus-visible:ring-2 focus-visible:ring-violet-300/60 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          (disabled || loading) && 'opacity-45 cursor-not-allowed pointer-events-none saturate-50',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-3.5 w-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-20"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="3"
              />
              <path
                className="opacity-80"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span className="opacity-75">{children}</span>
          </>
        ) : (
          <>
            {icon && <span className="shrink-0 w-4 h-4 flex items-center justify-center">{icon}</span>}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;

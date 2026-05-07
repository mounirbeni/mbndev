'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-lg shadow-primary-500/20',
  outline: 'border border-primary-500/50 text-primary-400 hover:bg-primary-500/10 hover:border-primary-400 active:bg-primary-500/15',
  ghost:   'text-slate-300 hover:text-white hover:bg-white/8 active:bg-white/12',
  danger:  'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white',
};

/* Minimum 44px height on mobile for all sizes (WCAG touch target) */
const sizes: Record<Size, string> = {
  sm: 'px-3 py-2 text-xs rounded-lg min-h-[36px] sm:min-h-[36px]',
  md: 'px-4 py-2.5 text-sm rounded-xl min-h-[44px]',
  lg: 'px-6 py-3.5 text-sm sm:text-base rounded-xl min-h-[48px]',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150',
          'cursor-pointer select-none',
          // Touch feedback via CSS (works on mobile, unlike framer-motion hover)
          'active:scale-[0.97] active:opacity-90',
          variants[variant],
          sizes[size],
          (disabled || loading) && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : icon ? (
          <span className="w-4 h-4 shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;

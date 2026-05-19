import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, className, id, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium transition-colors duration-150',
              focused ? 'text-primary-400' : 'text-slate-300',
              error && 'text-red-400'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative group">
          {icon && (
            <div className={cn(
              'absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-150',
              focused ? 'text-primary-400' : 'text-slate-500',
              error && 'text-red-400/70'
            )}>
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              // Base
              'w-full rounded-xl px-4 py-3 text-sm text-slate-100',
              'transition-all duration-150',

              // Background
              'bg-white/5 hover:bg-white/7',
              focused && 'bg-white/8',

              // Border
              'border border-white/10',
              'hover:border-white/18',
              focused && 'border-primary-500/60',

              // Shadow / glow on focus
              focused && 'shadow-[0_0_0_3px_rgba(124,58,237,0.14)]',

              // Placeholder
              'placeholder:text-slate-600 placeholder:font-normal',

              // States
              error && 'border-red-500/50 bg-red-500/5 focus:border-red-500/70 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]',

              // Icon padding
              icon && 'pl-10',
              iconRight && 'pr-10',

              'outline-none',
              className
            )}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
            {...props}
          />

          {iconRight && (
            <div className={cn(
              'absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-150',
              focused ? 'text-slate-300' : 'text-slate-500'
            )}>
              {iconRight}
            </div>
          )}
        </div>

        {/* Error / hint */}
        {error ? (
          <p className="text-xs text-red-400 flex items-center gap-1.5 animate-[pageEnter_0.2s_ease_both]">
            <span className="inline-block w-1 h-1 rounded-full bg-red-400 shrink-0" />
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-slate-600">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;

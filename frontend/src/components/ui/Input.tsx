import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-dark-100 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200',
              'placeholder:text-slate-500 transition-all duration-200',
              'focus:outline-none focus:border-primary-500 focus:bg-dark-100',
              'hover:border-white/20',
              icon && 'pl-10',
              error && 'border-red-500/50 focus:border-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;

import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'tonal' | 'outline' | 'text' | 'danger';
  size?: 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'filled',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40',
        size === 'md' ? 'h-11 px-5 text-sm' : 'h-13 px-6 text-base',
        variant === 'filled' && 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300 shadow-lg shadow-emerald-500/10',
        variant === 'tonal' && 'bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15',
        variant === 'outline' && 'border border-white/15 text-zinc-100 hover:border-white/30 hover:bg-white/5',
        variant === 'text' && 'text-zinc-300 hover:text-white hover:bg-white/5 px-3',
        variant === 'danger' && 'bg-red-500/10 text-red-400 hover:bg-red-500/15 border border-red-500/20',
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

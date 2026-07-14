import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  mono?: boolean;
  trailing?: ReactNode;
  error?: string | null;
}

export function TextField({ label, mono, trailing, error, className, id, ...rest }: TextFieldProps) {
  const inputId = id ?? label?.replace(/\s+/g, '-').toLowerCase();
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 transition-colors focus-within:border-emerald-400/50 focus-within:bg-white/[0.06]',
          error && 'border-red-500/50',
        )}
      >
        <input
          id={inputId}
          className={cn(
            'h-12 w-full bg-transparent text-[15px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none',
            mono && 'font-mono-key tracking-tight',
            className,
          )}
          {...rest}
        />
        {trailing}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

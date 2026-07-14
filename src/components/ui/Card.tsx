import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-3xl border border-white/8 bg-white/[0.03] p-5', className)}
      {...rest}
    />
  );
}

export function OptionPill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
        selected
          ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300'
          : 'border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200',
      )}
    >
      {label}
    </button>
  );
}

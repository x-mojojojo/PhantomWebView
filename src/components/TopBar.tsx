import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface TopBarProps {
  title: string;
  leading?: ReactNode;
  actions?: ReactNode;
  subtitle?: string;
  className?: string;
}

export function TopBar({ title, leading, actions, subtitle, className }: TopBarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center gap-3 border-b border-white/8 bg-[#0b0f0e]/90 px-4 py-4 backdrop-blur',
        className,
      )}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[17px] font-semibold tracking-tight text-zinc-50">{title}</h1>
        {subtitle && <p className="truncate text-xs text-zinc-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-1">{actions}</div>
    </header>
  );
}

export function IconBtn({ onClick, children, label }: { onClick: () => void; children: ReactNode; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/8 hover:text-white active:scale-95"
    >
      {children}
    </button>
  );
}

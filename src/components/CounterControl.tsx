import { MinusIcon, PlusIcon } from './icons';

interface Props {
  counter: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function CounterControl({ counter, onIncrement, onDecrement }: Props) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Counter</p>
        <p className="font-mono-key text-lg text-zinc-100">{String(counter).padStart(2, '0')}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDecrement}
          disabled={counter <= 1}
          aria-label="Decrement counter"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-zinc-300 transition-colors hover:border-white/25 hover:text-white disabled:opacity-30 active:scale-90"
        >
          <MinusIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onIncrement}
          aria-label="Increment counter"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/40 text-emerald-300 transition-colors hover:border-emerald-400/70 active:scale-90"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

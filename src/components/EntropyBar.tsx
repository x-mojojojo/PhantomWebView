interface Props {
  bits: number;
  maxBits?: number;
}

export function EntropyBar({ bits, maxBits = 128 }: Props) {
  const pct = Math.min(100, (bits / maxBits) * 100);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Entropy</p>
        <p className="font-mono-key text-xs text-emerald-300">{bits} bits</p>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

import { ALL_PASSWORD_TYPES, PASSWORD_TYPE_LABELS, PasswordType } from '../crypto/PasswordType';
import { cn } from '../utils/cn';

interface Props {
  selected: PasswordType;
  onSelect: (type: PasswordType) => void;
}

export function PasswordTypeSelector({ selected, onSelect }: Props) {
  return (
    <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1" style={{ scrollbarWidth: 'none' }}>
      {ALL_PASSWORD_TYPES.map((type) => {
        const active = type === selected;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={cn(
              'shrink-0 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all active:scale-95',
              active
                ? 'border-emerald-400/70 bg-emerald-400/15 text-emerald-300'
                : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-zinc-200',
            )}
          >
            {PASSWORD_TYPE_LABELS[type]}
          </button>
        );
      })}
    </div>
  );
}

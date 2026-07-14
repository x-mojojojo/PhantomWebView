import { PASSWORD_TYPE_LABELS, PasswordType } from '../crypto/PasswordType';
import { SiteEntry } from '../data/SiteRepository';
import { relativeTime } from '../utils/time';

interface Props {
  sites: SiteEntry[];
  onSelect: (site: SiteEntry) => void;
  limit?: number;
}

export function RecentSitesList({ sites, onSelect, limit = 10 }: Props) {
  const visible = sites.slice(0, limit);

  if (visible.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-500">
        No sites generated yet. Type a site name above to begin.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {visible.map((site) => (
        <button
          key={site.siteName}
          type="button"
          onClick={() => onSelect(site)}
          className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left transition-colors hover:border-white/20 hover:bg-white/[0.05] active:scale-[0.99]"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono-key text-sm text-zinc-100">{site.siteName}</p>
            <p className="mt-0.5 font-mono-key text-xs tracking-widest text-zinc-600">••••••••••••</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
              {PASSWORD_TYPE_LABELS[site.defaultType as PasswordType] ?? site.defaultType}
            </span>
            <span className="text-[11px] text-zinc-600">{relativeTime(site.lastUsed)}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

import { TopBar, IconBtn } from '../components/TopBar';
import { ArrowLeftIcon, HistoryIcon, TrashIcon } from '../components/icons';
import { useSites } from '../data/useSites';
import { SiteRepository, SiteEntry } from '../data/SiteRepository';
import { PASSWORD_TYPE_LABELS, PasswordType } from '../crypto/PasswordType';
import { relativeTime } from '../utils/time';

interface Props {
  onBack: () => void;
  onSelectSite: (site: SiteEntry) => void;
}

export function SiteHistoryScreen({ onBack, onSelectSite }: Props) {
  const sites = useSites();

  return (
    <div className="min-h-screen pb-10">
      <TopBar
        title="Site History"
        subtitle={`${sites.length} site${sites.length === 1 ? '' : 's'} recorded`}
        leading={
          <IconBtn label="Back" onClick={onBack}>
            <ArrowLeftIcon className="h-5 w-5" />
          </IconBtn>
        }
      />

      <main className="mx-auto max-w-md px-5 pt-5">
        {sites.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-white/10 py-16 text-center">
            <HistoryIcon className="h-8 w-8 text-zinc-600" />
            <p className="text-sm text-zinc-500">No sites yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sites.map((site) => (
              <div
                key={site.siteName}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
              >
                <button
                  onClick={() => onSelectSite(site)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate font-mono-key text-sm text-zinc-100">{site.siteName}</p>
                  <p className="mt-0.5 font-mono-key text-xs tracking-widest text-zinc-600">
                    •••••••••••• &middot; counter {site.defaultCounter}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                      {PASSWORD_TYPE_LABELS[site.defaultType as PasswordType] ?? site.defaultType}
                    </span>
                    <span className="text-[11px] text-zinc-600">{relativeTime(site.lastUsed)}</span>
                  </div>
                </button>
                <button
                  onClick={() => SiteRepository.removeSite(site.siteName)}
                  aria-label={`Delete ${site.siteName}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { TopBar, IconBtn } from '../components/TopBar';
import { TextField } from '../components/ui/TextField';
import { Card } from '../components/ui/Card';
import { PasswordTypeSelector } from '../components/PasswordTypeSelector';
import { CounterControl } from '../components/CounterControl';
import { EntropyBar } from '../components/EntropyBar';
import { RecentSitesList } from '../components/RecentSitesList';
import { SettingsDrawer } from '../components/SettingsDrawer';
import { CheckIcon, CopyIcon, HistoryIcon, SettingsIcon, SkullGhostIcon } from '../components/icons';
import { useGeneratorViewModel } from '../viewmodel/useGeneratorViewModel';
import { useSettingsViewModel } from '../viewmodel/useSettingsViewModel';
import { useSites } from '../data/useSites';
import { PreferencesManager } from '../data/PreferencesManager';
import { copyPlain, copyToClipboard } from '../utils/clipboard';
import { isBiometricAvailable } from '../utils/biometric';
import { SiteEntry } from '../data/SiteRepository';
import { PasswordType } from '../crypto/PasswordType';

interface Props {
  masterKey: Uint8Array;
  onLock: () => void;
  onOpenHistory: () => void;
  onOpenSecuritySettings: () => void;
  initialSite?: SiteEntry | null;
  onConsumedInitialSite?: () => void;
}

export function HubScreen({
  masterKey,
  onLock,
  onOpenHistory,
  onOpenSecuritySettings,
  initialSite,
  onConsumedInitialSite,
}: Props) {
  const settingsVM = useSettingsViewModel();
  const genVM = useGeneratorViewModel(settingsVM.defaultPasswordType);
  const sites = useSites();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copiedName, setCopiedName] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);

  useEffect(() => {
    genVM.setMasterKey(masterKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterKey]);

  useEffect(() => {
    if (initialSite) {
      genVM.loadSite(
        initialSite.siteName,
        initialSite.defaultType as PasswordType,
        initialSite.defaultCounter,
      );
      onConsumedInitialSite?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSite]);

  useEffect(() => {
    isBiometricAvailable().then(setBiometricSupported);
  }, []);

  // Session timeout enforcement: poll every 30s.
  useEffect(() => {
    const interval = window.setInterval(() => {
      const timeout = PreferencesManager.getKeyTimeoutMinutes();
      const last = PreferencesManager.getLastUnlockTime();
      if (PreferencesManager.isSessionExpired(timeout, last)) {
        onLock();
      }
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [onLock]);

  async function handleCopyPassword() {
    await copyToClipboard(genVM.generatedPassword, settingsVM.clipboardTimeout);
    genVM.markCopied();
  }

  async function handleCopyLogin() {
    await copyPlain(genVM.loginName);
    setCopiedName(true);
    window.setTimeout(() => setCopiedName(false), 1500);
  }

  function handleSelectSite(site: SiteEntry) {
    genVM.loadSite(site.siteName, site.defaultType as PasswordType, site.defaultCounter);
  }

  return (
    <div className="min-h-screen pb-16">
      <TopBar
        title="PhantomKey"
        subtitle="Stateless password vault"
        leading={
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10">
            <SkullGhostIcon className="h-5 w-5 text-emerald-300" />
          </div>
        }
        actions={
          <>
            <IconBtn label="Site history" onClick={onOpenHistory}>
              <HistoryIcon className="h-5 w-5" />
            </IconBtn>
            <IconBtn label="Settings" onClick={() => setDrawerOpen(true)}>
              <SettingsIcon className="h-5 w-5" />
            </IconBtn>
          </>
        }
      />

      <main className="mx-auto flex max-w-md flex-col gap-5 px-5 pt-5">
        <TextField
          label="Site Identity"
          placeholder="e.g. twitter.com"
          mono
          value={genVM.siteName}
          onChange={(e) => genVM.updateSiteName(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />

        <Card className="flex flex-col gap-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Login Name</p>
              <button
                onClick={handleCopyLogin}
                disabled={!genVM.loginName}
                className="flex items-center gap-1 text-xs font-medium text-emerald-300 disabled:opacity-30"
              >
                {copiedName ? (
                  <>
                    <CheckIcon className="h-3.5 w-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-3.5 w-3.5" /> Copy
                  </>
                )}
              </button>
            </div>
            <p className="break-all font-mono-key text-lg text-zinc-100">{genVM.loginName || '—'}</p>
          </div>

          <div className="h-px bg-white/8" />

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Password</p>
              <button
                onClick={handleCopyPassword}
                disabled={!genVM.siteName.trim()}
                className="flex items-center gap-1 text-xs font-medium text-emerald-300 disabled:opacity-30"
              >
                {genVM.isCopied ? (
                  <>
                    <CheckIcon className="h-3.5 w-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-3.5 w-3.5" /> Copy
                  </>
                )}
              </button>
            </div>
            <p className="break-all font-mono-key text-2xl font-semibold tracking-tight text-emerald-300">
              {genVM.generatedPassword}
            </p>
          </div>
        </Card>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">Password Type</p>
          <PasswordTypeSelector selected={genVM.selectedType} onSelect={genVM.selectPasswordType} />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <CounterControl
            counter={genVM.counter}
            onIncrement={genVM.incrementCounter}
            onDecrement={genVM.decrementCounter}
          />
          <Card>
            <EntropyBar bits={genVM.entropyBits} />
          </Card>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Recent Sites</p>
            {sites.length > 0 && (
              <button onClick={onOpenHistory} className="text-xs font-medium text-emerald-300">
                View all
              </button>
            )}
          </div>
          <RecentSitesList sites={sites} onSelect={handleSelectSite} limit={10} />
        </div>
      </main>

      <SettingsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        keyTimeout={settingsVM.keyTimeout}
        onKeyTimeoutChange={settingsVM.setKeyTimeout}
        biometricEnabled={settingsVM.biometricEnabled}
        onBiometricEnabledChange={settingsVM.setBiometricEnabled}
        biometricSupported={biometricSupported}
        clipboardTimeout={settingsVM.clipboardTimeout}
        onClipboardTimeoutChange={settingsVM.setClipboardTimeout}
        defaultPasswordType={settingsVM.defaultPasswordType}
        onDefaultPasswordTypeChange={settingsVM.setDefaultPasswordType}
        onLock={() => {
          setDrawerOpen(false);
          onLock();
        }}
        onOpenSecuritySettings={() => {
          setDrawerOpen(false);
          onOpenSecuritySettings();
        }}
      />
    </div>
  );
}

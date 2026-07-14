import { useCallback, useState } from 'react';
import { PreferencesManager } from './data/PreferencesManager';
import { SiteEntry } from './data/SiteRepository';
import { IdentitySetupScreen } from './screens/IdentitySetupScreen';
import { UnlockScreen } from './screens/UnlockScreen';
import { HubScreen } from './screens/HubScreen';
import { SiteHistoryScreen } from './screens/SiteHistoryScreen';
import { SecuritySettingsScreen } from './screens/SecuritySettingsScreen';
import { isBiometricAvailable } from './utils/biometric';
import { useEffect } from 'react';
import { PasswordType } from './crypto/PasswordType';

type Route = 'UNLOCK' | 'IDENTITY_SETUP' | 'HUB' | 'HISTORY' | 'SECURITY_SETTINGS';

export default function App() {
  const [route, setRoute] = useState<Route>(() =>
    PreferencesManager.getIdentityCreated() ? 'UNLOCK' : 'IDENTITY_SETUP',
  );
  const [masterKey, setMasterKey] = useState<Uint8Array | null>(null);
  const [pendingSite, setPendingSite] = useState<SiteEntry | null>(null);
  const [biometricSupported, setBiometricSupported] = useState(false);

  useEffect(() => {
    isBiometricAvailable().then(setBiometricSupported);
  }, []);

  const goToUnlock = useCallback(() => {
    setMasterKey(null);
    setRoute('UNLOCK');
  }, []);

  const handleUnlocked = useCallback((key: Uint8Array) => {
    setMasterKey(key);
    setRoute('HUB');
  }, []);

  const handleIdentityComplete = useCallback(() => {
    setRoute('UNLOCK');
  }, []);

  const handleSelectSiteFromHistory = useCallback((site: SiteEntry) => {
    setPendingSite(site);
    setRoute('HUB');
  }, []);

  const handlePurged = useCallback(() => {
    setMasterKey(null);
    setPendingSite(null);
    setRoute('IDENTITY_SETUP');
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f0e] text-zinc-100">
      {route === 'IDENTITY_SETUP' && <IdentitySetupScreen onComplete={handleIdentityComplete} />}

      {route === 'UNLOCK' && <UnlockScreen onUnlocked={handleUnlocked} />}

      {route === 'HUB' && masterKey && (
        <HubScreenWrapper
          masterKey={masterKey}
          onLock={goToUnlock}
          onOpenHistory={() => setRoute('HISTORY')}
          onOpenSecuritySettings={() => setRoute('SECURITY_SETTINGS')}
          pendingSite={pendingSite}
          clearPendingSite={() => setPendingSite(null)}
        />
      )}

      {route === 'HISTORY' && (
        <SiteHistoryScreen onBack={() => setRoute('HUB')} onSelectSite={handleSelectSiteFromHistory} />
      )}

      {route === 'SECURITY_SETTINGS' && (
        <SecuritySettingsScreen
          onBack={() => setRoute('HUB')}
          onPurged={handlePurged}
          biometricSupported={biometricSupported}
        />
      )}
    </div>
  );
}

// Small wrapper so HubScreen can react to a site selected from the History
// screen (loads it into the generator on return) without HubScreen itself
// needing to know about app-level navigation state.
function HubScreenWrapper({
  masterKey,
  onLock,
  onOpenHistory,
  onOpenSecuritySettings,
  pendingSite,
  clearPendingSite,
}: {
  masterKey: Uint8Array;
  onLock: () => void;
  onOpenHistory: () => void;
  onOpenSecuritySettings: () => void;
  pendingSite: SiteEntry | null;
  clearPendingSite: () => void;
}) {
  return (
    <HubScreen
      key="hub"
      masterKey={masterKey}
      onLock={onLock}
      onOpenHistory={onOpenHistory}
      onOpenSecuritySettings={onOpenSecuritySettings}
      initialSite={pendingSite}
      onConsumedInitialSite={clearPendingSite}
    />
  );
}

export type { PasswordType };

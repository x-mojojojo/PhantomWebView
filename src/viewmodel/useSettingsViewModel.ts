// useSettingsViewModel.ts — React port of SettingsViewModel.

import { useCallback, useState } from 'react';
import { PasswordType } from '../crypto/PasswordType';
import { PreferencesManager } from '../data/PreferencesManager';
import { SiteRepository } from '../data/SiteRepository';

export function useSettingsViewModel() {
  const [keyTimeout, setKeyTimeoutState] = useState(PreferencesManager.getKeyTimeoutMinutes());
  const [biometricEnabled, setBiometricEnabledState] = useState(PreferencesManager.getBiometricEnabled());
  const [clipboardTimeout, setClipboardTimeoutState] = useState(
    PreferencesManager.getClipboardTimeoutSeconds(),
  );
  const [defaultPasswordType, setDefaultPasswordTypeState] = useState(
    PreferencesManager.getDefaultPasswordType(),
  );
  const [isPurging, setIsPurging] = useState(false);
  const [purged, setPurged] = useState(false);

  const setKeyTimeout = useCallback((minutes: number) => {
    PreferencesManager.setKeyTimeoutMinutes(minutes);
    setKeyTimeoutState(minutes);
  }, []);

  const setBiometricEnabled = useCallback((enabled: boolean) => {
    PreferencesManager.setBiometricEnabled(enabled);
    setBiometricEnabledState(enabled);
  }, []);

  const setClipboardTimeout = useCallback((seconds: number) => {
    PreferencesManager.setClipboardTimeoutSeconds(seconds);
    setClipboardTimeoutState(seconds);
  }, []);

  const setDefaultPasswordType = useCallback((type: PasswordType) => {
    PreferencesManager.setDefaultPasswordType(type);
    setDefaultPasswordTypeState(type);
  }, []);

  const purgeAll = useCallback(async () => {
    setIsPurging(true);
    await new Promise((r) => setTimeout(r, 300));
    PreferencesManager.purgeAll();
    SiteRepository.clearAll();
    setIsPurging(false);
    setPurged(true);
  }, []);

  return {
    keyTimeout,
    biometricEnabled,
    clipboardTimeout,
    defaultPasswordType,
    isPurging,
    purged,
    setKeyTimeout,
    setBiometricEnabled,
    setClipboardTimeout,
    setDefaultPasswordType,
    purgeAll,
  };
}

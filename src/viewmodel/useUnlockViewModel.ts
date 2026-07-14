// useUnlockViewModel.ts — React port of UnlockViewModel.
//
// Web analogue notes:
//  - "EncryptedSharedPreferences" -> SecureStore (non-extractable WebCrypto key).
//  - "BiometricPrompt(activity, ...)" -> WebAuthn platform authenticator prompt.
//  - "openEnrollment(activity)" -> best-effort deep link / instructions, since
//    the web has no direct API to open OS biometric-enrollment settings.

import { useCallback, useEffect, useState } from 'react';
import { MasterKey } from '../crypto/MasterKey';
import { PreferencesManager } from '../data/PreferencesManager';
import { SecureStore } from '../utils/secureStore';
import {
  enrollBiometric,
  hasEnrolledCredential,
  isBiometricAvailable,
  verifyBiometric,
} from '../utils/biometric';

export function useUnlockViewModel() {
  const [masterPassword, setMasterPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isBiometricAvailableState, setIsBiometricAvailableState] = useState(false);
  const [storedFullName, setStoredFullName] = useState('');
  const [needsEnrollment, setNeedsEnrollment] = useState(false);
  const [unlockedKey, setUnlockedKey] = useState<Uint8Array | null>(null);

  useEffect(() => {
    setStoredFullName(PreferencesManager.getFullName());
    (async () => {
      const available = await isBiometricAvailable();
      setIsBiometricAvailableState(available && PreferencesManager.getBiometricEnabled());
      setNeedsEnrollment(available && !hasEnrolledCredential() && PreferencesManager.getBiometricEnabled());
    })();
  }, []);

  const unlock = useCallback(async () => {
    setError(null);
    if (!masterPassword) {
      setError('Enter your master password.');
      return;
    }
    setIsUnlocking(true);
    try {
      const fullName = PreferencesManager.getFullName();
      const key = await MasterKey.derive(fullName, masterPassword);

      PreferencesManager.setLastUnlockTime(Date.now());

      if (PreferencesManager.getBiometricEnabled()) {
        await SecureStore.put({ name: fullName, pass: masterPassword });
        if (!hasEnrolledCredential()) {
          await enrollBiometric(fullName);
        }
      }

      setUnlockedKey(key);
      setIsUnlocked(true);
    } catch (e) {
      setError('Incorrect master password.');
    } finally {
      setIsUnlocking(false);
    }
  }, [masterPassword]);

  const authenticateWithBiometrics = useCallback(
    async (onSuccess: (key: Uint8Array) => void, onError: (msg: string) => void) => {
      try {
        const creds = await SecureStore.get();
        if (!creds) {
          onError('No biometric-linked credentials found. Unlock with your password first.');
          return;
        }
        const verified = await verifyBiometric();
        if (!verified) {
          onError('Biometric authentication failed.');
          return;
        }
        const key = await MasterKey.derive(creds.name, creds.pass);
        PreferencesManager.setLastUnlockTime(Date.now());
        setUnlockedKey(key);
        setIsUnlocked(true);
        onSuccess(key);
      } catch (e) {
        onError('Biometric authentication error.');
      }
    },
    [],
  );

  const lock = useCallback(() => {
    setUnlockedKey(null);
    setIsUnlocked(false);
    setMasterPassword('');
    setError(null);
  }, []);

  const openEnrollment = useCallback(() => {
    // The web platform has no direct equivalent of
    // Settings.ACTION_BIOMETRIC_ENROLL — surface guidance instead.
    window.alert(
      'Set up a fingerprint, face, or screen-lock credential in your device/browser settings, then re-enable Biometric Lock in PhantomKey settings.',
    );
  }, []);

  return {
    masterPassword,
    setMasterPassword,
    isUnlocking,
    error,
    isUnlocked,
    isBiometricAvailable: isBiometricAvailableState,
    storedFullName,
    needsEnrollment,
    unlockedKey,
    unlock,
    authenticateWithBiometrics,
    lock,
    openEnrollment,
  };
}

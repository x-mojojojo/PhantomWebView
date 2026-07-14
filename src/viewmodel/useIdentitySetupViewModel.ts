// useIdentitySetupViewModel.ts — React port of IdentitySetupViewModel.

import { useMemo, useState } from 'react';
import { MasterKey } from '../crypto/MasterKey';
import { generateFingerprintHash } from '../crypto/SeedGenerator';
import { PreferencesManager } from '../data/PreferencesManager';

export function useIdentitySetupViewModel() {
  const [fullName, setFullName] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fingerprintHash = useMemo(
    () => generateFingerprintHash(fullName, masterPassword),
    [fullName, masterPassword],
  );

  async function initializeIdentity() {
    setError(null);

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (masterPassword.length < 8) {
      setError('Master password must be at least 8 characters.');
      return;
    }
    if (masterPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsInitializing(true);
    try {
      // Validate that the crypto core works end-to-end before committing.
      const key = await MasterKey.derive(fullName.trim(), masterPassword);
      if (key.length !== 64) throw new Error('Unexpected key length');

      // NEVER persist password or key material — only the full name.
      PreferencesManager.setFullName(fullName.trim());
      PreferencesManager.setIdentityCreated(true);
      setSuccess(true);
    } catch (e) {
      setError('Failed to initialize identity. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  }

  return {
    fullName,
    setFullName,
    masterPassword,
    setMasterPassword,
    confirmPassword,
    setConfirmPassword,
    fingerprintHash,
    isInitializing,
    error,
    success,
    initializeIdentity,
  };
}

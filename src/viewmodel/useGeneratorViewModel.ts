// useGeneratorViewModel.ts — React port of GeneratorViewModel.
// Generates login name + password in real time as the user types a site name.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MasterKey } from '../crypto/MasterKey';
import { PasswordGenerator } from '../crypto/PasswordGenerator';
import { PasswordType } from '../crypto/PasswordType';
import { SiteRepository } from '../data/SiteRepository';

const PLACEHOLDER = '••••••••••••••••';

export function useGeneratorViewModel(defaultType: PasswordType) {
  const [masterKey, setMasterKeyState] = useState<Uint8Array | null>(null);
  const [siteName, setSiteName] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState(PLACEHOLDER);
  const [loginName, setLoginName] = useState('');
  const [selectedType, setSelectedType] = useState<PasswordType>(defaultType);
  const [counter, setCounter] = useState(1);
  const [isCopied, setIsCopied] = useState(false);

  const entropyBits = useMemo(() => PasswordGenerator.calculateEntropyBits(selectedType), [selectedType]);

  const regenerate = useCallback(() => {
    if (!masterKey || !siteName.trim()) {
      setGeneratedPassword(PLACEHOLDER);
      setLoginName('');
      return;
    }
    const siteKey = MasterKey.deriveSiteKey(masterKey, siteName.trim(), counter);
    const loginKey = MasterKey.deriveLoginKey(masterKey, siteName.trim(), counter);
    setGeneratedPassword(PasswordGenerator.generate(siteKey, selectedType));
    setLoginName(PasswordGenerator.generate(loginKey, PasswordType.NAME));
  }, [masterKey, siteName, counter, selectedType]);

  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterKey, siteName, counter, selectedType]);

  function setMasterKey(key: Uint8Array) {
    setMasterKeyState(key);
  }

  function updateSiteName(name: string) {
    setSiteName(name);
  }

  function selectPasswordType(type: PasswordType) {
    setSelectedType(type);
  }

  function incrementCounter() {
    setCounter((c) => c + 1);
  }

  function decrementCounter() {
    setCounter((c) => Math.max(1, c - 1));
  }

  function markCopied() {
    if (!siteName.trim()) return;
    SiteRepository.recordSite(siteName.trim(), selectedType, counter);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 1500);
  }

  function loadSite(name: string, type?: PasswordType, loadedCounter?: number) {
    setSiteName(name);
    if (type) setSelectedType(type);
    if (loadedCounter) setCounter(loadedCounter);
  }

  return {
    siteName,
    generatedPassword,
    loginName,
    selectedType,
    counter,
    entropyBits,
    isCopied,
    setMasterKey,
    updateSiteName,
    selectPasswordType,
    incrementCounter,
    decrementCounter,
    markCopied,
    loadSite,
    regenerate,
  };
}

// PreferencesManager.ts
//
// Web analogue of the Kotlin Jetpack-DataStore-backed PreferencesManager.
// Backed by `localStorage` — synchronous, per-origin, persists across
// reloads, and (crucially) never stores passwords or key material.

import { DEFAULT_PASSWORD_TYPE, PasswordType } from '../crypto/PasswordType';

const KEYS = {
  identityCreated: 'phantomkey.identity_created',
  fullName: 'phantomkey.identity_full_name',
  biometricEnabled: 'phantomkey.biometric_enabled',
  keyTimeoutMinutes: 'phantomkey.key_timeout_minutes',
  clipboardTimeoutSeconds: 'phantomkey.clipboard_timeout_seconds',
  defaultPasswordType: 'phantomkey.default_password_type',
  lastUnlockTime: 'phantomkey.last_unlock_time',
} as const;

export const TIMEOUT_1_MIN = 1;
export const TIMEOUT_5_MIN = 5;
export const TIMEOUT_10_MIN = 10;
export const TIMEOUT_NEVER = 0;

function readString(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeString(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — fail silently, app still works in-memory */
  }
}

export const PreferencesManager = {
  getIdentityCreated(): boolean {
    return readString(KEYS.identityCreated) === 'true';
  },
  setIdentityCreated(value: boolean) {
    writeString(KEYS.identityCreated, String(value));
  },

  getFullName(): string {
    return readString(KEYS.fullName) ?? '';
  },
  setFullName(value: string) {
    writeString(KEYS.fullName, value);
  },

  getBiometricEnabled(): boolean {
    return readString(KEYS.biometricEnabled) === 'true';
  },
  setBiometricEnabled(value: boolean) {
    writeString(KEYS.biometricEnabled, String(value));
  },

  getKeyTimeoutMinutes(): number {
    const raw = readString(KEYS.keyTimeoutMinutes);
    return raw !== null ? Number(raw) : TIMEOUT_5_MIN;
  },
  setKeyTimeoutMinutes(value: number) {
    writeString(KEYS.keyTimeoutMinutes, String(value));
  },

  getClipboardTimeoutSeconds(): number {
    const raw = readString(KEYS.clipboardTimeoutSeconds);
    return raw !== null ? Number(raw) : 60;
  },
  setClipboardTimeoutSeconds(value: number) {
    writeString(KEYS.clipboardTimeoutSeconds, String(value));
  },

  getDefaultPasswordType(): PasswordType {
    const raw = readString(KEYS.defaultPasswordType);
    return (raw as PasswordType) ?? DEFAULT_PASSWORD_TYPE;
  },
  setDefaultPasswordType(value: PasswordType) {
    writeString(KEYS.defaultPasswordType, value);
  },

  getLastUnlockTime(): number {
    const raw = readString(KEYS.lastUnlockTime);
    return raw !== null ? Number(raw) : 0;
  },
  setLastUnlockTime(value: number) {
    writeString(KEYS.lastUnlockTime, String(value));
  },

  isSessionExpired(timeoutMinutes: number, lastUnlockTime: number): boolean {
    if (timeoutMinutes === TIMEOUT_NEVER) return false;
    return Date.now() - lastUnlockTime > timeoutMinutes * 60_000;
  },

  purgeAll() {
    Object.values(KEYS).forEach((key) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* noop */
      }
    });
  },
};

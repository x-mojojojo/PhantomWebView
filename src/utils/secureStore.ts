// secureStore.ts
//
// Web analogue of the Android-Keystore-backed EncryptedSharedPreferences
// used to cache credentials for biometric unlock. A non-extractable
// AES-GCM CryptoKey is generated and kept in IndexedDB — like an
// AndroidKeyStore key, it can encrypt/decrypt but its raw bytes can never
// be exported/read back out by application code.
//
// When running inside Capacitor, delegates to capacitor-native-biometric
// which uses the hardware-backed Android Keystore / iOS Keychain directly.

import { NATIVE } from '../native/native';
import { nativeSetCredentials, nativeGetCredentials } from './biometric';

const DB_NAME = 'phantomkey-secure';
const STORE_NAME = 'keys';
const KEY_ID = 'stateless_biometric_key';
const BLOB_STORAGE_KEY = 'phantomkey.stateless_biometric';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getOrCreateKey(): Promise<CryptoKey> {
  const db = await openDb();
  const existing = await new Promise<CryptoKey | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(KEY_ID);
    req.onsuccess = () => resolve(req.result as CryptoKey | undefined);
    req.onerror = () => reject(req.error);
  });
  if (existing) return existing;

  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ]);
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(key, KEY_ID);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return key;
}

function toB64(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}
function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export interface StoredCredentials {
  name: string;
  pass: string;
}

// ── native path (Android Keystore / iOS Keychain) ────────────────────

const NativeStore = {
  async put(credentials: StoredCredentials): Promise<void> {
    await nativeSetCredentials(credentials.name, credentials.pass);
  },

  async get(): Promise<StoredCredentials | null> {
    const result = await nativeGetCredentials();
    if (!result) return null;
    return { name: result.username, pass: result.password };
  },

  clear() {
    // Native credentials are cleared via biometric.clearBiometricEnrollment()
  },

  hasStoredCredentials(): boolean {
    // We can't synchronously check native keystore — assume false and let
    // the unlock screen discover availability via isBiometricAvailable.
    return false;
  },
};

// ── web path (IndexedDB + WebCrypto) ─────────────────────────────────

const WebStore = {
  async put(credentials: StoredCredentials): Promise<void> {
    const key = await getOrCreateKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode(JSON.stringify(credentials));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
    const payload = { iv: toB64(iv), data: toB64(new Uint8Array(ciphertext)) };
    window.localStorage.setItem(BLOB_STORAGE_KEY, JSON.stringify(payload));
  },

  async get(): Promise<StoredCredentials | null> {
    const raw = window.localStorage.getItem(BLOB_STORAGE_KEY);
    if (!raw) return null;
    try {
      const { iv, data } = JSON.parse(raw);
      const key = await getOrCreateKey();
      const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: fromB64(iv) as BufferSource },
        key,
        fromB64(data) as BufferSource,
      );
      return JSON.parse(new TextDecoder().decode(plaintext));
    } catch {
      return null;
    }
  },

  clear() {
    window.localStorage.removeItem(BLOB_STORAGE_KEY);
  },

  hasStoredCredentials(): boolean {
    return window.localStorage.getItem(BLOB_STORAGE_KEY) !== null;
  },
};

// ── unified export ───────────────────────────────────────────────────

function impl() {
  return NATIVE ? NativeStore : WebStore;
}

export const SecureStore = {
  async put(credentials: StoredCredentials): Promise<void> {
    return impl().put(credentials);
  },
  async get(): Promise<StoredCredentials | null> {
    return impl().get();
  },
  clear() {
    impl().clear();
  },
  hasStoredCredentials(): boolean {
    return impl().hasStoredCredentials();
  },
};

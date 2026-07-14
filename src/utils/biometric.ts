// biometric.ts
//
// Web analogue of AndroidX BiometricPrompt (BIOMETRIC_STRONG | DEVICE_CREDENTIAL).
// Uses the WebAuthn platform-authenticator API, which on modern browsers
// surfaces the same underlying fingerprint / face / device-PIN prompts.
//
// When running inside Capacitor (native Android/iOS), delegates to
// capacitor-native-biometric for hardware-backed biometric auth.

import { getNativeBiometric, NATIVE } from '../native/native';

const CREDENTIAL_ID_KEY = 'phantomkey.webauthn_credential_id';
const RP_NAME = 'PhantomKey';
const NATIVE_SERVER = 'phantomkey-biometric';

function randomBytes(len: number): BufferSource {
  return crypto.getRandomValues(new Uint8Array(len)) as unknown as BufferSource;
}

// ── native path ──────────────────────────────────────────────────────

let _nativeBiometric: Awaited<ReturnType<typeof getNativeBiometric>> = undefined;
let _nativeInit = false;

async function ensureNative() {
  if (!_nativeInit) {
    _nativeBiometric = await getNativeBiometric();
    _nativeInit = true;
  }
  return _nativeBiometric;
}

async function nativeIsAvailable(): Promise<boolean> {
  const nb = await ensureNative();
  if (!nb) return false;
  try {
    const result = await nb.isAvailable();
    return result.isAvailable;
  } catch {
    return false;
  }
}

async function nativeHasCredentials(): Promise<boolean> {
  const nb = await ensureNative();
  if (!nb) return false;
  try {
    // getCredentials will only succeed if credentials were stored and
    // biometric verification passes. We use a short-lived check:
    const result = await nb.getCredentials({ server: NATIVE_SERVER });
    return !!result.password;
  } catch {
    return false;
  }
}

async function nativeEnroll(username: string, password: string): Promise<boolean> {
  const nb = await ensureNative();
  if (!nb) return false;
  try {
    await nb.setCredentials({
      username,
      password,
      server: NATIVE_SERVER,
    });
    return true;
  } catch {
    return false;
  }
}

async function nativeVerify(): Promise<boolean> {
  const nb = await ensureNative();
  if (!nb) return false;
  try {
    await nb.verifyIdentity({
      reason: 'Unlock PhantomKey',
      title: 'PhantomKey',
      subtitle: 'Verify your identity',
    });
    return true;
  } catch {
    return false;
  }
}

async function nativeClear(): Promise<void> {
  const nb = await ensureNative();
  if (!nb) return;
  try {
    await nb.deleteCredentials({ server: NATIVE_SERVER });
  } catch {
    // noop
  }
}

// ── web (WebAuthn) path ──────────────────────────────────────────────

export function hasEnrolledCredential(): boolean {
  return window.localStorage.getItem(CREDENTIAL_ID_KEY) !== null;
}

async function webIsAvailable(): Promise<boolean> {
  if (!window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

async function webEnroll(username: string): Promise<boolean> {
  if (!(await webIsAvailable())) return false;
  try {
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge: randomBytes(32),
        rp: { name: RP_NAME },
        user: {
          id: randomBytes(16),
          name: username || 'phantomkey-user',
          displayName: username || 'PhantomKey User',
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
      },
    })) as PublicKeyCredential | null;

    if (!credential) return false;
    const idB64 = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
    window.localStorage.setItem(CREDENTIAL_ID_KEY, idB64);
    return true;
  } catch {
    return false;
  }
}

async function webVerify(): Promise<boolean> {
  const idB64 = window.localStorage.getItem(CREDENTIAL_ID_KEY);
  try {
    const allowCredentials = idB64
      ? [
          {
            type: 'public-key' as const,
            id: Uint8Array.from(atob(idB64), (c) => c.charCodeAt(0)) as unknown as BufferSource,
          },
        ]
      : undefined;

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: randomBytes(32),
        userVerification: 'required',
        timeout: 60000,
        allowCredentials,
      },
    });
    return assertion !== null;
  } catch {
    return false;
  }
}

// ── public API ───────────────────────────────────────────────────────

export async function isBiometricAvailable(): Promise<boolean> {
  if (NATIVE) return nativeIsAvailable();
  return webIsAvailable();
}

/** Registers a platform authenticator credential the first time biometrics are enabled. */
export async function enrollBiometric(username: string): Promise<boolean> {
  if (NATIVE) return true; // enrollment happens in SecureStore.put via setCredentials
  return webEnroll(username);
}

/** Prompts the platform authenticator (fingerprint / face / PIN). */
export async function verifyBiometric(): Promise<boolean> {
  if (NATIVE) return nativeVerify();
  return webVerify();
}

export function clearBiometricEnrollment() {
  window.localStorage.removeItem(CREDENTIAL_ID_KEY);
  if (NATIVE) nativeClear();
}

// ── native-specific helpers (used by SecureStore) ────────────────────

export async function nativeSetCredentials(username: string, password: string): Promise<boolean> {
  return nativeEnroll(username, password);
}

export async function nativeGetCredentials(): Promise<{ username: string; password: string } | null> {
  const nb = await ensureNative();
  if (!nb) return null;
  try {
    const result = await nb.getCredentials({ server: NATIVE_SERVER });
    if (result.username && result.password) {
      return { username: result.username, password: result.password };
    }
    return null;
  } catch {
    return null;
  }
}

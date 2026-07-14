// MasterKey.ts
//
// TypeScript port of the Kotlin `MasterKey` object. Implements the Spectre /
// Master Password (by Maarten Billemont) key derivation scheme:
//
//   masterKey = scrypt(masterPassword, salt = SCOPE_AUTH + len(fullName) + fullName, N=32768, r=8, p=2, dkLen=64)
//   siteKey   = HMAC-SHA256(masterKey, SCOPE_AUTH  + len(siteName) + siteName + counter)
//   loginKey  = HMAC-SHA256(masterKey, SCOPE_IDENT + len(siteName) + siteName + counter)
//
// The BouncyCastleProvider / Security-provider injection described for the
// Android build has no meaning on the web platform. Instead we rely on the
// audited, dependency-free primitives from `@noble/hashes`, which is the
// closest browser-safe equivalent (pure-JS scrypt + HMAC-SHA256).

import { scryptAsync, scrypt } from '@noble/hashes/scrypt.js';
import { hmac } from '@noble/hashes/hmac.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { concatBytes, uint32BE, utf8 } from './bytes';

export const SCOPE_AUTH = 'com.lyndir.masterpassword';
export const SCOPE_IDENT = 'com.lyndir.masterpassword.login';

const SCRYPT_PARAMS = { N: 32768, r: 8, p: 2, dkLen: 64 };

function buildSalt(fullName: string): Uint8Array {
  const nameBytes = utf8(fullName);
  return concatBytes(utf8(SCOPE_AUTH), uint32BE(nameBytes.length), nameBytes);
}

function buildMessage(scope: string, siteName: string, counter: number): Uint8Array {
  const siteBytes = utf8(siteName);
  return concatBytes(utf8(scope), uint32BE(siteBytes.length), siteBytes, uint32BE(counter));
}

export const MasterKey = {
  /** Asynchronous derivation — used by the UI so scrypt never blocks the main thread. */
  async derive(fullName: string, masterPassword: string): Promise<Uint8Array> {
    const salt = buildSalt(fullName);
    return scryptAsync(utf8(masterPassword), salt, SCRYPT_PARAMS);
  },

  /** Synchronous derivation, kept for parity with the Kotlin API / unit tests. */
  deriveSync(fullName: string, masterPassword: string): Uint8Array {
    const salt = buildSalt(fullName);
    return scrypt(utf8(masterPassword), salt, SCRYPT_PARAMS);
  },

  deriveSiteKey(masterKey: Uint8Array, siteName: string, counter = 1): Uint8Array {
    return hmac(sha256, masterKey, buildMessage(SCOPE_AUTH, siteName, counter));
  },

  deriveLoginKey(masterKey: Uint8Array, siteName: string, counter = 1): Uint8Array {
    return hmac(sha256, masterKey, buildMessage(SCOPE_IDENT, siteName, counter));
  },
};

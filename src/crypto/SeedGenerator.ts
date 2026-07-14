// SeedGenerator.ts — cosmetic "entropy fingerprint" shown during identity
// setup. Uses a DJB2 hash purely for visual/UX feedback; it never touches
// the real cryptographic key material.

export function generateFingerprintHash(fullName: string, masterPassword: string): string {
  if (!fullName.trim() && !masterPassword.trim()) {
    return 'NO_SEED_DETECTED';
  }

  const input = `${fullName}:${masterPassword}`;
  let hash = 5381 >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash * 33) >>> 0) + input.charCodeAt(i);
    hash >>>= 0;
  }

  const hex = hash.toString(16).toUpperCase().padStart(8, '0');
  return `ENTROPY_${hex}`;
}

/** Raw numeric hash, reused by the entropy-fingerprint canvas for its geometry. */
export function djbHash(input: string): number {
  let hash = 5381 >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash * 33) >>> 0) + input.charCodeAt(i);
    hash >>>= 0;
  }
  return hash;
}

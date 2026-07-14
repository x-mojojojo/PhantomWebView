// native.ts — Capacitor platform detection and native API bridge.
// Returns Capacitor native plugin instances when running in a native
// Android/iOS context; undefined otherwise (fall back to web APIs).

export function isNativePlatform(): boolean {
  try {
    // Capacitor sets window.Capacitor on native WebViews
    return !!(window as any).Capacitor?.isNativePlatform?.();
  } catch {
    return false;
  }
}

export const NATIVE = isNativePlatform();

// Lazy imports — tree-shaken when not on native
export async function getNativeBiometric() {
  if (!NATIVE) return undefined;
  try {
    const { NativeBiometric } = await import('capacitor-native-biometric');
    return NativeBiometric;
  } catch {
    return undefined;
  }
}

export async function getNativePreferences() {
  if (!NATIVE) return undefined;
  try {
    const { Preferences } = await import('@capacitor/preferences');
    return Preferences;
  } catch {
    return undefined;
  }
}

export async function getNativeClipboard() {
  if (!NATIVE) return undefined;
  try {
    const { Clipboard } = await import('@capacitor/clipboard');
    return Clipboard;
  } catch {
    return undefined;
  }
}

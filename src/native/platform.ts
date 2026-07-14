// platform.ts — Capacitor native platform initialization.
// Call initPlatform() once at app startup before rendering.

import { NATIVE } from './native';

export async function initPlatform(): Promise<void> {
  if (!NATIVE) return;

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0b0f0e' });
    // Don't overlay — let the WebView sit below the status bar
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {
    // StatusBar plugin not available — ignore
  }
}

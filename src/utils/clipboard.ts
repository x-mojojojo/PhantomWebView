// clipboard.ts
//
// Web analogue of Android's ClipData + IS_SENSITIVE extra. The browser
// clipboard API has no "sensitive" flag, so we approximate the behaviour
// (auto-clearing after a timeout) which is the important security property.
//
// When running inside Capacitor, delegates to @capacitor/clipboard for
// native clipboard access (which on Android can mark as sensitive).

import { getNativeClipboard, NATIVE } from '../native/native';

let sensitiveClipToken = 0;

export async function copyToClipboard(text: string, timeoutSec: number): Promise<void> {
  if (NATIVE) {
    return nativeCopyToClipboard(text, timeoutSec);
  }
  return webCopyToClipboard(text, timeoutSec);
}

export async function copyPlain(text: string): Promise<void> {
  sensitiveClipToken++; // invalidate any pending sensitive auto-clear
  if (NATIVE) {
    const Clipboard = await getNativeClipboard();
    if (Clipboard) {
      await Clipboard.write({ string: text });
      return;
    }
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    fallbackCopy(text);
  }
}

// ── native path ──────────────────────────────────────────────────────

async function nativeCopyToClipboard(text: string, timeoutSec: number): Promise<void> {
  const myToken = ++sensitiveClipToken;
  const Clipboard = await getNativeClipboard();
  if (!Clipboard) {
    // Fallback to web if native clipboard not available
    return webCopyToClipboard(text, timeoutSec);
  }
  await Clipboard.write({ string: text });

  if (timeoutSec > 0) {
    window.setTimeout(async () => {
      if (myToken !== sensitiveClipToken) return;
      try {
        const result = await Clipboard.read();
        if (result.value === text) {
          await Clipboard.write({ string: '' });
        }
      } catch {
        try {
          await Clipboard.write({ string: '' });
        } catch {
          /* noop */
        }
      }
    }, timeoutSec * 1000);
  }
}

// ── web path ─────────────────────────────────────────────────────────

async function webCopyToClipboard(text: string, timeoutSec: number): Promise<void> {
  const myToken = ++sensitiveClipToken;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    fallbackCopy(text);
  }

  if (timeoutSec > 0) {
    window.setTimeout(async () => {
      if (myToken !== sensitiveClipToken) return;
      try {
        const current = await navigator.clipboard.readText();
        if (current === text) {
          await navigator.clipboard.writeText('');
        }
      } catch {
        try {
          await navigator.clipboard.writeText('');
        } catch {
          /* noop */
        }
      }
    }, timeoutSec * 1000);
  }
}

function fallbackCopy(text: string) {
  const el = document.createElement('textarea');
  el.value = text;
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.focus();
  el.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(el);
  }
}

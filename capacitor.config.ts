import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.phantomkey.app',
  appName: 'PhantomKey',
  webDir: 'dist',
  server: {
    // Allow the WebView to load the bundled assets; no remote server needed.
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0b0f0e',
      overlaysWebView: false,
    },
    ScreenOrientation: {
      // Lock to portrait for password manager UX
    },
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;

import { useState } from 'react';
import {
  TIMEOUT_1_MIN,
  TIMEOUT_5_MIN,
  TIMEOUT_10_MIN,
  TIMEOUT_NEVER,
} from '../data/PreferencesManager';
import { PasswordType } from '../crypto/PasswordType';
import { SiteRepository } from '../data/SiteRepository';
import { CloseIcon, ShieldIcon, UploadDownloadIcon } from './icons';
import { Switch } from './ui/Switch';
import { OptionPill } from './ui/Card';
import { Button } from './ui/Button';

interface Props {
  open: boolean;
  onClose: () => void;
  keyTimeout: number;
  onKeyTimeoutChange: (v: number) => void;
  biometricEnabled: boolean;
  onBiometricEnabledChange: (v: boolean) => void;
  biometricSupported: boolean;
  clipboardTimeout: number;
  onClipboardTimeoutChange: (v: number) => void;
  defaultPasswordType: PasswordType;
  onDefaultPasswordTypeChange: (v: PasswordType) => void;
  onLock: () => void;
  onOpenSecuritySettings: () => void;
}

const TIMEOUT_OPTIONS = [
  { label: '1m', value: TIMEOUT_1_MIN },
  { label: '5m', value: TIMEOUT_5_MIN },
  { label: '10m', value: TIMEOUT_10_MIN },
  { label: 'Never', value: TIMEOUT_NEVER },
];

const CLIPBOARD_OPTIONS = [15, 30, 60, 120];
const DEFAULT_TYPE_OPTIONS = [PasswordType.LONG, PasswordType.MAXIMUM, PasswordType.MEDIUM, PasswordType.PIN];

export function SettingsDrawer(props: Props) {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  async function handleExport() {
    try {
      const json = SiteRepository.exportJson();
      await navigator.clipboard.writeText(json);
      setImportStatus('Site history copied to clipboard.');
    } catch {
      setImportStatus('Export failed — clipboard unavailable.');
    }
    window.setTimeout(() => setImportStatus(null), 3000);
  }

  async function handleImport() {
    try {
      const text = await navigator.clipboard.readText();
      const count = SiteRepository.importJson(text);
      setImportStatus(`Imported ${count} site${count === 1 ? '' : 's'}.`);
    } catch {
      setImportStatus('Import failed — invalid JSON on clipboard.');
    }
    window.setTimeout(() => setImportStatus(null), 3000);
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity ${
          props.open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={props.onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[86%] max-w-sm transform overflow-y-auto border-l border-white/8 bg-[#0d1211] shadow-2xl transition-transform duration-300 ${
          props.open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-50">Settings</h2>
          <button
            onClick={props.onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-white/8 hover:text-white"
            aria-label="Close settings"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-5">
          <section>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">Session Timeout</p>
            <div className="flex flex-wrap gap-2">
              {TIMEOUT_OPTIONS.map((opt) => (
                <OptionPill
                  key={opt.label}
                  label={opt.label}
                  selected={props.keyTimeout === opt.value}
                  onClick={() => props.onKeyTimeoutChange(opt.value)}
                />
              ))}
            </div>
          </section>

          <section className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-100">Biometric Lock</p>
              <p className="text-xs text-zinc-500">
                {props.biometricSupported ? 'Unlock with fingerprint / face' : 'Not supported on this device'}
              </p>
            </div>
            <Switch
              checked={props.biometricEnabled}
              onChange={props.onBiometricEnabledChange}
              disabled={!props.biometricSupported}
            />
          </section>

          <section>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">Clipboard Clear</p>
            <div className="flex flex-wrap gap-2">
              {CLIPBOARD_OPTIONS.map((sec) => (
                <OptionPill
                  key={sec}
                  label={`${sec}s`}
                  selected={props.clipboardTimeout === sec}
                  onClick={() => props.onClipboardTimeoutChange(sec)}
                />
              ))}
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">Default Password Type</p>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_TYPE_OPTIONS.map((t) => (
                <OptionPill
                  key={t}
                  label={t}
                  selected={props.defaultPasswordType === t}
                  onClick={() => props.onDefaultPasswordTypeChange(t)}
                />
              ))}
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">Import / Export</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleExport}>
                <UploadDownloadIcon className="h-4 w-4 rotate-180" /> Export
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleImport}>
                <UploadDownloadIcon className="h-4 w-4" /> Import
              </Button>
            </div>
            {importStatus && <p className="mt-2 text-xs text-emerald-300">{importStatus}</p>}
          </section>

          <button
            onClick={props.onOpenSecuritySettings}
            className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left transition-colors hover:border-white/20"
          >
            <span className="flex items-center gap-2 text-sm text-zinc-200">
              <ShieldIcon className="h-4 w-4 text-emerald-300" /> Security Settings
            </span>
            <span className="text-zinc-600">›</span>
          </button>

          <Button variant="danger" onClick={props.onLock} className="w-full">
            Lock Vault
          </Button>
        </div>
      </aside>
    </>
  );
}

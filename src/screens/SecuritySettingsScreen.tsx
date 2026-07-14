import { useState } from 'react';
import { TopBar, IconBtn } from '../components/TopBar';
import { ArrowLeftIcon, ShieldIcon } from '../components/icons';
import { Card, OptionPill } from '../components/ui/Card';
import { Switch } from '../components/ui/Switch';
import { Button } from '../components/ui/Button';
import { useSettingsViewModel } from '../viewmodel/useSettingsViewModel';
import {
  TIMEOUT_1_MIN,
  TIMEOUT_5_MIN,
  TIMEOUT_10_MIN,
  TIMEOUT_NEVER,
} from '../data/PreferencesManager';

interface Props {
  onBack: () => void;
  onPurged: () => void;
  biometricSupported: boolean;
}

const TIMEOUT_OPTIONS = [
  { label: '1 minute', value: TIMEOUT_1_MIN },
  { label: '5 minutes', value: TIMEOUT_5_MIN },
  { label: '10 minutes', value: TIMEOUT_10_MIN },
  { label: 'Never', value: TIMEOUT_NEVER },
];

export function SecuritySettingsScreen({ onBack, onPurged, biometricSupported }: Props) {
  const vm = useSettingsViewModel();
  const [confirmingPurge, setConfirmingPurge] = useState(false);

  async function handlePurge() {
    await vm.purgeAll();
    onPurged();
  }

  return (
    <div className="min-h-screen pb-10">
      <TopBar
        title="Security Settings"
        leading={
          <IconBtn label="Back" onClick={onBack}>
            <ArrowLeftIcon className="h-5 w-5" />
          </IconBtn>
        }
      />

      <main className="mx-auto flex max-w-md flex-col gap-5 px-5 pt-5">
        <Card>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Key Session Timeout
          </p>
          <div className="flex flex-wrap gap-2">
            {TIMEOUT_OPTIONS.map((opt) => (
              <OptionPill
                key={opt.label}
                label={opt.label}
                selected={vm.keyTimeout === opt.value}
                onClick={() => vm.setKeyTimeout(opt.value)}
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-600">
            The derived master key is held only in memory and is discarded automatically after
            this period of inactivity.
          </p>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-100">Biometric Unlock</p>
            <p className="text-xs text-zinc-500">
              {biometricSupported ? 'Fingerprint / face authentication' : 'Unavailable on this device'}
            </p>
          </div>
          <Switch
            checked={vm.biometricEnabled}
            onChange={vm.setBiometricEnabled}
            disabled={!biometricSupported}
          />
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <ShieldIcon className="h-4 w-4 text-emerald-300" />
            <p className="text-sm font-medium text-zinc-100">Cryptographic Core</p>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Algorithm</dt>
              <dd className="font-mono-key text-zinc-300">Spectre / Master Password</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Key Derivation</dt>
              <dd className="font-mono-key text-zinc-300">scrypt N=32768 r=8 p=2</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Site Derivation</dt>
              <dd className="font-mono-key text-zinc-300">HMAC-SHA256</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Build</dt>
              <dd className="font-mono-key text-emerald-300">Stateless v2.0 Stable</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Research Track</dt>
              <dd className="font-mono-key text-zinc-400">Quantum-Resistant Beta</dd>
            </div>
          </dl>
        </Card>

        <Card className="border-red-500/20">
          <p className="text-sm font-medium text-red-400">Emergency Purge</p>
          <p className="mt-1 text-xs text-zinc-500">
            Permanently deletes your identity and all local site metadata from this device. This
            cannot be undone. Since no passwords are ever stored, nothing besides history and
            settings is affected.
          </p>
          {!confirmingPurge ? (
            <Button variant="danger" className="mt-4 w-full" onClick={() => setConfirmingPurge(true)}>
              Purge This Device
            </Button>
          ) : (
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmingPurge(false)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={handlePurge} loading={vm.isPurging}>
                Confirm Purge
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

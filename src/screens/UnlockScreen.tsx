import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { EyeIcon, EyeOffIcon, FingerprintIcon, LockIcon } from '../components/icons';
import { useUnlockViewModel } from '../viewmodel/useUnlockViewModel';

interface Props {
  onUnlocked: (masterKey: Uint8Array) => void;
}

export function UnlockScreen({ onUnlocked }: Props) {
  const vm = useUnlockViewModel();
  const [showPass, setShowPass] = useState(false);
  const autoPromptedRef = useRef(false);

  useEffect(() => {
    if (vm.isUnlocked && vm.unlockedKey) {
      onUnlocked(vm.unlockedKey);
    }
  }, [vm.isUnlocked, vm.unlockedKey, onUnlocked]);

  useEffect(() => {
    if (autoPromptedRef.current) return;
    if (vm.isBiometricAvailable) {
      autoPromptedRef.current = true;
      vm.authenticateWithBiometrics(
        () => {},
        () => {},
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vm.isBiometricAvailable]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10">
          <LockIcon className="h-7 w-7 text-emerald-300" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Welcome back</h1>
        <p className="font-mono-key text-sm text-zinc-500">{vm.storedFullName || 'Unknown identity'}</p>
      </div>

      <div className="flex flex-col gap-4">
        <TextField
          label="Master Password"
          type={showPass ? 'text' : 'password'}
          placeholder="Enter your master password"
          value={vm.masterPassword}
          onChange={(e) => vm.setMasterPassword(e.target.value)}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && vm.unlock()}
          trailing={
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="text-zinc-500 hover:text-zinc-200"
              aria-label="Toggle password visibility"
            >
              {showPass ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          }
        />

        {vm.error && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {vm.error}
          </p>
        )}

        <Button size="lg" className="w-full" onClick={vm.unlock} loading={vm.isUnlocking}>
          Unlock
        </Button>

        {vm.isBiometricAvailable && (
          <Button
            variant="tonal"
            size="lg"
            className="w-full"
            onClick={() =>
              vm.authenticateWithBiometrics(
                () => {},
                (msg) => window.alert(msg),
              )
            }
          >
            <FingerprintIcon className="h-5 w-5" /> Use Biometrics
          </Button>
        )}

        {vm.needsEnrollment && (
          <Button variant="outline" className="w-full" onClick={vm.openEnrollment}>
            Set Up Screen Lock
          </Button>
        )}
      </div>
    </div>
  );
}

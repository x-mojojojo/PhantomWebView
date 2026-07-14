import { useState } from 'react';
import { EntropyFingerprint } from '../components/EntropyFingerprint';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { EyeIcon, EyeOffIcon, KeyIcon } from '../components/icons';
import { useIdentitySetupViewModel } from '../viewmodel/useIdentitySetupViewModel';
import { useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

export function IdentitySetupScreen({ onComplete }: Props) {
  const vm = useIdentitySetupViewModel();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (vm.success) onComplete();
  }, [vm.success, onComplete]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-14">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10">
          <KeyIcon className="h-7 w-7 text-emerald-300" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">PhantomKey</h1>
        <p className="max-w-xs text-sm text-zinc-500">
          A stateless password manager. Your identity generates every password on demand —
          nothing is ever stored.
        </p>
      </div>

      <EntropyFingerprint fullName={vm.fullName} masterPassword={vm.masterPassword} />
      <p className="pk-pulse mb-8 mt-3 text-center font-mono-key text-xs tracking-wider text-emerald-400">
        {vm.fingerprintHash}
      </p>

      <div className="flex flex-col gap-4">
        <TextField
          label="Full Name"
          placeholder="e.g. Robert"
          value={vm.fullName}
          onChange={(e) => vm.setFullName(e.target.value)}
          autoComplete="name"
        />
        <TextField
          label="Master Password"
          type={showPass ? 'text' : 'password'}
          placeholder="Minimum 8 characters"
          value={vm.masterPassword}
          onChange={(e) => vm.setMasterPassword(e.target.value)}
          autoComplete="new-password"
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
        <TextField
          label="Confirm Password"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Re-enter password"
          value={vm.confirmPassword}
          onChange={(e) => vm.setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          trailing={
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="text-zinc-500 hover:text-zinc-200"
              aria-label="Toggle password visibility"
            >
              {showConfirm ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          }
        />

        {vm.error && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {vm.error}
          </p>
        )}

        <Button
          size="lg"
          className="mt-2 w-full"
          onClick={vm.initializeIdentity}
          loading={vm.isInitializing}
        >
          Initialize Identity
        </Button>

        <p className="mt-2 text-center text-[11px] leading-relaxed text-zinc-600">
          Only your full name is ever saved on this device. Your master password and every
          generated password are re-derived mathematically each time — never stored anywhere.
        </p>
      </div>
    </div>
  );
}

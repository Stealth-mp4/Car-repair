"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import PasswordInput from "@/components/ui/PasswordInput";
import { fieldClass } from "@/components/account/ui";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import { updatePassword, type AuthState } from "@/app/auth/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-sweep mono-label mt-2 w-full bg-red px-6 py-3 text-ink disabled:opacity-60"
      style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
    >
      {pending ? "Saving…" : "Set new password"}
    </button>
  );
}

export default function ResetForm({ home, homeLabel }: { home: string; homeLabel: string }) {
  const [state, action] = useActionState<AuthState, FormData>(updatePassword, {});

  // Done: the form has nothing left to offer, so it's replaced by the way out.
  // The recovery link already signed them in, so this is a link, not a login.
  if (state.ok) {
    return (
      <div className="space-y-4">
        <p role="status" className="mono-label normal-case tracking-normal text-ok">
          {state.ok}
        </p>
        <Link
          href={home}
          className="btn-sweep mono-label block w-full bg-red px-6 py-3 text-center text-ink"
          style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
        >
          Go to {homeLabel}
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="next" className="mono-label mb-1.5 block">
          New password
        </label>
        <PasswordInput
          id="next"
          name="next"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoFocus
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="confirm" className="mono-label mb-1.5 block">
          Confirm new password
        </label>
        <PasswordInput
          id="confirm"
          name="confirm"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          className={fieldClass}
        />
      </div>

      {state.error && (
        <p role="alert" className="mono-label text-red">
          {state.error}
        </p>
      )}

      <Submit />

      <p className="mono-label normal-case tracking-normal">
        At least {MIN_PASSWORD_LENGTH} characters. Length beats punctuation.
      </p>
    </form>
  );
}

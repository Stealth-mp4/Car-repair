"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import AuthCard from "@/components/account/AuthCard";
import { fieldClass } from "@/components/account/ui";
import { sendResetLink, type AuthState } from "@/app/auth/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-sweep mono-label mt-2 w-full bg-red px-6 py-3 text-ink disabled:opacity-60"
      style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
    >
      {pending ? "Sending…" : "Send reset link"}
    </button>
  );
}

export default function ForgotForm() {
  const [state, action] = useActionState<AuthState, FormData>(sendResetLink, {});

  return (
    <AuthCard
      eyebrow="Password reset"
      title="Forgot your password?"
      lede="Enter the email address on the account and we'll send a link to set a new one."
      footer={
        <p className="mono-label text-center">
          <Link href="/account/login" className="link-underline text-cream hover:text-red">
            Back to sign in
          </Link>
        </p>
      }
    >
      {/* The success message stays on screen and the form stays usable: the
          link can take a moment, and "nothing happened" makes people resubmit. */}
      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="email" className="mono-label mb-1.5 block">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            autoFocus
            required
            className={fieldClass}
          />
        </div>

        {state.error && (
          <p role="alert" className="mono-label text-red">
            {state.error}
          </p>
        )}
        {state.ok && (
          <p role="status" className="mono-label normal-case tracking-normal text-ok">
            {state.ok}
          </p>
        )}

        <Submit />

        <p className="mono-label normal-case tracking-normal">
          The link expires shortly after it arrives. Check spam if it doesn&apos;t
          show up within a minute.
        </p>
      </form>
    </AuthCard>
  );
}

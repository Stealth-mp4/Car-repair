"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthCard from "@/components/account/AuthCard";
import { Field, fieldClass, PrimaryButton } from "@/components/account/ui";
import { MailIcon, LockIcon } from "@/components/account/icons";
import PasswordInput from "@/components/ui/PasswordInput";
import { signIn, type AccountAuthState } from "@/app/account/actions";

/** Reads the parent form's pending state — no manual isSubmitting flag. */
function Submit() {
  const { pending } = useFormStatus();
  return (
    <PrimaryButton type="submit" disabled={pending} className="w-full rounded-full">
      {pending ? "Signing in…" : "Sign in →"}
    </PrimaryButton>
  );
}

/** Hidden while a new attempt is in flight — the previous failure is stale. */
function Error({ message }: { message?: string }) {
  const { pending } = useFormStatus();
  if (!message || pending) return null;
  return (
    <p role="alert" className="mono-label text-red">
      {message}
    </p>
  );
}

export default function LoginForm() {
  const [state, action] = useActionState<AccountAuthState, FormData>(signIn, {});
  const next = useSearchParams().get("next");

  return (
    <AuthCard
      eyebrow="Customer account"
      title="Sign in"
      lede="Welcome back. An account is optional — you can book and browse without one."
      footer={
        <p className="mono-label">
          No account yet?{" "}
          <Link
            href={`/account/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="link-underline text-red"
          >
            Create one
          </Link>
        </p>
      }
    >
      <form action={action} className="space-y-5">
        <input type="hidden" name="next" value={next ?? ""} />

        <Field label="Email" icon={MailIcon}>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            // key: the action's return value is the only thing that changes
            // between attempts, and React keeps an uncontrolled input's DOM
            // value unless the element is replaced — so without this the field
            // stays exactly as the failed attempt left it.
            key={state.email ?? ""}
            defaultValue={state.email ?? ""}
            className={fieldClass}
          />
        </Field>

        <Field label="Password" icon={LockIcon}>
          <PasswordInput
            name="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className={fieldClass}
          />
        </Field>

        <Error message={state.error} />

        <Submit />

        {/*
          Deliberately left off while customer accounts were a localStorage
          simulation — the reset flow signs into Supabase Auth, which no
          simulated account had. They do now.
        */}
        <p className="mono-label text-center">
          <Link href="/auth/forgot" className="link-underline text-cream/75">
            Forgot your password?
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

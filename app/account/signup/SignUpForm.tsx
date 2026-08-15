"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthCard from "@/components/account/AuthCard";
import { Field, fieldClass, PrimaryButton } from "@/components/account/ui";
import { MailIcon, LockIcon, PhoneIcon, UserIcon, CarIcon } from "@/components/account/icons";
import PasswordInput from "@/components/ui/PasswordInput";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import { signUp, type AccountAuthState } from "@/app/account/actions";

/**
 * Validation lives in the server action, not here. The old client-side copy of
 * the rules was the only check there was; now it would just be a second set to
 * keep in sync with the one that actually decides. `required` and `type=email`
 * still do the cheap browser-level pass.
 */

function Submit() {
  const { pending } = useFormStatus();
  return (
    <PrimaryButton type="submit" disabled={pending} className="w-full rounded-full">
      {pending ? "Creating your account…" : "Create account →"}
    </PrimaryButton>
  );
}

function Message({ state }: { state: AccountAuthState }) {
  const { pending } = useFormStatus();
  if (pending) return null;
  if (state.error) {
    return (
      <p role="alert" className="mono-label text-red">
        {state.error}
      </p>
    );
  }
  if (state.notice) {
    return (
      <p role="status" className="mono-label text-warn">
        {state.notice}
      </p>
    );
  }
  return null;
}

export default function SignUpForm() {
  const [state, action] = useActionState<AccountAuthState, FormData>(signUp, {});
  // ?next= — set by the promos page, so a claim lands back on the offer.
  const next = useSearchParams().get("next");

  return (
    <AuthCard
      wide
      eyebrow="Customer account"
      title="Create your account"
      lede="Track your builds, warranties, and invoices in one place. Booking never requires an account."
      footer={
        <p className="mono-label">
          Already a member?{" "}
          <Link
            href={`/account/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="link-underline text-red"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form action={action} className="space-y-5">
        <input type="hidden" name="next" value={next ?? ""} />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="First name" icon={UserIcon}>
            <input
              name="firstName"
              placeholder="Marcus"
              autoComplete="given-name"
              required
              className={fieldClass}
            />
          </Field>
          <Field label="Last name">
            <input
              name="lastName"
              placeholder="Delgado"
              autoComplete="family-name"
              required
              className={fieldClass}
            />
          </Field>
          <Field label="Email" icon={MailIcon}>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              key={state.email ?? ""}
              defaultValue={state.email ?? ""}
              className={fieldClass}
            />
          </Field>
          <Field label="Phone" icon={PhoneIcon}>
            <input
              name="phone"
              placeholder="(832) 208-1071"
              inputMode="tel"
              autoComplete="tel"
              required
              className={fieldClass}
            />
          </Field>
          <Field label="Vehicle (optional)" icon={CarIcon}>
            <input
              name="vehicle"
              placeholder="2023 Tesla Model 3"
              className={fieldClass}
            />
          </Field>
          <Field label="Password" icon={LockIcon}>
            <PasswordInput
              name="password"
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              autoComplete="new-password"
              required
              className={fieldClass}
            />
          </Field>
          <Field label="Confirm password" icon={LockIcon}>
            <PasswordInput
              name="confirm"
              placeholder="Repeat it"
              autoComplete="new-password"
              required
              className={fieldClass}
            />
          </Field>
        </div>

        <Message state={state} />

        <Submit />

        <p className="text-center text-xs text-muted">
          By creating an account you agree to be contacted about your builds and
          appointments. You can turn off promotional email in your profile.
        </p>
      </form>
    </AuthCard>
  );
}

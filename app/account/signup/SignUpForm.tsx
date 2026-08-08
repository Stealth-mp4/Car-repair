"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/account/AuthCard";
import { Field, fieldClass, PrimaryButton } from "@/components/account/ui";
import { MailIcon, LockIcon, PhoneIcon, UserIcon, CarIcon } from "@/components/account/icons";
import { useAccount } from "@/lib/account/store";

/** Mirrors validateContact in lib/lead.ts — same rules the booking form uses. */
function validate(f: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
}): string | null {
  if (!f.firstName.trim()) return "Please add your first name.";
  if (!f.lastName.trim()) return "Please add your last name.";
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return "That email doesn't look right.";
  if (f.phone.replace(/\D/g, "").length < 10) return "Please add a valid phone number.";
  if (f.password.length < 8) return "Use at least 8 characters for your password.";
  if (f.password !== f.confirm) return "Those passwords don't match.";
  return null;
}

export default function SignUpForm() {
  const signUp = useAccount((s) => s.signUp);
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = validate({ firstName, lastName, email, phone, password, confirm });
    if (invalid) {
      setError(invalid);
      return;
    }

    setStatus("submitting");
    setError(null);

    // Simulated network round-trip — the store is synchronous, but an instant
    // jump to the dashboard reads like the form did nothing.
    await new Promise((r) => setTimeout(r, 700));

    const res = signUp({ firstName, lastName, email, phone, password, vehicle });
    if (!res.ok) {
      setError(res.error ?? "Couldn't create that account.");
      setStatus("idle");
      return;
    }

    // signUp signs the new member straight in.
    setStatus("done");
    router.push("/account");
  };

  return (
    <AuthCard
      wide
      eyebrow="Customer account"
      title="Create your account"
      lede="Track your builds, warranties, and invoices in one place. Booking never requires an account."
      footer={
        <p className="mono-label">
          Already a member?{" "}
          <Link href="/account/login" className="link-underline text-red">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="First name" icon={UserIcon}>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Marcus"
              autoComplete="given-name"
              className={fieldClass}
            />
          </Field>
          <Field label="Last name">
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Delgado"
              autoComplete="family-name"
              className={fieldClass}
            />
          </Field>
          <Field label="Email" icon={MailIcon}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className={fieldClass}
            />
          </Field>
          <Field label="Phone" icon={PhoneIcon}>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(832) 208-1071"
              inputMode="tel"
              autoComplete="tel"
              className={fieldClass}
            />
          </Field>
          <Field label="Vehicle (optional)" icon={CarIcon}>
            <input
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="2023 Tesla Model 3"
              className={fieldClass}
            />
          </Field>
          <Field label="Password" icon={LockIcon}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className={fieldClass}
            />
          </Field>
          <Field label="Confirm password" icon={LockIcon}>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat it"
              autoComplete="new-password"
              className={fieldClass}
            />
          </Field>
        </div>

        {error ? <p className="mono-label text-red">{error}</p> : null}

        <PrimaryButton
          type="submit"
          disabled={status !== "idle"}
          className="w-full rounded-full"
        >
          {status === "idle" ? "Create account →" : "Creating your account…"}
        </PrimaryButton>

        <p className="text-center text-xs text-muted">
          By creating an account you agree to be contacted about your builds and
          appointments. You can turn off promotional email in your profile.
        </p>
      </form>
    </AuthCard>
  );
}

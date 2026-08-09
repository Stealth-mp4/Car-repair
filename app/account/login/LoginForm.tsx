"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/account/AuthCard";
import { Field, fieldClass, PrimaryButton } from "@/components/account/ui";
import { MailIcon, LockIcon } from "@/components/account/icons";
import { useAccount } from "@/lib/account/store";
import { DEMO_LOGIN } from "@/lib/account/data";

export default function LoginForm() {
  const signIn = useAccount((s) => s.signIn);
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = signIn(email, password);
    if (!res.ok) {
      setError(res.error ?? "Couldn't sign you in.");
      setBusy(false);
      return;
    }
    router.push(next && next.startsWith("/account") ? next : "/account");
  };

  /** One click to fill the seeded demo account, so nobody has to retype it. */
  const useDemo = () => {
    setEmail(DEMO_LOGIN.email);
    setPassword(DEMO_LOGIN.password);
    setError(null);
  };

  return (
    <AuthCard
      eyebrow="Customer account"
      title="Sign in"
      lede="Welcome back. An account is optional — you can book and browse without one."
      footer={
        <p className="mono-label">
          No account yet?{" "}
          <Link href="/account/signup" className="link-underline text-red">
            Create one
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <Field label="Email" icon={MailIcon}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className={fieldClass}
          />
        </Field>
        <Field label="Password" icon={LockIcon}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className={fieldClass}
          />
        </Field>

        {error ? <p className="mono-label text-red">{error}</p> : null}

        <PrimaryButton type="submit" disabled={busy} className="w-full rounded-full">
          {busy ? "Signing in…" : "Sign in →"}
        </PrimaryButton>
      </form>

      {/*
        Demo credentials, shown on purpose — the same thing /admin/login does
        with its seeded login. Delete this block when real accounts land.
      */}
      <div className="mono-label mt-6 rounded-input border border-line px-4 py-3 leading-relaxed">
        <span className="text-warn">Demo account</span>
        <br />
        <span className="normal-case tracking-normal text-cream">
          {DEMO_LOGIN.email} / {DEMO_LOGIN.password}
        </span>
        <br />
        <button type="button" onClick={useDemo} className="link-underline mt-1 text-red">
          Fill it in
        </button>
      </div>
    </AuthCard>
  );
}

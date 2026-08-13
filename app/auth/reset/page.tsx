import type { Metadata } from "next";
import Link from "next/link";
import AuthCard from "@/components/account/AuthCard";
import { supabaseServer, currentStaff } from "@/lib/supabase/server";
import ResetForm from "./ResetForm";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

// The recovery cookie is written by /auth/confirm on this same request cycle;
// a cached render would decide "expired" once and keep saying it.
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();

  // No session means the link was never followed, was used already, or has
  // expired. All three are the same dead end from here, and none of them should
  // show a password form that can't submit.
  if (!user) {
    return (
      <AuthCard
        eyebrow="Password reset"
        title="That link has expired"
        lede="Reset links are single-use and short-lived. Ask for a fresh one and it'll work."
      >
        <Link
          href="/auth/forgot"
          className="btn-sweep mono-label block w-full bg-red px-6 py-3 text-center text-ink"
          style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
        >
          Send a new link
        </Link>
      </AuthCard>
    );
  }

  // Staff and customers share this page but not their destinations.
  const staff = await currentStaff();

  return (
    <AuthCard
      eyebrow="Password reset"
      title="Set a new password"
      lede={`Signed in as ${user.email}. Choose something you don't use anywhere else.`}
    >
      <ResetForm home={staff ? "/admin" : "/account"} homeLabel={staff ? "the console" : "your account"} />
    </AuthCard>
  );
}

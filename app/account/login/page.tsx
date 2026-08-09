import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false, nocache: true },
};

export default function AccountLoginPage() {
  // useSearchParams needs a Suspense boundary to keep this route static.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

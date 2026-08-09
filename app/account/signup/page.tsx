import type { Metadata } from "next";
import { Suspense } from "react";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false, nocache: true },
};

export default function AccountSignUpPage() {
  // useSearchParams (for ?ref=) needs a Suspense boundary to keep this static.
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}

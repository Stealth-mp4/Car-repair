import type { Metadata } from "next";
import ForgotForm from "./ForgotForm";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

/**
 * Shared by staff and customers — one flow, because both are Supabase auth
 * users and a second copy of this would be a second place to get it wrong.
 */
export default function ForgotPasswordPage() {
  return <ForgotForm />;
}

"use client";

import { useState } from "react";

/**
 * Password field with a Show/Hide toggle. Spreads every prop onto the input, so
 * it drops into both idioms in this codebase: the controlled account forms
 * (value/onChange + fieldClass) and the uncontrolled admin ones (name + field).
 *
 * Padding is inline because the callers' classes already set `px-4`, and two
 * Tailwind padding utilities on one element is a coin flip.
 */

/** Eye, gaining a slash when the password is visible. Inline rather than in an
 *  icon set — one consumer, and the slash is a conditional child. */
function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.75" />
      {off && <path d="M4 20 20 4" />}
    </svg>
  );
}
export default function PasswordInput({
  className = "",
  style,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const [shown, setShown] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={shown ? "text" : "password"}
        className={className}
        style={{ paddingRight: "3.25rem", ...style }}
      />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-pressed={shown}
        aria-label={shown ? "Hide password" : "Show password"}
        title={shown ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-input p-1.5 text-muted transition-colors hover:text-red"
      >
        <EyeIcon off={shown} />
      </button>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import PasswordInput from "@/components/ui/PasswordInput";
import { signIn, type LoginState } from "./actions";

const field =
  "w-full rounded-input border border-line bg-black px-4 py-3 text-ink outline-none transition-colors placeholder:text-muted focus:border-red";

function Submit() {
  // useFormStatus reads the parent <form>'s pending state — no manual
  // isSubmitting flag to keep in sync.
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-sweep mono-label mt-2 w-full bg-red px-6 py-3 text-ink disabled:opacity-60"
      style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
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

export default function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />

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
          // key: the action's return value is the only thing that changes
          // between attempts, and React keeps an uncontrolled input's DOM value
          // unless the element is replaced. Without this the field stays blank
          // after a failed attempt, which is where it was left.
          key={state.email ?? ""}
          defaultValue={state.email ?? ""}
          className={field}
        />
      </div>

      <div>
        <label htmlFor="password" className="mono-label mb-1.5 block">
          Password
        </label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
          className={field}
        />
      </div>

      <Error message={state.error} />

      <Submit />
    </form>
  );
}

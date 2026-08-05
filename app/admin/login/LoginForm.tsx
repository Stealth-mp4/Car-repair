"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
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

export default function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />

      <div>
        <label htmlFor="user" className="mono-label mb-1.5 block">
          Username
        </label>
        <input
          id="user"
          name="user"
          type="text"
          autoComplete="username"
          autoFocus
          required
          className={field}
        />
      </div>

      <div>
        <label htmlFor="password" className="mono-label mb-1.5 block">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={field}
        />
      </div>

      {state.error && (
        <p role="alert" className="mono-label text-red">
          {state.error}
        </p>
      )}

      <Submit />
    </form>
  );
}

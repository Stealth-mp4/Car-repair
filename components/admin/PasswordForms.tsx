"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import PasswordInput from "@/components/ui/PasswordInput";
import { useAdmin } from "@/lib/admin/store";
import {
  changePassword,
  setStaffPassword,
  type PasswordState,
} from "@/app/admin/(console)/account/actions";

const field =
  "w-full rounded-input border border-line bg-black px-4 py-3 text-ink outline-none transition-colors placeholder:text-muted focus:border-red";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-sweep mono-label mt-2 bg-red px-6 py-3 text-ink disabled:opacity-60"
      style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

function Result({ state }: { state: PasswordState }) {
  if (state.error) return <p role="alert" className="mono-label text-red">{state.error}</p>;
  if (state.ok) return <p role="status" className="mono-label text-ok">{state.ok}</p>;
  return null;
}

/** Everyone's own password. Reachable by every role at /admin/account. */
export function ChangePassword() {
  const [state, action] = useActionState<PasswordState, FormData>(changePassword, {});

  return (
    <form action={action} className="space-y-4 p-5">
      <div>
        <label htmlFor="current" className="mono-label mb-1.5 block">Current password</label>
        <PasswordInput id="current" name="current" autoComplete="current-password" required className={field} />
      </div>
      <div>
        <label htmlFor="next" className="mono-label mb-1.5 block">New password</label>
        <PasswordInput id="next" name="next" autoComplete="new-password" required minLength={10} className={field} />
      </div>
      <div>
        <label htmlFor="confirm" className="mono-label mb-1.5 block">Confirm new password</label>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" required minLength={10} className={field} />
      </div>
      <Result state={state} />
      <Submit label="Change password" />
    </form>
  );
}

/** Owner-only recovery, standing in for the reset email the shop has no SMTP for. */
export function ResetStaffPassword() {
  const [state, action] = useActionState<PasswordState, FormData>(setStaffPassword, {});
  const staff = useAdmin((s) => s.staff);
  const me = useAdmin((s) => s.me);

  return (
    <form action={action} className="space-y-4 p-5">
      <div>
        <label htmlFor="staffId" className="mono-label mb-1.5 block">Staff member</label>
        <select id="staffId" name="staffId" required className={field} defaultValue="">
          <option value="" disabled>Choose someone…</option>
          {staff
            // You change your own password with the form above, which asks for
            // the current one. Routing yourself through here would skip that.
            .filter((s) => s.id !== me?.id)
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.access}
              </option>
            ))}
        </select>
      </div>
      <div>
        <label htmlFor="staff-next" className="mono-label mb-1.5 block">New password</label>
        <PasswordInput id="staff-next" name="next" autoComplete="new-password" required minLength={10} className={field} />
      </div>
      <div>
        <label htmlFor="staff-confirm" className="mono-label mb-1.5 block">Confirm new password</label>
        <PasswordInput id="staff-confirm" name="confirm" autoComplete="new-password" required minLength={10} className={field} />
      </div>
      <Result state={state} />
      <Submit label="Set password" />
    </form>
  );
}

"use client";

import { useActionState, useState, useTransition } from "react";
import { useCustomer, useVehicles, firstName, lastName } from "@/lib/account/customer";
import {
  updateProfile,
  changePassword,
  setPrimaryVehicle,
  toggleNotification,
  type ProfileState,
} from "@/app/account/actions";

import {
  Panel,
  Field,
  Toggle,
  fieldClass,
  PrimaryButton,
  GhostButton,
  formatDate,
} from "@/components/account/ui";
import PasswordInput from "@/components/ui/PasswordInput";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  CarIcon,
  LockIcon,
  BellRingIcon,
} from "@/components/account/icons";

const NOTIFICATIONS: { key: "billing" | "service" | "promos"; label: string }[] = [
  { key: "billing", label: "Invoice & payment alerts" },
  { key: "service", label: "Service reminders" },
  { key: "promos", label: "Promotions & new drops" },
];

/**
 * Two forms, not one, and that is the point.
 *
 * They used to be a single "Save changes" button over a client-side store.
 * Contact details and passwords now go to different places — one UPDATEs the
 * `customers` row under RLS, the other re-authenticates against Supabase Auth —
 * and a password that fails its check should not silently discard a name edit
 * on its way past. Separate actions, separate results.
 */
export default function AccountProfilePage() {
  const customer = useCustomer();
  const vehicles = useVehicles();

  // Both of these write on click, so there's no form to hang useActionState on.
  // useTransition is what keeps the row from being clicked twice mid-flight and
  // what lets the revalidated layout swap the values back in.
  const [pending, start] = useTransition();
  const [prefError, setPrefError] = useState<string | null>(null);

  const run = (action: () => Promise<ProfileState>) =>
    start(async () => setPrefError((await action()).error ?? null));

  const [profileState, saveProfile, savingProfile] =
    useActionState<ProfileState, FormData>(updateProfile, {});
  const [passwordState, savePassword, savingPassword] =
    useActionState<ProfileState, FormData>(changePassword, {});

  // Uncontrolled would be simpler, but Cancel has to put the fields back.
  const [first, setFirst] = useState(firstName(customer));
  const [last, setLast] = useState(lastName(customer));
  const [email, setEmail] = useState(customer.email);
  const [phone, setPhone] = useState(customer.phone);

  const reset = () => {
    setFirst(firstName(customer));
    setLast(lastName(customer));
    setEmail(customer.email);
    setPhone(customer.phone);
  };

  return (
    <div className="space-y-6">
      <form action={saveProfile} className="space-y-6">
        <Panel title="Personal details">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="First name" icon={UserIcon}>
              <input
                name="firstName"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                autoComplete="given-name"
                className={fieldClass}
              />
            </Field>
            <Field label="Last name">
              <input
                name="lastName"
                value={last}
                onChange={(e) => setLast(e.target.value)}
                autoComplete="family-name"
                className={fieldClass}
              />
            </Field>
            <Field label="Email address" icon={MailIcon}>
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={fieldClass}
              />
            </Field>
            <Field label="Phone" icon={PhoneIcon}>
              <input
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                autoComplete="tel"
                className={fieldClass}
              />
            </Field>
          </div>

          {/* Says so plainly rather than letting someone change this and then
              find out at the next sign-in. Moving the login address needs a
              confirmation link to the new mailbox, and no SMTP is wired yet. */}
          <p className="mono-label mt-4">
            This is the address the shop contacts you on. To change the email you
            sign in with, ask the shop.
          </p>

          <p className="mono-label mt-5">Member since {formatDate(customer.joined)}</p>
        </Panel>

        <div className="flex flex-wrap items-center justify-end gap-3">
          {profileState.error ? (
            <p role="alert" className="mono-label mr-auto text-red">{profileState.error}</p>
          ) : profileState.ok ? (
            <p role="status" className="mono-label mr-auto text-ok">{profileState.ok}</p>
          ) : null}
          <GhostButton type="button" onClick={reset}>
            Cancel
          </GhostButton>
          <PrimaryButton type="submit" disabled={savingProfile} className="rounded-full">
            {savingProfile ? "Saving…" : "Save changes"}
          </PrimaryButton>
        </div>
      </form>

      <Panel title="Your vehicles">
        {vehicles.length === 0 ? (
          <p className="text-sm text-cream/70">
            No vehicles on your record yet. The shop adds these at intake — ask
            them to put your car on file and it&apos;ll show up here.
          </p>
        ) : (
          <>
            <p className="text-sm text-cream/70">
              Pick the one we should assume when you book. Everything else about a
              vehicle is maintained by the shop.
            </p>
            <ul className="mt-4">
              {vehicles.map((v) => {
                const isPrimary = v.id === customer.primaryVehicleId;
                return (
                  <li key={v.id}>
                    {/* A radio, not a toggle: exactly one can be primary, and a
                        row of switches would imply otherwise. */}
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isPrimary}
                      disabled={pending || isPrimary}
                      onClick={() => run(() => setPrimaryVehicle(v.id))}
                      className="flex w-full items-center justify-between gap-6 border-b border-line py-3.5 text-left last:border-b-0 disabled:cursor-default"
                    >
                      <span>
                        <span className="block text-sm text-ink">
                          {`${v.year} ${v.make} ${v.model}`}
                        </span>
                        {v.vin ? (
                          <span className="mono-label mt-1 block">VIN {v.vin}</span>
                        ) : null}
                      </span>
                      <span
                        className={`mono-label shrink-0 ${isPrimary ? "text-red" : "text-cream/50"}`}
                      >
                        {isPrimary ? "✓ Primary" : "Make primary"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Panel>

      <form action={savePassword} className="space-y-6">
        <Panel title="Security">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Required, and not decoration: an active session is enough for
                Supabase to change a password, which would make any unattended
                signed-in machine a silent account takeover. */}
            <Field label="Current password" icon={LockIcon}>
              <PasswordInput
                name="current"
                autoComplete="current-password"
                required
                className={fieldClass}
              />
            </Field>
            <div className="hidden sm:block" />
            <Field label="New password" icon={LockIcon}>
              <PasswordInput
                name="next"
                placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                autoComplete="new-password"
                required
                className={fieldClass}
              />
            </Field>
            <Field label="Confirm password" icon={LockIcon}>
              <PasswordInput
                name="confirm"
                placeholder="Repeat it"
                autoComplete="new-password"
                required
                className={fieldClass}
              />
            </Field>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
            {passwordState.error ? (
              <p role="alert" className="mono-label mr-auto text-red">{passwordState.error}</p>
            ) : passwordState.ok ? (
              <p role="status" className="mono-label mr-auto text-ok">{passwordState.ok}</p>
            ) : null}
            <PrimaryButton type="submit" disabled={savingPassword} className="rounded-full">
              {savingPassword ? "Changing…" : "Change password"}
            </PrimaryButton>
          </div>
        </Panel>
      </form>

      <Panel>
        <p className="mono-label flex items-center gap-2 text-red">
          <BellRingIcon className="h-3.5 w-3.5" />
          Notifications
        </p>
        <div className="mt-4">
          {NOTIFICATIONS.map((n) => (
            <Toggle
              key={n.key}
              label={n.label}
              on={customer.notifications[n.key]}
              onChange={() => run(() => toggleNotification(n.key))}
            />
          ))}
        </div>
        {prefError ? (
          <p role="alert" className="mono-label mt-4 text-red">{prefError}</p>
        ) : (
          <p className="mono-label mt-4">Saved as you switch them.</p>
        )}
        {/* ponytail: stored, not yet acted on — no SMTP means nothing sends
            mail to honour these. They record the preference so whatever sends
            it later has something to obey. */}
        <p className="mono-label mt-2 text-warn">
          Email isn&apos;t switched on yet — we&apos;ll follow these once it is.
        </p>
      </Panel>

    </div>
  );
}

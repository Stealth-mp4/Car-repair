"use client";

import { useState } from "react";
import { useAccount, currentUser } from "@/lib/account/store";
import type { NotificationKey } from "@/lib/account/data";
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
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  CarIcon,
  LockIcon,
  BellRingIcon,
} from "@/components/account/icons";

const NOTIFICATIONS: { key: NotificationKey; label: string }[] = [
  { key: "billing", label: "Invoice & payment alerts" },
  { key: "service", label: "Service reminders" },
  { key: "promos", label: "Promotions & new drops" },
];

export default function AccountProfilePage() {
  const user = useAccount(currentUser);
  const updateProfile = useAccount((s) => s.updateProfile);
  const changePassword = useAccount((s) => s.changePassword);
  const toggleNotification = useAccount((s) => s.toggleNotification);

  // Seeded from the store once; the store is the source of truth on save.
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [makeModel, setMakeModel] = useState(user?.vehicle.makeModel ?? "");
  const [plate, setPlate] = useState(user?.vehicle.plate ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (!user) return null;

  const reset = () => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setPhone(user.phone);
    setMakeModel(user.vehicle.makeModel);
    setPlate(user.vehicle.plate);
    setPassword("");
    setConfirm("");
    setMessage(null);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      setMessage({ ok: false, text: "Name can't be blank." });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setMessage({ ok: false, text: "That email doesn't look right." });
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      setMessage({ ok: false, text: "Please add a valid phone number." });
      return;
    }

    // Password is optional here — blank means "leave it alone".
    if (password || confirm) {
      if (password !== confirm) {
        setMessage({ ok: false, text: "Those passwords don't match." });
        return;
      }
      const res = changePassword(password);
      if (!res.ok) {
        setMessage({ ok: false, text: res.error ?? "Couldn't change your password." });
        return;
      }
    }

    updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      vehicle: { makeModel: makeModel.trim(), plate: plate.trim() },
    });

    setPassword("");
    setConfirm("");
    setMessage({ ok: true, text: "Saved." });
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <Panel title="Personal details">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="First name" icon={UserIcon}>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              className={fieldClass}
            />
          </Field>
          <Field label="Last name">
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              className={fieldClass}
            />
          </Field>
          <Field label="Email address" icon={MailIcon}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={fieldClass}
            />
          </Field>
          <Field label="Phone" icon={PhoneIcon}>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              autoComplete="tel"
              className={fieldClass}
            />
          </Field>
        </div>
        <p className="mono-label mt-5">Member since {formatDate(user.joined)}</p>
      </Panel>

      <Panel title="Primary vehicle">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Make & model" icon={CarIcon}>
            <input
              value={makeModel}
              onChange={(e) => setMakeModel(e.target.value)}
              placeholder="2023 Tesla Model 3"
              className={fieldClass}
            />
          </Field>
          <Field label="Plate">
            <input
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="ABC 1234"
              className={fieldClass}
            />
          </Field>
        </div>
      </Panel>

      <Panel title="Security">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="New password" icon={LockIcon}>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              autoComplete="new-password"
              className={fieldClass}
            />
          </Field>
          <Field label="Confirm password" icon={LockIcon}>
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat it"
              autoComplete="new-password"
              className={fieldClass}
            />
          </Field>
        </div>
      </Panel>

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
              on={user.notifications[n.key]}
              onChange={() => toggleNotification(n.key)}
            />
          ))}
        </div>
        <p className="mono-label mt-4">Toggles save immediately.</p>
      </Panel>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {message ? (
          <p className={`mono-label mr-auto ${message.ok ? "text-ok" : "text-red"}`}>
            {message.text}
          </p>
        ) : null}
        <GhostButton type="button" onClick={reset}>
          Cancel
        </GhostButton>
        <PrimaryButton type="submit" className="rounded-full">
          Save changes
        </PrimaryButton>
      </div>
    </form>
  );
}

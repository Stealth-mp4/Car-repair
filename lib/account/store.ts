/**
 * lib/account/store.ts — the customer account area's single zustand store.
 *
 * Same shape of thing as lib/admin/store.ts: one store holding the domain data
 * plus the shell's UI state, seeded synchronously from lib/account/data.ts.
 * The difference is that this one is `persist`ed, because a customer who
 * refreshes the page expects to still be signed in.
 *
 * ============================ SECURITY ============================
 * THIS IS A SIMULATION AND MUST NOT SHIP AS THE REAL LOGIN.
 *
 * Everything lives in the visitor's own localStorage: the "user table",
 * the session, and the passwords — in plain text, readable from the console by
 * anyone sitting at the machine. There is no server, so:
 *   - "signing in" is a string comparison the client performs on itself and
 *     can trivially bypass;
 *   - the account area's gate is cosmetic, not a security boundary;
 *   - accounts exist only in the browser that created them.
 *
 * Nothing behind this gate is actually sensitive today — Service History and
 * Billing read the same seeded content/*.json the Passport access-code page
 * already serves — so the simulation leaks nothing real. It stops being true
 * the moment a live customer record goes in.
 *
 * To make it real: move `users` to a database, hash passwords (scrypt/argon2),
 * issue a signed httpOnly session cookie the way lib/admin/auth.ts already
 * does, gate /account in middleware.ts, and keep this store for UI state only.
 * ==================================================================
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  seedUser,
  type AccountUser,
  type NotificationKey,
  type AppointmentRequest,
} from "@/lib/account/data";

export type Result = { ok: boolean; error?: string };

export type SignUpInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  vehicle?: string;
};

type UiState = { navOpen: boolean };

type AccountState = {
  /** the simulated user table */
  users: AccountUser[];
  session: { userId: string | null };
  ui: UiState;
};

type Actions = {
  signUp: (input: SignUpInput) => Result;
  signIn: (email: string, password: string) => Result;
  signOut: () => void;

  setNavOpen: (open: boolean) => void;

  updateProfile: (patch: Partial<AccountUser>) => void;
  changePassword: (next: string) => Result;
  toggleNotification: (key: NotificationKey) => void;

  requestAppointment: (req: Omit<AppointmentRequest, "id" | "createdAt" | "status">) => void;
  /** Records a promo claim against the signed-in member. Idempotent per offer. */
  claimPromo: (promo: { id: string; headline: string }) => void;
};

export type AccountStore = AccountState & Actions;

const today = () => new Date().toISOString().slice(0, 10);
const id = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
const normalizeEmail = (e: string) => e.trim().toLowerCase();

export const useAccount = create<AccountStore>()(
  persist(
    (set, get) => ({
      users: [seedUser],
      session: { userId: null },
      ui: { navOpen: false },

      signUp: (input) => {
        const email = normalizeEmail(input.email);
        if (get().users.some((u) => normalizeEmail(u.email) === email)) {
          return { ok: false, error: "An account with that email already exists." };
        }

        const now = today();
        const user: AccountUser = {
          id: id("usr"),
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          email: input.email.trim(),
          phone: input.phone.trim(),
          password: input.password,
          vehicle: { makeModel: input.vehicle?.trim() ?? "", plate: "" },
          joined: now,
          appointments: [],
          claims: [],
          activity: [
            {
              id: id("ac"),
              kind: "account",
              label: "Account created",
              detail: "Welcome to Iqballaz Customs",
              date: now,
            },
          ],
          notifications: { billing: true, service: true, promos: false },
        };

        set((s) => ({ users: [...s.users, user], session: { userId: user.id } }));
        return { ok: true };
      },

      signIn: (email, password) => {
        const target = normalizeEmail(email);
        const user = get().users.find((u) => normalizeEmail(u.email) === target);
        // One message for both cases: saying "no such email" tells an attacker
        // which addresses are registered.
        if (!user || user.password !== password) {
          return { ok: false, error: "That email and password don't match an account." };
        }
        set({ session: { userId: user.id } });
        return { ok: true };
      },

      signOut: () => set({ session: { userId: null }, ui: { navOpen: false } }),

      setNavOpen: (navOpen) => set({ ui: { navOpen } }),

      updateProfile: (patch) =>
        set((s) => ({ users: patchUser(s, (u) => ({ ...u, ...patch })) })),

      changePassword: (next) => {
        if (next.length < 8) {
          return { ok: false, error: "Use at least 8 characters." };
        }
        set((s) => ({ users: patchUser(s, (u) => ({ ...u, password: next })) }));
        return { ok: true };
      },

      toggleNotification: (key) =>
        set((s) => ({
          users: patchUser(s, (u) => ({
            ...u,
            notifications: { ...u.notifications, [key]: !u.notifications[key] },
          })),
        })),

      requestAppointment: (req) => {
        const now = today();
        set((s) => ({
          users: patchUser(s, (u) => ({
            ...u,
            appointments: [
              { ...req, id: id("apt"), createdAt: now, status: "requested" as const },
              ...u.appointments,
            ],
            activity: [
              {
                id: id("ac"),
                kind: "service" as const,
                label: "Appointment requested",
                detail: req.service || "Service request",
                date: now,
              },
              ...u.activity,
            ],
          })),
        }));
      },

      claimPromo: (promo) => {
        const now = today();
        set((s) => ({
          users: patchUser(s, (u) =>
            // Claiming twice is a re-visit to checkout, not a second offer.
            u.claims.some((c) => c.promoId === promo.id)
              ? u
              : {
                  ...u,
                  claims: [
                    { promoId: promo.id, headline: promo.headline, claimedAt: now },
                    ...u.claims,
                  ],
                  activity: [
                    {
                      id: id("ac"),
                      kind: "account" as const,
                      label: "Promo claimed",
                      detail: promo.headline,
                      date: now,
                    },
                    ...u.activity,
                  ],
                }
          ),
        }));
      },
    }),
    {
      name: "iq-account",
      version: 3,
      // UI state is per-visit; persisting `navOpen` would reopen the drawer on
      // every load. Everything else is the simulated database.
      partialize: (s) => ({ users: s.users, session: s.session }),
      // v1 users carry plan/points/referral fields that no longer exist, and v2
      // users predate `claims`. Rather than migrate dead data, drop the stored
      // table back to the seed — this is a demo store, and a stale localStorage
      // shouldn't outlive the schema.
      migrate: () => ({ users: [seedUser], session: { userId: null } }),
    },
  ),
);

/* ---- Internals ----------------------------------------------------------- */

/** Applies `fn` to the signed-in user only; a no-op when nobody is signed in. */
function patchUser(s: AccountState, fn: (u: AccountUser) => AccountUser): AccountUser[] {
  const { userId } = s.session;
  if (!userId) return s.users;
  return s.users.map((u) => (u.id === userId ? fn(u) : u));
}

/* ---- Derived selectors --------------------------------------------------- */

export const currentUser = (s: AccountStore | AccountState): AccountUser | undefined =>
  s.users.find((u) => u.id === s.session.userId);

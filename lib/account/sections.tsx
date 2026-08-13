/**
 * lib/account/sections.tsx — the account sidebar's single source of truth.
 * Mirrors lib/admin/sections.tsx: the nav list, the page <h1>, and the little
 * breadcrumb eyebrow all read from here so they can't drift apart.
 */
import type { SVGProps } from "react";
import {
  GridIcon,
  CalendarIcon,
  ClockIcon,
  CardIcon,
  UserIcon,
  StarIcon,
} from "@/components/account/icons";

export type AccountSection = {
  /** "" is the dashboard index (/account) */
  slug: string;
  label: string;
  /** small caps line above the page title */
  eyebrow: string;
  title: string;
  lede: string;
  icon: (p: SVGProps<SVGSVGElement>) => React.ReactElement;
};

export const sections: AccountSection[] = [
  {
    slug: "",
    label: "Overview",
    eyebrow: "Dashboard · Welcome back",
    title: "Overview",
    lede: "Here's what's happening with your account today.",
    icon: GridIcon,
  },
  {
    slug: "book",
    label: "Book Appointment",
    eyebrow: "Book · Schedule a visit",
    title: "Book an appointment",
    lede: "Pick a service and a time — we confirm by phone during business hours.",
    icon: CalendarIcon,
  },
  {
    slug: "history",
    label: "Service History",
    eyebrow: "Service history · Garage records",
    title: "Service history",
    lede: "A complete record of every visit, fitment, and warranty.",
    icon: ClockIcon,
  },
  {
    slug: "promos",
    label: "Promos",
    eyebrow: "Promos · Member offers",
    title: "Promos",
    lede: "Live offers, and the ones you've already claimed.",
    icon: StarIcon,
  },
  {
    slug: "billing",
    label: "Billing",
    eyebrow: "Billing · Payments & invoices",
    title: "Billing",
    lede: "Review your invoice history and manage how you pay.",
    icon: CardIcon,
  },
  {
    slug: "profile",
    label: "Profile",
    eyebrow: "Profile · Account settings",
    title: "Profile",
    lede: "Manage your personal details, vehicle, and preferences.",
    icon: UserIcon,
  },
];

export const accountHref = (slug: string) => (slug ? `/account/${slug}` : "/account");

export const getSection = (slug: string) => sections.find((s) => s.slug === slug);

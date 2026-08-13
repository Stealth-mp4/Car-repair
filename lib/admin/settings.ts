import { business, hours, social, openingHours } from "@/lib/site";

// Re-exported so the settings form and action keep one import. The parser
// itself lives apart from this file because this one imports lib/site.ts,
// which drags in path aliases that node --test can't resolve.
export { WEEKDAYS, parseOpeningHours, type OpeningHours } from "./opening-hours";

/**
 * The editable subset of lib/site.ts.
 *
 * Deliberately a subset: `business` also holds hero copy, wordmarks and asset
 * paths, which are design decisions rather than shop details and have no
 * business being edited from a settings form. What's here is the stuff that
 * changes when the shop moves, reprices, or gets a new phone line.
 */
export type ShopSettings = {
  business: {
    name: string;
    phone: string;
    phoneHref: string;
    email: string;
    url: string;
    street: string;
    locality: string;
    region: string;
    postalCode: string;
  };
  hours: { day: string; value: string }[];
  /**
   * The schema.org version of the hours above — what search engines read.
   * Separate from `hours` on purpose: that one is free text a human writes,
   * this one is structured data, and deriving either from the other means
   * parsing prose into weekday arrays.
   */
  openingHours: { days: string[]; opens: string; closes: string }[];
  social: {
    instagram: string;
    instagramHandle: string;
    facebook: string;
    tiktok: string;
    tiktokHandle: string;
  };
};

export type SettingsKey = keyof ShopSettings;

/** lib/site.ts, reshaped. Used whenever a group has never been saved. */
export const DEFAULT_SETTINGS: ShopSettings = {
  business: {
    name: business.name,
    phone: business.phone,
    phoneHref: business.phoneHref,
    email: business.email,
    url: business.url,
    street: business.address.street,
    locality: business.address.locality,
    region: business.address.region,
    postalCode: business.address.postalCode,
  },
  hours: hours.map((h) => ({ day: h.day, value: h.value })),
  openingHours: openingHours.map((h) => ({ days: [...h.days], opens: h.opens, closes: h.closes })),
  social: { ...social },
};

/** Field order and labels for the form. Also the whitelist the action trusts. */
export const BUSINESS_FIELDS: { name: keyof ShopSettings["business"]; label: string; type?: string }[] = [
  { name: "name", label: "Business name" },
  { name: "phone", label: "Phone (displayed)" },
  { name: "phoneHref", label: "Phone (dial link)" },
  { name: "email", label: "Email", type: "email" },
  { name: "url", label: "Website", type: "url" },
  { name: "street", label: "Street" },
  { name: "locality", label: "City" },
  { name: "region", label: "State" },
  { name: "postalCode", label: "ZIP" },
];

export const SOCIAL_FIELDS: { name: keyof ShopSettings["social"]; label: string; type?: string }[] = [
  { name: "instagram", label: "Instagram URL", type: "url" },
  { name: "instagramHandle", label: "Instagram handle" },
  { name: "facebook", label: "Facebook URL", type: "url" },
  { name: "tiktok", label: "TikTok URL", type: "url" },
  { name: "tiktokHandle", label: "TikTok handle" },
];

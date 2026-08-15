/**
 * lib/admin/sections.tsx — one config that drives the sidebar, every list page,
 * and every create/edit form. Adding a console section means adding one entry
 * here, not a new route file: `app/admin/[section]/page.tsx` renders whatever
 * this describes and `RowForm` builds the dialog from `fields`.
 *
 * `def()` keeps each entry's row type narrow inside its own `cell` / `sortBy` /
 * `blank` callbacks while erasing it at the boundary, so the generic table and
 * form don't need generics of their own.
 */

import type { ReactNode } from "react";
import type { AdminStore, RowCollections } from "@/lib/admin/store";
import {
  GridIcon,
  CalendarIcon,
  UsersIcon,
  CarIcon,
  LayersIcon,
  WrenchIcon,
  FileIcon,
  CardIcon,
  ChartIcon,
  StarIcon,
  MailIcon,
  UserIcon,
  BoxIcon,
  GearIcon,
  ListIcon,
} from "@/components/admin/icons";
import { currency, shortDate, timeLabel } from "@/lib/admin/format";
import { TODAY } from "@/lib/admin/data";
import StatusPill, { type Tone } from "@/components/admin/StatusPill";
import CopyCode from "@/components/admin/CopyCode";
import ReplyLinks from "@/components/admin/ReplyLinks";
import ReadToggle from "@/components/admin/ReadToggle";

export type Row = { id: string };

export type Column = {
  label: string;
  cell: (row: Row) => ReactNode;
  /**
   * Section slug the viewer must be able to see for this column to render.
   * For columns derived from another table: a technician can't read invoices,
   * so a customer's lifetime value comes back 0 for them — and a confident $0
   * is worse than no column.
   */
  needs?: string;
  /** return a sortable primitive to make the column sortable; omit to disable */
  sortBy?: (row: Row) => string | number;
  /** right-align numeric columns */
  right?: boolean;
  /** hide below lg — keeps narrow screens to the columns that matter */
  secondary?: boolean;
};

/** One form control. `key` may be a dotted path (e.g. "ppf.coverage"). */
export type Field = {
  key: string;
  label: string;
  /**
   * "image" is the one type that isn't a plain input: it uploads to the
   * `promo-images` bucket and stores the resulting public URL in the row. See
   * components/admin/ImageField.tsx.
   */
  type:
    | "text"
    | "number"
    | "date"
    | "time"
    | "datetime-local"
    | "select"
    | "textarea"
    | "checkbox"
    | "image";
  options?: readonly string[];
  /**
   * Options read from the store instead of a fixed list — for foreign keys,
   * where the valid values are whatever rows exist right now.
   */
  optionsFrom?: (s: AdminStore) => { value: string; label: string }[];
  /**
   * Copy the chosen option's label into this key too. Appointments and projects
   * store `customerName` alongside `customerId`; picking an owner has to set
   * both or the row shows one customer's name against another's id.
   */
  syncLabelTo?: string;
  required?: boolean;
  /** takes the full row width instead of half */
  wide?: boolean;
};

/**
 * The owner picker. `customerId` is `not null references customers` on
 * appointments, projects and vehicles, so a form without it can create rows
 * that the database refuses — which is exactly what it did: every "New
 * appointment" failed on the foreign key, silently.
 */
const customerField = (syncLabelTo?: string): Field => ({
  key: "customerId",
  label: "Customer",
  type: "select",
  required: true,
  optionsFrom: (s) => s.customers.map((c) => ({ value: c.id, label: c.name })),
  syncLabelTo,
});

/**
 * Vehicle picker. Unlike customerField there is no syncLabelTo: a service
 * record stores only `vehicleId`, and the label is rebuilt from the vehicles
 * collection at render time. Copying a denormalised name would go stale the
 * first time the shop corrects a model.
 */
const vehicleField = (): Field => ({
  key: "vehicleId",
  label: "Vehicle",
  type: "select",
  required: true,
  optionsFrom: (s) =>
    s.vehicles.map((v) => ({
      value: v.id,
      label: `${v.year} ${v.make} ${v.model}${v.customerName ? ` — ${v.customerName}` : ""}`,
    })),
});

export type SectionDef = {
  slug: string;
  label: string;
  group: "main" | "management";
  icon: (p: { className?: string }) => ReactNode;
  /** dashboard + settings render bespoke pages instead of a table */
  table?: {
    title: string;
    /** singular noun for buttons and dialogs ("New appointment") */
    noun: string;
    blurb: string;
    /** which store collection edits write back to */
    collection: keyof RowCollections;
    rows: (s: AdminStore) => Row[];
    columns: Column[];
    fields: Field[];
    /** defaults for a newly created row */
    blank: () => Row;
    /**
     * Set false where hand-creating a row makes no sense. Messages are things
     * that ARRIVED — typing one in invents an enquiry nobody sent.
     */
    create?: boolean;
    /** fields concatenated for the console search box */
    searchText: (row: Row) => string;
    /** optional status filter chips */
    filters?: { label: string; match: (row: Row) => boolean }[];
  };
};

function def<T extends Row>(cfg: {
  slug: string;
  label: string;
  group: "main" | "management";
  icon: SectionDef["icon"];
  table?: {
    title: string;
    noun: string;
    blurb: string;
    collection: keyof RowCollections;
    rows: (s: AdminStore) => T[];
    columns: {
      label: string;
      cell: (row: T) => ReactNode;
      needs?: string;
      sortBy?: (row: T) => string | number;
      right?: boolean;
      secondary?: boolean;
    }[];
    fields: Field[];
    // Typed as Row, not T, deliberately: a blank row carries literal defaults
    // ("pending", 0, "") that would otherwise narrow T and fight `rows`, which
    // is where the row type should come from.
    blank: () => Row;
    create?: boolean;
    searchText: (row: T) => string;
    filters?: { label: string; match: (row: T) => boolean }[];
  };
}): SectionDef {
  return cfg as unknown as SectionDef;
}

/** Short unique id for rows created in the console. Called on submit, never
 *  during render, so it can't desync a server/client render. */
export const newId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

/* ---- Status tone maps ----------------------------------------------------
 * One place decides what "good / warning / bad" looks like, so an appointment
 * status and an invoice status never disagree about which green they use.
 * ------------------------------------------------------------------------- */
const tones: Record<string, Tone> = {
  confirmed: "ok",
  completed: "ok",
  paid: "ok",
  settled: "ok",
  active: "ok",
  published: "ok",
  pending: "warn",
  due: "warn",
  invited: "warn",
  "in-progress": "accent",
  cancelled: "bad",
  overdue: "bad",
  suspended: "bad",
  refunded: "bad",
  "on-hold": "muted",
  hidden: "muted",
  inactive: "muted",
};

export const toneFor = (status: string): Tone => tones[status] ?? "muted";

const pill = (status: string, label?: string) => (
  <StatusPill tone={toneFor(status)}>{label ?? status.replace("-", " ")}</StatusPill>
);

/* ---- Shared option lists (kept next to the types they mirror) ------------- */
export const APPOINTMENT_STATUS = ["confirmed", "pending", "completed", "cancelled"] as const;
const PROJECT_STATUS = ["in-progress", "pending", "completed", "on-hold"] as const;
const INVOICE_STATUS = ["paid", "due", "overdue"] as const;

/* ---- Sections ------------------------------------------------------------ */

export const sections: SectionDef[] = [
  def({ slug: "", label: "Dashboard", group: "main", icon: GridIcon }),

  def({
    slug: "appointments",
    label: "Appointments",
    group: "main",
    icon: CalendarIcon,
    table: {
      title: "Appointments",
      noun: "appointment",
      blurb: "Every booked, requested, and completed slot.",
      collection: "appointments",
      rows: (s) => s.appointments,
      searchText: (a) => `${a.vehicle} ${a.customerName} ${a.service} ${a.status}`,
      blank: () => ({
        id: newId("apt"),
        customerId: "",
        customerName: "",
        vehicle: "",
        service: "",
        date: TODAY,
        time: "10:00",
        status: "pending" as const,
      }),
      fields: [
        { key: "vehicle", label: "Vehicle", type: "text", required: true, wide: true },
        customerField("customerName"),
        { key: "service", label: "Service", type: "text", required: true },
        { key: "date", label: "Date", type: "date", required: true },
        { key: "time", label: "Time", type: "time", required: true },
        { key: "status", label: "Status", type: "select", options: APPOINTMENT_STATUS },
        { key: "image", label: "Photo path", type: "text" },
      ],
      filters: [
        { label: "Confirmed", match: (a) => a.status === "confirmed" },
        { label: "Pending", match: (a) => a.status === "pending" },
        { label: "Completed", match: (a) => a.status === "completed" },
        { label: "Cancelled", match: (a) => a.status === "cancelled" },
      ],
      columns: [
        {
          label: "Vehicle",
          sortBy: (a) => a.vehicle,
          cell: (a) => (
            <div>
              <p className="text-ink">{a.vehicle}</p>
              <p className="mono-label mt-1">{a.service}</p>
            </div>
          ),
        },
        { label: "Customer", sortBy: (a) => a.customerName, cell: (a) => a.customerName, secondary: true },
        { label: "Date", sortBy: (a) => a.date + a.time, cell: (a) => shortDate(a.date) },
        { label: "Time", sortBy: (a) => a.time, cell: (a) => timeLabel(a.time), secondary: true },
        { label: "Status", sortBy: (a) => a.status, cell: (a) => pill(a.status), right: true },
      ],
    },
  }),

  def({
    slug: "customers",
    label: "Customers",
    group: "main",
    icon: UsersIcon,
    table: {
      title: "Customers",
      noun: "customer",
      blurb: "Everyone with a record in the shop, newest first.",
      collection: "customers",
      rows: (s) => [...s.customers].sort((a, b) => b.joined.localeCompare(a.joined)),
      searchText: (c) => `${c.name} ${c.email} ${c.phone}`,
      blank: () => ({
        id: newId("cust"),
        name: "",
        phone: "",
        email: "",
        accessCode: "",
        joined: TODAY,
        vehicleCount: 0,
        lifetimeValue: 0,
      }),
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "email", label: "Email", type: "text", required: true },
        { key: "phone", label: "Phone", type: "text", required: true },
        { key: "accessCode", label: "Passport code", type: "text" },
        { key: "joined", label: "Joined", type: "date" },
        { key: "vehicleCount", label: "Vehicles", type: "number" },
        { key: "lifetimeValue", label: "Lifetime value", type: "number" },
      ],
      columns: [
        {
          label: "Customer",
          sortBy: (c) => c.name,
          cell: (c) => (
            <div>
              <p className="text-ink">{c.name}</p>
              <p className="mono-label mt-1 normal-case tracking-normal">{c.email}</p>
            </div>
          ),
        },
        { label: "Phone", cell: (c) => c.phone, secondary: true },
        {
          // Read straight off the row rather than out of the edit dialog — see
          // CopyCode. Null for anyone the view withholds it from.
          label: "Passport code",
          sortBy: (c) => c.accessCode ?? "",
          cell: (c) => <CopyCode value={c.accessCode ?? null} />,
        },
        { label: "Vehicles", sortBy: (c) => c.vehicleCount, cell: (c) => c.vehicleCount, right: true, secondary: true },
        {
          label: "Lifetime",
          sortBy: (c) => c.lifetimeValue,
          cell: (c) => currency(c.lifetimeValue),
          needs: "invoices",
          right: true,
        },
        { label: "Joined", sortBy: (c) => c.joined, cell: (c) => shortDate(c.joined), right: true, secondary: true },
      ],
    },
  }),

  def({
    slug: "vehicles",
    label: "Vehicles",
    group: "main",
    icon: CarIcon,
    table: {
      title: "Vehicles",
      noun: "vehicle",
      blurb: "Every vehicle on file, with the finish currently on it.",
      collection: "vehicles",
      rows: (s) => s.vehicles,
      searchText: (v) => `${v.year} ${v.make} ${v.model} ${v.customerName ?? ""} ${v.vin ?? ""}`,
      blank: () => ({
        id: newId("veh"),
        customerId: "",
        customerName: "",
        make: "",
        model: "",
        year: new Date(`${TODAY}T00:00:00Z`).getUTCFullYear(),
        vin: "",
        wrapColor: "",
        media: [],
        lastService: TODAY,
      }),
      fields: [
        { key: "year", label: "Year", type: "number", required: true },
        { key: "make", label: "Make", type: "text", required: true },
        { key: "model", label: "Model", type: "text", required: true },
        // No syncLabelTo: on vehicles `customerName` comes from the
        // admin_vehicles view, and writable() strips it before the write.
        { ...customerField(), label: "Owner" },
        { key: "vin", label: "VIN", type: "text" },
        { key: "wrapColor", label: "Finish", type: "text" },
        { key: "ppf.coverage", label: "PPF coverage", type: "text" },
        { key: "tint.shade", label: "Tint shade", type: "text" },
        { key: "lastService", label: "Last service", type: "date" },
      ],
      columns: [
        {
          label: "Vehicle",
          sortBy: (v) => `${v.make} ${v.model}`,
          cell: (v) => (
            <div>
              <p className="text-ink">{`${v.year} ${v.make} ${v.model}`}</p>
              <p className="mono-label mt-1">{v.vin || "VIN not on file"}</p>
            </div>
          ),
        },
        {
          label: "Owner",
          // Null when the viewer can't read customers — admin_vehicles left-joins
          // them, so a technician gets the car without the owner's name. A dash
          // says "withheld"; a blank cell reads as missing data.
          sortBy: (v) => v.customerName ?? "",
          cell: (v) => v.customerName ?? <span className="text-muted">&mdash;</span>,
        },
        { label: "Finish", cell: (v) => v.wrapColor || "—", secondary: true },
        {
          label: "PPF / Tint",
          cell: (v) => [v.ppf?.coverage, v.tint?.shade].filter(Boolean).join(" · ") || "—",
          secondary: true,
        },
        { label: "Last service", sortBy: (v) => v.lastService, cell: (v) => shortDate(v.lastService), right: true },
      ],
    },
  }),

  def({
    slug: "service-records",
    label: "Service records",
    group: "main",
    icon: WrenchIcon,
    table: {
      title: "Service records",
      noun: "service record",
      blurb: "What was done to each car, and what it's covered by.",
      collection: "serviceRecords",
      rows: (s) => s.serviceRecords,
      searchText: (r) => `${r.service} ${r.notes ?? ""} ${r.warrantyProvider ?? ""}`,
      blank: () => ({
        id: newId("sr"),
        vehicleId: "",
        service: "",
        date: TODAY,
        notes: "",
        buildSlug: "",
        warrantyExpires: "",
        warrantyProvider: "",
        warrantyTerms: "",
      }),
      fields: [
        vehicleField(),
        // Free text, not a select over serviceFacets: the catalogue is the
        // marketing site's five headline services, and the shop records jobs
        // that don't map onto them ("Wheels", a one-off repair).
        { key: "service", label: "Service", type: "text", required: true },
        { key: "date", label: "Date", type: "date", required: true },
        { key: "notes", label: "Notes", type: "textarea", wide: true },
        { key: "buildSlug", label: "Gallery build slug", type: "text" },
        // Leave the expiry blank for work that carries no warranty. Blank means
        // "none", which is not the same as expired and doesn't render as cover.
        { key: "warrantyExpires", label: "Warranty until", type: "date" },
        { key: "warrantyProvider", label: "Warranty provider", type: "text" },
        { key: "warrantyTerms", label: "Warranty terms", type: "textarea", wide: true },
      ],
      columns: [
        {
          label: "Service",
          sortBy: (r) => r.service,
          cell: (r) => (
            <div>
              <p className="text-ink">{r.service}</p>
              <p className="mono-label mt-1">{r.notes || "No notes"}</p>
            </div>
          ),
        },
        {
          label: "Vehicle",
          // Derived by the admin_service_records view, not stored — correcting
          // a car's model shouldn't leave stale labels across its history. Null
          // when the viewer can't read the vehicle; a dash says "withheld",
          // where a blank cell would read as missing data.
          sortBy: (r) => r.vehicleLabel ?? "",
          cell: (r) => r.vehicleLabel ?? <span className="text-muted">&mdash;</span>,
        },
        { label: "Date", sortBy: (r) => r.date, cell: (r) => shortDate(r.date) },
        {
          label: "Warranty",
          sortBy: (r) => r.warrantyExpires ?? "",
          cell: (r) => {
            if (!r.warrantyExpires) return <span className="text-muted">none</span>;
            // Compared against the shop's own TODAY, not the viewer's clock —
            // same reason the dashboard pins it.
            const expired = r.warrantyExpires < TODAY;
            return (
              <span className={expired ? "text-muted" : "text-ok"}>
                {expired ? `expired ${shortDate(r.warrantyExpires)}` : `to ${shortDate(r.warrantyExpires)}`}
                {r.warrantyProvider ? ` · ${r.warrantyProvider}` : ""}
              </span>
            );
          },
          secondary: true,
        },
      ],
    },
  }),

  def({
    slug: "projects",
    label: "Projects",
    group: "main",
    icon: LayersIcon,
    table: {
      title: "Projects",
      noun: "project",
      blurb: "Work in the bay, queued, and recently closed out.",
      collection: "projects",
      rows: (s) => s.projects,
      searchText: (p) => `${p.vehicle} ${p.customerName} ${p.service} ${p.assignedTo} ${p.status}`,
      blank: () => ({
        id: newId("prj"),
        customerId: "",
        customerName: "",
        vehicle: "",
        service: "",
        status: "pending" as const,
        value: 0,
        startDate: TODAY,
        dueDate: TODAY,
        progress: 0,
        assignedTo: "",
      }),
      fields: [
        { key: "vehicle", label: "Vehicle", type: "text", required: true, wide: true },
        customerField("customerName"),
        { key: "service", label: "Service", type: "text", required: true },
        { key: "assignedTo", label: "Assigned to", type: "text" },
        { key: "status", label: "Status", type: "select", options: PROJECT_STATUS },
        { key: "value", label: "Value (USD)", type: "number" },
        { key: "progress", label: "Progress (%)", type: "number" },
        { key: "startDate", label: "Start", type: "date" },
        { key: "dueDate", label: "Due", type: "date" },
      ],
      filters: [
        { label: "In progress", match: (p) => p.status === "in-progress" },
        { label: "Pending", match: (p) => p.status === "pending" },
        { label: "Completed", match: (p) => p.status === "completed" },
        { label: "On hold", match: (p) => p.status === "on-hold" },
      ],
      columns: [
        {
          label: "Project",
          sortBy: (p) => p.vehicle,
          cell: (p) => (
            <div>
              <p className="text-ink">{p.vehicle}</p>
              <p className="mono-label mt-1">{p.service}</p>
            </div>
          ),
        },
        { label: "Assigned", sortBy: (p) => p.assignedTo, cell: (p) => p.assignedTo, secondary: true },
        {
          label: "Progress",
          sortBy: (p) => p.progress,
          cell: (p) => (
            <div className="flex items-center gap-3">
              <span className="h-1 w-20 rounded-full bg-line">
                <span
                  className="block h-1 rounded-full bg-red"
                  style={{ width: `${p.progress}%` }}
                />
              </span>
              <span className="mono-label">{p.progress}%</span>
            </div>
          ),
        },
        { label: "Value", sortBy: (p) => p.value, cell: (p) => currency(p.value), right: true, secondary: true },
        { label: "Due", sortBy: (p) => p.dueDate, cell: (p) => shortDate(p.dueDate), right: true, secondary: true },
        { label: "Status", sortBy: (p) => p.status, cell: (p) => pill(p.status), right: true },
      ],
    },
  }),

  def({
    slug: "services",
    label: "Services",
    group: "main",
    icon: WrenchIcon,
    table: {
      title: "Services",
      noun: "service",
      blurb: "The bookable catalogue. Titles mirror the public site.",
      collection: "services",
      // ServiceItem is keyed by slug (it mirrors the public site); the table
      // only ever needs a stable row key, so alias it rather than duplicating
      // an `id` field into the catalogue.
      rows: (s) => s.services.map((x) => ({ ...x, id: x.slug })),
      searchText: (x) => `${x.title} ${x.slug}`,
      blank: () => ({
        id: "",
        slug: "",
        title: "",
        price: 0,
        duration: 0,
        active: true,
        bookings: 0,
      }),
      fields: [
        { key: "title", label: "Service", type: "text", required: true },
        { key: "slug", label: "Slug", type: "text", required: true },
        { key: "price", label: "From (USD)", type: "number" },
        { key: "duration", label: "Shop hours", type: "number" },
        { key: "bookings", label: "Bookings", type: "number" },
        { key: "active", label: "Bookable", type: "checkbox" },
      ],
      columns: [
        { label: "Service", sortBy: (x) => x.title, cell: (x) => <span className="text-ink">{x.title}</span> },
        { label: "From", sortBy: (x) => x.price, cell: (x) => (x.price ? currency(x.price) : "—"), right: true },
        {
          label: "Shop hours",
          sortBy: (x) => x.duration,
          cell: (x) => (x.duration ? `${x.duration}h` : "—"),
          right: true,
          secondary: true,
        },
        { label: "Bookings", sortBy: (x) => x.bookings, cell: (x) => x.bookings, right: true, secondary: true },
        { label: "Status", cell: (x) => pill(x.active ? "active" : "inactive"), right: true },
      ],
    },
  }),

  def({
    slug: "promos",
    label: "Promos",
    group: "main",
    icon: StarIcon,
    table: {
      title: "Promos",
      noun: "promo",
      blurb: "Offers on /promos and in the bar above the nav. Claimed from a customer account.",
      collection: "promos",
      // Soonest deadline first, matching activePromos() on the public site.
      rows: (s) => [...s.promos].sort((a, b) => a.endsAt.localeCompare(b.endsAt)),
      searchText: (p) => `${p.headline} ${p.label} ${p.id}`,
      blank: () => ({
        id: newId("promo"),
        barText: "",
        label: "LIMITED",
        headline: "",
        detail: "",
        image: "",
        endsAt: `${TODAY}T23:59`,
        // `href` is not on the form: an offer with a price sends people to a
        // Square checkout built per customer, and one without a price sends them
        // to the quote form. Neither is a URL worth asking the office to type,
        // and a typo in it used to mean a dead claim button.
        cta: { label: "Claim this offer", href: "/quote" },
        payUrl: "",
      }),
      filters: [
        { label: "Live", match: (p) => p.endsAt > TODAY },
        { label: "Expired", match: (p) => p.endsAt <= TODAY },
      ],
      fields: [
        { key: "headline", label: "Headline", type: "text", required: true, wide: true },
        { key: "detail", label: "Detail", type: "textarea", wide: true },
        { key: "label", label: "Window label", type: "text" },
        { key: "barText", label: "Promo bar text", type: "text" },
        { key: "endsAt", label: "Ends", type: "datetime-local", required: true },
        { key: "image", label: "Image", type: "image", wide: true },
        { key: "spotsTotal", label: "Spots total", type: "number" },
        { key: "spotsLeft", label: "Spots left", type: "number" },
        // In cents, because that's what Square charges in and dollars-as-float
        // is how someone gets billed $19.989999999. Set it and the claim button
        // generates a Square link per customer whose payment confirms itself;
        // leave it blank and the offer uses the fixed Payment link below and is
        // confirmed by hand. Both work — see 0016.
        { key: "priceCents", label: "Price (cents)", type: "number" },
        { key: "cta.label", label: "Button label", type: "text" },
      ],
      columns: [
        {
          label: "Offer",
          sortBy: (p) => p.headline,
          cell: (p) => (
            <span>
              <span className="block text-ink">{p.headline}</span>
              <span className="mono-label">{p.label}</span>
            </span>
          ),
        },
        {
          label: "Ends",
          sortBy: (p) => p.endsAt,
          cell: (p) => shortDate(p.endsAt.slice(0, 10)),
          secondary: true,
        },
        {
          label: "Spots",
          sortBy: (p) => p.spotsLeft ?? -1,
          cell: (p) =>
            p.spotsTotal && p.spotsLeft !== undefined
              ? `${p.spotsLeft} / ${p.spotsTotal}`
              : "\u2014",
          right: true,
          secondary: true,
        },
        {
          // Priced offers take money online; the rest send people to the quote
          // form, which is a legitimate way to run an offer and not a fault.
          label: "Price",
          sortBy: (p) => p.priceCents ?? -1,
          cell: (p) =>
            p.priceCents
              ? `$${(p.priceCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              : pill("pending", "by quote"),
          right: true,
          secondary: true,
        },
        {
          label: "Status",
          cell: (p) => pill(p.endsAt > TODAY ? "published" : "hidden", p.endsAt > TODAY ? "live" : "expired"),
          right: true,
        },
      ],
    },
  }),

  def({
    slug: "promo-claims",
    label: "Promo claims",
    group: "main",
    icon: CardIcon,
    table: {
      title: "Promo claims",
      noun: "claim",
      blurb: "Who went to checkout for an offer. Tick Paid once you see it in Square.",
      collection: "promoClaims",
      // Unconfirmed first: this list exists to be worked through, and the rows
      // needing a decision are the ones that should be at the top.
      rows: (s) =>
        [...s.promoClaims].sort(
          (a, b) =>
            Number(a.paid) - Number(b.paid) || b.claimedAt.localeCompare(a.claimedAt),
        ),
      // Order id included so a payment can be found from either direction: paste
      // the Square order number in here, or copy this one into Square.
      searchText: (c) => `${c.headline} ${c.customerName ?? ""} ${c.squareOrderId ?? ""}`,
      // Claims are made by customers pressing a button, or by the shop from the
      // customer's own record. Inventing one from a blank form means typing raw
      // ids for both ends, which is how you attach a sale to the wrong person.
      create: false,
      blank: () => ({ id: "", customerId: "", promoId: "", headline: "", claimedAt: "", paid: false }),
      fields: [
        // The only editable thing. Everything else is a record of what happened
        // and the database refuses to change it — see guard_claim_edit in 0015.
        { key: "paid", label: "Paid (confirmed in Square)", type: "checkbox", wide: true },
      ],
      filters: [
        { label: "Awaiting payment", match: (c) => !c.paid },
        { label: "Paid", match: (c) => c.paid },
      ],
      columns: [
        {
          label: "Customer",
          sortBy: (c) => c.customerName ?? "",
          cell: (c) => (
            <div>
              <p className="text-ink">{c.customerName ?? <span className="text-muted">&mdash;</span>}</p>
              <p className="mono-label mt-1">{c.headline}</p>
            </div>
          ),
        },
        {
          label: "Claimed",
          sortBy: (c) => c.claimedAt,
          cell: (c) => shortDate(c.claimedAt.slice(0, 10)),
          secondary: true,
        },
        {
          label: "Payment",
          sortBy: (c) => Number(c.paid),
          // "Awaiting" rather than "unpaid": nothing here knows they didn't pay,
          // only that nobody has confirmed they did.
          cell: (c) =>
            c.paid
              ? pill("paid", c.paidAt ? `paid ${shortDate(c.paidAt.slice(0, 10))}` : "paid")
              : pill("pending", "awaiting"),
          right: true,
        },
        {
          // Who did the confirming. A tick with a Square order behind it came
          // from the webhook; one without it was somebody's judgement — which is
          // the difference between "Square says so" and "Dave says so" when a
          // customer rings up disputing it. It is also how you tell the
          // integration is actually working rather than being quietly bypassed.
          label: "Source",
          sortBy: (c) => (c.squareOrderId ? 1 : 0),
          cell: (c) =>
            !c.paid ? (
              <span className="text-muted">&mdash;</span>
            ) : c.squareOrderId ? (
              <span className="mono-label" title={c.squareOrderId}>
                square {c.squareOrderId.slice(0, 8)}
              </span>
            ) : (
              <span className="mono-label text-muted">by hand</span>
            ),
          right: true,
          secondary: true,
        },
      ],
    },
  }),

  def({
    slug: "invoices",
    label: "Invoices",
    group: "main",
    icon: FileIcon,
    table: {
      title: "Invoices",
      noun: "invoice",
      blurb: "Issued invoices and what's still outstanding.",
      collection: "invoices",
      rows: (s) => [...s.invoices].sort((a, b) => b.date.localeCompare(a.date)),
      searchText: (i) => `${i.id} ${i.customerName} ${i.description} ${i.status}`,
      blank: () => ({
        id: newId("inv"),
        vehicleId: "",
        customerId: "",
        customerName: "",
        date: TODAY,
        dueDate: TODAY,
        description: "",
        amount: 0,
        status: "due" as const,
      }),
      fields: [
        { key: "customerName", label: "Customer", type: "text", required: true },
        { key: "description", label: "Description", type: "text", required: true, wide: true },
        { key: "amount", label: "Amount (USD)", type: "number", required: true },
        { key: "status", label: "Status", type: "select", options: INVOICE_STATUS },
        { key: "date", label: "Issued", type: "date" },
        { key: "dueDate", label: "Due", type: "date" },
      ],
      filters: [
        { label: "Paid", match: (i) => i.status === "paid" },
        { label: "Due", match: (i) => i.status === "due" },
        { label: "Overdue", match: (i) => i.status === "overdue" },
      ],
      columns: [
        {
          label: "Invoice",
          sortBy: (i) => i.id,
          cell: (i) => (
            <div>
              <p className="mono-label text-ink uppercase">{i.id}</p>
              <p className="mt-1 text-muted">{i.description}</p>
            </div>
          ),
        },
        { label: "Customer", sortBy: (i) => i.customerName, cell: (i) => i.customerName, secondary: true },
        { label: "Issued", sortBy: (i) => i.date, cell: (i) => shortDate(i.date), secondary: true },
        { label: "Due", sortBy: (i) => i.dueDate, cell: (i) => shortDate(i.dueDate), secondary: true },
        {
          label: "Amount",
          sortBy: (i) => i.amount,
          cell: (i) => <span className="text-ink">{currency(i.amount)}</span>,
          right: true,
        },
        { label: "Status", sortBy: (i) => i.status, cell: (i) => pill(i.status), right: true },
      ],
    },
  }),

  def({
    slug: "payments",
    label: "Payments",
    group: "main",
    icon: CardIcon,
    table: {
      title: "Payments",
      noun: "payment",
      blurb: "Money in, by method and settlement state.",
      collection: "payments",
      rows: (s) => [...s.payments].sort((a, b) => b.date.localeCompare(a.date)),
      searchText: (p) => `${p.id} ${p.customerName} ${p.method} ${p.invoiceId} ${p.status}`,
      blank: () => ({
        id: newId("pay"),
        invoiceId: "",
        customerName: "",
        amount: 0,
        method: "Card" as const,
        date: TODAY,
        status: "pending" as const,
      }),
      fields: [
        { key: "customerName", label: "Customer", type: "text", required: true },
        { key: "invoiceId", label: "Against invoice", type: "text", required: true },
        { key: "amount", label: "Amount (USD)", type: "number", required: true },
        {
          key: "method",
          label: "Method",
          type: "select",
          options: ["Card", "Cash", "Financing", "Bank transfer"],
        },
        { key: "status", label: "Status", type: "select", options: ["settled", "pending", "refunded"] },
        { key: "date", label: "Date", type: "date" },
      ],
      columns: [
        {
          label: "Payment",
          sortBy: (p) => p.id,
          cell: (p) => (
            <div>
              <p className="mono-label text-ink uppercase">{p.id}</p>
              <p className="mono-label mt-1">against {p.invoiceId}</p>
            </div>
          ),
        },
        { label: "Customer", sortBy: (p) => p.customerName, cell: (p) => p.customerName },
        { label: "Method", sortBy: (p) => p.method, cell: (p) => p.method, secondary: true },
        { label: "Date", sortBy: (p) => p.date, cell: (p) => shortDate(p.date), secondary: true },
        {
          label: "Amount",
          sortBy: (p) => p.amount,
          cell: (p) => <span className="text-ink">{currency(p.amount)}</span>,
          right: true,
        },
        { label: "Status", sortBy: (p) => p.status, cell: (p) => pill(p.status), right: true },
      ],
    },
  }),

  def({
    slug: "finance",
    label: "Finance",
    group: "main",
    icon: ChartIcon,
    table: {
      title: "Finance",
      noun: "ledger entry",
      blurb: "Ledger of revenue and cost lines for the period.",
      collection: "finance",
      rows: (s) => [...s.finance].sort((a, b) => b.date.localeCompare(a.date)),
      searchText: (f) => `${f.label} ${f.category}`,
      blank: () => ({
        id: newId("fin"),
        label: "",
        category: "Revenue" as const,
        amount: 0,
        date: TODAY,
      }),
      fields: [
        { key: "label", label: "Entry", type: "text", required: true, wide: true },
        {
          key: "category",
          label: "Category",
          type: "select",
          options: ["Revenue", "Materials", "Payroll", "Overhead", "Marketing"],
        },
        { key: "amount", label: "Amount (negative = cost)", type: "number", required: true },
        { key: "date", label: "Date", type: "date" },
      ],
      filters: [
        { label: "Revenue", match: (f) => f.amount > 0 },
        { label: "Costs", match: (f) => f.amount < 0 },
      ],
      columns: [
        { label: "Entry", sortBy: (f) => f.label, cell: (f) => <span className="text-ink">{f.label}</span> },
        { label: "Category", sortBy: (f) => f.category, cell: (f) => f.category, secondary: true },
        { label: "Date", sortBy: (f) => f.date, cell: (f) => shortDate(f.date), secondary: true },
        {
          label: "Amount",
          sortBy: (f) => f.amount,
          cell: (f) => (
            <span className={f.amount < 0 ? "text-muted" : "text-ink"}>
              {f.amount < 0 ? `−${currency(Math.abs(f.amount))}` : currency(f.amount)}
            </span>
          ),
          right: true,
        },
      ],
    },
  }),

  def({
    slug: "reviews",
    label: "Reviews",
    group: "main",
    icon: StarIcon,
    table: {
      title: "Reviews",
      noun: "review",
      blurb: "What customers said, and what's live on the site.",
      collection: "reviews",
      rows: (s) => s.reviews,
      searchText: (r) => `${r.customerName} ${r.body} ${r.source}`,
      blank: () => ({
        id: newId("rev"),
        customerName: "",
        rating: 5,
        body: "",
        source: "Google" as const,
        date: TODAY,
        status: "pending" as const,
      }),
      fields: [
        { key: "customerName", label: "Customer", type: "text", required: true },
        { key: "rating", label: "Rating (1-5)", type: "number", required: true },
        { key: "body", label: "Review", type: "textarea", required: true, wide: true },
        {
          key: "source",
          label: "Source",
          type: "select",
          options: ["Google", "Facebook", "Instagram", "Direct"],
        },
        { key: "status", label: "Status", type: "select", options: ["published", "pending", "hidden"] },
        { key: "date", label: "Date", type: "date" },
      ],
      filters: [
        { label: "Published", match: (r) => r.status === "published" },
        { label: "Pending", match: (r) => r.status === "pending" },
        { label: "Hidden", match: (r) => r.status === "hidden" },
      ],
      columns: [
        {
          label: "Review",
          sortBy: (r) => r.customerName,
          cell: (r) => (
            <div className="max-w-md">
              <p className="text-ink">{r.customerName}</p>
              <p className="mt-1 text-muted">{r.body}</p>
            </div>
          ),
        },
        {
          label: "Rating",
          sortBy: (r) => r.rating,
          cell: (r) => <span className="mono-label text-ink">{r.rating}.0 / 5</span>,
        },
        { label: "Source", sortBy: (r) => r.source, cell: (r) => r.source, secondary: true },
        { label: "Date", sortBy: (r) => r.date, cell: (r) => shortDate(r.date), secondary: true, right: true },
        { label: "Status", sortBy: (r) => r.status, cell: (r) => pill(r.status), right: true },
      ],
    },
  }),

  def({
    slug: "messages",
    label: "Messages",
    group: "main",
    icon: MailIcon,
    table: {
      title: "Messages",
      noun: "message",
      blurb: "Enquiries from the web form, chat widget, email, and SMS.",
      collection: "messages",
      create: false,
      rows: (s) => [...s.messages].sort((a, b) => b.date.localeCompare(a.date)),
      searchText: (m) => `${m.from} ${m.subject} ${m.preview} ${m.channel} ${m.phone ?? ""} ${m.email}`,
      blank: () => ({
        id: newId("msg"),
        from: "",
        email: "",
        phone: "",
        subject: "",
        preview: "",
        date: TODAY,
        read: false,
        channel: "Web form" as const,
      }),
      /*
       * Contact details only, on purpose. What someone wrote, when it arrived
       * and which channel it came through are facts about an event — editing
       * them rewrites the record. A mistyped email is the one thing worth
       * repairing here, because Reply and Call depend on it.
       */
      fields: [
        { key: "email", label: "Email", type: "text" },
        { key: "phone", label: "Phone", type: "text" },
      ],
      filters: [
        { label: "Unread", match: (m) => !m.read },
        { label: "Read", match: (m) => m.read },
      ],
      columns: [
        {
          label: "Message",
          sortBy: (m) => m.from,
          cell: (m) => (
            <div className="max-w-md">
              <p className={m.read ? "text-muted" : "text-ink"}>
                {m.from} — {m.subject}
              </p>
              <p className="mt-1 whitespace-pre-line text-muted">{m.preview}</p>
            </div>
          ),
        },
        { label: "Channel", sortBy: (m) => m.channel, cell: (m) => m.channel, secondary: true },
        {
          label: "Reply",
          cell: (m) => <ReplyLinks email={m.email} phone={m.phone} subject={m.subject} />,
          right: true,
        },
        { label: "Received", sortBy: (m) => m.date, cell: (m) => shortDate(m.date), right: true, secondary: true },
        {
          label: "Status",
          sortBy: (m) => String(m.read),
          cell: (m) => <ReadToggle id={m.id} read={m.read} />,
          right: true,
        },
      ],
    },
  }),

  def({
    slug: "users",
    label: "Users",
    group: "management",
    icon: UserIcon,
    table: {
      title: "Console users",
      noun: "user",
      blurb: "Who can sign into this dashboard, and at what level.",
      collection: "staff",
      rows: (s) => s.staff,
      searchText: (u) => `${u.name} ${u.email} ${u.access}`,
      blank: () => ({
        id: newId("stf"),
        name: "",
        email: "",
        role: "",
        access: "Front desk" as const,
        status: "invited" as const,
        joined: TODAY,
      }),
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "email", label: "Email", type: "text", required: true },
        {
          key: "access",
          label: "Console access",
          type: "select",
          options: ["Super Admin", "Manager", "Technician", "Front desk"],
        },
        { key: "status", label: "Status", type: "select", options: ["active", "invited", "suspended"] },
        { key: "role", label: "Shop role", type: "text" },
        { key: "joined", label: "Added", type: "date" },
      ],
      columns: [
        {
          label: "User",
          sortBy: (u) => u.name,
          cell: (u) => (
            <div>
              <p className="text-ink">{u.name}</p>
              <p className="mono-label mt-1 normal-case tracking-normal">{u.email}</p>
            </div>
          ),
        },
        { label: "Access", sortBy: (u) => u.access, cell: (u) => u.access },
        { label: "Added", sortBy: (u) => u.joined, cell: (u) => shortDate(u.joined), secondary: true, right: true },
        { label: "Status", sortBy: (u) => u.status, cell: (u) => pill(u.status), right: true },
      ],
    },
  }),

  def({
    slug: "staff",
    label: "Staff",
    group: "management",
    icon: UsersIcon,
    table: {
      title: "Staff",
      noun: "staff member",
      blurb: "The shop roster and who's assigned to work.",
      collection: "staff",
      rows: (s) => s.staff,
      searchText: (u) => `${u.name} ${u.role} ${u.email}`,
      blank: () => ({
        id: newId("stf"),
        name: "",
        email: "",
        role: "",
        access: "Technician" as const,
        status: "active" as const,
        joined: TODAY,
      }),
      fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "role", label: "Shop role", type: "text", required: true },
        { key: "email", label: "Email", type: "text", required: true },
        {
          key: "access",
          label: "Console access",
          type: "select",
          options: ["Super Admin", "Manager", "Technician", "Front desk"],
        },
        { key: "status", label: "Status", type: "select", options: ["active", "invited", "suspended"] },
        { key: "joined", label: "Since", type: "date" },
      ],
      columns: [
        { label: "Name", sortBy: (u) => u.name, cell: (u) => <span className="text-ink">{u.name}</span> },
        { label: "Role", sortBy: (u) => u.role, cell: (u) => u.role },
        {
          label: "Contact",
          cell: (u) => <span className="normal-case">{u.email}</span>,
          secondary: true,
        },
        { label: "Since", sortBy: (u) => u.joined, cell: (u) => shortDate(u.joined), secondary: true, right: true },
        { label: "Status", sortBy: (u) => u.status, cell: (u) => pill(u.status), right: true },
      ],
    },
  }),

  def({
    slug: "inventory",
    label: "Inventory",
    group: "management",
    icon: BoxIcon,
    table: {
      title: "Inventory",
      noun: "item",
      blurb: "Film, vinyl, and coatings on the shelf.",
      collection: "inventory",
      rows: (s) => s.inventory,
      searchText: (i) => `${i.item} ${i.sku} ${i.supplier}`,
      blank: () => ({
        id: newId("inv-mat"),
        item: "",
        sku: "",
        supplier: "",
        quantity: 0,
        reorderAt: 0,
        unitCost: 0,
      }),
      fields: [
        { key: "item", label: "Item", type: "text", required: true, wide: true },
        { key: "sku", label: "SKU", type: "text", required: true },
        { key: "supplier", label: "Supplier", type: "text" },
        { key: "quantity", label: "On hand", type: "number" },
        { key: "reorderAt", label: "Reorder at", type: "number" },
        { key: "unitCost", label: "Unit cost (USD)", type: "number" },
      ],
      filters: [{ label: "Below reorder", match: (i) => i.quantity <= i.reorderAt }],
      columns: [
        {
          label: "Item",
          sortBy: (i) => i.item,
          cell: (i) => (
            <div>
              <p className="text-ink">{i.item}</p>
              <p className="mono-label mt-1">{i.sku}</p>
            </div>
          ),
        },
        { label: "Supplier", sortBy: (i) => i.supplier, cell: (i) => i.supplier, secondary: true },
        { label: "On hand", sortBy: (i) => i.quantity, cell: (i) => i.quantity, right: true },
        { label: "Reorder at", sortBy: (i) => i.reorderAt, cell: (i) => i.reorderAt, right: true, secondary: true },
        { label: "Unit cost", sortBy: (i) => i.unitCost, cell: (i) => currency(i.unitCost), right: true, secondary: true },
        {
          label: "Status",
          sortBy: (i) => i.quantity - i.reorderAt,
          cell: (i) =>
            i.quantity <= i.reorderAt ? pill("overdue", "Reorder") : pill("active", "In stock"),
          right: true,
        },
      ],
    },
  }),

  def({ slug: "settings", label: "Settings", group: "management", icon: GearIcon }),

  def({
    slug: "activity",
    label: "Activity Log",
    group: "management",
    icon: ListIcon,
    table: {
      title: "Activity log",
      noun: "entry",
      blurb: "Everything the console and the site recorded, newest first.",
      collection: "activity",
      rows: (s) => [...s.activity].sort((a, b) => b.at.localeCompare(a.at)),
      searchText: (a) => `${a.text} ${a.kind}`,
      blank: () => ({
        id: newId("act"),
        kind: "appointment" as const,
        text: "",
        at: `${TODAY}T09:00`,
      }),
      fields: [
        { key: "text", label: "Event", type: "text", required: true, wide: true },
        {
          key: "kind",
          label: "Type",
          type: "select",
          options: ["appointment", "payment", "project", "customer", "review", "message"],
        },
        { key: "at", label: "When", type: "datetime-local" },
      ],
      columns: [
        { label: "Event", sortBy: (a) => a.text, cell: (a) => <span className="text-ink">{a.text}</span> },
        { label: "Type", sortBy: (a) => a.kind, cell: (a) => a.kind, secondary: true },
        {
          label: "When",
          sortBy: (a) => a.at,
          cell: (a) => `${shortDate(a.at.slice(0, 10))} · ${timeLabel(a.at.slice(11, 16))}`,
          right: true,
        },
      ],
    },
  }),
];

export const getSection = (slug: string) => sections.find((s) => s.slug === slug);

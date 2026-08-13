"use client";

import { useEffect, useRef, useState } from "react";
import { useAdmin } from "@/lib/admin/store";
import { canEdit } from "@/lib/admin/access";
import type { Field, Row, SectionDef } from "@/lib/admin/sections";
import { CloseIcon } from "@/components/admin/icons";

/* ---- Dotted-path get/set --------------------------------------------------
 * Vehicles nest `ppf.coverage` and `tint.shade`; everything else is flat. Ten
 * lines here beats flattening the domain types just to make a form easier.
 * ------------------------------------------------------------------------- */

type Obj = Record<string, unknown>;

function get(obj: Obj, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o as Obj | undefined)?.[k], obj);
}

function set(obj: Obj, path: string, value: unknown): Obj {
  const [head, ...rest] = path.split(".");
  if (rest.length === 0) return { ...obj, [head]: value };
  const child = (obj[head] as Obj | undefined) ?? {};
  return { ...obj, [head]: set(child, rest.join("."), value) };
}

/* ---- Controls ------------------------------------------------------------ */

const controlClass =
  "w-full rounded-input border border-line bg-black px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-red [color-scheme:dark]";

function Control({
  id,
  field,
  value,
  options,
  disabled,
  onChange,
}: {
  id: string;
  field: Field;
  value: unknown;
  /** resolved from field.optionsFrom by the caller, which has the store */
  options?: { value: string; label: string }[];
  /** shown, but not changeable — see `locked` in the dialog below */
  disabled?: boolean;
  onChange: (v: unknown) => void;
}) {
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 rounded-input border border-line px-3 py-2.5">
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-[var(--color-red)]"
        />
        <span className="text-sm text-cream">{field.label}</span>
      </label>
    );
  }

  if (field.type === "select") {
    const current = String(value ?? "");
    return (
      <select
        id={id}
        value={current}
        required={field.required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${controlClass} disabled:cursor-not-allowed disabled:text-muted disabled:opacity-70`}
      >
        {/* A foreign key on a new row starts empty, and an empty value matches
            no option — without this the browser shows the first customer while
            the draft still holds "", so it looks chosen and saves blank. */}
        {options && !options.some((o) => o.value === current) && (
          <option value="" className="bg-black">
            Select…
          </option>
        )}
        {options
          ? options.map((o) => (
              <option key={o.value} value={o.value} className="bg-black">
                {o.label}
              </option>
            ))
          : field.options?.map((o) => (
              <option key={o} value={o} className="bg-black capitalize">
                {o.replace("-", " ")}
              </option>
            ))}
      </select>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        id={id}
        rows={3}
        value={String(value ?? "")}
        required={field.required}
        onChange={(e) => onChange(e.target.value)}
        className={`${controlClass} resize-y`}
      />
    );
  }

  return (
    <input
      id={id}
      type={field.type}
      value={String(value ?? "")}
      required={field.required}
      onChange={(e) =>
        onChange(field.type === "number" ? Number(e.target.value) : e.target.value)
      }
      className={controlClass}
    />
  );
}

/* ---- Dialog ---------------------------------------------------------------
 * Native <dialog showModal()>: focus trap, Esc-to-close, inert background, and
 * a ::backdrop — all from the platform. A headless-UI modal would be a
 * dependency to re-implement what the element already does.
 * ------------------------------------------------------------------------- */

export default function RowForm({
  section,
  row,
  isNew,
  onClose,
}: {
  section: SectionDef;
  /** the row being edited, or a blank row for create */
  row: Row;
  isNew: boolean;
  onClose: () => void;
}) {
  const table = section.table!;
  // Whole store, not a selector: optionsFrom reads collections, and a selector
  // returning a fresh array every render is what useSyncExternalStore treats as
  // "changed" — see the note above the derived helpers in lib/admin/store.ts.
  const store = useAdmin();
  const upsert = store.upsertRow;
  const ref = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Obj>(row as Obj);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  // Esc and backdrop dismissal both fire `close` — one handler covers each.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("close", onClose);
    return () => el.removeEventListener("close", onClose);
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    upsert(table.collection, draft);
    ref.current?.close();
  };

  /**
   * The owner of an existing record can't be changed by someone who can't
   * manage customers — a technician records what's been done to the car, not
   * who it belongs to. Reassignment is an office decision.
   *
   * Only on existing rows: on a new one the picker is the only way to satisfy
   * `customerId not null`, and a disabled required field is a dead end.
   */
  const locked = (f: Field) =>
    !isNew && f.key === "customerId" && !canEdit(store.me?.access, "customers");

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        // Clicks land on the dialog element itself only when they hit the backdrop.
        if (e.target === ref.current) ref.current?.close();
      }}
      // `m-auto` is required: <dialog> centres itself via `margin:auto`, which
      // Tailwind's preflight resets to 0.
      className="m-auto w-[min(42rem,calc(100vw-2rem))] rounded-media border border-line bg-black-raised p-0 text-cream backdrop:bg-black/80"
    >
      <form onSubmit={submit}>
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="font-display text-lg tracking-tight text-ink">
            {isNew ? `New ${table.noun}` : `Edit ${table.noun}`}
          </h2>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close"
            className="rounded-input p-1.5 text-muted transition-colors hover:text-ink"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="grid max-h-[60svh] gap-4 overflow-y-auto p-5 sm:grid-cols-2">
          {table.fields.map((f) => (
            <div key={f.key} className={f.wide || f.type === "textarea" ? "sm:col-span-2" : ""}>
              {f.type !== "checkbox" && (
                <label className="mono-label mb-1.5 block" htmlFor={`f-${f.key}`}>
                  {f.label}
                  {f.required && <span className="text-red"> *</span>}
                </label>
              )}
              <Control
                id={`f-${f.key}`}
                field={f}
                value={get(draft, f.key)}
                options={f.optionsFrom?.(store)}
                disabled={locked(f)}
                onChange={(v) =>
                  setDraft((d) => {
                    const next = set(d, f.key, v);
                    // Foreign key with a denormalised name beside it: set both,
                    // or the row shows one customer against another's id.
                    if (!f.syncLabelTo) return next;
                    const label = f.optionsFrom?.(store).find((o) => o.value === v)?.label ?? "";
                    return set(next, f.syncLabelTo, label);
                  })
                }
              />
            </div>
          ))}
        </div>

        <footer className="flex justify-end gap-3 border-t border-line px-5 py-4">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="btn-sweep mono-label border border-line px-5 py-2.5 text-ink"
            style={{ ["--sweep" as string]: "var(--color-black-raised)" } as React.CSSProperties}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-sweep mono-label bg-red px-5 py-2.5 text-ink"
            style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
          >
            {isNew ? `Create ${table.noun}` : "Save changes"}
          </button>
        </footer>
      </form>
    </dialog>
  );
}

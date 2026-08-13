"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveBusiness,
  saveHours,
  saveOpeningHours,
  saveSocial,
  type SettingsState,
} from "@/app/admin/(console)/settings/actions";
import {
  BUSINESS_FIELDS,
  SOCIAL_FIELDS,
  WEEKDAYS,
  type ShopSettings,
} from "@/lib/admin/settings";

const field =
  "w-full rounded-input border border-line bg-black px-4 py-2.5 text-ink outline-none transition-colors placeholder:text-muted focus:border-red";

function Save() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-sweep mono-label bg-red px-6 py-2.5 text-ink disabled:opacity-60"
      style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

function Footer({ state }: { state: SettingsState }) {
  return (
    // mt-auto pins this to the bottom of the card when the form is shorter than
    // the one beside it in the grid — see the flex chain in the settings page.
    <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-line px-5 py-4">
      <Save />
      {state.error && (
        <p role="alert" className="mono-label text-red">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="mono-label text-ok">
          {state.ok}
        </p>
      )}
    </div>
  );
}

function Input({
  name,
  label,
  type = "text",
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="mono-label mb-1.5 block">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} className={field} />
    </label>
  );
}

export function BusinessForm({ values }: { values: ShopSettings["business"] }) {
  const [state, action] = useActionState<SettingsState, FormData>(saveBusiness, {});
  return (
    <form action={action} className="flex flex-1 flex-col">
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        {BUSINESS_FIELDS.map((f) => (
          <Input
            key={f.name}
            name={f.name}
            label={f.label}
            type={f.type}
            defaultValue={values[f.name]}
          />
        ))}
      </div>
      <Footer state={state} />
    </form>
  );
}

export function SocialForm({ values }: { values: ShopSettings["social"] }) {
  const [state, action] = useActionState<SettingsState, FormData>(saveSocial, {});
  return (
    <form action={action} className="flex flex-1 flex-col">
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        {SOCIAL_FIELDS.map((f) => (
          <Input
            key={f.name}
            name={f.name}
            label={f.label}
            type={f.type}
            defaultValue={values[f.name]}
          />
        ))}
      </div>
      <Footer state={state} />
    </form>
  );
}

/**
 * Hours are a list, so the form is too. Rows are local state purely so you can
 * add one; the values themselves stay uncontrolled and are read from the
 * FormData on submit, which is why clearing a row's text deletes it.
 */
export function HoursForm({ values }: { values: ShopSettings["hours"] }) {
  const [rows, setRows] = useState(values);

  const [state, action] = useActionState<SettingsState, FormData>(saveHours, {});

  return (
    <form action={action} className="flex flex-1 flex-col">
      <div className="space-y-3 p-5">
        {rows.map((h, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              name="day"
              defaultValue={h.day}
              aria-label={`Days, row ${i + 1}`}
              placeholder="Mon-Sat"
              className={field}
            />
            <input
              name="value"
              defaultValue={h.value}
              aria-label={`Hours, row ${i + 1}`}
              placeholder="12PM-8PM"
              className={field}
            />
            <button
              type="button"
              onClick={() => setRows(rows.filter((_, n) => n !== i))}
              className="mono-label rounded-input border border-line px-4 text-cream transition-colors hover:border-red hover:text-red"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setRows([...rows, { day: "", value: "" }])}
          className="mono-label rounded-full border border-line px-4 py-2 text-cream transition-colors hover:border-maroon hover:text-ink"
        >
          Add a row
        </button>
        <p className="mono-label normal-case tracking-normal">
          Free text, shown on the site. The structured version search engines read
          is the panel beside this one — keep the two in step.
        </p>
      </div>
      <Footer state={state} />
    </form>
  );
}

/**
 * Structured opening hours — what the LocalBusiness schema publishes, as
 * distinct from the display text above it.
 *
 * One row per block of days sharing the same times, which is how a shop
 * actually works ("Mon-Sat 12-8, Sun closed" is one block, not seven). A day
 * left unticked everywhere is closed; there is no "closed" checkbox, because
 * absence already means that in the schema.
 */
export function OpeningHoursForm({ values }: { values: ShopSettings["openingHours"] }) {
  const [rows, setRows] = useState(values);
  const [state, action] = useActionState<SettingsState, FormData>(saveOpeningHours, {});

  return (
    <form action={action} className="flex flex-1 flex-col">
      {/* The action reads days-N / opens-N / closes-N, so it needs to know N. */}
      <input type="hidden" name="rowCount" value={rows.length} />

      <div className="space-y-4 p-5">
        {rows.map((row, i) => (
          <fieldset key={i} className="rounded-input border border-line p-4">
            <legend className="mono-label px-2">Block {i + 1}</legend>

            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => (
                <label
                  key={day}
                  className="mono-label flex cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-1.5 text-cream has-[:checked]:border-maroon has-[:checked]:bg-maroon/40 has-[:checked]:text-ink"
                >
                  <input
                    type="checkbox"
                    name={`days-${i}`}
                    value={day}
                    defaultChecked={row.days.includes(day)}
                    className="accent-[var(--color-red)]"
                  />
                  {day.slice(0, 3)}
                </label>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="block">
                <span className="mono-label mb-1.5 block">Opens</span>
                {/* type="time" gives a 24-hour value and a native picker. */}
                <input
                  type="time"
                  name={`opens-${i}`}
                  defaultValue={row.opens}
                  className={`${field} [color-scheme:dark]`}
                />
              </label>
              <label className="block">
                <span className="mono-label mb-1.5 block">Closes</span>
                <input
                  type="time"
                  name={`closes-${i}`}
                  defaultValue={row.closes}
                  className={`${field} [color-scheme:dark]`}
                />
              </label>
              <button
                type="button"
                onClick={() => setRows(rows.filter((_, n) => n !== i))}
                className="mono-label rounded-input border border-line px-4 py-3 text-cream transition-colors hover:border-red hover:text-red"
              >
                Remove block
              </button>
            </div>
          </fieldset>
        ))}

        <button
          type="button"
          onClick={() => setRows([...rows, { days: [], opens: "09:00", closes: "17:00" }])}
          className="mono-label rounded-full border border-line px-4 py-2 text-cream transition-colors hover:border-maroon hover:text-ink"
        >
          Add a block
        </button>
        <p className="mono-label normal-case tracking-normal">
          Any day not ticked above is published as closed.
        </p>
      </div>
      <Footer state={state} />
    </form>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useAdmin } from "@/lib/admin/store";
import { canEdit, canSee } from "@/lib/admin/access";
import { getSection, type Row } from "@/lib/admin/sections";
import RowForm from "@/components/admin/RowForm";
import { Empty, Loading, LoadError } from "@/components/admin/States";
import { ChevronIcon, CloseIcon, SearchIcon } from "@/components/admin/icons";

type ColMeta = { right?: boolean; secondary?: boolean };

/**
 * Delete, in two clicks.
 *
 * A single click on a small × used to remove the row outright — no prompt, no
 * undo, and the store writes the delete straight through to the database. The
 * second click is inline rather than a `confirm()` so it can't block the page,
 * and it reverts on blur so an accidental first click costs nothing.
 */
function ConfirmDelete({ onConfirm }: { onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);

  if (armed) {
    return (
      <button
        type="button"
        autoFocus
        onBlur={() => setArmed(false)}
        onClick={onConfirm}
        className="mono-label rounded-full border border-red bg-red/15 px-3 py-1 text-red"
      >
        Delete?
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setArmed(true)}
      aria-label="Delete row"
      className="rounded-full border border-line p-1.5 text-muted transition-colors hover:border-red hover:text-red"
    >
      <CloseIcon className="h-3.5 w-3.5" />
    </button>
  );
}

/**
 * DataTable — the one list view every console section renders. Columns, rows,
 * search fields, filter chips, and form fields all come from the section's own
 * entry in lib/admin/sections.tsx; there is deliberately no per-section table.
 *
 * Row models come from TanStack Table (headless): it owns sorting, filtering,
 * and pagination state while we keep full control of the markup, so rows stay
 * in the site's own design system instead of a grid library's theme.
 *
 * Takes the section *slug*, not the section object: the config carries render
 * functions, and functions can't cross the server -> client boundary. The
 * server page validates the slug, the client looks the config back up here.
 */
export default function DataTable({
  slug,
  heading = true,
}: {
  slug: string;
  /** false when a page already renders its own title (see AppointmentsView) */
  heading?: boolean;
}) {
  const section = getSection(slug)!;
  const table = section.table!;
  const removeRow = useAdmin((s) => s.removeRow);

  // Whether this tab has data is a separate question from whether it has rows.
  const status = useAdmin((s) => s.status);
  const loadError = useAdmin((s) => s.errors[table.collection]);

  /*
   * `rows` MUST keep a stable identity between renders that don't change the
   * data. Several sections sort into a fresh array (`[...s.customers].sort()`),
   * and TanStack's autoResetPageIndex fires a state update whenever `data`
   * changes identity — so an unmemoized array means: any store update ->
   * render -> new array -> autoReset setState -> render -> new array -> ...
   * an infinite loop that hard-locks the tab. It was reproducible by opening
   * the mobile nav on /admin/customers.
   *
   * The store snapshot only changes when the store actually changes, so keying
   * on it recomputes exactly when it should and no more often.
   */
  const store = useAdmin();
  const rows = useMemo(() => table.rows(store), [table, store]);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState<number | null>(null);
  const [editing, setEditing] = useState<{ row: Row; isNew: boolean } | null>(null);

  // What this viewer may change here. Read-only sections (customers, for a
  // technician) keep the list and lose the New button and the row actions.
  const editable = canEdit(store.me?.access, section.slug);

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      ...table.columns
        .filter((c) => !c.needs || canSee(store.me?.access, c.needs))
        .map<ColumnDef<Row>>((c) => ({
          id: c.label,
          header: c.label,
          // Sorting needs a primitive, and `cell` returns JSX — so the column's
          // own `sortBy` supplies the comparable value. No sortBy = not sortable.
          accessorFn: c.sortBy ?? (() => ""),
          enableSorting: Boolean(c.sortBy),
          cell: ({ row }) => c.cell(row.original),
          meta: { right: c.right, secondary: c.secondary } satisfies ColMeta,
        })),
      ...(editable ? [{
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }: { row: { original: Row } }) => (
          <span className="flex justify-end gap-1.5 whitespace-nowrap">
            <button
              type="button"
              onClick={() => setEditing({ row: row.original, isNew: false })}
              className="mono-label rounded-full border border-line px-3 py-1 text-cream transition-colors hover:border-maroon hover:text-ink"
            >
              Edit
            </button>
            <ConfirmDelete onConfirm={() => removeRow(table.collection, row.original.id)} />
          </span>
        ),
        meta: { right: true } satisfies ColMeta,
      } as ColumnDef<Row>] : []),
    ],
    [table, removeRow, editable, store.me?.access]
  );

  const data = useMemo(
    () => (filter === null ? rows : rows.filter((r) => table.filters![filter].match(r))),
    [rows, filter, table]
  );

  const t = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    // Search the section's own `searchText` rather than per-column values —
    // most columns render JSX and have nothing sensible to match against.
    globalFilterFn: (row, _id, value: string) =>
      table.searchText(row.original).toLowerCase().includes(value.toLowerCase()),
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const { pageIndex, pageSize } = t.getState().pagination;
  const filtered = t.getFilteredRowModel().rows.length;

  return (
    <div className="space-y-4">
      <header
        className={`flex flex-wrap items-end gap-4 ${heading ? "justify-between" : "justify-end"}`}
      >
        {heading && (
          <div>
            <h1 className="font-display text-3xl tracking-tight text-ink">{table.title}</h1>
            <p className="mt-1 text-muted">{table.blurb}</p>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          {/* w-64, not w-full: a full-width child forces the New button onto
              its own row inside this flex-wrap container. */}
          <div className="relative w-64 max-w-full">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={`Search ${table.title.toLowerCase()}…`}
              aria-label={`Search ${table.title}`}
              className="w-full rounded-full border border-line bg-black-raised py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-red"
            />
          </div>
          {editable && table.create !== false && (
            <button
              type="button"
              onClick={() => setEditing({ row: table.blank(), isNew: true })}
              // Creating into a collection we couldn't read risks colliding with
              // a row that's already there and merely invisible right now.
              disabled={Boolean(loadError) || status === "loading"}
              className="btn-sweep mono-label whitespace-nowrap bg-red px-5 py-2.5 text-ink disabled:opacity-50"
              style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
            >
              New {table.noun}
            </button>
          )}
        </div>
      </header>

      {loadError ? (
        <div className="rounded-media border border-line bg-black-raised">
          <LoadError what={table.title.toLowerCase()} message={loadError} />
        </div>
      ) : status === "loading" ? (
        <div className="rounded-media border border-line bg-black-raised">
          <Loading label={`Loading ${table.title}`} />
        </div>
      ) : (
        <>
      {table.filters && (
        <div className="flex flex-wrap gap-2">
          <Chip active={filter === null} onClick={() => setFilter(null)}>
            All
          </Chip>
          {table.filters.map((f, i) => (
            <Chip key={f.label} active={filter === i} onClick={() => setFilter(i)}>
              {f.label}
            </Chip>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-media border border-line bg-black-raised">
        <table className="w-full min-w-[52rem] border-collapse text-sm">
          <thead>
            {t.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-line">
                {hg.headers.map((h) => {
                  const meta = h.column.columnDef.meta as ColMeta | undefined;
                  const sorted = h.column.getIsSorted();
                  return (
                    <th
                      key={h.id}
                      scope="col"
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : undefined
                      }
                      className={`mono-label px-5 py-3.5 font-normal ${
                        meta?.right ? "text-right" : "text-left"
                      } ${meta?.secondary ? "hidden lg:table-cell" : ""}`}
                    >
                      {h.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={h.column.getToggleSortingHandler()}
                          className={`mono-label inline-flex items-center gap-1 transition-colors hover:text-cream ${
                            sorted ? "text-red" : ""
                          }`}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          <ChevronIcon
                            className={`h-3 w-3 transition-transform ${
                              sorted === "asc" ? "rotate-180" : ""
                            } ${sorted ? "opacity-100" : "opacity-30"}`}
                          />
                        </button>
                      ) : (
                        flexRender(h.column.columnDef.header, h.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {t.getRowModel().rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-line text-cream transition-colors last:border-0 hover:bg-burgundy/25"
              >
                {r.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as ColMeta | undefined;
                  return (
                    <td
                      key={cell.id}
                      className={`px-5 py-4 align-middle ${meta?.right ? "text-right" : ""} ${
                        meta?.secondary ? "hidden lg:table-cell" : ""
                      }`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Two different nothings: nothing in the table at all, versus nothing
            left after a search. Only the first is a claim about the shop. */}
        {filtered === 0 &&
          (rows.length === 0 ? (
            <Empty what={table.title.toLowerCase()} />
          ) : (
            <p className="px-5 py-12 text-center text-muted">
              Nothing matches that. Clear the search or filter to see all {rows.length}{" "}
              records.
            </p>
          ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="mono-label">
          {filtered === 0
            ? `0 of ${rows.length}`
            : `${pageIndex * pageSize + 1}–${Math.min(
                (pageIndex + 1) * pageSize,
                filtered
              )} of ${filtered}`}
        </p>
        <div className="flex items-center gap-3">
          <label className="mono-label flex items-center gap-2">
            Rows
            <select
              value={pageSize}
              onChange={(e) => t.setPageSize(Number(e.target.value))}
              className="mono-label rounded-input border border-line bg-black px-2 py-1.5 text-cream outline-none focus:border-red"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n} className="bg-black">
                  {n}
                </option>
              ))}
            </select>
          </label>
          <PageButton onClick={() => t.previousPage()} disabled={!t.getCanPreviousPage()}>
            <ChevronIcon className="h-4 w-4 rotate-90" />
            <span className="sr-only">Previous page</span>
          </PageButton>
          <span className="mono-label">
            {t.getPageCount() === 0 ? 0 : pageIndex + 1} / {t.getPageCount()}
          </span>
          <PageButton onClick={() => t.nextPage()} disabled={!t.getCanNextPage()}>
            <ChevronIcon className="h-4 w-4 -rotate-90" />
            <span className="sr-only">Next page</span>
          </PageButton>
        </div>
      </div>
        </>
      )}

      {editing && (
        <RowForm
          section={section}
          row={editing.row}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function PageButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-input border border-line p-2 text-cream transition-colors hover:border-maroon disabled:opacity-35 disabled:hover:border-line"
    >
      {children}
    </button>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`mono-label rounded-full border px-4 py-2 transition-colors ${
        active
          ? "border-maroon bg-maroon/40 text-ink"
          : "border-line text-cream hover:border-maroon"
      }`}
    >
      {children}
    </button>
  );
}

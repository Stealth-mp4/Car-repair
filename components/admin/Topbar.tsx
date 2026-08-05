"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdmin, unreadNotifications, type AdminStore } from "@/lib/admin/store";
import { sections } from "@/lib/admin/sections";
import { feedStamp, initials } from "@/lib/admin/format";
import { BellIcon, ChevronIcon, MenuIcon, SearchIcon } from "@/components/admin/icons";
import { signOut } from "@/app/admin/login/actions";

/** The signed-in operator. Replace with the session user once auth is wired. */
const currentUser = { name: "Admin", role: "Super Admin" };

/** Cross-section search — reuses each section's own `searchText`, so a new
 *  section becomes searchable the moment it's added to sections.tsx. */
function useSearchResults(query: string, state: AdminStore) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const hits: { href: string; section: string; label: string }[] = [];
    for (const s of sections) {
      if (!s.table) continue;
      for (const row of s.table.rows(state)) {
        if (!s.table.searchText(row).toLowerCase().includes(q)) continue;
        hits.push({
          href: `/admin/${s.slug}`,
          section: s.label,
          label: s.table.searchText(row).slice(0, 60),
        });
        if (hits.length >= 8) return hits;
      }
    }
    return hits;
  }, [query, state]);
}

/** Close a dropdown when focus leaves its wrapper — no document listener, no
 *  outside-click library; the wrapper's own blur event already knows. */
const closeOnBlur = (close: () => void) => (e: React.FocusEvent<HTMLDivElement>) => {
  if (!e.currentTarget.contains(e.relatedTarget)) close();
};

export default function Topbar() {
  const state = useAdmin((s) => s);
  const search = state.ui.search;
  const unread = unreadNotifications(state);

  const [openMenu, setOpenMenu] = useState<"none" | "bell" | "user">("none");
  const dismiss = closeOnBlur(() => setOpenMenu("none"));
  const results = useSearchResults(search, state);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-black/95 px-[var(--admin-pad)] backdrop-blur-sm">
      <button
        type="button"
        onClick={() => state.setMobileNav(true)}
        aria-label="Open menu"
        className="rounded-input p-2 text-cream hover:bg-black-raised hover:text-ink lg:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative ml-auto w-full max-w-sm">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={search}
          onChange={(e) => state.setSearch(e.target.value)}
          placeholder="Search anything…"
          aria-label="Search the console"
          className="w-full rounded-full border border-line bg-black-raised py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-red"
        />
        {results.length > 0 && (
          <ul className="absolute left-0 right-0 top-[calc(100%+8px)] max-h-80 overflow-y-auto rounded-media border border-line bg-black-raised py-2 scrollbar-none">
            {results.map((r, i) => (
              <li key={`${r.href}-${i}`}>
                <Link
                  href={r.href}
                  onClick={() => state.setSearch("")}
                  className="block px-4 py-2 hover:bg-burgundy/40"
                >
                  <span className="mono-label text-red">{r.section}</span>
                  <span className="mt-0.5 block truncate text-sm text-cream">
                    {r.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Notifications */}
      <div className="relative" onBlur={dismiss}>
        <button
          type="button"
          onClick={() => setOpenMenu(openMenu === "bell" ? "none" : "bell")}
          aria-label={`Notifications, ${unread} unread`}
          aria-expanded={openMenu === "bell"}
          className="relative rounded-input p-2 text-cream transition-colors hover:bg-black-raised hover:text-ink"
        >
          <BellIcon className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-1 font-mono text-[0.625rem] text-ink">
              {unread}
            </span>
          )}
        </button>
        {openMenu === "bell" && (
          <div className="absolute right-0 top-[calc(100%+8px)] w-80 rounded-media border border-line bg-black-raised">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="mono-label text-ink">Notifications</p>
              <button
                type="button"
                onClick={state.markAllNotificationsRead}
                className="mono-label text-red hover:text-cream"
              >
                Mark all read
              </button>
            </div>
            <ul className="max-h-72 overflow-y-auto scrollbar-none">
              {state.notifications.map((n) => (
                <li key={n.id} className="border-b border-line px-4 py-3 last:border-0">
                  <p className={`text-sm ${n.read ? "text-muted" : "text-cream"}`}>
                    {n.text}
                  </p>
                  <p className="mono-label mt-1">{feedStamp(n.at)}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Account */}
      <div className="relative" onBlur={dismiss}>
        <button
          type="button"
          onClick={() => setOpenMenu(openMenu === "user" ? "none" : "user")}
          aria-expanded={openMenu === "user"}
          className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-black-raised"
        >
          <span className="mono-label flex h-9 w-9 items-center justify-center rounded-full border border-maroon bg-burgundy text-ink">
            {initials(currentUser.name)}
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-sm text-ink">{currentUser.name}</span>
            <span className="mono-label block">{currentUser.role}</span>
          </span>
          <ChevronIcon className="h-4 w-4 text-muted" />
        </button>
        {openMenu === "user" && (
          <div className="absolute right-0 top-[calc(100%+8px)] w-52 rounded-media border border-line bg-black-raised py-2">
            <Link
              href="/admin/settings"
              className="block px-4 py-2 text-sm text-cream hover:bg-burgundy/40"
            >
              Settings
            </Link>
            <Link
              href="/admin/users"
              className="block px-4 py-2 text-sm text-cream hover:bg-burgundy/40"
            >
              Console users
            </Link>
            <Link
              href="/"
              className="block px-4 py-2 text-sm text-cream hover:bg-burgundy/40"
            >
              View public site
            </Link>
            {/* POST, not a link: a GET sign-out can be triggered by any page
                that embeds the URL. */}
            <form action={signOut} className="mt-1 border-t border-line pt-1">
              <button
                type="submit"
                className="block w-full px-4 py-2 text-left text-sm text-red transition-colors hover:bg-burgundy/40 hover:text-cream"
              >
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}

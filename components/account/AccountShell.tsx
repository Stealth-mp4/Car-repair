"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAccount, currentUser } from "@/lib/account/store";
import { useHydrated } from "@/lib/account/useHydrated";
import { sections, accountHref, getSection } from "@/lib/account/sections";
import { brand } from "@/lib/site";
import { useShop } from "@/components/ShopProvider";
import { MenuIcon, CloseIcon, SignOutIcon, ArrowRightIcon } from "@/components/account/icons";

/** Which section the current path is in — "" for /account itself. */
function slugFromPath(pathname: string): string {
  const rest = pathname.replace(/^\/account\/?/, "");
  return rest.split("/")[0] ?? "";
}

function NavList({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const active = slugFromPath(pathname);

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-none">
      <ul className="space-y-0.5">
        {sections.map((s) => {
          const Icon = s.icon;
          const isActive = s.slug === active;
          return (
            <li key={s.slug || "overview"}>
              <Link
                href={accountHref(s.slug)}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex items-center gap-3 rounded-input px-3 py-2.5 transition-colors ${
                  isActive
                    ? "bg-maroon/45 text-ink"
                    : "text-cream/75 hover:bg-black-raised hover:text-ink"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-red" />
                )}
                <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-red" : ""}`} />
                <span className="truncate text-[0.9375rem]">{s.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SidebarFooter({ onNavigate }: { onNavigate: () => void }) {
  const signOut = useAccount((s) => s.signOut);
  const router = useRouter();

  return (
    <div className="space-y-0.5 border-t border-line px-3 py-4">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-input px-3 py-2.5 text-cream/75 transition-colors hover:bg-black-raised hover:text-ink"
      >
        <ArrowRightIcon className="h-[18px] w-[18px] shrink-0 rotate-180" />
        <span className="text-[0.9375rem]">Back to site</span>
      </Link>
      <button
        type="button"
        onClick={() => {
          signOut();
          router.push("/account/login");
        }}
        className="flex w-full items-center gap-3 rounded-input px-3 py-2.5 text-cream/75 transition-colors hover:bg-black-raised hover:text-ink"
      >
        <SignOutIcon className="h-[18px] w-[18px] shrink-0" />
        <span className="text-[0.9375rem]">Sign out</span>
      </button>
    </div>
  );
}

/**
 * AccountShell — sidebar + page header for every signed-in account route, and
 * the gate in front of them.
 *
 * The gate is a redirect, not a security boundary: the store it reads lives in
 * the visitor's own localStorage. See the SECURITY block in lib/account/store.ts.
 */
export default function AccountShell({ children }: { children: React.ReactNode }) {
  const shop = useShop();
  const hydrated = useHydrated();
  const user = useAccount(currentUser);
  const navOpen = useAccount((s) => s.ui.navOpen);
  const setNavOpen = useAccount((s) => s.setNavOpen);
  const pathname = usePathname();
  const router = useRouter();

  const section = getSection(slugFromPath(pathname));

  useEffect(() => {
    if (hydrated && !user) router.replace("/account/login");
  }, [hydrated, user, router]);

  // Lock body scroll behind the mobile drawer; close it on Escape.
  useEffect(() => {
    if (!navOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNavOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [navOpen, setNavOpen]);

  if (!hydrated || !user) {
    return (
      <main className="flex min-h-svh items-center justify-center px-[var(--gutter)]">
        <p className="mono-label">{hydrated ? "Redirecting to sign in…" : "Loading your account…"}</p>
      </main>
    );
  }

  /**
   * The mark is portrait (820x972), so it's sized by a fixed box + object-contain
   * and only fills part of that box horizontally. Which edge it hugs therefore
   * has to follow which edge of the bar it sits on — left in the sidebar,
   * right in the mobile top bar, otherwise it floats away from the margin.
   */
  const brandMark = (align: "left" | "right") => (
    <Link href="/account" className="relative block h-10 w-28 shrink-0">
      <Image
        src={brand.markTight}
        alt={`${shop.business.name} account`}
        fill
        sizes="120px"
        priority
        className={`object-contain ${align === "left" ? "object-left" : "object-right"}`}
      />
    </Link>
  );

  const Brand = brandMark("left");

  return (
    <div className="min-h-svh bg-black">
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 shrink-0 flex-col border-r border-line bg-black lg:flex">
        <div className="flex h-16 items-center px-4">{Brand}</div>
        <NavList onNavigate={() => {}} />
        <SidebarFooter onNavigate={() => {}} />
      </aside>

      {/* Mobile drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
            className="absolute inset-0 bg-black/80"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-line bg-black">
            <div className="flex h-16 items-center justify-between px-4">
              {Brand}
              <button
                type="button"
                onClick={() => setNavOpen(false)}
                aria-label="Close menu"
                className="rounded-input p-2 text-cream hover:bg-black-raised hover:text-ink"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <NavList onNavigate={() => setNavOpen(false)} />
            <SidebarFooter onNavigate={() => setNavOpen(false)} />
          </aside>
        </div>
      )}

      {/* Content column */}
      <div className="lg:pl-64">
        {/* Mobile top bar — the rail is hidden below lg, so the drawer needs a trigger */}
        <div className="flex h-16 items-center justify-between border-b border-line px-[var(--gutter)] lg:hidden">
          {/* -ml-2 cancels the button's own p-2 so the glyph — not its hit area —
              starts at the gutter, matching the right-hugging mark opposite it.
              Both then sit exactly var(--gutter) from their screen edge. */}
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
            aria-expanded={navOpen}
            className="-ml-2 rounded-input p-2 text-cream hover:bg-black-raised hover:text-ink"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          {brandMark("right")}
        </div>

        <main className="px-[var(--gutter)] py-10 lg:py-14">
          <div className="mx-auto max-w-6xl">
            {section ? (
              <header className="mb-8">
                <p className="mono-label flex items-center gap-3">
                  <span className="h-px w-6 bg-line" />
                  <span className="text-red">{section.eyebrow}</span>
                </p>
                <h1 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                  {section.slug === "" ? `Hello, ${user.firstName}.` : section.title}
                </h1>
                <p className="mt-2 max-w-xl text-cream/80">{section.lede}</p>
              </header>
            ) : null}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/lib/admin/store";
import { sections } from "@/lib/admin/sections";
import { canSee } from "@/lib/admin/access";
import { brand } from "@/lib/site";
import { CloseIcon, LifebuoyIcon, MenuIcon, ArrowRightIcon } from "@/components/admin/icons";

const href = (slug: string) => (slug ? `/admin/${slug}` : "/admin");

function NavList({ collapsed, onNavigate }: { collapsed: boolean; onNavigate: () => void }) {
  const pathname = usePathname();
  // Null before hydration, and canSee() denies on null — the nav fills in a
  // beat later rather than flashing sections the viewer may not be allowed.
  const access = useAdmin((s) => s.me?.access);

  return (
    <nav className="flex-1 overflow-y-auto px-3 pb-6 scrollbar-none">
      {(["main", "management"] as const).map((group) => (
        <div key={group} className="mt-6 first:mt-2">
          {!collapsed && (
            <p className="mono-label px-3 pb-2 text-red">
              {group === "main" ? "Main" : "Management"}
            </p>
          )}
          <ul className="space-y-0.5">
            {sections
              .filter((s) => s.group === group && canSee(access, s.slug))
              .map((s) => {
                const to = href(s.slug);
                const active = s.slug ? pathname.startsWith(to) : pathname === "/admin";
                const Icon = s.icon;
                return (
                  <li key={s.slug || "dashboard"}>
                    <Link
                      href={to}
                      onClick={onNavigate}
                      title={collapsed ? s.label : undefined}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex items-center gap-3 rounded-input px-3 py-2.5 transition-colors ${
                        active
                          ? "bg-maroon/45 text-ink"
                          : "text-cream/75 hover:bg-black-raised hover:text-ink"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-red" />
                      )}
                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 ${active ? "text-red" : ""}`}
                      />
                      {!collapsed && <span className="truncate text-[0.9375rem]">{s.label}</span>}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SupportCard() {
  return (
    <div className="mx-3 mb-4 overflow-hidden rounded-media border border-line bg-burgundy/40">
      <div className="relative h-24">
        <Image
          src="/gallery/lamborghini-aventador-black-1.webp"
          alt=""
          fill
          sizes="240px"
          className="graded object-cover opacity-70"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black-raised to-transparent" />
      </div>
      <div className="p-4">
        <p className="flex items-center gap-2 font-display text-base text-ink">
          <LifebuoyIcon className="h-4 w-4 text-red" />
          Need help?
        </p>
        <p className="mt-1 text-sm text-muted">
          Check the docs or reach the team that built this.
        </p>
        <Link
          href="/admin/settings#support"
          className="btn-sweep mono-label mt-3 inline-flex w-full items-center justify-center gap-2 bg-red px-4 py-2.5 text-ink"
          style={{ ["--sweep" as string]: "var(--color-red-deep)" } as React.CSSProperties}
        >
          Contact support
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

/**
 * Sidebar — desktop rail (collapsible to icons) plus the mobile drawer, both
 * driven off the same store flags. The nav list itself is shared so the two
 * can never drift apart.
 */
export default function Sidebar() {
  const collapsed = useAdmin((s) => s.ui.sidebarCollapsed);
  const mobileOpen = useAdmin((s) => s.ui.mobileNavOpen);
  const toggleSidebar = useAdmin((s) => s.toggleSidebar);
  const setMobileNav = useAdmin((s) => s.setMobileNav);

  // The mark is 820x972 — sized by a fixed box + object-contain, exactly as
  // SiteNav does it, so `w-auto` can't collapse it to the portrait aspect.
  const Brand = (
    <Link href="/admin" className="relative block h-10 w-28 shrink-0">
      <Image
        src={brand.markTight}
        alt="Iqballaz Customs admin"
        fill
        sizes="120px"
        priority
        className="object-contain object-left"
      />
    </Link>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden shrink-0 flex-col border-r border-line bg-black lg:flex ${
          collapsed ? "w-[76px]" : "w-64"
        } transition-[width] duration-300`}
        style={{ transitionTimingFunction: "var(--ease-brand)" }}
      >
        <div
          className={`flex h-16 items-center gap-2 px-4 ${collapsed ? "justify-center" : "justify-between"}`}
        >
          {!collapsed && Brand}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="rounded-input p-2 text-cream transition-colors hover:bg-black-raised hover:text-ink"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
        <NavList collapsed={collapsed} onNavigate={() => {}} />
        {!collapsed && <SupportCard />}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileNav(false)}
            className="absolute inset-0 bg-black/80"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-line bg-black">
            <div className="flex h-16 items-center justify-between px-4">
              {Brand}
              <button
                type="button"
                onClick={() => setMobileNav(false)}
                aria-label="Close menu"
                className="rounded-input p-2 text-cream hover:bg-black-raised hover:text-ink"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <NavList collapsed={false} onNavigate={() => setMobileNav(false)} />
            <SupportCard />
          </aside>
        </div>
      )}
    </>
  );
}

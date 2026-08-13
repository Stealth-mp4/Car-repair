import { Children } from "react";
import { DateRange, StatRow } from "@/components/admin/Stats";
import { ProjectsDonut, RevenueChart, TopServices } from "@/components/admin/Charts";
import {
  RecentActivity,
  RecentAppointments,
  RecentCustomers,
  UpcomingAppointments,
} from "@/components/admin/Lists";
import { canSee, seesMoney } from "@/lib/admin/access";
import { currentStaff } from "@/lib/supabase/server";

/**
 * The lower panel area, laid out from however many panels the viewer's role
 * actually leaves visible.
 *
 * The old fixed `grid-cols-3` / `grid-cols-2` pair assumed everyone saw all
 * five. A technician saw two, which came out as a third-width donut against two
 * thirds of nothing with Upcoming stranded on the row below.
 *
 * Twelve-column arithmetic instead: three panels a row once there are four or
 * more, two a row below that, and whatever is left over on the last row widens
 * to fill it. That reproduces the owner's original 3-then-2 exactly, and gives
 * the smaller roles full-width rows instead of gaps.
 */
function PanelGrid({ children }: { children: React.ReactNode }) {
  const panels = Children.toArray(children).filter(Boolean);
  const perRow = panels.length >= 4 ? 3 : 2;

  // Tailwind can't see interpolated class names, so these are literals.
  const span: Record<number, string> = {
    1: "xl:col-span-6",
    2: "xl:col-span-3",
    3: "xl:col-span-2",
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-6">
      {panels.map((panel, i) => {
        // How many land on this panel's own row — the last row is usually short.
        const row = Math.floor(i / perRow);
        const onThisRow = Math.min(perRow, panels.length - row * perRow);
        return (
          <div
            key={i}
            // [&>section]:h-full — Panel is a grandchild here, so it needs
            // telling to fill the equal-height row a grid item stretches to.
            className={`min-w-0 ${span[onThisRow]} [&>section]:h-full ${
              // A lone panel on the last row at lg would sit half-width with a
              // hole beside it.
              onThisRow === 1 ? "lg:col-span-2" : ""
            }`}
          >
            {panel}
          </div>
        );
      })}
    </div>
  );
}

export default async function AdminDashboard() {
  const me = await currentStaff();
  const access = me?.access;

  // Each widget reads a table its viewer may not be allowed. RLS returns empty
  // rather than erroring, so an ungated dashboard renders a wall of zeroes and
  // "no records" panels that look like a broken console rather than a scoped one.
  const money = seesMoney(access);
  const showCustomers = canSee(access, "customers");
  const showActivity = canSee(access, "activity");
  const showServices = canSee(access, "services");

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-1 text-muted">
            Welcome back{me ? `, ${me.name.split(" ")[0]}` : ""}. Here&apos;s what&apos;s
            happening today.
          </p>
        </div>
        <DateRange />
      </header>

      <StatRow />

      <div className="grid gap-4 xl:grid-cols-12">
        {money && (
          <div className="min-w-0 xl:col-span-7">
            <RevenueChart />
          </div>
        )}
        <div className={`min-w-0 ${money ? "xl:col-span-5" : "xl:col-span-12"}`}>
          <RecentAppointments />
        </div>
      </div>

      <PanelGrid>
        <ProjectsDonut />
        {/* Second on purpose: it pairs with the donut, and for the roles that
            see only a few panels those two share the top row. */}
        <UpcomingAppointments />
        {showServices && <TopServices />}
        {showCustomers && <RecentCustomers />}
        {showActivity && <RecentActivity />}
      </PanelGrid>
    </div>
  );
}

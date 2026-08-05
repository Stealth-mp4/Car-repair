import { DateRange, StatRow } from "@/components/admin/Stats";
import { ProjectsDonut, RevenueChart, TopServices } from "@/components/admin/Charts";
import {
  RecentActivity,
  RecentAppointments,
  RecentCustomers,
  UpcomingAppointments,
} from "@/components/admin/Lists";

export default function AdminDashboard() {
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-1 text-muted">
            Welcome back, Admin. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <DateRange />
      </header>

      <StatRow />

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-7">
          <RevenueChart />
        </div>
        <div className="min-w-0 xl:col-span-5">
          <RecentAppointments />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <ProjectsDonut />
        <TopServices />
        <div className="min-w-0 lg:col-span-2 xl:col-span-1">
          <RecentCustomers />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <RecentActivity />
        <UpcomingAppointments />
      </div>
    </div>
  );
}

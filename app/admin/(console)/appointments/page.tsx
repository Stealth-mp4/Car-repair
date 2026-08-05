import type { Metadata } from "next";
import AppointmentsView from "./AppointmentsView";

export const metadata: Metadata = { title: "Appointments" };

export default function AppointmentsPage() {
  return <AppointmentsView />;
}

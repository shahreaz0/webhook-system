import { DashboardShell } from "@/web/components/dashboard/dashboard-shell";

export default function DashboardLayout({
  children,
}: Readonly<LayoutProps<"/dashboard">>) {
  return <DashboardShell>{children}</DashboardShell>;
}

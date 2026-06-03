import type { Metadata } from "next";
import { OverviewView } from "./_components/overview-view";

export const metadata: Metadata = {
  title: "Dashboard Overview | Webhook System",
  description:
    "Monitor delivery outcomes, metrics, and logs for your application webhooks in real-time.",
};

export default function DashboardOverviewPage() {
  return <OverviewView />;
}

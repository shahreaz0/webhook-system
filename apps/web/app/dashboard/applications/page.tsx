import type { Metadata } from "next";
import { ApplicationsView } from "./components/applications-view";

export const metadata: Metadata = {
  title: "Applications | Webhook System",
  description:
    "Isolate, configure, and manage sandbox environments for your webhooks.",
};

export default function ApplicationsPage() {
  return <ApplicationsView />;
}

import type { Metadata } from "next";
import { EventTypesView } from "./components/event-types-view";

export const metadata: Metadata = {
  title: "Event Definitions | Webhook System",
  description:
    "Define and manage webhook event schemas that applications can trigger or subscribe to.",
};

export default function EventTypesPage() {
  return <EventTypesView />;
}

import type { Metadata } from "next";
import { MessagesView } from "./components/messages-view";

export const metadata: Metadata = {
  title: "Delivery Logs | Webhook System",
  description:
    "Monitor and audit webhook message delivery attempts, status, and request payloads.",
};

export default function MessagesPage() {
  return <MessagesView />;
}

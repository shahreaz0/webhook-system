import type { Metadata } from "next";
import { SubscribersView } from "./components/subscribers-view";

export const metadata: Metadata = {
  title: "Subscribers | Webhook System",
  description:
    "Configure and manage application subscribers and delivery endpoints.",
};

export default function SubscribersPage() {
  return <SubscribersView />;
}

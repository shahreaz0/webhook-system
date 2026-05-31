import { History, Layers, LayoutDashboard, Users, Zap } from "lucide-react";

export const navLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/applications", label: "Applications", icon: Layers },
  { href: "/dashboard/event-types", label: "Event Types", icon: Zap },
  { href: "/dashboard/subscribers", label: "Subscribers", icon: Users },
  { href: "/dashboard/messages", label: "Messages & Logs", icon: History },
];

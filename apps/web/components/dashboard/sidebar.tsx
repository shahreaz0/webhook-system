"use client";

import {
  ChevronsUpDown,
  LogOut,
  Plus,
  Terminal,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/web/components/ui/button";
import type { Application, User } from "@/web/lib/types";
import { cn } from "@/web/lib/utils";
import { navLinks } from "./nav-links";

interface SidebarProps {
  activeApp: Application | null;
  applications: Application[];
  handleLogout: () => void;
  setActiveApp: (app: Application | null) => void;
  user: User;
}

export function Sidebar({
  user,
  applications,
  activeApp,
  setActiveApp,
  handleLogout,
}: SidebarProps) {
  const pathname = usePathname();
  const [appDropdownOpen, setAppDropdownOpen] = useState(false);

  return (
    <aside className="hidden w-64 border-border border-r bg-card/40 backdrop-blur-md md:flex md:flex-col dark:border-input">
      {/* Brand Header */}
      <div className="flex h-14 items-center gap-2 border-border border-b px-4 dark:border-input">
        <Terminal className="size-4.5 animate-pulse text-primary" />
        <span className="font-bold font-mono text-sm tracking-wider">
          XWEBHOOK
        </span>
        <span className="border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-bold text-[9px] text-primary">
          V1
        </span>
      </div>

      {/* Application Selector */}
      <div className="relative border-border border-b p-3 dark:border-input">
        <Button
          className="flex h-auto w-full items-center justify-between px-3 py-2 text-left text-xs dark:bg-muted/10 dark:hover:bg-muted/20"
          onClick={() => setAppDropdownOpen(!appDropdownOpen)}
          variant="outline"
        >
          <div className="truncate">
            <div className="font-mono font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
              Active App
            </div>
            <div className="mt-0.5 truncate font-semibold text-foreground">
              {activeApp ? activeApp.name : "Select Application"}
            </div>
          </div>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 text-muted-foreground" />
        </Button>

        {appDropdownOpen && (
          <div className="fade-in slide-in-from-top-1 absolute right-3 left-3 z-50 mt-1 animate-in border border-border bg-card p-1 shadow-lg duration-150 dark:border-input">
            <div className="max-h-48 overflow-y-auto">
              {applications.length === 0 ? (
                <div className="p-3 text-center font-mono text-muted-foreground text-xs">
                  No applications found
                </div>
              ) : (
                applications.map((app) => (
                  <Button
                    className={cn(
                      "flex h-auto w-full items-center justify-start px-3 py-2 text-left text-xs",
                      activeApp?.id === app.id &&
                        "bg-primary/10 font-semibold text-primary"
                    )}
                    key={app.id}
                    onClick={() => {
                      setActiveApp(app);
                      setAppDropdownOpen(false);
                    }}
                    variant="ghost"
                  >
                    <span className="truncate">{app.name}</span>
                  </Button>
                ))
              )}
            </div>
            <div className="mt-1 border-border border-t pt-1 dark:border-input">
              <Link
                className="flex w-full items-center gap-1.5 px-3 py-2 text-left font-semibold text-primary text-xs transition-all hover:bg-primary/5"
                href="/dashboard/applications"
                onClick={() => setAppDropdownOpen(false)}
              >
                <Plus className="size-3.5" />
                <span>Manage Applications</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-1 p-3">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              className={cn(
                "group flex items-center gap-2.5 border-l-2 px-3 py-2.5 font-medium text-xs transition-all",
                isActive
                  ? "border-primary bg-primary/5 font-semibold text-primary"
                  : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
              href={link.href}
              key={link.href}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-transform group-hover:scale-105",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="mt-auto border-border border-t p-3 dark:border-input">
        <div className="mb-2 flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-7 shrink-0 items-center justify-center border border-primary/20 bg-primary/10 text-primary">
            <UserIcon className="size-3.5" />
          </div>
          <div className="truncate">
            <div className="truncate font-semibold text-foreground text-xs">
              {user.name || "Developer"}
            </div>
            <div className="truncate text-[10px] text-muted-foreground">
              {user.email}
            </div>
          </div>
        </div>
        <Button
          className="w-full justify-start font-medium text-muted-foreground text-xs hover:text-destructive dark:hover:bg-destructive/10"
          onClick={handleLogout}
          size="xs"
          variant="ghost"
        >
          <LogOut className="mr-2 size-3.5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

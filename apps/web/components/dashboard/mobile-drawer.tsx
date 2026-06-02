"use client";

import { LogOut, Terminal, User as UserIcon, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/web/app/(auth)/hooks/use-session";
import { Button } from "@/web/components/ui/button";
import type { Application } from "@/web/lib/types";
import { cn } from "@/web/lib/utils";
import { navLinks } from "./nav-links";

interface MobileDrawerProps {
  activeApp: Application | null;
  applications: Application[];
  handleLogout: () => void;
  mobileMenuOpen: boolean;
  setActiveApp: (app: Application | null) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export function MobileDrawer({
  mobileMenuOpen,
  setMobileMenuOpen,
  applications,
  activeApp,
  setActiveApp,
  handleLogout,
}: MobileDrawerProps) {
  const { data: user } = useSession();
  const pathname = usePathname();

  if (!mobileMenuOpen) {
    return null;
  }

  return (
    <div className="fade-in fixed inset-0 z-50 flex animate-in duration-200 md:hidden">
      <button
        aria-label="Close menu"
        className="fixed inset-0 cursor-default bg-background/80 backdrop-blur-xs"
        onClick={() => setMobileMenuOpen(false)}
        type="button"
      />
      <aside className="relative flex w-64 flex-col border-border border-r bg-card p-4 dark:border-input">
        <div className="mb-4 flex items-center justify-between border-border border-b pb-4 dark:border-input">
          <div className="flex items-center gap-2">
            <Terminal className="size-4.5 text-primary" />
            <span className="font-bold font-mono text-sm tracking-wider">
              XWEBHOOK
            </span>
          </div>
          <Button
            onClick={() => setMobileMenuOpen(false)}
            size="icon-xs"
            variant="outline"
          >
            <X className="size-3.5" />
          </Button>
        </div>

        {/* Mobile App Selector */}
        <div className="mb-4">
          <div className="mb-1 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            Active App
          </div>
          <select
            className="w-full border border-border bg-background px-2.5 py-1.5 text-foreground text-xs focus:outline-hidden dark:border-input"
            onChange={(e) => {
              const selected = applications.find(
                (a) => a.id === e.target.value
              );
              if (selected) {
                setActiveApp(selected);
              }
            }}
            value={activeApp?.id || ""}
          >
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
        </div>

        <nav className="flex-1 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                className={cn(
                  "flex items-center gap-2.5 border-l-2 px-3 py-2.5 font-medium text-xs",
                  isActive
                    ? "border-primary bg-primary/5 font-semibold text-primary"
                    : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
                href={link.href}
                key={link.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="size-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-border border-t pt-4 dark:border-input">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center border border-primary/20 bg-primary/10 text-primary">
              <UserIcon className="size-3.5" />
            </div>
            <div className="truncate">
              <div className="truncate font-semibold text-foreground text-xs">
                {user?.name || "Developer"}
              </div>
              <div className="truncate text-[10px] text-muted-foreground">
                {user?.email || ""}
              </div>
            </div>
          </div>
          <Button
            className="w-full justify-start text-muted-foreground text-xs hover:text-destructive"
            onClick={handleLogout}
            size="xs"
            variant="ghost"
          >
            <LogOut className="mr-2 size-3.5" />
            Sign Out
          </Button>
        </div>
      </aside>
    </div>
  );
}

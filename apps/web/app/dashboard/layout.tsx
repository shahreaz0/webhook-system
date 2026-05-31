"use client";

import {
  ChevronsUpDown,
  History,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  Sun,
  Terminal,
  User as UserIcon,
  Users,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/web/components/ui/button";
import { ActiveAppProvider, useActiveApp } from "@/web/lib/active-app-context";
import { apiClient } from "@/web/lib/fetch-client";
import type { User } from "@/web/lib/types";
import { cn } from "@/web/lib/utils";

function DashboardLayoutContent({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appDropdownOpen, setAppDropdownOpen] = useState(false);

  const { activeApp, setActiveApp, applications } = useActiveApp();

  useEffect(() => {
    const currentUser = apiClient.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = async () => {
    await apiClient.logout();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="font-mono text-muted-foreground text-xs">
            LOADING SESSION...
          </span>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/applications", label: "Applications", icon: Layers },
    { href: "/dashboard/event-types", label: "Event Types", icon: Zap },
    { href: "/dashboard/subscribers", label: "Subscribers", icon: Users },
    { href: "/dashboard/messages", label: "Messages & Logs", icon: History },
  ];

  return (
    <div className="relative flex min-h-screen bg-background">
      {/* Sidebar - Desktop */}
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

      {/* Mobile Top Nav & Sidebar Drawer */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-border border-b bg-card/30 px-4 backdrop-blur-md md:px-6 dark:border-input">
          <div className="flex items-center gap-4">
            <Button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              size="icon-sm"
              variant="outline"
            >
              {mobileMenuOpen ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
            </Button>
            <div className="flex items-center gap-2">
              <div className="font-semibold text-foreground text-sm capitalize tracking-tight md:text-base">
                {pathname.split("/").pop() === "dashboard"
                  ? "Overview"
                  : pathname.split("/").pop()?.replace("-", " ")}
              </div>
              {activeApp && pathname !== "/dashboard/applications" && (
                <div className="hidden items-center gap-1.5 sm:flex">
                  <span className="font-mono text-muted-foreground text-xs">
                    /
                  </span>
                  <span className="border border-primary/20 bg-primary/5 px-2 py-0.5 font-medium font-mono text-[10px] text-primary">
                    {activeApp.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2">
            {/* Quick Dark Mode Hotkey Hint */}
            <div className="hidden border border-border bg-muted/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground sm:block dark:border-input">
              Press <kbd className="font-semibold text-foreground">d</kbd> to
              toggle theme
            </div>

            {/* Light/Dark Toggle Button */}
            <Button
              className="text-muted-foreground hover:text-foreground"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              size="icon-sm"
              title="Toggle theme"
              variant="outline"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="mx-auto w-full max-w-7xl flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
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
                    {user.name}
                  </div>
                  <div className="truncate text-[10px] text-muted-foreground">
                    {user.email}
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
      )}
    </div>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ActiveAppProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ActiveAppProvider>
  );
}

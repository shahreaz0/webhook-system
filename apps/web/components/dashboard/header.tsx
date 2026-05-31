"use client";

import { Menu, Moon, Sun, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { Button } from "@/web/components/ui/button";
import type { Application } from "@/web/lib/types";

interface HeaderProps {
  activeApp: Application | null;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function Header({
  mobileMenuOpen,
  setMobileMenuOpen,
  activeApp,
}: HeaderProps) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  // Implement the theme toggle hotkey functionality
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is typing in form inputs
      const activeElement = document.activeElement as HTMLElement | null;
      const isInput =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.isContentEditable);

      if (e.key === "d" && !isInput) {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [resolvedTheme, setTheme]);

  const pageTitle =
    pathname.split("/").pop() === "dashboard"
      ? "Overview"
      : pathname.split("/").pop()?.replace("-", " ") || "Dashboard";

  return (
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
            {pageTitle}
          </div>
          {activeApp && pathname !== "/dashboard/applications" && (
            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="font-mono text-muted-foreground text-xs">/</span>
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
          Press <kbd className="font-semibold text-foreground">d</kbd> to toggle
          theme
        </div>

        {/* Light/Dark Toggle Button */}
        <Button
          className="text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
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
  );
}

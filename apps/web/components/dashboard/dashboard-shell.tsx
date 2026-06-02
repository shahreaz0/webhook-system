"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/web/app/(auth)/hooks/use-session";
import { useGetApplicationList } from "@/web/app/dashboard/applications/hooks/use-get-application-list";
import { useUpdateActiveApp } from "@/web/app/dashboard/applications/hooks/use-update-active-app";
import { useApplicationsStore } from "@/web/app/dashboard/applications/store";
import { apiClient } from "@/web/lib/fetch-client";
import type { Application } from "@/web/lib/types";
import { Header } from "./header";
import { MobileDrawer } from "./mobile-drawer";
import { Sidebar } from "./sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { activeApp } = useApplicationsStore();
  const { data: applications = [], isSuccess } = useGetApplicationList();
  const updateActiveApp = useUpdateActiveApp();

  const handleSetActiveApp = (app: Application | null) => {
    updateActiveApp.mutate(app);
  };

  const { data: session, isSuccess: isProfileSuccess } = useSession();

  useEffect(() => {
    if (!(isSuccess && isProfileSuccess)) {
      return;
    }

    const savedAppId = session?.activeApplicationId;
    if (applications.length > 0) {
      const found = savedAppId
        ? applications.find((a) => a.id === savedAppId)
        : null;
      if (!found) {
        updateActiveApp.mutate(applications[0]);
      }
    } else if (savedAppId !== null && savedAppId !== undefined) {
      updateActiveApp.mutate(null);
    }
  }, [applications, isSuccess, isProfileSuccess, session, updateActiveApp]);

  const handleLogout = async () => {
    await apiClient.logout();
    router.push("/signin");
  };

  if (!session) {
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

  return (
    <div className="relative flex min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <Sidebar
        activeApp={activeApp}
        applications={applications}
        handleLogout={handleLogout}
        setActiveApp={handleSetActiveApp}
      />

      {/* Main Viewport Container */}
      <div className="flex flex-1 flex-col">
        <Header
          activeApp={activeApp}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Content Viewport */}
        <main className="mx-auto w-full max-w-7xl flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      <MobileDrawer
        activeApp={activeApp}
        applications={applications}
        handleLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setActiveApp={handleSetActiveApp}
        setMobileMenuOpen={setMobileMenuOpen}
      />
    </div>
  );
}

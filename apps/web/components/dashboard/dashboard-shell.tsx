"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLogout } from "@/web/app/(auth)/_hooks/use-logout";
import { useSession } from "@/web/app/(auth)/_hooks/use-session";
import { useGetApplicationList } from "@/web/app/dashboard/applications/_hooks/use-get-application-list";
import { useUpdateActiveApp } from "@/web/app/dashboard/applications/_hooks/use-update-active-app";
import { useApplicationsStore } from "@/web/app/dashboard/applications/store";
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

  const {
    data: session,
    isSuccess: isProfileSuccess,
    isError: isSessionError,
  } = useSession();

  useEffect(() => {
    if (isSessionError) {
      router.push("/signin");
    }
  }, [isSessionError, router]);

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

  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push("/signin");
  };

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

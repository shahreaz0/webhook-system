"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGetApplicationList } from "@/web/app/dashboard/applications/hooks/use-get-application-list";
import { useApplicationsStore } from "@/web/app/dashboard/applications/store";
import { apiClient } from "@/web/lib/fetch-client";
import type { User } from "@/web/lib/types";
import { Header } from "./header";
import { MobileDrawer } from "./mobile-drawer";
import { Sidebar } from "./sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { activeApp, setActiveApp } = useApplicationsStore();
  const { data: applications = [], isSuccess } = useGetApplicationList();

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    if (applications.length > 0) {
      if (activeApp) {
        const found = applications.find((a) => a.id === activeApp.id);
        if (found) {
          if (
            found.name !== activeApp.name ||
            found.description !== activeApp.description
          ) {
            setActiveApp(found);
          }
        } else {
          setActiveApp(applications[0]);
        }
      } else {
        setActiveApp(applications[0]);
      }
    } else if (activeApp) {
      setActiveApp(null);
    }
  }, [applications, activeApp, isSuccess, setActiveApp]);

  useEffect(() => {
    const currentUser = apiClient.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      router.push("/signin");
    }
  }, [router]);

  const handleLogout = async () => {
    await apiClient.logout();
    router.push("/signin");
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

  return (
    <div className="relative flex min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <Sidebar
        activeApp={activeApp}
        applications={applications}
        handleLogout={handleLogout}
        setActiveApp={setActiveApp}
        user={user}
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
        setActiveApp={setActiveApp}
        setMobileMenuOpen={setMobileMenuOpen}
        user={user}
      />
    </div>
  );
}

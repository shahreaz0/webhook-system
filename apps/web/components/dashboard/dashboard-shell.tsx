"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGetApplicationList } from "@/web/app/dashboard/applications/hooks/use-get-application-list";
import { useUpdateActiveApp } from "@/web/app/dashboard/applications/hooks/use-update-active-app";
import { useApplicationsStore } from "@/web/app/dashboard/applications/store";
import { hc } from "@/web/lib/api-client";
import { apiClient } from "@/web/lib/fetch-client";
import type { Application, User } from "@/web/lib/types";
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

  const { activeApp } = useApplicationsStore();
  const { data: applications = [], isSuccess } = useGetApplicationList();
  const updateActiveApp = useUpdateActiveApp();

  const handleSetActiveApp = (app: Application | null) => {
    updateActiveApp.mutate(app);
  };

  const { data: profile, isSuccess: isProfileSuccess } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await hc.users.me.$get();
      const json = await res.json();
      if (!res.ok) {
        throw new Error((json as any).message || "Failed to fetch profile");
      }
      return (json as any).data as User;
    },
  });

  useEffect(() => {
    if (!(isSuccess && isProfileSuccess)) {
      return;
    }

    const savedAppId = profile?.activeApplicationId;
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
  }, [applications, isSuccess, isProfileSuccess, profile, updateActiveApp]);

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
        setActiveApp={handleSetActiveApp}
        user={profile || user}
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
        user={profile || user}
      />
    </div>
  );
}

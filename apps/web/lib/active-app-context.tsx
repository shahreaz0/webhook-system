"use client";

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiClient } from "./fetch-client";
import type { Application } from "./types";

interface ActiveAppContextType {
  activeApp: Application | null;
  applications: Application[];
  loading: boolean;
  refreshApplications: () => Promise<void>;
  setActiveApp: (app: Application | null) => void;
}

const ActiveAppContext = createContext<ActiveAppContextType | undefined>(
  undefined
);

export function ActiveAppProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeApp, setActiveAppState] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshApplications = useCallback(async () => {
    try {
      const list = await apiClient.getApplications();
      setApplications(list);

      // Sync active app state
      const savedActiveAppId = localStorage.getItem("webhook_active_app_id");
      if (list.length > 0) {
        const found = list.find((a) => a.id === savedActiveAppId);
        setActiveAppState(found || list[0]);
      } else {
        setActiveAppState(null);
      }
    } catch (err) {
      console.error("Failed to fetch applications", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshApplications();
  }, [refreshApplications]);

  const setActiveApp = useCallback((app: Application | null) => {
    setActiveAppState(app);
    if (app) {
      localStorage.setItem("webhook_active_app_id", app.id);
    } else {
      localStorage.removeItem("webhook_active_app_id");
    }
  }, []);

  return (
    <ActiveAppContext.Provider
      value={{
        activeApp,
        setActiveApp,
        applications,
        refreshApplications,
        loading,
      }}
    >
      {children}
    </ActiveAppContext.Provider>
  );
}

export function useActiveApp() {
  const context = useContext(ActiveAppContext);
  if (!context) {
    throw new Error("useActiveApp must be used within an ActiveAppProvider");
  }
  return context;
}

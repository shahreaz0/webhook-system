import { useMemo } from "react";
import { useSession } from "@/web/app/(auth)/_hooks/use-session";
import type { Application } from "@/web/lib/types";
import { useGetApplicationList } from "./use-get-application-list";

export function useActiveApp(): Application | null {
  const { data: applications = [] } = useGetApplicationList();
  const { data: profile } = useSession();

  const activeAppId = profile?.activeApplicationId;

  return useMemo(() => {
    if (!activeAppId) {
      return applications[0] || null;
    }
    return (
      applications.find((app) => app.id === activeAppId) ||
      applications[0] ||
      null
    );
  }, [applications, activeAppId]);
}

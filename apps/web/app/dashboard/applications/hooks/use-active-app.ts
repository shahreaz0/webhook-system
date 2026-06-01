import { useQuery } from "@tanstack/react-query";
import type { Application, User } from "@/web/lib/types";
import { useGetApplicationList } from "./use-get-application-list";

export function useActiveApp(): Application | null {
  const { data: applications = [] } = useGetApplicationList();

  const { data: profile } = useQuery<User>({
    queryKey: ["profile"],
    enabled: false,
  });

  const activeAppId = profile?.activeApplicationId;
  if (!activeAppId) {
    return applications[0] || null;
  }
  return (
    applications.find((a) => a.id === activeAppId) || applications[0] || null
  );
}

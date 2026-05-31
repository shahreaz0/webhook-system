import { queryOptions, useQuery } from "@tanstack/react-query";
import { hc } from "@/web/lib/api-client";
import type { EventType } from "@/web/lib/types";

export function eventTypesListQueryOptions(applicationId: string) {
  return queryOptions({
    queryKey: ["event-types", applicationId],
    queryFn: async () => {
      if (!applicationId) {
        return [];
      }
      const res = await hc.applications[":applicationId"]["event-types"].$get({
        param: { applicationId },
        query: {},
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error((json as any).message || "Failed to fetch event types");
      }
      return (json as any).data as EventType[];
    },
    enabled: !!applicationId,
  });
}

export function useGetEventTypesList(applicationId: string) {
  return useQuery(eventTypesListQueryOptions(applicationId));
}

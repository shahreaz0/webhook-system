import { queryOptions, useQuery } from "@tanstack/react-query";
import { hc } from "@/web/lib/api-client";
import type { EventType } from "@/web/lib/types";

export function eventTypesListQueryOptions(
  applicationId: string,
  query: { archived?: boolean; deprecated?: boolean; search?: string } = {}
) {
  return queryOptions({
    queryKey: ["event-types", applicationId, query],
    queryFn: async () => {
      if (!applicationId) {
        return [];
      }
      const apiQuery: any = {};
      if (query.archived !== undefined) {
        apiQuery.archived = String(query.archived);
      }
      if (query.deprecated !== undefined) {
        apiQuery.deprecated = String(query.deprecated);
      }
      if (query.search !== undefined) {
        apiQuery.search = query.search;
      }

      const res = await hc.applications[":applicationId"]["event-types"].$get({
        param: { applicationId },
        query: apiQuery,
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

export function useGetEventTypesList(
  applicationId: string,
  query?: { archived?: boolean; deprecated?: boolean; search?: string }
) {
  return useQuery(eventTypesListQueryOptions(applicationId, query));
}

import { queryOptions, useQuery } from "@tanstack/react-query";
import { hc } from "@/web/lib/api-client";
import type { Subscriber } from "@/web/lib/types";

export function subscribersListQueryOptions(
  applicationId: string,
  search?: string
) {
  return queryOptions({
    queryKey: ["subscribers", applicationId, search],
    queryFn: async () => {
      if (!applicationId) {
        return [];
      }
      const apiQuery: any = {};
      if (search) {
        apiQuery.search = search;
      }
      const res = await hc.applications[":applicationId"].subscribers.$get({
        param: { applicationId },
        query: apiQuery,
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error((json as any).message || "Failed to fetch subscribers");
      }
      return (json as any).data as Subscriber[];
    },
    enabled: !!applicationId,
  });
}

export function useGetSubscribersList(applicationId: string, search?: string) {
  return useQuery(subscribersListQueryOptions(applicationId, search));
}

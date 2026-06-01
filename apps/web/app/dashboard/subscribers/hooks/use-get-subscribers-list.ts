import { queryOptions, useQuery } from "@tanstack/react-query";
import { hc } from "@/web/lib/api-client";
import type { Subscriber } from "@/web/lib/types";

export function subscribersListQueryOptions(applicationId: string) {
  return queryOptions({
    queryKey: ["subscribers", applicationId],
    queryFn: async () => {
      if (!applicationId) {
        return [];
      }
      const res = await hc.applications[":applicationId"].subscribers.$get({
        param: { applicationId },
        query: {},
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

export function useGetSubscribersList(applicationId: string) {
  return useQuery(subscribersListQueryOptions(applicationId));
}

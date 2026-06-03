import { queryOptions, useQuery } from "@tanstack/react-query";
import { hc } from "@/web/lib/api-client";
import type { Webhook } from "@/web/lib/types";

export function overviewWebhooksQueryOptions(applicationId: string) {
  return queryOptions({
    queryKey: ["overview-webhooks", applicationId],
    queryFn: async () => {
      if (!applicationId) {
        return [];
      }
      const resSub = await hc.applications[":applicationId"].subscribers.$get({
        param: { applicationId },
        query: {},
      });
      const jsonSub = await resSub.json();
      if (!resSub.ok) {
        throw new Error(
          (jsonSub as any).message || "Failed to fetch subscribers"
        );
      }
      const subs = (jsonSub as any).data;

      const whsPromises = subs.map(async (s: any) => {
        const resWh = await hc.subscribers[":subscriberId"].webhooks.$get({
          param: { subscriberId: s.id },
          query: {},
        });
        const jsonWh = await resWh.json();
        if (!resWh.ok) {
          return [];
        }
        return (jsonWh as any).data;
      });

      const whsLists = await Promise.all(whsPromises);
      return whsLists.flat() as Webhook[];
    },
    enabled: !!applicationId,
  });
}

export function useGetOverviewWebhooks(applicationId: string) {
  return useQuery(overviewWebhooksQueryOptions(applicationId));
}

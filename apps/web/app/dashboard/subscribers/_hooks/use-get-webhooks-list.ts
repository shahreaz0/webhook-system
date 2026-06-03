import { queryOptions, useQuery } from "@tanstack/react-query";
import { hc } from "@/web/lib/api-client";
import type { Webhook } from "@/web/lib/types";

export function webhooksListQueryOptions(subscriberId: string) {
  return queryOptions({
    queryKey: ["webhooks", subscriberId],
    queryFn: async () => {
      if (!subscriberId) {
        return [];
      }
      const res = await hc.subscribers[":subscriberId"].webhooks.$get({
        param: { subscriberId },
        query: {},
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error((json as any).message || "Failed to fetch webhooks");
      }
      return (json as any).data as Webhook[];
    },
    enabled: !!subscriberId,
  });
}

export function useGetWebhooksList(subscriberId: string) {
  return useQuery(webhooksListQueryOptions(subscriberId));
}

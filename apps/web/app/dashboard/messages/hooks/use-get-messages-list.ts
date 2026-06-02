import { queryOptions, useQuery } from "@tanstack/react-query";
import { hc } from "@/web/lib/api-client";
import type { Message } from "@/web/lib/types";

export function messagesListQueryOptions(
  subscriberId: string,
  query: {
    page?: number;
    perPage?: number;
    status?: string;
    eventTypeId?: string;
  } = {}
) {
  return queryOptions({
    queryKey: ["messages", subscriberId, query],
    queryFn: async () => {
      if (!subscriberId) {
        return [];
      }
      const apiQuery: any = {};
      if (query.page !== undefined) {
        apiQuery.page = String(query.page);
      }
      if (query.perPage !== undefined) {
        apiQuery.perPage = String(query.perPage);
      }
      if (query.status) {
        apiQuery.status = query.status;
      }
      if (query.eventTypeId) {
        apiQuery.eventTypeId = query.eventTypeId;
      }

      const res = await hc.subscribers[":subscriberId"].messages.$get({
        param: { subscriberId },
        query: apiQuery,
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error((json as any).message || "Failed to fetch messages");
      }
      return (json as any).data as Message[];
    },
    enabled: !!subscriberId,
    refetchInterval: 4000,
  });
}

export function useGetMessagesList(
  subscriberId: string,
  query?: {
    page?: number;
    perPage?: number;
    status?: string;
    eventTypeId?: string;
  }
) {
  return useQuery(messagesListQueryOptions(subscriberId, query));
}

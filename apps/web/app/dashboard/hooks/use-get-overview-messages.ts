import { queryOptions, useQuery } from "@tanstack/react-query";
import { hc } from "@/web/lib/api-client";
import type { Message } from "@/web/lib/types";

export function overviewMessagesQueryOptions(applicationId: string) {
  return queryOptions({
    queryKey: ["overview-messages", applicationId],
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

      const msgPromises = subs.map(async (s: any) => {
        const resMsg = await hc.subscribers[":subscriberId"].messages.$get({
          param: { subscriberId: s.id },
          query: {},
        });
        const jsonMsg = await resMsg.json();
        if (!resMsg.ok) {
          return [];
        }
        return (jsonMsg as any).data;
      });

      const msgLists = await Promise.all(msgPromises);
      return msgLists
        .flat()
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ) as Message[];
    },
    enabled: !!applicationId,
  });
}

export function useGetOverviewMessages(applicationId: string) {
  return useQuery(overviewMessagesQueryOptions(applicationId));
}

import { queryOptions, useQuery } from "@tanstack/react-query";
import { hc } from "@/web/lib/api-client";
import type { Application } from "@/web/lib/types";

export function applicationsListQueryOptions() {
  return queryOptions({
    queryKey: ["applications"],
    queryFn: async () => {
      const res = await hc.applications.$get({ query: {} });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          (json as any).message || "Failed to fetch applications"
        );
      }
      return (json as any).data as Application[];
    },
  });
}

export function useGetApplicationList() {
  return useQuery(applicationsListQueryOptions());
}

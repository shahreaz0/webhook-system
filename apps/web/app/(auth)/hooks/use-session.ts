import { useQuery } from "@tanstack/react-query";
import { hc } from "@/web/lib/api-client";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const response = await hc.users.me.$get();

      const data = await response.json();

      if (!response.ok) {
        throw new Error((data as any).message);
      }

      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

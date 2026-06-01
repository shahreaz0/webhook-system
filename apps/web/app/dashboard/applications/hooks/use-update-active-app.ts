import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hc } from "@/web/lib/api-client";
import type { Application, User } from "@/web/lib/types";

export function useUpdateActiveApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-active-app"],
    mutationFn: async (app: Application | null) => {
      const res = await hc.users.me.$patch({
        json: { activeApplicationId: app ? app.id : null },
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error((json as any).message || "Failed to update active app");
      }
      return app;
    },
    onMutate: async (newApp) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["profile"] });

      // Snapshot the previous profile value
      const previousProfile = queryClient.getQueryData<User>(["profile"]);

      // Optimistically update to the new activeApplicationId
      if (previousProfile) {
        queryClient.setQueryData<User>(["profile"], {
          ...previousProfile,
          activeApplicationId: newApp ? newApp.id : null,
        });
      }

      // Return context with snapshotted value for rollback
      return { previousProfile };
    },
    onError: (_err, _newApp, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(["profile"], context.previousProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

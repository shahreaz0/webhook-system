import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { hc } from "@/web/lib/api-client";
import type { Application } from "@/web/lib/types";

export function updateApplicationMutationOptions() {
  return mutationOptions({
    mutationKey: ["update-application"],
    mutationFn: async ({
      id,
      name,
      description,
    }: {
      id: string;
      name?: string;
      description?: string;
    }) => {
      const res = await hc.applications[":id"].$patch({
        param: { id },
        json: { name, description },
      });
      const json = await res.json();
      if (!res.ok) {
        return Promise.reject(json);
      }
      return (json as any).data as Application;
    },
    onSuccess: () => {
      toast.success("Application updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update application");
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

export function useUpdateApplication() {
  return useMutation(updateApplicationMutationOptions());
}

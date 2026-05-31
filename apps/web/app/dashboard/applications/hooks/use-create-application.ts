import { mutationOptions, useMutation } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { toast } from "sonner";
import { hc } from "@/web/lib/api-client";
import type { Application } from "@/web/lib/types";

export function createApplicationMutationOptions() {
  return mutationOptions({
    mutationKey: ["create-application"],
    mutationFn: async (
      payload: InferRequestType<typeof hc.applications.$post>["json"]
    ) => {
      const res = await hc.applications.$post({ json: payload });
      const json = await res.json();
      if (!res.ok) {
        return Promise.reject(json);
      }
      return (json as any).data as Application;
    },
    onSuccess: () => {
      toast.success("Application created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create application");
    },

    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

export function useCreateApplication() {
  return useMutation(createApplicationMutationOptions());
}

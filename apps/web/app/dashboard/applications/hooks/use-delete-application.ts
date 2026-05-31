import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { hc } from "@/web/lib/api-client";

export function deleteApplicationMutationOptions() {
  return mutationOptions({
    mutationKey: ["delete-application"],
    mutationFn: async (id: string) => {
      const res = await hc.applications[":id"].$delete({
        param: { id },
      });
      const json = await res.json();
      if (!res.ok) {
        return Promise.reject(json);
      }
      return (json as any).data as { id: string };
    },
    onSuccess: () => {
      toast.success("Application deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete application");
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

export function useDeleteApplication() {
  return useMutation(deleteApplicationMutationOptions());
}

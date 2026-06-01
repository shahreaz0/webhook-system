import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { hc } from "@/web/lib/api-client";

export function deleteSubscriberMutationOptions(applicationId: string) {
  return mutationOptions({
    mutationKey: ["delete-subscriber", applicationId],
    mutationFn: async (subscriberId: string) => {
      const res = await hc.applications[":applicationId"].subscribers[
        ":subscriberId"
      ].$delete({
        param: { applicationId, subscriberId },
      });
      const json = await res.json();
      if (!res.ok) {
        return Promise.reject(json);
      }
      return (json as any).data as { id: string };
    },
    onSuccess: () => {
      toast.success("Subscriber deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete subscriber");
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["subscribers", applicationId],
      });
    },
  });
}

export function useDeleteSubscriber(applicationId: string) {
  return useMutation(deleteSubscriberMutationOptions(applicationId));
}

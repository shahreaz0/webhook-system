import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { hc } from "@/web/lib/api-client";
import type { Subscriber } from "@/web/lib/types";

export function updateSubscriberMutationOptions(applicationId: string) {
  return mutationOptions({
    mutationKey: ["update-subscriber", applicationId],
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        referenceId?: string;
        email?: string;
        metadata?: any;
      };
    }) => {
      const res = await hc.applications[":applicationId"].subscribers[
        ":subscriberId"
      ].$patch({
        param: { applicationId, subscriberId: id },
        json: payload,
      });
      const json = await res.json();
      if (!res.ok) {
        return Promise.reject(json);
      }
      return (json as any).data as Subscriber;
    },
    onSuccess: () => {
      toast.success("Subscriber updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update subscriber");
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["subscribers", applicationId],
      });
    },
  });
}

export function useUpdateSubscriber(applicationId: string) {
  return useMutation(updateSubscriberMutationOptions(applicationId));
}

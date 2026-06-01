import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { hc } from "@/web/lib/api-client";
import type { Subscriber } from "@/web/lib/types";

export function createSubscriberMutationOptions(applicationId: string) {
  return mutationOptions({
    mutationKey: ["create-subscriber", applicationId],
    mutationFn: async (payload: {
      referenceId: string;
      email: string;
      metadata?: any;
    }) => {
      const res = await hc.applications[":applicationId"].subscribers.$post({
        param: { applicationId },
        json: payload,
      });
      const json = await res.json();
      if (!res.ok) {
        return Promise.reject(json);
      }
      return (json as any).data as Subscriber;
    },
    onSuccess: () => {
      toast.success("Subscriber created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create subscriber");
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["subscribers", applicationId],
      });
    },
  });
}

export function useCreateSubscriber(applicationId: string) {
  return useMutation(createSubscriberMutationOptions(applicationId));
}

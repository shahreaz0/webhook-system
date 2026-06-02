import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { hc } from "@/web/lib/api-client";
import type { Message } from "@/web/lib/types";

export function triggerMessageMutationOptions(subscriberId: string) {
  return mutationOptions({
    mutationKey: ["trigger-message", subscriberId],
    mutationFn: async (payload: {
      eventTypeId: string;
      payload: any;
      labels?: Record<string, string>;
    }) => {
      const res = await hc.subscribers[":subscriberId"].messages.$post({
        param: { subscriberId },
        json: payload,
      });
      const json = await res.json();
      if (!res.ok) {
        return Promise.reject(json);
      }
      return (json as any).data as Message;
    },
    onSuccess: () => {
      toast.success("Test event dispatched successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to dispatch event");
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["messages", subscriberId],
      });
    },
  });
}

export function useTriggerMessage(subscriberId: string) {
  return useMutation(triggerMessageMutationOptions(subscriberId));
}

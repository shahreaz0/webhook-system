import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { hc } from "@/web/lib/api-client";
import type { EventType } from "@/web/lib/types";

export function createEventTypeMutationOptions(applicationId: string) {
  return mutationOptions({
    mutationKey: ["create-event-type", applicationId],
    mutationFn: async (payload: {
      name: string;
      description?: string | null;
      groupName?: string | null;
      archived?: boolean;
      deprecated?: boolean;
    }) => {
      const res = await hc.applications[":applicationId"]["event-types"].$post({
        param: { applicationId },
        json: payload,
      });
      const json = await res.json();
      if (!res.ok) {
        return Promise.reject(json);
      }
      return (json as any).data as EventType;
    },
    onSuccess: () => {
      toast.success("Event type created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create event type");
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["event-types", applicationId],
      });
    },
  });
}

export function useCreateEventType(applicationId: string) {
  return useMutation(createEventTypeMutationOptions(applicationId));
}

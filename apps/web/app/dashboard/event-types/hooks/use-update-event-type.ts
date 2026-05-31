import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { hc } from "@/web/lib/api-client";
import type { EventType } from "@/web/lib/types";

export function updateEventTypeMutationOptions(applicationId: string) {
  return mutationOptions({
    mutationKey: ["update-event-type", applicationId],
    mutationFn: async ({
      id,
      name,
      description,
      groupName,
      archived,
      deprecated,
    }: {
      id: string;
      name?: string;
      description?: string | null;
      groupName?: string | null;
      archived?: boolean;
      deprecated?: boolean;
    }) => {
      const res = await hc.applications[":applicationId"]["event-types"][
        ":eventTypeId"
      ].$patch({
        param: { applicationId, eventTypeId: id },
        json: { name, description, groupName, archived, deprecated },
      });
      const json = await res.json();
      if (!res.ok) {
        return Promise.reject(json);
      }
      return (json as any).data as EventType;
    },
    onSuccess: () => {
      toast.success("Event type updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update event type");
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["event-types", applicationId],
      });
    },
  });
}

export function useUpdateEventType(applicationId: string) {
  return useMutation(updateEventTypeMutationOptions(applicationId));
}

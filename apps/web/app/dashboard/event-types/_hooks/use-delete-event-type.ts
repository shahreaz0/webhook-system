import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { hc } from "@/web/lib/api-client";

export function deleteEventTypeMutationOptions(applicationId: string) {
  return mutationOptions({
    mutationKey: ["delete-event-type", applicationId],
    mutationFn: async (id: string) => {
      const res = await hc.applications[":applicationId"]["event-types"][
        ":eventTypeId"
      ].$delete({
        param: { applicationId, eventTypeId: id },
      });
      const json = await res.json();
      if (!res.ok) {
        return Promise.reject(json);
      }
      return (json as any).data as { id: string };
    },
    onSuccess: () => {
      toast.success("Event type deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete event type");
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["event-types", applicationId],
      });
    },
  });
}

export function useDeleteEventType(applicationId: string) {
  return useMutation(deleteEventTypeMutationOptions(applicationId));
}

import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { hc } from "@/web/lib/api-client";

export function deleteWebhookMutationOptions(subscriberId: string) {
  return mutationOptions({
    mutationKey: ["delete-webhook", subscriberId],
    mutationFn: async (webhookId: string) => {
      const res = await hc.subscribers[":subscriberId"].webhooks[
        ":webhookId"
      ].$delete({
        param: { subscriberId, webhookId },
      });
      const json = await res.json();
      if (!res.ok) {
        return Promise.reject(json);
      }
      return (json as any).data as { id: string };
    },
    onSuccess: () => {
      toast.success("Webhook endpoint deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete webhook endpoint");
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["webhooks", subscriberId],
      });
    },
  });
}

export function useDeleteWebhook(subscriberId: string) {
  return useMutation(deleteWebhookMutationOptions(subscriberId));
}

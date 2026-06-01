import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { hc } from "@/web/lib/api-client";
import type { Webhook } from "@/web/lib/types";

export function updateWebhookMutationOptions(subscriberId: string) {
  return mutationOptions({
    mutationKey: ["update-webhook", subscriberId],
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        url?: string;
        description?: string | null;
        rateLimit?: number | null;
        disabled?: boolean;
        eventTypes?: string[];
      };
    }) => {
      const res = await hc.subscribers[":subscriberId"].webhooks[
        ":webhookId"
      ].$patch({
        param: { subscriberId, webhookId: id },
        json: payload,
      });
      const json = await res.json();
      if (!res.ok) {
        return Promise.reject(json);
      }
      return (json as any).data as Webhook;
    },
    onSuccess: () => {
      toast.success("Webhook endpoint updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update webhook endpoint");
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["webhooks", subscriberId],
      });
    },
  });
}

export function useUpdateWebhook(subscriberId: string) {
  return useMutation(updateWebhookMutationOptions(subscriberId));
}

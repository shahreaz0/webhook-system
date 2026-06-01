import { mutationOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { hc } from "@/web/lib/api-client";
import type { Webhook } from "@/web/lib/types";

export function createWebhookMutationOptions(subscriberId: string) {
  return mutationOptions({
    mutationKey: ["create-webhook", subscriberId],
    mutationFn: async (payload: {
      name: string;
      method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
      url: string;
      description?: string | null;
      rateLimit?: number | null;
      eventTypes: string[];
      headers?: Record<string, string>;
      labels?: Record<string, string>;
    }) => {
      const secret = `whsec_${Array.from(
        crypto.getRandomValues(new Uint8Array(16))
      )
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}`;

      const res = await hc.subscribers[":subscriberId"].webhooks.$post({
        param: { subscriberId },
        json: {
          ...payload,
          secret,
        },
      });
      const json = await res.json();
      if (!res.ok) {
        return Promise.reject(json);
      }
      return (json as any).data as Webhook;
    },
    onSuccess: () => {
      toast.success("Webhook endpoint created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create webhook endpoint");
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["webhooks", subscriberId],
      });
    },
  });
}

export function useCreateWebhook(subscriberId: string) {
  return useMutation(createWebhookMutationOptions(subscriberId));
}

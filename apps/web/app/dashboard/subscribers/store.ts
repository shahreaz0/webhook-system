import { createStore } from "stan-js";
import type { Subscriber, Webhook } from "@/web/lib/types";

export const { useStore: useSubscribersStore, reset: resetSubscribersStore } =
  createStore({
    selectedSubscriber: null as Subscriber | null,
    subscriberToDelete: null as Subscriber | null,
    webhookToDelete: null as Webhook | null,
    isUpsertSubscriberDialogOpen: false,
    subscriberMutationType: "" as "add" | "edit",
    isUpsertWebhookDialogOpen: false,
    webhookMutationType: "" as "add" | "edit",
    selectedWebhook: null as Webhook | null,
    isCreateWebhookOpen: false,
    searchQuery: "",
  });

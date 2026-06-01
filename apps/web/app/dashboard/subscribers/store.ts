import { createStore } from "stan-js";
import type { Subscriber, Webhook } from "@/web/lib/types";

export const { useStore: useSubscribersStore, reset: resetSubscribersStore } =
  createStore({
    selectedSubscriber: null as Subscriber | null,
    subscriberToDelete: null as Subscriber | null,
    webhookToDelete: null as Webhook | null,
    isCreateSubscriberOpen: false,
    isCreateWebhookOpen: false,
  });

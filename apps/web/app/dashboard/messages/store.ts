import { createStore } from "stan-js";
import type { Message } from "@/web/lib/types";

export const getDefaultPayload = () => `{
  "event": "iam.user.signup",
  "user": {
    "id": "usr_909",
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "timestamp": "${new Date().toISOString()}"
}`;

export const { useStore: useMessagesStore, reset: resetMessagesStore } =
  createStore({
    selectedMessage: null as Message | null,
    isTriggering: false,
    selectedSubscriberFilterId: "",
    selectedSubscriberId: "",
    selectedEventTypeId: "",
    payloadStr: "",
    triggerError: null as string | null,
  });

import { createStore } from "stan-js";
import type { EventType } from "@/web/lib/types";

export const { useStore: useEventTypesStore, reset: resetEventTypesStore } =
  createStore({
    isUpsertEventTypeDialogOpen: false,
    eventTypeMutationType: "" as "add" | "edit",
    selectedEventType: null as EventType | null,
  });

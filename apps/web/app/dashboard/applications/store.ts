import { createStore } from "stan-js";
import { storage } from "stan-js/storage";
import type { Application } from "@/web/lib/types";

export const { useStore: useApplicationsStore, reset: resetApplicationsStore } =
  createStore({
    isUpsertApplicationDialogOpen: false,
    applicationMutationType: "" as "add" | "edit",
    selectedApplication: null as Application | null,
    activeApp: storage<Application | null>(null, {
      storageKey: "webhook_active_app",
    }),
  });

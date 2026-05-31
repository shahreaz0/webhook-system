import { createStore } from "stan-js";
import type { Application } from "@/web/lib/types";

export const { useStore: useApplicationsStore, reset: resetApplicationsStore } =
  createStore({
    isUpsertApplicationDialogOpen: false,
    applicationMutationType: "" as "add" | "edit",
    selectedApplication: null as Application | null,
  });

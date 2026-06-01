import { createStore } from "stan-js";
import type { Application } from "@/web/lib/types";
import { useActiveApp } from "./hooks/use-active-app";

const { useStore, reset: resetApplicationsStore } = createStore({
  isUpsertApplicationDialogOpen: false,
  applicationMutationType: "" as "add" | "edit",
  selectedApplication: null as Application | null,
});

export { resetApplicationsStore };

export function useApplicationsStore() {
  const store = useStore();
  const activeApp = useActiveApp();

  return {
    ...store,
    activeApp,
  };
}

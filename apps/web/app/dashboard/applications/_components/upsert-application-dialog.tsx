"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/web/components/ui/dialog";
import { useApplicationsStore } from "../store";
import { UpsertApplicationForm } from "./upsert-application-form";

export function UpsertApplicationDialog() {
  const {
    isUpsertApplicationDialogOpen,
    setIsUpsertApplicationDialogOpen,
    applicationMutationType,
  } = useApplicationsStore();

  const isEdit = applicationMutationType === "edit";

  return (
    <Dialog
      onOpenChange={setIsUpsertApplicationDialogOpen}
      open={isUpsertApplicationDialogOpen}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Application" : "New Application"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your application details below."
              : "Create a new sandbox event container."}
          </DialogDescription>
        </DialogHeader>
        <UpsertApplicationForm />
      </DialogContent>
    </Dialog>
  );
}

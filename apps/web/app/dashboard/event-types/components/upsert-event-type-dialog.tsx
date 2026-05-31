"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/web/components/ui/dialog";
import { useEventTypesStore } from "../store";
import { UpsertEventTypeForm } from "./upsert-event-type-form";

export function UpsertEventTypeDialog() {
  const {
    isUpsertEventTypeDialogOpen,
    setIsUpsertEventTypeDialogOpen,
    eventTypeMutationType,
  } = useEventTypesStore();

  const isEdit = eventTypeMutationType === "edit";

  return (
    <Dialog
      onOpenChange={setIsUpsertEventTypeDialogOpen}
      open={isUpsertEventTypeDialogOpen}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Event Type" : "New Event Type"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the event type properties below."
              : "Register a new event type under the current application."}
          </DialogDescription>
        </DialogHeader>
        <UpsertEventTypeForm />
      </DialogContent>
    </Dialog>
  );
}

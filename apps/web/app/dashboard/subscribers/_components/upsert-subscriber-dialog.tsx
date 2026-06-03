"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/web/components/ui/dialog";
import { useSubscribersStore } from "../store";
import { UpsertSubscriberForm } from "./upsert-subscriber-form";

export function UpsertSubscriberDialog() {
  const {
    isUpsertSubscriberDialogOpen,
    setIsUpsertSubscriberDialogOpen,
    subscriberMutationType,
  } = useSubscribersStore();

  const isEdit = subscriberMutationType === "edit";

  return (
    <Dialog
      onOpenChange={setIsUpsertSubscriberDialogOpen}
      open={isUpsertSubscriberDialogOpen}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Subscriber" : "New Subscriber"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the subscriber profile details below."
              : "Register a new subscriber under the current application."}
          </DialogDescription>
        </DialogHeader>
        <UpsertSubscriberForm />
      </DialogContent>
    </Dialog>
  );
}

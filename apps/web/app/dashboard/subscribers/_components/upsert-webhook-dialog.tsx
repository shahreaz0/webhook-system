"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/web/components/ui/dialog";
import { useSubscribersStore } from "../store";
import { UpsertWebhookForm } from "./upsert-webhook-form";

export function UpsertWebhookDialog() {
  const {
    isUpsertWebhookDialogOpen,
    setIsUpsertWebhookDialogOpen,
    webhookMutationType,
  } = useSubscribersStore();

  const isEdit = webhookMutationType === "edit";

  return (
    <Dialog
      onOpenChange={setIsUpsertWebhookDialogOpen}
      open={isUpsertWebhookDialogOpen}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Webhook Endpoint" : "New Webhook Endpoint"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your target webhook configuration."
              : "Register a new event delivery destination."}
          </DialogDescription>
        </DialogHeader>
        <UpsertWebhookForm />
      </DialogContent>
    </Dialog>
  );
}

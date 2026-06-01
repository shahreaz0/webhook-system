"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/web/components/ui/alert-dialog";
import { useApplicationsStore } from "../../applications/store";
import { useDeleteSubscriber } from "../hooks/use-delete-subscriber";
import { useDeleteWebhook } from "../hooks/use-delete-webhook";
import { useSubscribersStore } from "../store";

export function DeleteDialogs() {
  const { activeApp } = useApplicationsStore();
  const appId = activeApp?.id || "";

  const {
    selectedSubscriber,
    setSelectedSubscriber,
    subscriberToDelete,
    setSubscriberToDelete,
    webhookToDelete,
    setWebhookToDelete,
  } = useSubscribersStore();

  const subId = selectedSubscriber?.id || "";

  const deleteSubMutation = useDeleteSubscriber(appId);
  const deleteWhMutation = useDeleteWebhook(subId);

  const handleDeleteSubscriber = () => {
    if (subscriberToDelete) {
      deleteSubMutation.mutate(subscriberToDelete.id, {
        onSuccess: () => {
          if (selectedSubscriber?.id === subscriberToDelete.id) {
            setSelectedSubscriber(null);
          }
          setSubscriberToDelete(null);
        },
      });
    }
  };

  const handleDeleteWebhook = () => {
    if (webhookToDelete) {
      deleteWhMutation.mutate(webhookToDelete.id, {
        onSuccess: () => {
          setWebhookToDelete(null);
        },
      });
    }
  };

  return (
    <>
      <AlertDialog
        onOpenChange={(open) => !open && setSubscriberToDelete(null)}
        open={!!subscriberToDelete}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscriber</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this subscriber? All endpoints
              will be removed!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteSubMutation.isPending}
              onClick={handleDeleteSubscriber}
              variant="destructive"
            >
              {deleteSubMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={(open) => !open && setWebhookToDelete(null)}
        open={!!webhookToDelete}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook Endpoint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this webhook endpoint permanently?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteWhMutation.isPending}
              onClick={handleDeleteWebhook}
              variant="destructive"
            >
              {deleteWhMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

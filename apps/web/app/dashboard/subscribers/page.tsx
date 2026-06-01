"use client";

import { Layers, Plus, Users } from "lucide-react";
import { Button } from "@/web/components/ui/button";
import { useApplicationsStore } from "../applications/store";
import { DeleteDialogs } from "./components/delete-dialogs";
import { SubscriberList } from "./components/subscriber-list";
import { SubscriberProfileCard } from "./components/subscriber-profile-card";
import { UpsertSubscriberDialog } from "./components/upsert-subscriber-dialog";
import { UpsertWebhookDialog } from "./components/upsert-webhook-dialog";
import { WebhookList } from "./components/webhook-list";
import { useSubscribersStore } from "./store";

export default function SubscribersPage() {
  const { activeApp } = useApplicationsStore();
  const {
    selectedSubscriber,
    setIsUpsertWebhookDialogOpen,
    setWebhookMutationType,
    setSelectedWebhook,
  } = useSubscribersStore();

  if (!activeApp) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center border border-border border-dashed p-8 text-center dark:border-input">
        <Layers className="mb-4 size-10 stroke-1 text-muted-foreground" />
        <h3 className="font-semibold text-base">Select an application</h3>
        <p className="mt-1 max-w-sm text-muted-foreground text-xs">
          Please select or create an application in the sidebar to configure
          subscribers and webhook destinations.
        </p>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 md:grid-cols-5">
      {/* LEFT COLUMN: Subscribers List */}
      <div className="space-y-4 md:col-span-2">
        <SubscriberList />
      </div>

      {/* RIGHT COLUMN: Selected Subscriber details and Webhooks */}
      <div className="md:col-span-3">
        {selectedSubscriber ? (
          <div className="space-y-6">
            <SubscriberProfileCard />

            {/* Webhook Endpoints Sections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Delivery Endpoints</h3>
                  <p className="text-[10px] text-muted-foreground">
                    URLs to which events will be HTTP POSTed.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setSelectedWebhook(null);
                    setWebhookMutationType("add");
                    setIsUpsertWebhookDialogOpen(true);
                  }}
                  size="xs"
                >
                  Add Endpoint
                  <Plus className="size-3.5" />
                </Button>
              </div>

              <WebhookList />
            </div>
          </div>
        ) : (
          <div className="flex h-[50vh] flex-col items-center justify-center border border-border border-dashed p-8 text-center dark:border-input">
            <Users className="mb-4 size-10 stroke-1 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Select a subscriber</h3>
            <p className="mt-1 max-w-sm text-muted-foreground text-xs">
              Click on a subscriber from the left list to manage their webhook
              target URLs and signing secrets.
            </p>
          </div>
        )}
      </div>

      <UpsertSubscriberDialog />
      <UpsertWebhookDialog />
      <DeleteDialogs />
    </div>
  );
}

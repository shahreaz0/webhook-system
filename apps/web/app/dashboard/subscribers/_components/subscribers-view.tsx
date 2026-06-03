"use client";

import { Layers, Plus, Users } from "lucide-react";
import { useEffect } from "react";
import { useSession } from "@/web/app/(auth)/_hooks/use-session";
import { useGetApplicationList } from "@/web/app/dashboard/applications/_hooks/use-get-application-list";
import { Button } from "@/web/components/ui/button";
import { Skeleton } from "@/web/components/ui/skeleton";
import { createSkeletonKeys } from "@/web/lib/utils";
import { useApplicationsStore } from "../../applications/store";
import { resetSubscribersStore, useSubscribersStore } from "../store";
import { DeleteDialogs } from "./delete-dialogs";
import { SubscriberList } from "./subscriber-list";
import { SubscriberProfileCard } from "./subscriber-profile-card";
import { UpsertSubscriberDialog } from "./upsert-subscriber-dialog";
import { UpsertWebhookDialog } from "./upsert-webhook-dialog";
import { WebhookList } from "./webhook-list";

function SubscribersSkeleton() {
  return (
    <div className="grid animate-pulse items-start gap-6 md:grid-cols-5">
      {/* Left Column: Subscribers List */}
      <div className="space-y-4 md:col-span-2">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-8 w-full" />
        <div className="space-y-2">
          {createSkeletonKeys(4, "sub").map((key) => (
            <div
              className="space-y-2 border border-border p-3 dark:border-input"
              key={key}
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-36" />
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Subscriber Details */}
      <div className="space-y-6 md:col-span-3">
        <div className="space-y-4 border border-border bg-card p-4 dark:border-input">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3.5 w-64" />
            </div>
          </div>
          <div className="grid gap-2 border-border border-t pt-4 sm:grid-cols-2 dark:border-input">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-7 w-20" />
          </div>
          <div className="space-y-2">
            {createSkeletonKeys(2, "webhook").map((key) => (
              <div
                className="space-y-2 border border-border bg-card p-4 dark:border-input"
                key={key}
              >
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3.5 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SubscribersView() {
  const { isLoading: isSessionLoading } = useSession();
  const { isLoading: isAppsLoading } = useGetApplicationList();
  const { activeApp } = useApplicationsStore();
  const {
    selectedSubscriber,
    setIsUpsertWebhookDialogOpen,
    setWebhookMutationType,
    setSelectedWebhook,
  } = useSubscribersStore();

  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset store when activeApp changes
  useEffect(() => {
    resetSubscribersStore();
  }, [activeApp?.id]);

  if (isSessionLoading || isAppsLoading) {
    return <SubscribersSkeleton />;
  }

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

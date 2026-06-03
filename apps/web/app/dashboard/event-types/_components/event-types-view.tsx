"use client";

import { Layers, Plus, Zap } from "lucide-react";
import { useState } from "react";
import { useSession } from "@/web/app/(auth)/_hooks/use-session";
import { useGetApplicationList } from "@/web/app/dashboard/applications/_hooks/use-get-application-list";
import { Button } from "@/web/components/ui/button";
import { Checkbox } from "@/web/components/ui/checkbox";
import { Skeleton } from "@/web/components/ui/skeleton";
import { createSkeletonKeys } from "@/web/lib/utils";
import { useApplicationsStore } from "../../applications/store";
import { useGetEventTypesList } from "../_hooks/use-get-event-types-list";
import { useEventTypesStore } from "../store";
import { EventTypeCard } from "./event-type-card";
import { UpsertEventTypeDialog } from "./upsert-event-type-dialog";

function EventTypesSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Filters Bar */}
      <div className="flex gap-6 border border-border/60 bg-muted/20 px-4 py-3 dark:border-input/60">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Event Types Group Header & Grid */}
      <div className="space-y-6">
        <Skeleton className="h-4 w-16" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {createSkeletonKeys(3, "event-type").map((key) => (
            <div
              className="space-y-4 border border-border bg-card p-4 dark:border-input"
              key={key}
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3.5 w-10" />
              </div>
              <Skeleton className="h-3.5 w-full" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EventTypesView() {
  const { isLoading: isSessionLoading } = useSession();
  const { isLoading: isAppsLoading } = useGetApplicationList();
  const { activeApp } = useApplicationsStore();
  const appId = activeApp?.id || "";

  const [includeArchived, setIncludeArchived] = useState(false);
  const [includeDeprecated, setIncludeDeprecated] = useState(true);

  const { data: eventTypes = [], isLoading: isEventTypesLoading } =
    useGetEventTypesList(appId, {
      archived: includeArchived ? undefined : false,
      deprecated: includeDeprecated ? undefined : false,
    });

  const {
    setIsUpsertEventTypeDialogOpen,
    setEventTypeMutationType,
    setSelectedEventType,
  } = useEventTypesStore();

  const handleOpenCreateDialog = () => {
    setIsUpsertEventTypeDialogOpen(true);
    setEventTypeMutationType("add");
    setSelectedEventType(null);
  };

  if (isSessionLoading || isAppsLoading || isEventTypesLoading) {
    return <EventTypesSkeleton />;
  }

  if (!activeApp) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center border border-border border-dashed p-8 text-center dark:border-input">
        <Layers className="mb-4 size-10 stroke-1 text-muted-foreground" />
        <h3 className="font-semibold text-base">Select an application</h3>
        <p className="mt-1 max-w-sm text-muted-foreground text-xs">
          Please select or create an application in the sidebar to define custom
          webhook event types.
        </p>
      </div>
    );
  }

  // Group event types by group name
  const groupedEvents = eventTypes.reduce(
    (acc: Record<string, typeof eventTypes>, et) => {
      const group = et.groupName || "Default";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(et);
      return acc;
    },
    {}
  );

  function renderEventTypesContent() {
    if (eventTypes.length === 0) {
      return (
        <div className="flex h-[40vh] flex-col items-center justify-center border border-border border-dashed p-8 text-center dark:border-input">
          <Zap className="mb-4 size-10 stroke-1 text-muted-foreground" />
          <h3 className="font-semibold text-sm">No events defined</h3>
          <p className="mt-1 max-w-sm text-muted-foreground text-xs">
            Start defining event types like `billing.payment.succeeded` or
            `iam.user.deleted` for subscribers to listen to.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {Object.keys(groupedEvents).map((group) => (
          <div className="space-y-3" key={group}>
            <h3 className="border-primary/40 border-l-2 pl-1 font-bold font-mono text-muted-foreground text-xs uppercase tracking-wider">
              {group}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groupedEvents[group].map((et) => (
                <EventTypeCard
                  applicationId={appId}
                  eventType={et}
                  key={et.id}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl tracking-tight">
            Event Definitions
          </h2>
          <p className="text-muted-foreground text-xs">
            Manage webhook event definitions that can be triggered or subscribed
            to under this application.
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          Define Event
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-6 border border-border/60 bg-muted/20 px-4 py-3 dark:border-input/60">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={includeArchived}
            id="includeArchived"
            onCheckedChange={(checked) => setIncludeArchived(!!checked)}
          />
          <label
            className="cursor-pointer select-none font-medium text-xs leading-none"
            htmlFor="includeArchived"
          >
            Include Archived
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={includeDeprecated}
            id="includeDeprecated"
            onCheckedChange={(checked) => setIncludeDeprecated(!!checked)}
          />
          <label
            className="cursor-pointer select-none font-medium text-xs leading-none"
            htmlFor="includeDeprecated"
          >
            Include Deprecated
          </label>
        </div>
      </div>

      {/* Creation Modal Form Panel */}
      <UpsertEventTypeDialog />

      {/* Event Types List */}
      {renderEventTypesContent()}
    </div>
  );
}

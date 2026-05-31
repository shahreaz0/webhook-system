"use client";

import { Layers, Plus, Zap } from "lucide-react";
import { Button } from "@/web/components/ui/button";
import { useApplicationsStore } from "../applications/store";
import { EventTypeCard } from "./components/event-type-card";
import { UpsertEventTypeDialog } from "./components/upsert-event-type-dialog";
import { useGetEventTypesList } from "./hooks/use-get-event-types-list";
import { useEventTypesStore } from "./store";

export default function EventTypesPage() {
  const { activeApp } = useApplicationsStore();
  const appId = activeApp?.id || "";

  const { data: eventTypes = [], isLoading } = useGetEventTypesList(appId);

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
    if (isLoading) {
      return (
        <div className="py-12 text-center font-mono text-muted-foreground text-xs">
          Querying event definitions database...
        </div>
      );
    }

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

      {/* Creation Modal Form Panel */}
      <UpsertEventTypeDialog />

      {/* Event Types List */}
      {renderEventTypesContent()}
    </div>
  );
}

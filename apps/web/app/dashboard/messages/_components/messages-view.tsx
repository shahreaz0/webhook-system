"use client";

import { History, Layers, RefreshCw, Send } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/web/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/web/components/ui/select";
import { cn } from "@/web/lib/utils";
import { useApplicationsStore } from "../../applications/store";
import { useGetEventTypesList } from "../../event-types/_hooks/use-get-event-types-list";
import { useGetSubscribersList } from "../../subscribers/_hooks/use-get-subscribers-list";
import { useGetMessagesList } from "../_hooks/use-get-messages-list";
import { useMessagesStore } from "../store";
import { MessageDetails } from "./message-details";
import { MessageItem } from "./message-item";
import { TriggerEventForm } from "./trigger-event-form";

export function MessagesView() {
  const { activeApp } = useApplicationsStore();
  const appId = activeApp?.id || "";

  const {
    selectedMessage,
    setSelectedMessage,
    isTriggering,
    setIsTriggering,
    selectedSubscriberFilterId,
    setSelectedSubscriberFilterId,
    setSelectedSubscriberId,
    setSelectedEventTypeId,
    setTriggerError,
  } = useMessagesStore();

  // Reset state when activeApp changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset state when activeApp changes
  useEffect(() => {
    setSelectedMessage(null);
    setSelectedSubscriberFilterId("");
    setSelectedSubscriberId("");
    setSelectedEventTypeId("");
    setIsTriggering(false);
    setTriggerError(null);
  }, [appId]);

  // 1. Fetch Subscribers
  const { data: subscribers = [] } = useGetSubscribersList(appId);

  // 2. Fetch Event Types
  const { data: eventTypes = [] } = useGetEventTypesList(appId);

  // Auto-select the first subscriber if none is currently selected
  useEffect(() => {
    if (subscribers.length > 0 && !selectedSubscriberFilterId) {
      setSelectedSubscriberFilterId(subscribers[0].id);
    }
  }, [subscribers, selectedSubscriberFilterId, setSelectedSubscriberFilterId]);

  // 3. Fetch Messages Stream (polls every 4s inside hook)
  const {
    data: messages = [],
    isLoading: msgsLoading,
    refetch,
    isRefetching,
  } = useGetMessagesList(selectedSubscriberFilterId);

  if (!activeApp) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center border border-border border-dashed p-8 text-center dark:border-input">
        <Layers className="mb-4 size-10 stroke-1 text-muted-foreground" />
        <h3 className="font-semibold text-base">Select an application</h3>
        <p className="mt-1 max-w-sm text-muted-foreground text-xs">
          Please select or create an application in the sidebar to review
          webhook transmission logs.
        </p>
      </div>
    );
  }

  function renderMessageLogsContent() {
    if (!selectedSubscriberFilterId) {
      return (
        <div className="border border-border border-dashed py-12 text-center dark:border-input">
          <Layers className="mx-auto mb-3 size-10 stroke-1 text-muted-foreground" />
          <div className="font-semibold text-sm">No subscriber selected</div>
          <p className="mx-auto mt-1 max-w-xs text-muted-foreground text-xs">
            Please select a subscriber from the filter dropdown to view delivery
            logs.
          </p>
        </div>
      );
    }

    if (msgsLoading) {
      return (
        <div className="py-6 text-center font-mono text-muted-foreground text-xs">
          Querying logs database...
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="border border-border border-dashed py-12 text-center dark:border-input">
          <History className="mx-auto mb-3 size-10 stroke-1 text-muted-foreground" />
          <div className="font-semibold text-sm">
            No message logs logged yet
          </div>
          <p className="mx-auto mt-1 max-w-xs text-muted-foreground text-xs">
            Trigger a test webhook event above to start tracking real-time
            delivery logs.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {messages.map((msg) => (
          <MessageItem
            isSelected={selectedMessage?.id === msg.id}
            key={msg.id}
            msg={msg}
            onClick={() => setSelectedMessage(msg)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 md:grid-cols-5">
      {/* LEFT COLUMN: Message Stream logs list */}
      <div className="space-y-4 md:col-span-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Delivery Logs</h2>
            <p className="text-[10px] text-muted-foreground">
              Audit trail of triggered webhook payloads.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="h-8 w-8"
              onClick={() => refetch()}
              size="icon"
              title="Refresh log stream"
              variant="outline"
            >
              <RefreshCw
                className={cn("size-3.5", isRefetching && "animate-spin")}
              />
            </Button>
            <Button onClick={() => setIsTriggering(!isTriggering)}>
              {isTriggering ? "Cancel" : "Trigger Event"}
              <Send className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Subscriber Filters Bar */}
        <div className="flex flex-wrap items-center gap-4 border border-border/60 bg-muted/20 px-4 py-3 dark:border-input/60">
          <div className="flex items-center gap-2">
            <label className="font-medium text-xs" htmlFor="subFilter">
              Subscriber Filter:
            </label>
            <Select
              onValueChange={(val) =>
                setSelectedSubscriberFilterId(val === "none" || !val ? "" : val)
              }
              value={selectedSubscriberFilterId || "none"}
            >
              <SelectTrigger className="w-[240px]" id="subFilter">
                <SelectValue>
                  {subscribers.find(
                    (sub) => sub.id === selectedSubscriberFilterId
                  )
                    ? (() => {
                        const sub = subscribers.find(
                          (sub) => sub.id === selectedSubscriberFilterId
                        );
                        return `${sub?.referenceId} (${sub?.email})`;
                      })()
                    : "Select Subscriber..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select Subscriber...</SelectItem>
                {subscribers.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.referenceId} ({sub.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Trigger Event Form Panel */}
        {isTriggering ? (
          <TriggerEventForm eventTypes={eventTypes} subscribers={subscribers} />
        ) : null}

        {/* Message logs stream */}
        {renderMessageLogsContent()}
      </div>

      {/* RIGHT COLUMN: Details Log Drawer Panel */}
      <div className="md:col-span-2">
        <MessageDetails />
      </div>
    </div>
  );
}

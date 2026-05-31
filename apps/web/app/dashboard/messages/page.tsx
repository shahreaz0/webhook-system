"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Copy,
  History,
  Layers,
  RefreshCw,
  Send,
  Terminal,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import { useActiveApp } from "@/web/lib/active-app-context";
import { apiClient } from "@/web/lib/fetch-client";
import type { Message } from "@/web/lib/types";
import { cn } from "@/web/lib/utils";

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const { activeApp } = useActiveApp();

  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);

  // Trigger test form state
  const [triggering, setTriggering] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState("");
  const [selectedEtId, setSelectedEtId] = useState("");
  const [payloadStr, setPayloadStr] = useState(
    `{\n  "event": "user.signup",\n  "user": {\n    "id": "usr_909",\n    "name": "Jane Doe",\n    "email": "jane@example.com"\n  },\n  "timestamp": "${new Date().toISOString()}"\n}`
  );
  const [triggerError, setTriggerError] = useState<string | null>(null);

  // 1. Fetch Subscribers (for select dropdown)
  const { data: subscribers = [] } = useQuery({
    queryKey: ["subscribers", activeApp?.id],
    queryFn: () =>
      activeApp ? apiClient.getSubscribers(activeApp.id) : Promise.resolve([]),
    enabled: !!activeApp,
  });

  // 2. Fetch Event Types (for select dropdown)
  const { data: eventTypes = [] } = useQuery({
    queryKey: ["event-types", activeApp?.id],
    queryFn: () =>
      activeApp ? apiClient.getEventTypes(activeApp.id) : Promise.resolve([]),
    enabled: !!activeApp,
  });

  // 3. Fetch Messages Stream
  const {
    data: messages = [],
    isLoading: msgsLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["messages", activeApp?.id],
    queryFn: () => apiClient.getMessages(),
    enabled: !!activeApp,
    // Polling every 4 seconds to show live updates during testing
    refetchInterval: 4000,
  });

  // Trigger message mutation
  const triggerMutation = useMutation({
    mutationFn: (payload: {
      subscriberId: string;
      eventTypeId: string;
      payload: any;
    }) => apiClient.triggerMessage(payload),
    onSuccess: (newMsg) => {
      setTriggering(false);
      setSelectedMsg(newMsg);
      queryClient.invalidateQueries({ queryKey: ["messages", activeApp?.id] });
    },
    onError: (err: any) => {
      setTriggerError(err.message || "Failed to dispatch message.");
    },
  });

  const handleTrigger = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTriggerError(null);
    if (!(selectedSubId && selectedEtId)) {
      setTriggerError("Please select both a subscriber and an event type.");
      return;
    }

    let parsedPayload: unknown = null;
    try {
      parsedPayload = JSON.parse(payloadStr);
    } catch {
      setTriggerError("Invalid JSON payload. Check brackets and commas.");
      return;
    }

    triggerMutation.mutate({
      subscriberId: selectedSubId,
      eventTypeId: selectedEtId,
      payload: parsedPayload,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

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
            isSelected={selectedMsg?.id === msg.id}
            key={msg.id}
            msg={msg}
            onClick={() => setSelectedMsg(msg)}
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
            <Button onClick={() => setTriggering(!triggering)}>
              {triggering ? "Cancel" : "Trigger Event"}
              <Send className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Trigger Event Form Panel */}
        {triggering ? (
          <Card className="fade-in slide-in-from-top-1 animate-in border-primary/20 bg-primary/5 duration-150 dark:bg-primary/5">
            <form onSubmit={handleTrigger}>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center gap-1.5 font-semibold text-xs">
                  <Terminal className="size-3.5 text-primary" />
                  Dispatch Test Webhook Broadcast
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                {triggerError && (
                  <div className="border border-destructive/20 bg-destructive/10 p-2 text-[10px] text-destructive">
                    {triggerError}
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label
                      className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
                      htmlFor="msgSub"
                    >
                      Target Subscriber Reference
                    </label>
                    <select
                      className="w-full border border-border bg-background px-2.5 py-1.5 text-foreground text-xs focus:outline-hidden dark:border-input"
                      id="msgSub"
                      onChange={(e) => setSelectedSubId(e.target.value)}
                      required
                      value={selectedSubId}
                    >
                      <option value="">Select Target...</option>
                      {subscribers.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.referenceId} ({sub.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label
                      className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
                      htmlFor="msgEt"
                    >
                      Event Type Key
                    </label>
                    <select
                      className="w-full border border-border bg-background px-2.5 py-1.5 text-foreground text-xs focus:outline-hidden dark:border-input"
                      id="msgEt"
                      onChange={(e) => setSelectedEtId(e.target.value)}
                      required
                      value={selectedEtId}
                    >
                      <option value="">Select Event...</option>
                      {eventTypes.map((et) => (
                        <option key={et.id} value={et.id}>
                          {et.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label
                    className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
                    htmlFor="msgPayload"
                  >
                    JSON Data Payload
                  </label>
                  <textarea
                    className="w-full border border-border bg-background p-2.5 font-mono text-[10px] text-foreground focus:outline-hidden dark:border-input"
                    id="msgPayload"
                    onChange={(e) => setPayloadStr(e.target.value)}
                    required
                    rows={6}
                    value={payloadStr}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end p-4 pt-0">
                <Button
                  disabled={triggerMutation.isPending}
                  size="xs"
                  type="submit"
                >
                  {triggerMutation.isPending ? "Dispatching..." : "Send Event"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : null}

        {/* Message logs stream */}
        {renderMessageLogsContent()}
      </div>

      {/* RIGHT COLUMN: Details Log Drawer Panel */}
      <div className="md:col-span-2">
        {selectedMsg ? (
          <div className="fade-in slide-in-from-right-1 animate-in space-y-6 duration-150">
            {/* Header profile */}
            <Card>
              <CardHeader className="p-4 pb-3">
                <div className="font-bold font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                  Audit Event ID
                </div>
                <CardTitle className="mt-1 select-all font-bold font-mono text-xs">
                  {selectedMsg.id}
                </CardTitle>
                <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                  <span>
                    Dispatched:{" "}
                    {new Date(selectedMsg.createdAt).toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4 pt-0">
                {/* JSON Code Viewer */}
                <div>
                  <div className="mb-1 flex items-center justify-between font-bold font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                    <span>Payload (body)</span>
                    <Button
                      className="h-auto p-0 font-bold font-mono text-[9px] text-primary hover:underline"
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(selectedMsg.payload, null, 2)
                        )
                      }
                      variant="link"
                    >
                      <Copy className="size-2.5" />
                      <span>Copy</span>
                    </Button>
                  </div>
                  <pre className="max-h-56 select-all overflow-y-auto border border-border/50 bg-muted/40 p-3 font-mono text-[10px] text-foreground leading-normal dark:border-input/50">
                    {JSON.stringify(selectedMsg.payload, null, 2)}
                  </pre>
                </div>

                {/* Subscriber reference details */}
                <div className="border-border/50 border-t pt-3 font-mono text-[10px] dark:border-input/50">
                  <div className="mb-1 font-bold text-[8px] text-muted-foreground uppercase tracking-wider">
                    Receiver Account Context
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">Reference ID:</span>
                    <span className="font-bold text-foreground">
                      {selectedMsg.subscriber?.referenceId}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">
                      Notification Email:
                    </span>
                    <span className="text-foreground">
                      {selectedMsg.subscriber?.email}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery attempts logs table */}
            <div className="space-y-3">
              <h3 className="border-primary/40 border-l-2 pl-1 font-bold font-mono text-muted-foreground text-xs uppercase tracking-wider">
                Delivery Outcomes
              </h3>

              {!selectedMsg.deliveries ||
              selectedMsg.deliveries.length === 0 ? (
                <div className="border border-border border-dashed p-4 text-center text-muted-foreground text-xs dark:border-input">
                  No listener endpoints matched this event type filters.
                  Delivery skipped.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedMsg.deliveries.map((del) => (
                    <Card
                      className="border-border/60 dark:border-input/60"
                      key={del.id}
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1.5">
                        <span
                          className="max-w-[200px] truncate font-mono font-semibold text-[10px] text-foreground"
                          title={del.webhook?.url}
                        >
                          {del.webhook?.url}
                        </span>
                        <span
                          className={cn(
                            "rounded-none border px-1.5 py-0.25 font-bold font-mono text-[8px]",
                            del.status === "DELIVERED"
                              ? "border-green-500/20 bg-green-500/10 text-green-500"
                              : "border-destructive/20 bg-destructive/10 text-destructive"
                          )}
                        >
                          {del.status}
                        </span>
                      </CardHeader>
                      <CardContent className="space-y-2 p-3 pt-1.5 font-mono text-[10px]">
                        {del.lastError && (
                          <div className="flex items-start gap-1.5 border border-destructive/20 bg-destructive/5 p-2 text-[9px] text-destructive leading-relaxed">
                            <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                            <span>{del.lastError}</span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                          <div>
                            <span className="font-semibold text-foreground">
                              Attempts:
                            </span>{" "}
                            {del.attempts}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">
                              Last Status:
                            </span>{" "}
                            {del.status === "DELIVERED"
                              ? "200 OK"
                              : "503 Failed"}
                          </div>
                          {del.deliveredAt && (
                            <div className="col-span-2">
                              <span className="font-semibold text-foreground">
                                Delivered At:
                              </span>{" "}
                              {new Date(del.deliveredAt).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-[50vh] flex-col items-center justify-center border border-border border-dashed p-8 text-center dark:border-input">
            <History className="mb-4 size-10 stroke-1 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Select log item</h3>
            <p className="mt-1 max-w-sm text-muted-foreground text-xs">
              Click on a log entry from the list to audit payload JSONs, copy
              endpoints signing secrets, and review transmission response logs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface MessageItemProps {
  isSelected: boolean;
  msg: Message;
  onClick: () => void;
}

function MessageItem({ msg, isSelected, onClick }: MessageItemProps) {
  // Calculate status
  const hasDeliveries = msg.deliveries && msg.deliveries.length > 0;
  const hasFailure = msg.deliveries?.some((d) => d.status === "FAILED");
  const hasPending = msg.deliveries?.some(
    (d) => d.status === "PENDING" || d.status === "PROCESSING"
  );

  let statusText = "NO_ENDPOINTS";
  let badgeColor =
    "bg-muted text-muted-foreground border-border dark:border-input";

  if (hasDeliveries) {
    if (hasPending) {
      statusText = "PROCESSING";
      badgeColor = "bg-primary/10 text-primary border-primary/20";
    } else if (hasFailure) {
      const hasSuccess = msg.deliveries?.some((d) => d.status === "DELIVERED");
      statusText = hasSuccess ? "PARTIAL" : "FAILED";
      badgeColor = hasSuccess
        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
        : "bg-destructive/10 text-destructive border-destructive/20";
    } else {
      statusText = "DELIVERED";
      badgeColor = "bg-green-500/10 text-green-500 border-green-500/20";
    }
  }

  return (
    <Button
      className={cn(
        "group flex h-auto w-full items-center justify-between rounded-none border p-3 text-left transition-all duration-150",
        isSelected
          ? "border-primary bg-primary/1"
          : "border-border hover:border-border-hover dark:border-input"
      )}
      onClick={onClick}
      variant="ghost"
    >
      <div className="flex-1 truncate pr-4">
        <div className="flex items-center gap-2">
          <span className="border border-primary/10 bg-primary/5 px-1.5 py-0.5 font-mono text-[9px] text-primary">
            {msg.eventType?.name || "unknown.event"}
          </span>
          <span className="font-mono text-[9px] text-muted-foreground">
            {msg.id.slice(0, 12)}...
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1 truncate text-[10px] text-muted-foreground">
          <span>Sub:</span>
          <span className="font-bold text-foreground">
            {msg.subscriber?.referenceId}
          </span>
          <span>•</span>
          <span>Target Endpoints: {msg.deliveries?.length || 0}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={cn(
            "rounded-none border px-1.5 py-0.5 font-bold font-mono text-[9px]",
            badgeColor
          )}
        >
          {statusText}
        </span>
        <span className="font-mono text-[9px] text-muted-foreground">
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      </div>
    </Button>
  );
}

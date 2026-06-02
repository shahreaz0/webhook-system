import { Terminal } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/web/components/ui/select";
import type { EventType, Subscriber } from "@/web/lib/types";
import { useTriggerMessage } from "../hooks/use-trigger-message";
import { getDefaultPayload, useMessagesStore } from "../store";

interface TriggerEventFormProps {
  eventTypes: EventType[];
  subscribers: Subscriber[];
}

export function TriggerEventForm({
  subscribers,
  eventTypes,
}: TriggerEventFormProps) {
  const {
    selectedSubscriberId,
    setSelectedSubscriberId,
    selectedEventTypeId,
    setSelectedEventTypeId,
    payloadStr,
    setPayloadStr,
    triggerError,
    setTriggerError,
    setIsTriggering,
    setSelectedMessage,
  } = useMessagesStore();

  const triggerMutation = useTriggerMessage(selectedSubscriberId);

  // Initialize payload string if empty
  useEffect(() => {
    if (!payloadStr) {
      setPayloadStr(getDefaultPayload());
    }
  }, [payloadStr, setPayloadStr]);

  const handleTrigger = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTriggerError(null);

    if (!(selectedSubscriberId && selectedEventTypeId)) {
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

    triggerMutation.mutate(
      {
        eventTypeId: selectedEventTypeId,
        payload: parsedPayload,
      },
      {
        onSuccess: (newMsg) => {
          setIsTriggering(false);
          setSelectedMessage(newMsg);
        },
        onError: (err: any) => {
          setTriggerError(err.message || "Failed to dispatch message.");
        },
      }
    );
  };

  return (
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
              <Select
                onValueChange={(val) => setSelectedSubscriberId(val || "")}
                value={selectedSubscriberId}
              >
                <SelectTrigger className="h-8 w-full text-xs" id="msgSub">
                  <SelectValue>
                    {subscribers.find((sub) => sub.id === selectedSubscriberId)
                      ? (() => {
                          const sub = subscribers.find(
                            (sub) => sub.id === selectedSubscriberId
                          );
                          return `${sub?.referenceId} (${sub?.email})`;
                        })()
                      : "Select Target..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {subscribers.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.referenceId} ({sub.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label
                className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
                htmlFor="msgEt"
              >
                Event Type Key
              </label>
              <Select
                onValueChange={(val) => setSelectedEventTypeId(val || "")}
                value={selectedEventTypeId}
              >
                <SelectTrigger className="h-8 w-full text-xs" id="msgEt">
                  <SelectValue>
                    {eventTypes.find((et) => et.id === selectedEventTypeId)
                      ?.name || "Select Event..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((et) => (
                    <SelectItem key={et.id} value={et.id}>
                      {et.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          <Button disabled={triggerMutation.isPending} size="xs" type="submit">
            {triggerMutation.isPending ? "Dispatching..." : "Send Event"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

"use client";

import { Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import { Input } from "@/web/components/ui/input";
import { useApplicationsStore } from "../../applications/store";
import { useGetEventTypesList } from "../../event-types/hooks/use-get-event-types-list";
import { useCreateWebhook } from "../hooks/use-create-webhook";
import { useSubscribersStore } from "../store";

export function CreateWebhookCard() {
  const { activeApp } = useApplicationsStore();
  const appId = activeApp?.id || "";

  // 1. Fetch event types for selection
  const { data: eventTypes = [] } = useGetEventTypesList(appId);

  const { selectedSubscriber, isCreateWebhookOpen, setIsCreateWebhookOpen } =
    useSubscribersStore();

  const subId = selectedSubscriber?.id || "";
  const createWhMutation = useCreateWebhook(subId);

  const [whUrl, setWhUrl] = useState("");
  const [whDesc, setWhDesc] = useState("");
  const [whRateLimit, setWhRateLimit] = useState("");
  const [whEvents, setWhEvents] = useState<string[]>([]);
  const [whError, setWhError] = useState<string | null>(null);

  if (!(isCreateWebhookOpen && selectedSubscriber)) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setWhError(null);

    if (!whUrl.trim()) {
      return;
    }

    if (whEvents.length === 0) {
      setWhError("Please select at least one event type filter.");
      return;
    }

    createWhMutation.mutate(
      {
        url: whUrl.trim(),
        description: whDesc || null,
        rateLimit: whRateLimit ? Number.parseInt(whRateLimit, 10) : null,
        eventTypes: whEvents,
      },
      {
        onSuccess: () => {
          setWhUrl("");
          setWhDesc("");
          setWhRateLimit("");
          setWhEvents([]);
          setIsCreateWebhookOpen(false);
        },
        onError: (err: any) => {
          setWhError(err.message || "Failed to create endpoint.");
        },
      }
    );
  };

  return (
    <Card className="fade-in slide-in-from-top-1 animate-in border-primary/20 bg-primary/5 duration-150 dark:bg-primary/5">
      <form onSubmit={handleSubmit}>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="flex items-center gap-1.5 font-semibold text-xs">
            <Globe className="size-3.5 text-primary" />
            Configure Target Webhook Endpoint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          {whError && (
            <div className="border border-destructive/20 bg-destructive/10 p-2 text-[10px] text-destructive">
              {whError}
            </div>
          )}
          <div className="space-y-1">
            <label
              className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
              htmlFor="whUrl"
            >
              Destination URL (HTTPS highly recommended)
            </label>
            <Input
              id="whUrl"
              onChange={(e) => setWhUrl(e.target.value)}
              placeholder="https://api.yourcustomer.com/webhooks"
              required
              type="url"
              value={whUrl}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label
                className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
                htmlFor="whDesc"
              >
                Description
              </label>
              <Input
                id="whDesc"
                onChange={(e) => setWhDesc(e.target.value)}
                placeholder="Primary alerts receiver"
                value={whDesc}
              />
            </div>
            <div className="space-y-1">
              <label
                className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
                htmlFor="whRate"
              >
                Max Rate Limit (req/sec)
              </label>
              <Input
                id="whRate"
                onChange={(e) => setWhRateLimit(e.target.value)}
                placeholder="No limit"
                type="number"
                value={whRateLimit}
              />
            </div>
          </div>

          {/* Event selection checkboxes */}
          <div className="space-y-1.5 border-border/50 border-t pt-2 dark:border-input/50">
            <span className="font-mono font-semibold text-[10px] text-muted-foreground uppercase">
              Subscribe to Event Types:
            </span>
            {eventTypes.length === 0 ? (
              <div className="pl-1 text-[10px] text-muted-foreground italic">
                No events defined in active application. Define event types
                first.
              </div>
            ) : (
              <div className="grid max-h-36 grid-cols-2 gap-2 overflow-y-auto border border-border/50 bg-background p-2 dark:border-input/50">
                {eventTypes.map((et) => (
                  <label
                    className="flex cursor-pointer select-none items-center gap-2 text-xs"
                    key={et.id}
                  >
                    <input
                      checked={whEvents.includes(et.id)}
                      className="accent-primary"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setWhEvents([...whEvents, et.id]);
                        } else {
                          setWhEvents(whEvents.filter((id) => id !== et.id));
                        }
                      }}
                      type="checkbox"
                    />
                    <span className="truncate font-mono text-[10px]">
                      {et.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end p-4 pt-0">
          <Button disabled={createWhMutation.isPending} size="xs" type="submit">
            {createWhMutation.isPending ? "Creating..." : "Save Endpoint"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

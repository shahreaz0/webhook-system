"use client";

import { Globe } from "lucide-react";
import { useGetWebhooksList } from "../_hooks/use-get-webhooks-list";
import { useSubscribersStore } from "../store";
import { WebhookCard } from "./webhook-card";

export function WebhookList() {
  const { selectedSubscriber } = useSubscribersStore();
  const subId = selectedSubscriber?.id || "";

  const { data: webhooks = [], isLoading } = useGetWebhooksList(subId);

  if (!selectedSubscriber) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="py-6 text-center font-mono text-muted-foreground text-xs">
        Querying webhooks list...
      </div>
    );
  }

  if (webhooks.length === 0) {
    return (
      <div className="border border-border border-dashed py-8 text-center dark:border-input">
        <Globe className="mx-auto mb-2 size-8 stroke-1 text-muted-foreground" />
        <div className="font-semibold text-xs">No endpoints registered</div>
        <p className="mx-auto mt-1 max-w-[220px] text-[10px] text-muted-foreground">
          No webhook endpoints registered for this subscriber. Add one to route
          notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {webhooks.map((wh) => (
        <WebhookCard key={wh.id} wh={wh} />
      ))}
    </div>
  );
}

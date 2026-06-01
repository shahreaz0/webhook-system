"use client";

import { Copy, Edit3, Eye, EyeOff, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import type { Webhook } from "@/web/lib/types";
import { cn } from "@/web/lib/utils";
import { useUpdateWebhook } from "../hooks/use-update-webhook";
import { useSubscribersStore } from "../store";

interface WebhookCardProps {
  wh: Webhook;
}

function WebhookSecretKeySection({
  secret,
  revealSecret,
  setRevealSecret,
  copyToClipboard,
}: {
  secret: string;
  revealSecret: boolean;
  setRevealSecret: (val: boolean) => void;
  copyToClipboard: (text: string) => void;
}) {
  return (
    <div className="flex items-center justify-between border border-border bg-muted/40 p-2 font-mono text-[10px] dark:border-input">
      <div className="truncate pr-2">
        <span className="mr-1 font-bold text-[8px] text-muted-foreground uppercase">
          Signing Secret:
        </span>
        <span className="select-all text-foreground">
          {revealSecret ? secret : "••••••••••••••••••••••••••••••••"}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          className="text-muted-foreground hover:text-foreground"
          onClick={() => setRevealSecret(!revealSecret)}
          size="icon-xs"
          title={revealSecret ? "Hide Secret" : "Reveal Secret"}
          variant="ghost"
        >
          {revealSecret ? (
            <EyeOff className="size-3" />
          ) : (
            <Eye className="size-3" />
          )}
        </Button>
        <Button
          className="text-muted-foreground hover:text-foreground"
          onClick={() => copyToClipboard(secret)}
          size="icon-xs"
          title="Copy Secret"
          variant="ghost"
        >
          <Copy className="size-3" />
        </Button>
      </div>
    </div>
  );
}

function WebhookLabelsSection({ labels }: { labels: Record<string, string> }) {
  if (!labels || Object.keys(labels).length === 0) {
    return null;
  }
  return (
    <div className="space-y-1 border-border/40 border-t pt-1.5 dark:border-input/40">
      <div className="font-bold font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
        Subscription Labels:
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {Object.entries(labels).map(([key, val]) => (
          <span
            className="rounded-sm border border-green-500/10 bg-green-500/5 px-1.5 py-0.5 font-mono text-[9px] text-green-600 dark:text-green-400"
            key={key}
          >
            {key}={val}
          </span>
        ))}
      </div>
    </div>
  );
}

function WebhookDetailsSection({
  headers,
  metadata,
}: {
  headers: Record<string, string>;
  metadata: any;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const hasHeaders = headers && Object.keys(headers).length > 0;
  const hasMetadata = metadata && Object.keys(metadata).length > 0;

  if (!(hasHeaders || hasMetadata)) {
    return null;
  }

  return (
    <div className="space-y-1.5 border-border/40 border-t pt-1.5 dark:border-input/40">
      <button
        className="flex items-center gap-1 font-bold font-mono text-[9px] text-muted-foreground uppercase tracking-wider focus:outline-none"
        onClick={() => setShowDetails(!showDetails)}
        type="button"
      >
        <span>{showDetails ? "▼" : "▶"} Headers & Metadata</span>
      </button>
      {showDetails && (
        <div className="space-y-2 pl-2 font-mono text-[9px] text-muted-foreground">
          {hasHeaders && (
            <div>
              <div className="font-bold">Custom Headers:</div>
              <ul className="list-inside list-disc">
                {Object.entries(headers).map(([k, v]) => (
                  <li key={k}>
                    {k}: {v}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasMetadata && (
            <div>
              <div className="font-bold">Metadata:</div>
              <ul className="list-inside list-disc">
                {Object.entries(metadata).map(([k, v]) => (
                  <li key={k}>
                    {k}: {String(v)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function WebhookCard({ wh }: WebhookCardProps) {
  const {
    selectedSubscriber,
    setWebhookToDelete,
    setIsUpsertWebhookDialogOpen,
    setWebhookMutationType,
    setSelectedWebhook,
  } = useSubscribersStore();
  const subId = selectedSubscriber?.id || "";
  const updateWhMutation = useUpdateWebhook(subId);
  const [revealSecret, setRevealSecret] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const toggleStatus = () => {
    updateWhMutation.mutate({
      id: wh.id,
      payload: {
        url: wh.url,
        description: wh.description,
        rateLimit: wh.rateLimit,
        disabled: !wh.disabled,
        eventTypes: wh.eventTypes.map((et) => et.id),
      },
    });
  };

  const handleEdit = () => {
    setSelectedWebhook(wh);
    setWebhookMutationType("edit");
    setIsUpsertWebhookDialogOpen(true);
  };

  const handleDelete = () => {
    setWebhookToDelete(wh);
  };

  return (
    <Card
      className={cn("transition-all", wh.disabled && "bg-muted/20 opacity-75")}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="truncate pr-2">
            <CardTitle className="select-all truncate font-semibold text-foreground text-sm">
              {wh.name || "Unnamed Webhook"}
            </CardTitle>
            <div className="mt-1 flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground">
              <span className="rounded-sm bg-primary/10 px-1 py-0.5 font-bold text-primary uppercase">
                {wh.method || "POST"}
              </span>
              <span className="select-all truncate" title={wh.url}>
                {wh.url}
              </span>
            </div>
            {wh.description && (
              <CardDescription className="mt-1 text-[10px]">
                {wh.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              className={cn(
                "font-bold font-mono text-[8px]",
                wh.disabled
                  ? "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20"
                  : "border-green-500/20 bg-green-500/10 text-green-500 hover:bg-green-500/20"
              )}
              disabled={updateWhMutation.isPending}
              onClick={toggleStatus}
              size="xs"
              variant="ghost"
            >
              {wh.disabled ? "DISABLED" : "ACTIVE"}
            </Button>
            <Button
              className="text-muted-foreground hover:text-foreground"
              onClick={handleEdit}
              size="icon-xs"
              variant="ghost"
            >
              <Edit3 className="size-3.5" />
            </Button>
            <Button
              className="text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
              size="icon-xs"
              variant="ghost"
            >
              <Trash className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5 p-4 pt-2 pb-3">
        <WebhookSecretKeySection
          copyToClipboard={copyToClipboard}
          revealSecret={revealSecret}
          secret={wh.secret}
          setRevealSecret={setRevealSecret}
        />

        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] text-muted-foreground">
          <span>
            Max Rate: {wh.rateLimit ? `${wh.rateLimit} req/s` : "No limit"}
          </span>
          <span>•</span>
          <span>Created: {new Date(wh.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Event Tags */}
        <div className="space-y-1 border-border/40 border-t pt-1.5 dark:border-input/40">
          <div className="font-bold font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            Subscribed Event Filters:
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {wh.eventTypes.length === 0 ? (
              <span className="text-[9px] text-muted-foreground italic">
                No events subscribed
              </span>
            ) : (
              wh.eventTypes.map((et) => (
                <span
                  className="border border-primary/10 bg-primary/5 px-1 py-0.5 font-mono text-[9px] text-primary"
                  key={et.id}
                >
                  {et.name}
                </span>
              ))
            )}
          </div>
        </div>

        <WebhookLabelsSection labels={wh.labels} />

        <WebhookDetailsSection headers={wh.headers} metadata={wh.metadata} />
      </CardContent>
    </Card>
  );
}

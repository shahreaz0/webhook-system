"use client";

import { Copy, Eye, EyeOff, Trash } from "lucide-react";
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

export function WebhookCard({ wh }: WebhookCardProps) {
  const { selectedSubscriber, setWebhookToDelete } = useSubscribersStore();
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
            <CardTitle className="select-all truncate font-mono font-semibold text-foreground text-xs">
              {wh.url}
            </CardTitle>
            {wh.description && (
              <CardDescription className="mt-0.5 text-[10px]">
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
      <CardContent className="space-y-2 p-4 pt-2 pb-3">
        {/* Secret Key Display */}
        <div className="flex items-center justify-between border border-border bg-muted/40 p-2 font-mono text-[10px] dark:border-input">
          <div className="truncate pr-2">
            <span className="mr-1 font-bold text-[8px] text-muted-foreground uppercase">
              Signing Secret:
            </span>
            <span className="select-all text-foreground">
              {revealSecret ? wh.secret : "••••••••••••••••••••••••••••••••"}
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
              onClick={() => copyToClipboard(wh.secret)}
              size="icon-xs"
              title="Copy Secret"
              variant="ghost"
            >
              <Copy className="size-3" />
            </Button>
          </div>
        </div>

        {/* Rate Limit and Creation date */}
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
      </CardContent>
    </Card>
  );
}

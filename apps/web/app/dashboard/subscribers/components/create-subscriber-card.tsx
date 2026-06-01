"use client";

import { Sparkles } from "lucide-react";
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
import { useCreateSubscriber } from "../hooks/use-create-subscriber";
import { useSubscribersStore } from "../store";

export function CreateSubscriberCard() {
  const { activeApp } = useApplicationsStore();
  const appId = activeApp?.id || "";

  const {
    isCreateSubscriberOpen,
    setIsCreateSubscriberOpen,
    setSelectedSubscriber,
  } = useSubscribersStore();

  const createSubMutation = useCreateSubscriber(appId);

  const [refId, setRefId] = useState("");
  const [email, setEmail] = useState("");
  const [metadataStr, setMetadataStr] = useState("{}");
  const [subError, setSubError] = useState<string | null>(null);

  if (!(isCreateSubscriberOpen && activeApp)) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubError(null);

    if (!(refId.trim() && email.trim())) {
      return;
    }

    let parsedMeta: any = null;
    try {
      parsedMeta = JSON.parse(metadataStr);
    } catch {
      setSubError("Invalid metadata JSON. Must be a valid JSON object.");
      return;
    }

    createSubMutation.mutate(
      {
        referenceId: refId.trim(),
        email: email.trim(),
        metadata: parsedMeta,
      },
      {
        onSuccess: (newSub) => {
          setRefId("");
          setEmail("");
          setMetadataStr("{}");
          setIsCreateSubscriberOpen(false);
          setSelectedSubscriber(newSub);
        },
        onError: (err: any) => {
          setSubError(err.message || "Failed to create subscriber.");
        },
      }
    );
  };

  return (
    <Card className="fade-in slide-in-from-top-1 animate-in border-primary/20 bg-primary/5 duration-150 dark:bg-primary/5">
      <form onSubmit={handleSubmit}>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="flex items-center gap-1.5 font-semibold text-xs">
            <Sparkles className="size-3.5 text-primary" />
            New Subscriber Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          {subError && (
            <div className="border border-destructive/20 bg-destructive/10 p-2 text-[10px] text-destructive">
              {subError}
            </div>
          )}
          <div className="space-y-1">
            <label
              className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
              htmlFor="refId"
            >
              Reference ID (unique key)
            </label>
            <Input
              id="refId"
              onChange={(e) => setRefId(e.target.value)}
              placeholder="e.g. user_1028"
              required
              value={refId}
            />
          </div>
          <div className="space-y-1">
            <label
              className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
              htmlFor="subEmail"
            >
              Notification Email
            </label>
            <Input
              id="subEmail"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@customer.com"
              required
              type="email"
              value={email}
            />
          </div>
          <div className="space-y-1">
            <label
              className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
              htmlFor="subMeta"
            >
              Metadata (JSON payload)
            </label>
            <Input
              id="subMeta"
              onChange={(e) => setMetadataStr(e.target.value)}
              placeholder='{"tier": "enterprise"}'
              value={metadataStr}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end p-4 pt-0">
          <Button
            disabled={createSubMutation.isPending}
            size="xs"
            type="submit"
          >
            {createSubMutation.isPending ? "Adding..." : "Add Subscriber"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/web/components/ui/button";
import { Input } from "@/web/components/ui/input";
import { useApplicationsStore } from "../../applications/store";
import { useCreateSubscriber } from "../hooks/use-create-subscriber";
import { useUpdateSubscriber } from "../hooks/use-update-subscriber";
import { useSubscribersStore } from "../store";

export function UpsertSubscriberForm() {
  const { activeApp } = useApplicationsStore();
  const appId = activeApp?.id || "";

  const {
    selectedSubscriber,
    setSelectedSubscriber,
    subscriberMutationType,
    setIsUpsertSubscriberDialogOpen,
  } = useSubscribersStore();

  const isEdit = subscriberMutationType === "edit";

  const createMutation = useCreateSubscriber(appId);
  const updateMutation = useUpdateSubscriber(appId);

  const [refId, setRefId] = useState("");
  const [email, setEmail] = useState("");
  const [metadataStr, setMetadataStr] = useState("{}");
  const [subError, setSubError] = useState<string | null>(null);

  // Pre-fill form if editing
  useEffect(() => {
    if (isEdit && selectedSubscriber) {
      setRefId(selectedSubscriber.referenceId);
      setEmail(selectedSubscriber.email);
      setMetadataStr(
        selectedSubscriber.metadata
          ? JSON.stringify(selectedSubscriber.metadata, null, 2)
          : "{}"
      );
    } else {
      setRefId("");
      setEmail("");
      setMetadataStr("{}");
    }
    setSubError(null);
  }, [isEdit, selectedSubscriber]);

  const isPending = createMutation.isPending || updateMutation.isPending;

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

    if (isEdit && selectedSubscriber) {
      updateMutation.mutate(
        {
          id: selectedSubscriber.id,
          payload: {
            referenceId: refId.trim(),
            email: email.trim(),
            metadata: parsedMeta,
          },
        },
        {
          onSuccess: (updatedSub) => {
            setSelectedSubscriber(updatedSub);
            setIsUpsertSubscriberDialogOpen(false);
          },
          onError: (err: any) => {
            setSubError(err.message || "Failed to update subscriber.");
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          referenceId: refId.trim(),
          email: email.trim(),
          metadata: parsedMeta,
        },
        {
          onSuccess: (newSub) => {
            setSelectedSubscriber(newSub);
            setIsUpsertSubscriberDialogOpen(false);
          },
          onError: (err: any) => {
            setSubError(err.message || "Failed to create subscriber.");
          },
        }
      );
    }
  };

  let buttonText = "Add Subscriber";
  if (isPending) {
    buttonText = "Saving...";
  } else if (isEdit) {
    buttonText = "Save Changes";
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {subError && (
        <div className="border border-destructive/20 bg-destructive/10 p-2.5 text-[10px] text-destructive">
          {subError}
        </div>
      )}
      <div className="space-y-3">
        <div className="space-y-1">
          <label
            className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
            htmlFor="refId"
          >
            Reference ID (unique key)
          </label>
          <Input
            disabled={isPending}
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
            disabled={isPending}
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
            disabled={isPending}
            id="subMeta"
            onChange={(e) => setMetadataStr(e.target.value)}
            placeholder='{"tier": "enterprise"}'
            value={metadataStr}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          disabled={isPending}
          onClick={() => setIsUpsertSubscriberDialogOpen(false)}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
        <Button disabled={isPending} type="submit">
          {buttonText}
        </Button>
      </div>
    </form>
  );
}

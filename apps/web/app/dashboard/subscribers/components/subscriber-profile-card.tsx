"use client";

import { Trash } from "lucide-react";
import { Button } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import { useSubscribersStore } from "../store";

export function SubscriberProfileCard() {
  const { selectedSubscriber, setSubscriberToDelete } = useSubscribersStore();

  if (!selectedSubscriber) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-3">
        <div>
          <div className="font-bold font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            Subscriber Profile
          </div>
          <CardTitle className="mt-1 font-bold font-mono text-base">
            {selectedSubscriber.referenceId}
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs">
            {selectedSubscriber.email}
          </CardDescription>
        </div>
        <Button
          className="text-muted-foreground hover:text-destructive"
          onClick={() => {
            setSubscriberToDelete(selectedSubscriber);
          }}
          size="icon-sm"
          title="Delete Subscriber"
          variant="ghost"
        >
          <Trash className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="max-h-32 overflow-y-auto border border-border/50 bg-muted/40 p-2.5 font-mono text-[10px] text-muted-foreground leading-normal dark:border-input/50">
          <div className="mb-1 font-semibold text-[8px] text-foreground uppercase">
            Metadata context:
          </div>
          {selectedSubscriber.metadata
            ? JSON.stringify(selectedSubscriber.metadata, null, 2)
            : "{}"}
        </div>
      </CardContent>
    </Card>
  );
}

import { ChevronDown, ChevronUp, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { Button } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import { CopyButton } from "@/web/components/ui/copy-button";
import { useSubscribersStore } from "../store";

export function SubscriberProfileCard() {
  const {
    selectedSubscriber,
    setSubscriberToDelete,
    setIsUpsertSubscriberDialogOpen,
    setSubscriberMutationType,
  } = useSubscribersStore();

  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!selectedSubscriber) {
    return null;
  }

  const handleOpenEditDialog = () => {
    setIsUpsertSubscriberDialogOpen(true);
    setSubscriberMutationType("edit");
  };

  if (isCollapsed) {
    return (
      <div className="flex items-center justify-between border border-border bg-muted/20 px-3 py-1.5 text-xs dark:border-input">
        <div className="flex items-center gap-2 truncate pr-2">
          <span className="font-bold font-mono text-foreground text-xs leading-none">
            {selectedSubscriber.referenceId}
          </span>
          <span className="truncate text-[10px] text-muted-foreground">
            ({selectedSubscriber.email})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={() => setIsCollapsed(false)}
            size="icon"
            title="Expand Profile"
            variant="ghost"
          >
            <ChevronDown className="size-3.5" />
          </Button>
          <Button
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={handleOpenEditDialog}
            size="icon"
            title="Edit Subscriber"
            variant="ghost"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => {
              setSubscriberToDelete(selectedSubscriber);
            }}
            size="icon"
            title="Delete Subscriber"
            variant="ghost"
          >
            <Trash className="size-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-3">
        <div>
          <div className="font-bold font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            Subscriber Profile
          </div>
          <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
            <span className="truncate">ID: {selectedSubscriber.id}</span>
            <CopyButton
              successMessage="Copied subscriber ID!"
              title="Copy Subscriber ID"
              value={selectedSubscriber.id}
            />
          </div>
          <CardTitle className="mt-1.5 font-bold font-mono text-base">
            {selectedSubscriber.referenceId}
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs">
            {selectedSubscriber.email}
          </CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <Button
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setIsCollapsed(!isCollapsed)}
            size="icon-sm"
            title="Collapse Profile"
            variant="ghost"
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            className="text-muted-foreground hover:text-foreground"
            onClick={handleOpenEditDialog}
            size="icon-sm"
            title="Edit Subscriber"
            variant="ghost"
          >
            <Pencil className="size-4" />
          </Button>
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
        </div>
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

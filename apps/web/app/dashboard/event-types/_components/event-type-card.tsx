import { Archive, Pencil, ShieldAlert, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/web/components/ui/alert-dialog";
import { Button } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import { CopyButton } from "@/web/components/ui/copy-button";
import type { EventType } from "@/web/lib/types";
import { cn } from "@/web/lib/utils";
import { useDeleteEventType } from "../_hooks/use-delete-event-type";
import { useUpdateEventType } from "../_hooks/use-update-event-type";
import { useEventTypesStore } from "../store";

interface EventTypeCardProps {
  applicationId: string;
  eventType: EventType;
}

export function EventTypeCard({
  eventType,
  applicationId,
}: EventTypeCardProps) {
  const deleteMutation = useDeleteEventType(applicationId);
  const updateMutation = useUpdateEventType(applicationId);
  const {
    setIsUpsertEventTypeDialogOpen,
    setEventTypeMutationType,
    setSelectedEventType,
  } = useEventTypesStore();

  const handleEdit = () => {
    setIsUpsertEventTypeDialogOpen(true);
    setEventTypeMutationType("edit");
    setSelectedEventType(eventType);
  };

  const handleToggleArchive = () => {
    updateMutation.mutate({
      id: eventType.id,
      archived: !eventType.archived,
    });
  };

  const handleToggleDeprecate = () => {
    updateMutation.mutate({
      id: eventType.id,
      deprecated: !eventType.deprecated,
    });
  };

  return (
    <Card
      className={cn(
        "group relative flex flex-col justify-between transition-all duration-200 hover:border-border-hover",
        eventType.archived && "bg-muted/20 opacity-60"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 truncate pr-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
              <span className="truncate">ID: {eventType.id}</span>
              <CopyButton
                successMessage="Copied event type ID!"
                title="Copy Event Type ID"
                value={eventType.id}
              />
            </div>
            <CardTitle className="mt-2 flex items-center gap-1.5 truncate">
              {(() => {
                const parts = eventType.name.split(".");
                if (parts.length === 3) {
                  return (
                    <span className="inline-flex items-center gap-0.5 border border-primary/10 bg-primary/5 px-2 py-0.5 font-mono text-xs leading-none">
                      <span className="font-medium text-muted-foreground/85">
                        {parts[0]}
                      </span>
                      <span className="font-bold text-muted-foreground/45">
                        .
                      </span>
                      <span className="font-semibold text-foreground">
                        {parts[1]}
                      </span>
                      <span className="font-bold text-muted-foreground/45">
                        .
                      </span>
                      <span className="font-bold text-primary">{parts[2]}</span>
                    </span>
                  );
                }
                return (
                  <span className="border border-primary/10 bg-primary/5 px-2 py-0.5 font-mono font-semibold text-primary text-xs leading-none">
                    {eventType.name}
                  </span>
                );
              })()}
            </CardTitle>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {eventType.deprecated && (
              <span className="flex items-center gap-0.5 border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 font-bold font-mono text-[8px] text-amber-600">
                <ShieldAlert className="size-2" />
                DEPRECATED
              </span>
            )}
            {eventType.archived && (
              <span className="flex items-center gap-0.5 border border-muted-foreground/20 bg-muted px-1.5 py-0.5 font-bold font-mono text-[8px] text-muted-foreground">
                <Archive className="size-2" />
                ARCHIVED
              </span>
            )}
          </div>
        </div>
        <CardDescription className="mt-2 line-clamp-2 h-8 text-[11px] leading-relaxed">
          {eventType.description || "No description provided."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between pt-0 font-mono text-[10px] text-muted-foreground">
        <span>Group: {eventType.groupName || "Default"}</span>
        <span>{new Date(eventType.createdAt).toLocaleDateString()}</span>
      </CardContent>
      <CardFooter className="flex justify-end gap-1.5 border-border/50 border-t pt-3 dark:border-input/50">
        <Button
          className={cn(
            "h-7 w-7 text-muted-foreground hover:bg-muted",
            eventType.deprecated && "text-amber-500 hover:bg-amber-500/10"
          )}
          disabled={updateMutation.isPending}
          onClick={handleToggleDeprecate}
          size="icon"
          title={eventType.deprecated ? "Undeprecate" : "Deprecate"}
          variant="ghost"
        >
          <ShieldAlert className="size-3.5" />
        </Button>
        <Button
          className={cn(
            "h-7 w-7 text-muted-foreground hover:bg-muted",
            eventType.archived && "text-primary hover:bg-primary/10"
          )}
          disabled={updateMutation.isPending}
          onClick={handleToggleArchive}
          size="icon"
          title={eventType.archived ? "Unarchive" : "Archive"}
          variant="ghost"
        >
          <Archive className="size-3.5" />
        </Button>
        <Button
          className="h-7 w-7 text-muted-foreground hover:bg-muted"
          onClick={handleEdit}
          size="icon"
          title="Edit Event Type"
          variant="ghost"
        >
          <Pencil className="size-3.5" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                size="icon"
                title="Delete Event Type"
                variant="ghost"
              >
                <Trash2 className="size-3.5" />
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Event Type</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this event type? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(eventType.id)}
                variant="destructive"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

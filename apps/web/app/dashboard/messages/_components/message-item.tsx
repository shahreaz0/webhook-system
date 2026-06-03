import { Button } from "@/web/components/ui/button";
import type { Message } from "@/web/lib/types";
import { cn } from "@/web/lib/utils";

export interface MessageItemProps {
  isSelected: boolean;
  msg: Message;
  onClick: () => void;
}

export function MessageItem({ msg, isSelected, onClick }: MessageItemProps) {
  // Calculate status
  const hasDeliveries = msg.deliveries && msg.deliveries.length > 0;
  const hasFailure = msg.deliveries?.some((d) => d.status === "FAILED");
  const hasPending = msg.deliveries?.some(
    (d) => d.status === "PENDING" || d.status === "PROCESSING"
  );

  let statusText = "NO_ENDPOINTS";
  let badgeColor =
    "bg-muted text-muted-foreground border-border dark:border-input";

  if (hasDeliveries) {
    if (hasPending) {
      statusText = "PROCESSING";
      badgeColor = "bg-primary/10 text-primary border-primary/20";
    } else if (hasFailure) {
      const hasSuccess = msg.deliveries?.some((d) => d.status === "DELIVERED");
      statusText = hasSuccess ? "PARTIAL" : "FAILED";
      badgeColor = hasSuccess
        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
        : "bg-destructive/10 text-destructive border-destructive/20";
    } else {
      statusText = "DELIVERED";
      badgeColor = "bg-green-500/10 text-green-500 border-green-500/20";
    }
  }

  return (
    <Button
      className={cn(
        "group flex h-auto w-full items-center justify-between rounded-none border p-3 text-left transition-all duration-150",
        isSelected
          ? "border-primary bg-primary/1"
          : "border-border hover:border-border-hover dark:border-input"
      )}
      onClick={onClick}
      variant="ghost"
    >
      <div className="flex-1 truncate pr-4">
        <div className="flex items-center gap-2">
          <span className="border border-primary/10 bg-primary/5 px-1.5 py-0.5 font-mono text-[9px] text-primary">
            {msg.eventType?.name || "unknown.event"}
          </span>
          <span className="font-mono text-[9px] text-muted-foreground">
            {msg.id.slice(0, 12)}...
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1 truncate text-[10px] text-muted-foreground">
          <span>Sub:</span>
          <span className="font-bold text-foreground">
            {msg.subscriber?.referenceId}
          </span>
          <span>•</span>
          <span>Target Endpoints: {msg.deliveries?.length || 0}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={cn(
            "rounded-none border px-1.5 py-0.5 font-bold font-mono text-[9px]",
            badgeColor
          )}
        >
          {statusText}
        </span>
        <span className="font-mono text-[9px] text-muted-foreground">
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      </div>
    </Button>
  );
}

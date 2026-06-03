import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import type { Message } from "@/web/lib/types";
import { cn } from "@/web/lib/utils";

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  DELIVERED: {
    badge: "border-green-500/20 bg-green-500/10 text-green-500",
    dot: "bg-green-500",
  },
  FAILED: {
    badge: "border-destructive/20 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
};

const DEFAULT_STATUS_STYLE = {
  badge: "border-primary/20 bg-primary/10 text-primary",
  dot: "bg-primary",
};

interface DeliveryStreamProps {
  isLoading: boolean;
  messages: Message[];
}

export function DeliveryStream({ messages, isLoading }: DeliveryStreamProps) {
  const allDeliveries = messages.flatMap((m) => m.deliveries || []);

  const renderDeliveryRows = () => {
    if (isLoading) {
      return (
        <tr>
          <td
            className="py-6 text-center font-mono text-muted-foreground"
            colSpan={5}
          >
            Querying events database...
          </td>
        </tr>
      );
    }

    if (allDeliveries.length === 0) {
      return (
        <tr>
          <td
            className="py-8 text-center font-mono text-muted-foreground"
            colSpan={5}
          >
            No webhook deliveries logged for this application yet.
          </td>
        </tr>
      );
    }

    return allDeliveries.slice(0, 5).map((delivery) => {
      const message = messages.find((m) => m.id === delivery.messageId);
      const statusStyle =
        STATUS_STYLES[delivery.status] || DEFAULT_STATUS_STYLE;
      return (
        <tr className="transition-colors hover:bg-muted/30" key={delivery.id}>
          <td className="py-3 font-medium font-mono text-foreground">
            {delivery.messageId.slice(0, 10)}...
          </td>
          <td className="py-3">
            <span className="border border-primary/10 bg-primary/5 px-1.5 py-0.5 font-mono text-[10px] text-primary">
              {message?.eventType?.name || "unknown.event"}
            </span>
          </td>
          <td
            className="max-w-xs truncate py-3 font-mono text-muted-foreground"
            title={delivery.webhook?.url}
          >
            {delivery.webhook?.url || "https://..."}
          </td>
          <td className="py-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono font-semibold text-[10px]",
                statusStyle.badge
              )}
            >
              <span className={cn("h-1 w-1 rounded-full", statusStyle.dot)} />
              {delivery.status}
            </span>
          </td>
          <td className="py-3 text-right font-mono text-muted-foreground">
            {new Date(delivery.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </td>
        </tr>
      );
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-semibold text-sm">
            Recent Event Delivery Stream
          </CardTitle>
          <CardDescription>
            Real-time list of the latest webhook dispatch actions and responses.
          </CardDescription>
        </div>
        <Link
          className="flex items-center gap-1 font-semibold text-primary text-xs hover:underline"
          href="/dashboard/messages"
        >
          <span>View All Logs</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-border border-b font-mono text-[10px] text-muted-foreground uppercase dark:border-input">
                <th className="py-2.5 font-semibold">Message ID</th>
                <th className="py-2.5 font-semibold">Event Type</th>
                <th className="py-2.5 font-semibold">Endpoint</th>
                <th className="py-2.5 font-semibold">Status</th>
                <th className="py-2.5 text-right font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 dark:divide-input/60">
              {renderDeliveryRows()}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

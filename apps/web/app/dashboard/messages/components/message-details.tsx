import { AlertTriangle, Copy, History } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import { cn } from "@/web/lib/utils";
import { useMessagesStore } from "../store";

export function MessageDetails() {
  const { selectedMessage } = useMessagesStore();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (!selectedMessage) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center border border-border border-dashed p-8 text-center dark:border-input">
        <History className="mb-4 size-10 stroke-1 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Select log item</h3>
        <p className="mt-1 max-w-sm text-muted-foreground text-xs">
          Click on a log entry from the list to audit payload JSONs, copy
          endpoints signing secrets, and review transmission response logs.
        </p>
      </div>
    );
  }

  return (
    <div className="fade-in slide-in-from-right-1 animate-in space-y-6 duration-150">
      {/* Header profile */}
      <Card>
        <CardHeader className="p-4 pb-3">
          <div className="font-bold font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            Audit Event ID
          </div>
          <CardTitle className="mt-1 select-all font-bold font-mono text-xs">
            {selectedMessage.id}
          </CardTitle>
          <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
            <span>
              Dispatched: {new Date(selectedMessage.createdAt).toLocaleString()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0">
          {/* JSON Code Viewer */}
          <div>
            <div className="mb-1 flex items-center justify-between font-bold font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
              <span>Payload (body)</span>
              <Button
                className="h-auto p-0 font-bold font-mono text-[9px] text-primary hover:underline"
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(selectedMessage.payload, null, 2)
                  )
                }
                variant="link"
              >
                <Copy className="size-2.5" />
                <span>Copy</span>
              </Button>
            </div>
            <pre className="max-h-56 select-all overflow-y-auto border border-border/50 bg-muted/40 p-3 font-mono text-[10px] text-foreground leading-normal dark:border-input/50">
              {JSON.stringify(selectedMessage.payload, null, 2)}
            </pre>
          </div>

          {/* Subscriber reference details */}
          <div className="border-border/50 border-t pt-3 font-mono text-[10px] dark:border-input/50">
            <div className="mb-1 font-bold text-[8px] text-muted-foreground uppercase tracking-wider">
              Receiver Account Context
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">Reference ID:</span>
              <span className="font-bold text-foreground">
                {selectedMessage.subscriber?.referenceId}
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">Notification Email:</span>
              <span className="text-foreground">
                {selectedMessage.subscriber?.email}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery attempts logs table */}
      <div className="space-y-3">
        <h3 className="border-primary/40 border-l-2 pl-1 font-bold font-mono text-muted-foreground text-xs uppercase tracking-wider">
          Delivery Outcomes
        </h3>

        {!selectedMessage.deliveries ||
        selectedMessage.deliveries.length === 0 ? (
          <div className="border border-border border-dashed p-4 text-center text-muted-foreground text-xs dark:border-input">
            No listener endpoints matched this event type filters. Delivery
            skipped.
          </div>
        ) : (
          <div className="space-y-3">
            {selectedMessage.deliveries.map((del) => (
              <Card
                className="border-border/60 dark:border-input/60"
                key={del.id}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1.5">
                  <span
                    className="max-w-[200px] truncate font-mono font-semibold text-[10px] text-foreground"
                    title={del.webhook?.url}
                  >
                    {del.webhook?.url}
                  </span>
                  <span
                    className={cn(
                      "rounded-none border px-1.5 py-0.25 font-bold font-mono text-[8px]",
                      del.status === "DELIVERED"
                        ? "border-green-500/20 bg-green-500/10 text-green-500"
                        : "border-destructive/20 bg-destructive/10 text-destructive"
                    )}
                  >
                    {del.status}
                  </span>
                </CardHeader>
                <CardContent className="space-y-2 p-3 pt-1.5 font-mono text-[10px]">
                  {del.lastError && (
                    <div className="flex items-start gap-1.5 border border-destructive/20 bg-destructive/5 p-2 text-[9px] text-destructive leading-relaxed">
                      <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                      <span>{del.lastError}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                    <div>
                      <span className="font-semibold text-foreground">
                        Attempts:
                      </span>{" "}
                      {del.attempts}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">
                        Last Status:
                      </span>{" "}
                      {del.status === "DELIVERED" ? "200 OK" : "503 Failed"}
                    </div>
                    {del.deliveredAt && (
                      <div className="col-span-2">
                        <span className="font-semibold text-foreground">
                          Delivered At:
                        </span>{" "}
                        {new Date(del.deliveredAt).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

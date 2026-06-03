import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";

interface OutcomesChartProps {
  failedDeliveries: number;
  successfulDeliveries: number;
  totalDeliveries: number;
}

export function OutcomesChart({
  totalDeliveries,
  successfulDeliveries,
  failedDeliveries,
}: OutcomesChartProps) {
  const processingDeliveries =
    totalDeliveries - successfulDeliveries - failedDeliveries;

  const successPercent =
    totalDeliveries > 0
      ? ((successfulDeliveries / totalDeliveries) * 100).toFixed(0)
      : "0";
  const failedPercent =
    totalDeliveries > 0
      ? ((failedDeliveries / totalDeliveries) * 100).toFixed(0)
      : "0";
  const processingPercent =
    totalDeliveries > 0
      ? ((processingDeliveries / totalDeliveries) * 100).toFixed(0)
      : "0";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold text-sm">
          Delivery Outcomes
        </CardTitle>
        <CardDescription>
          Proportion of statuses for all deliveries.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex h-48 flex-col justify-center">
        {totalDeliveries === 0 ? (
          <div className="text-center font-mono text-muted-foreground text-xs">
            No data logged yet
          </div>
        ) : (
          <div className="space-y-4">
            {/* Delivered Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-green-500" />{" "}
                  Delivered
                </span>
                <span className="font-semibold">
                  {successfulDeliveries} ({successPercent}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden bg-muted">
                <div
                  className="h-full bg-green-500"
                  style={{
                    width: `${successPercent}%`,
                  }}
                />
              </div>
            </div>

            {/* Failed Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-destructive" />{" "}
                  Failed
                </span>
                <span className="font-semibold">
                  {failedDeliveries} ({failedPercent}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden bg-muted">
                <div
                  className="h-full bg-destructive"
                  style={{
                    width: `${failedPercent}%`,
                  }}
                />
              </div>
            </div>

            {/* Processing Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary" />{" "}
                  Processing
                </span>
                <span className="font-semibold">
                  {processingDeliveries} ({processingPercent}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${processingPercent}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

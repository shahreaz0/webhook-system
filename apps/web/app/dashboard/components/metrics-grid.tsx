import { Activity, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";

interface MetricsGridProps {
  activeWebhooksCount: number;
  failedDeliveries: number;
  successRate: string;
  totalMessages: number;
}

export function MetricsGrid({
  successRate,
  totalMessages,
  failedDeliveries,
  activeWebhooksCount,
}: MetricsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Metric 1: Success Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-mono font-semibold text-muted-foreground text-xs uppercase tracking-wider">
            Success Rate
          </CardTitle>
          <CheckCircle2 className="size-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="font-bold font-mono text-2xl">{successRate}%</div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Percentage of delivered webhooks with status code 2xx.
          </p>
        </CardContent>
      </Card>

      {/* Metric 2: Total Messages */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-mono font-semibold text-muted-foreground text-xs uppercase tracking-wider">
            Total Messages
          </CardTitle>
          <Activity className="size-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="font-bold font-mono text-2xl">{totalMessages}</div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Total event payloads queued in this application.
          </p>
        </CardContent>
      </Card>

      {/* Metric 3: Failed Deliveries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-mono font-semibold text-muted-foreground text-xs uppercase tracking-wider">
            Failed Deliveries
          </CardTitle>
          <AlertCircle className="size-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="font-bold font-mono text-2xl">{failedDeliveries}</div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Non-delivered webhook logs requiring attention.
          </p>
        </CardContent>
      </Card>

      {/* Metric 4: Active Endpoints */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-mono font-semibold text-muted-foreground text-xs uppercase tracking-wider">
            Active Endpoints
          </CardTitle>
          <Zap className="size-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="font-bold font-mono text-2xl">
            {activeWebhooksCount}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Active URLs listening to event broadcasts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Layers,
  RefreshCw,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useActiveApp } from "@/lib/active-app-context";
import { apiClient } from "@/lib/fetch-client";
import { cn } from "@/lib/utils";

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

export default function DashboardOverviewPage() {
  const { activeApp } = useActiveApp();

  // Fetch messages (which includes nested deliveries) using TanStack Query
  const {
    data: messages = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["messages", activeApp?.id],
    queryFn: () => apiClient.getMessages(),
    enabled: !!activeApp,
  });

  // Calculate metrics
  const totalMessages = messages.length;

  const allDeliveries = messages.flatMap((m) => m.deliveries || []);
  const totalDeliveries = allDeliveries.length;
  const successfulDeliveries = allDeliveries.filter(
    (d) => d.status === "DELIVERED"
  ).length;
  const failedDeliveries = allDeliveries.filter(
    (d) => d.status === "FAILED"
  ).length;
  const successRate =
    totalDeliveries > 0
      ? ((successfulDeliveries / totalDeliveries) * 100).toFixed(1)
      : "0.0";

  // Simulate active webhook count
  const { data: webhooks = [] } = useQuery({
    queryKey: ["webhooks-count", activeApp?.id],
    queryFn: async () => {
      if (!activeApp) {
        return [];
      }
      const subs = await apiClient.getSubscribers(activeApp.id);
      const whsPromises = subs.map((s) => apiClient.getWebhooks(s.id));
      const whsLists = await Promise.all(whsPromises);
      return whsLists.flat();
    },
    enabled: !!activeApp,
  });

  const activeWebhooksCount = webhooks.filter((w) => !w.disabled).length;

  if (!activeApp) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center border border-border border-dashed p-8 text-center dark:border-input">
        <Layers className="mb-4 size-10 stroke-1 text-muted-foreground" />
        <h3 className="font-semibold text-base">No active application</h3>
        <p className="mt-1 max-w-sm text-muted-foreground text-xs">
          Select or create an application from the sidebar to view metrics.
        </p>
        <Link className="mt-4" href="/dashboard/applications">
          <Button>Create Application</Button>
        </Link>
      </div>
    );
  }

  // Simulated chart data points for SVG line chart (representing hourly delivery count)
  const chartData = [
    12, 19, 3, 5, 2, 3, 10, 15, 25, 30, 45, 35, 20, 25, 40, 55, 60, 48, 52, 64,
    75, 80, 95, 110,
  ];
  const maxChartVal = Math.max(...chartData);
  const chartPoints = chartData
    .map(
      (val, index) =>
        `${(index / (chartData.length - 1)) * 100},${100 - (val / maxChartVal) * 80}`
    )
    .join(" ");

  const renderDeliveryStream = () => {
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
    <div className="space-y-6">
      {/* Top dashboard action bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl tracking-tight">
            Overview Dashboard
          </h2>
          <p className="text-muted-foreground text-xs">
            Monitor real-time webhook operations for{" "}
            <span className="font-semibold text-foreground">
              {activeApp.name}{" "}
            </span>{" "}
            .
          </p>
        </div>
        <Button
          disabled={isLoading || isRefetching}
          onClick={() => refetch()}
          variant="outline"
        >
          <RefreshCw
            className={cn(
              "size-3.5",
              (isLoading || isRefetching) && "animate-spin"
            )}
          />
          <span>Sync Data</span>
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
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

        {/* Metric 2 */}
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

        {/* Metric 3 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-mono font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Failed Deliveries
            </CardTitle>
            <AlertCircle className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="font-bold font-mono text-2xl">
              {failedDeliveries}
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Non-delivered webhook logs requiring attention.
            </p>
          </CardContent>
        </Card>

        {/* Metric 4 */}
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

      {/* Charts & Graphs */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* SVG Sparkline Graph */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="font-semibold text-sm">
              Delivery Activity
            </CardTitle>
            <CardDescription>
              Visual traffic graph representing webhook deliveries over the last
              24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mt-4 h-48 w-full border border-border/50 bg-muted/20 p-2 dark:border-input/50">
              {/* SVG Sparkline */}
              <svg
                className="h-full w-full overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <title>dd</title>
                <defs>
                  <linearGradient
                    id="chartGradient"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--primary)"
                      stopOpacity="0.25"
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--primary)"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                {/* Gradient area */}
                <path
                  d={`M 0,100 L ${chartPoints} L 100,100 Z`}
                  fill="url(#chartGradient)"
                />
                {/* Stroke line */}
                <polyline
                  className="stroke-primary"
                  fill="none"
                  points={chartPoints}
                  stroke="var(--color-primary)"
                  strokeWidth="1.5"
                />
              </svg>
              {/* Bottom labels */}
              <div className="absolute right-2 bottom-2 left-2 flex justify-between font-mono text-[8px] text-muted-foreground uppercase">
                <span>24 Hours Ago</span>
                <span>12 Hours Ago</span>
                <span>Just Now</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status distribution */}
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
                      {successfulDeliveries} (
                      {((successfulDeliveries / totalDeliveries) * 100).toFixed(
                        0
                      )}
                      %)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden bg-muted">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${(successfulDeliveries / totalDeliveries) * 100}%`,
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
                      {failedDeliveries} (
                      {((failedDeliveries / totalDeliveries) * 100).toFixed(0)}
                      %)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden bg-muted">
                    <div
                      className="h-full bg-destructive"
                      style={{
                        width: `${(failedDeliveries / totalDeliveries) * 100}%`,
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
                      {totalDeliveries -
                        successfulDeliveries -
                        failedDeliveries}{" "}
                      (
                      {(
                        ((totalDeliveries -
                          successfulDeliveries -
                          failedDeliveries) /
                          totalDeliveries) *
                        100
                      ).toFixed(0)}
                      %)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${((totalDeliveries - successfulDeliveries - failedDeliveries) / totalDeliveries) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Webhook Deliveries List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-semibold text-sm">
              Recent Event Delivery Stream
            </CardTitle>
            <CardDescription>
              Real-time list of the latest webhook dispatch actions and
              responses.
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
                {renderDeliveryStream()}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

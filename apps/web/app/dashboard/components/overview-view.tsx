"use client";

import { Layers, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/web/components/ui/button";
import { cn } from "@/web/lib/utils";
import { useApplicationsStore } from "../applications/store";
import { useGetOverviewMessages } from "../hooks/use-get-overview-messages";
import { useGetOverviewWebhooks } from "../hooks/use-get-overview-webhooks";
import { ActivityChart } from "./activity-chart";
import { DeliveryStream } from "./delivery-stream";
import { MetricsGrid } from "./metrics-grid";
import { OutcomesChart } from "./outcomes-chart";

export function OverviewView() {
  const { activeApp } = useApplicationsStore();

  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
    isRefetching: isRefetchingMessages,
  } = useGetOverviewMessages(activeApp?.id || "");

  const {
    data: webhooks = [],
    isLoading: isLoadingWebhooks,
    refetch: refetchWebhooks,
    isRefetching: isRefetchingWebhooks,
  } = useGetOverviewWebhooks(activeApp?.id || "");

  const handleSync = async () => {
    await Promise.all([refetchMessages(), refetchWebhooks()]);
  };

  const isLoading = isLoadingMessages || isLoadingWebhooks;
  const isRefetching = isRefetchingMessages || isRefetchingWebhooks;

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

  const activeWebhooksCount = webhooks.filter((w) => !w.disabled).length;

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
          onClick={handleSync}
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
      <MetricsGrid
        activeWebhooksCount={activeWebhooksCount}
        failedDeliveries={failedDeliveries}
        successRate={successRate}
        totalMessages={totalMessages}
      />

      {/* Charts & Graphs */}
      <div className="grid gap-4 md:grid-cols-3">
        <ActivityChart />
        <OutcomesChart
          failedDeliveries={failedDeliveries}
          successfulDeliveries={successfulDeliveries}
          totalDeliveries={totalDeliveries}
        />
      </div>

      {/* Recent Webhook Deliveries List */}
      <DeliveryStream isLoading={isLoading} messages={messages} />
    </div>
  );
}

"use client";

import { Layers, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/web/app/(auth)/_hooks/use-session";
import { useGetApplicationList } from "@/web/app/dashboard/applications/_hooks/use-get-application-list";
import { Button } from "@/web/components/ui/button";
import { Skeleton } from "@/web/components/ui/skeleton";
import { cn, createSkeletonKeys } from "@/web/lib/utils";
import { useGetOverviewMessages } from "../_hooks/use-get-overview-messages";
import { useGetOverviewWebhooks } from "../_hooks/use-get-overview-webhooks";
import { useApplicationsStore } from "../applications/store";
import { ActivityChart } from "./activity-chart";
import { DeliveryStream } from "./delivery-stream";
import { MetricsGrid } from "./metrics-grid";
import { OutcomesChart } from "./outcomes-chart";

function OverviewSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Top dashboard action bar */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {createSkeletonKeys(4, "metric").map((key) => (
          <div
            className="space-y-3 border border-border bg-card p-4 dark:border-input"
            key={key}
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        ))}
      </div>

      {/* Charts & Graphs */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-4 border border-border bg-card p-4 md:col-span-2 dark:border-input">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-[240px] w-full" />
        </div>
        <div className="space-y-4 border border-border bg-card p-4 dark:border-input">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-[240px] w-full" />
        </div>
      </div>

      {/* Recent Webhook Deliveries List */}
      <div className="space-y-4 border border-border bg-card p-4 dark:border-input">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-3">
          {createSkeletonKeys(5, "delivery").map((key) => (
            <Skeleton className="h-10 w-full" key={key} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function OverviewView() {
  const { isLoading: isSessionLoading } = useSession();
  const { isLoading: isAppsLoading } = useGetApplicationList();
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

  if (isSessionLoading || isAppsLoading) {
    return <OverviewSkeleton />;
  }

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

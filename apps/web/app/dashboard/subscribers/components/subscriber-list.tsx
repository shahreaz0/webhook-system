"use client";

import { ChevronRight, Plus, Users } from "lucide-react";
import { Button } from "@/web/components/ui/button";
import { cn } from "@/web/lib/utils";
import { useApplicationsStore } from "../../applications/store";
import { useGetSubscribersList } from "../hooks/use-get-subscribers-list";
import { useSubscribersStore } from "../store";

export function SubscriberList() {
  const { activeApp } = useApplicationsStore();
  const appId = activeApp?.id || "";

  const { data: subscribers = [], isLoading } = useGetSubscribersList(appId);

  const {
    selectedSubscriber,
    setSelectedSubscriber,
    isCreateSubscriberOpen,
    setIsCreateSubscriberOpen,
  } = useSubscribersStore();

  const toggleCreate = () => {
    setIsCreateSubscriberOpen(!isCreateSubscriberOpen);
  };

  function renderListContent() {
    if (isLoading) {
      return (
        <div className="py-6 text-center font-mono text-muted-foreground text-xs">
          Loading subscribers list...
        </div>
      );
    }

    if (subscribers.length === 0) {
      return (
        <div className="border border-border border-dashed py-8 text-center dark:border-input">
          <Users className="mx-auto mb-2 size-8 stroke-1 text-muted-foreground" />
          <div className="font-semibold text-xs">No subscribers created</div>
          <p className="mx-auto mt-1 max-w-[200px] text-[10px] text-muted-foreground">
            Add a subscriber first before configuring webhook destination URLs.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {subscribers.map((sub) => {
          const isSelected = selectedSubscriber?.id === sub.id;
          return (
            <button
              className={cn(
                "group flex w-full cursor-pointer items-center justify-between border p-3 text-left transition-all duration-150",
                isSelected
                  ? "border-primary bg-primary/1"
                  : "border-border hover:border-border-hover dark:border-input"
              )}
              key={sub.id}
              onClick={() => setSelectedSubscriber(sub)}
              type="button"
            >
              <div className="truncate pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-bold font-mono text-foreground text-xs">
                    {sub.referenceId}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                  {sub.email}
                </div>
              </div>
              <ChevronRight
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-all",
                  isSelected
                    ? "translate-x-0.5 text-primary"
                    : "group-hover:translate-x-0.5"
                )}
              />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Subscribers</h2>
          <p className="text-[10px] text-muted-foreground">
            Accounts receiving webhooks.
          </p>
        </div>
        <Button onClick={toggleCreate} size="xs" variant="outline">
          {isCreateSubscriberOpen ? "Cancel" : "Add Subscriber"}
          <Plus className="size-3.5" />
        </Button>
      </div>

      {renderListContent()}
    </div>
  );
}

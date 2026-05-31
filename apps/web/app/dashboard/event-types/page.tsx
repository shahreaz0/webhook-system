"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus, Tag, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import { Input } from "@/web/components/ui/input";
import { useActiveApp } from "@/web/lib/active-app-context";
import { apiClient } from "@/web/lib/fetch-client";

export default function EventTypesPage() {
  const queryClient = useQueryClient();
  const { activeApp } = useActiveApp();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch event types for active app using TanStack Query
  const { data: eventTypes = [], isLoading } = useQuery({
    queryKey: ["event-types", activeApp?.id],
    queryFn: () =>
      activeApp ? apiClient.getEventTypes(activeApp.id) : Promise.resolve([]),
    enabled: !!activeApp,
  });

  // Create event type mutation
  const createMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      description: string;
      groupName: string;
      applicationId: string;
    }) => apiClient.createEventType(payload),
    onSuccess: () => {
      setName("");
      setDescription("");
      setGroupName("");
      setCreating(false);
      queryClient.invalidateQueries({
        queryKey: ["event-types", activeApp?.id],
      });
    },
    onError: (err: any) => {
      setError(err.message || "Failed to create event type.");
    },
  });

  const handleCreate = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!(name.trim() && activeApp)) {
      return;
    }

    // Standardize event naming formats (e.g. user.created or payment.failed)
    const cleanName = name.trim().toLowerCase().replace(/\s+/g, ".");
    createMutation.mutate({
      name: cleanName,
      description,
      groupName: groupName.trim() || "Default",
      applicationId: activeApp.id,
    });
  };

  if (!activeApp) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center border border-border border-dashed p-8 text-center dark:border-input">
        <Layers className="mb-4 size-10 stroke-1 text-muted-foreground" />
        <h3 className="font-semibold text-base">Select an application</h3>
        <p className="mt-1 max-w-sm text-muted-foreground text-xs">
          Please select or create an application in the sidebar to define custom
          webhook event types.
        </p>
      </div>
    );
  }

  // Group event types by group name
  const groupedEvents = eventTypes.reduce((acc: any, et) => {
    const group = et.groupName || "Default";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(et);
    return acc;
  }, {});

  function renderEventTypesList() {
    if (isLoading) {
      return (
        <div className="py-12 text-center font-mono text-muted-foreground text-xs">
          Querying event definitions database...
        </div>
      );
    }

    if (eventTypes.length === 0) {
      return (
        <div className="flex h-[40vh] flex-col items-center justify-center border border-border border-dashed p-8 text-center dark:border-input">
          <Zap className="mb-4 size-10 stroke-1 text-muted-foreground" />
          <h3 className="font-semibold text-sm">No events defined</h3>
          <p className="mt-1 max-w-sm text-muted-foreground text-xs">
            Start defining event types like `payment.succeeded` or
            `user.deleted` for subscribers to listen to.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {Object.keys(groupedEvents).map((group) => (
          <div className="space-y-3" key={group}>
            <h3 className="border-primary/40 border-l-2 pl-1 font-bold font-mono text-muted-foreground text-xs uppercase tracking-wider">
              {group}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groupedEvents[group].map((et: any) => (
                <Card
                  className="transition-colors hover:border-border-hover"
                  key={et.id}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="border border-primary/10 bg-primary/5 px-2 py-0.5 font-mono font-semibold text-primary text-xs">
                        {et.name}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {et.id}
                      </span>
                    </div>
                    <CardDescription className="mt-3 text-xs leading-relaxed">
                      {et.description || "No description provided."}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl tracking-tight">
            Event Definitions
          </h2>
          <p className="text-muted-foreground text-xs">
            Manage webhook event definitions that can be triggered or subscribed
            to under this application.
          </p>
        </div>
        <Button onClick={() => setCreating(!creating)}>
          {creating ? "Cancel" : "Define Event"}
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Event creation form panel */}
      {creating && (
        <Card className="fade-in slide-in-from-top-2 animate-in border-primary/20 bg-primary/5 duration-200 dark:bg-primary/5">
          <form onSubmit={handleCreate}>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 font-semibold text-sm">
                <Tag className="size-4 text-primary" />
                Register New Event Type
              </CardTitle>
              <CardDescription>
                Define the hook key name (use dot notation, e.g.
                `order.fulfilled`) and categories.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="border border-destructive/20 bg-destructive/10 p-3 text-destructive text-xs">
                  {error}
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label
                    className="font-semibold text-foreground/80 text-xs"
                    htmlFor="etName"
                  >
                    Event Trigger Name
                  </label>
                  <Input
                    id="etName"
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. user.signup"
                    required
                    value={name}
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    className="font-semibold text-foreground/80 text-xs"
                    htmlFor="etGroup"
                  >
                    Category Group
                  </label>
                  <Input
                    id="etGroup"
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. Billing, Users"
                    value={groupName}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-3">
                  <label
                    className="font-semibold text-foreground/80 text-xs"
                    htmlFor="etDesc"
                  >
                    Description / Schema guidelines
                  </label>
                  <Input
                    id="etDesc"
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Triggered whenever a customer completes registration flow"
                    value={description}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button disabled={createMutation.isPending} type="submit">
                {createMutation.isPending ? "Creating..." : "Save Event Type"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {renderEventTypesList()}
    </div>
  );
}

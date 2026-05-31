"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Layers,
  Plus,
  Sparkles,
  Trash,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/web/components/ui/alert-dialog";
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
import { apiClient } from "@/web/lib/fetch-client";
import type { Subscriber, Webhook } from "@/web/lib/types";
import { cn } from "@/web/lib/utils";
import { useApplicationsStore } from "../applications/store";

export default function SubscribersPage() {
  const queryClient = useQueryClient();
  const { activeApp } = useApplicationsStore();

  const [selectedSub, setSelectedSub] = useState<Subscriber | null>(null);
  const [subToDelete, setSubToDelete] = useState<Subscriber | null>(null);
  const [whToDelete, setWhToDelete] = useState<Webhook | null>(null);

  // Forms states
  const [subCreating, setSubCreating] = useState(false);
  const [refId, setRefId] = useState("");
  const [email, setEmail] = useState("");
  const [metadataStr, setMetadataStr] = useState("{}");
  const [subError, setSubError] = useState<string | null>(null);

  const [whCreating, setWhCreating] = useState(false);
  const [whUrl, setWhUrl] = useState("");
  const [whDesc, setWhDesc] = useState("");
  const [whRateLimit, setWhRateLimit] = useState("");
  const [whEvents, setWhEvents] = useState<string[]>([]);
  const [whError, setWhError] = useState<string | null>(null);
  const [revealSecrets, setRevealSecrets] = useState<Record<string, boolean>>(
    {}
  );

  // 1. Fetch event types for selection
  const { data: eventTypes = [] } = useQuery({
    queryKey: ["event-types", activeApp?.id],
    queryFn: () =>
      activeApp ? apiClient.getEventTypes(activeApp.id) : Promise.resolve([]),
    enabled: !!activeApp,
  });

  // 2. Fetch subscribers
  const { data: subscribers = [], isLoading: subsLoading } = useQuery({
    queryKey: ["subscribers", activeApp?.id],
    queryFn: () =>
      activeApp ? apiClient.getSubscribers(activeApp.id) : Promise.resolve([]),
    enabled: !!activeApp,
  });

  // 3. Fetch webhooks for selected subscriber
  const { data: webhooks = [], isLoading: whsLoading } = useQuery({
    queryKey: ["webhooks", selectedSub?.id],
    queryFn: () =>
      selectedSub ? apiClient.getWebhooks(selectedSub.id) : Promise.resolve([]),
    enabled: !!selectedSub,
  });

  // Mutations
  const createSubMutation = useMutation({
    mutationFn: (payload: any) => apiClient.createSubscriber(payload),
    onSuccess: (newSub) => {
      setRefId("");
      setEmail("");
      setMetadataStr("{}");
      setSubCreating(false);
      setSelectedSub(newSub);
      queryClient.invalidateQueries({
        queryKey: ["subscribers", activeApp?.id],
      });
    },
    onError: (err: any) => {
      setSubError(err.message || "Failed to create subscriber.");
    },
  });

  const deleteSubMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteSubscriber(id),
    onSuccess: () => {
      setSelectedSub(null);
      queryClient.invalidateQueries({
        queryKey: ["subscribers", activeApp?.id],
      });
    },
  });

  const createWhMutation = useMutation({
    mutationFn: (payload: any) => apiClient.createWebhook(payload),
    onSuccess: () => {
      setWhUrl("");
      setWhDesc("");
      setWhRateLimit("");
      setWhEvents([]);
      setWhCreating(false);
      queryClient.invalidateQueries({
        queryKey: ["webhooks", selectedSub?.id],
      });
    },
    onError: (err: any) => {
      setWhError(err.message || "Failed to create endpoint.");
    },
  });

  const updateWhMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      apiClient.updateWebhook(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["webhooks", selectedSub?.id],
      });
    },
  });

  const deleteWhMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteWebhook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["webhooks", selectedSub?.id],
      });
    },
  });

  const handleCreateSub = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubError(null);
    if (!(refId.trim() && email.trim() && activeApp)) {
      return;
    }

    let parsedMeta: unknown = null;
    try {
      parsedMeta = JSON.parse(metadataStr);
    } catch {
      setSubError("Invalid metadata JSON. Must be a valid JSON object.");
      return;
    }

    createSubMutation.mutate({
      applicationId: activeApp.id,
      referenceId: refId.trim(),
      email: email.trim(),
      metadata: parsedMeta,
    });
  };

  const handleCreateWh = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setWhError(null);
    if (!(whUrl.trim() && selectedSub)) {
      return;
    }

    if (whEvents.length === 0) {
      setWhError("Please select at least one event type filter.");
      return;
    }

    createWhMutation.mutate({
      url: whUrl.trim(),
      description: whDesc,
      rateLimit: whRateLimit ? Number.parseInt(whRateLimit, 10) : null,
      subscriberId: selectedSub.id,
      eventTypeIds: whEvents,
    });
  };

  const toggleWhStatus = (wh: Webhook) => {
    updateWhMutation.mutate({
      id: wh.id,
      payload: {
        url: wh.url,
        description: wh.description,
        rateLimit: wh.rateLimit,
        disabled: !wh.disabled,
        eventTypeIds: wh.eventTypes.map((et) => et.id),
      },
    });
  };

  if (!activeApp) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center border border-border border-dashed p-8 text-center dark:border-input">
        <Layers className="mb-4 size-10 stroke-1 text-muted-foreground" />
        <h3 className="font-semibold text-base">Select an application</h3>
        <p className="mt-1 max-w-sm text-muted-foreground text-xs">
          Please select or create an application in the sidebar to configure
          subscribers and webhook destinations.
        </p>
      </div>
    );
  }

  function renderSubscribersList() {
    if (subsLoading) {
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
          const isSelected = selectedSub?.id === sub.id;
          return (
            <button
              className={cn(
                "group flex w-full cursor-pointer items-center justify-between border p-3 text-left transition-all duration-150",
                isSelected
                  ? "border-primary bg-primary/1"
                  : "border-border hover:border-border-hover dark:border-input"
              )}
              key={sub.id}
              onClick={() => setSelectedSub(sub)}
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

  function renderWebhooksList() {
    if (whsLoading) {
      return (
        <div className="py-6 text-center font-mono text-muted-foreground text-xs">
          Querying webhooks list...
        </div>
      );
    }

    if (webhooks.length === 0) {
      return (
        <div className="border border-border border-dashed py-8 text-center dark:border-input">
          <Globe className="mx-auto mb-2 size-8 stroke-1 text-muted-foreground" />
          <div className="font-semibold text-xs">No endpoints registered</div>
          <p className="mx-auto mt-1 max-w-[220px] text-[10px] text-muted-foreground">
            No webhook endpoints registered for this subscriber. Add one to
            route notifications.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {webhooks.map((wh) => (
          <WebhookCard
            key={wh.id}
            onDelete={setWhToDelete}
            onToggleReveal={() =>
              setRevealSecrets({
                ...revealSecrets,
                [wh.id]: !revealSecrets[wh.id],
              })
            }
            onToggleStatus={toggleWhStatus}
            revealSecret={!!revealSecrets[wh.id]}
            wh={wh}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 md:grid-cols-5">
      {/* LEFT COLUMN: Subscribers List */}
      <div className="space-y-4 md:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Subscribers</h2>
            <p className="text-[10px] text-muted-foreground">
              Accounts receiving webhooks.
            </p>
          </div>
          <Button
            onClick={() => setSubCreating(!subCreating)}
            size="xs"
            variant="outline"
          >
            {subCreating ? "Cancel" : "Add Subscriber"}
            <Plus className="size-3.5" />
          </Button>
        </div>

        {subCreating && (
          <Card className="fade-in slide-in-from-top-1 animate-in border-primary/20 bg-primary/5 duration-150 dark:bg-primary/5">
            <form onSubmit={handleCreateSub}>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center gap-1.5 font-semibold text-xs">
                  <Sparkles className="size-3.5 text-primary" />
                  New Subscriber Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                {subError && (
                  <div className="border border-destructive/20 bg-destructive/10 p-2 text-[10px] text-destructive">
                    {subError}
                  </div>
                )}
                <div className="space-y-1">
                  <label
                    className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
                    htmlFor="refId"
                  >
                    Reference ID (unique key)
                  </label>
                  <Input
                    id="refId"
                    onChange={(e) => setRefId(e.target.value)}
                    placeholder="e.g. user_1028"
                    required
                    value={refId}
                  />
                </div>
                <div className="space-y-1">
                  <label
                    className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
                    htmlFor="subEmail"
                  >
                    Notification Email
                  </label>
                  <Input
                    id="subEmail"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@customer.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>
                <div className="space-y-1">
                  <label
                    className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
                    htmlFor="subMeta"
                  >
                    Metadata (JSON payload)
                  </label>
                  <Input
                    id="subMeta"
                    onChange={(e) => setMetadataStr(e.target.value)}
                    placeholder='{"tier": "enterprise"}'
                    value={metadataStr}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end p-4 pt-0">
                <Button
                  disabled={createSubMutation.isPending}
                  size="xs"
                  type="submit"
                >
                  {createSubMutation.isPending ? "Adding..." : "Add Subscriber"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {renderSubscribersList()}
      </div>

      {/* RIGHT COLUMN: Selected Subscriber details and Webhooks */}
      <div className="md:col-span-3">
        {selectedSub ? (
          <div className="space-y-6">
            {/* Subscriber Meta Header Card */}
            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-3">
                <div>
                  <div className="font-bold font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                    Subscriber Profile
                  </div>
                  <CardTitle className="mt-1 font-bold font-mono text-base">
                    {selectedSub.referenceId}
                  </CardTitle>
                  <CardDescription className="mt-0.5 text-xs">
                    {selectedSub.email}
                  </CardDescription>
                </div>
                <Button
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    setSubToDelete(selectedSub);
                  }}
                  size="icon-sm"
                  title="Delete Subscriber"
                  variant="ghost"
                >
                  <Trash className="size-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="max-h-32 overflow-y-auto border border-border/50 bg-muted/40 p-2.5 font-mono text-[10px] text-muted-foreground leading-normal dark:border-input/50">
                  <div className="mb-1 font-semibold text-[8px] text-foreground uppercase">
                    Metadata context:
                  </div>
                  {selectedSub.metadata
                    ? JSON.stringify(selectedSub.metadata, null, 2)
                    : "{}"}
                </div>
              </CardContent>
            </Card>

            {/* Webhook Endpoints Sections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Delivery Endpoints</h3>
                  <p className="text-[10px] text-muted-foreground">
                    URLs to which events will be HTTP POSTed.
                  </p>
                </div>
                <Button onClick={() => setWhCreating(!whCreating)} size="xs">
                  {whCreating ? "Cancel" : "Add Endpoint"}
                  <Plus className="size-3.5" />
                </Button>
              </div>

              {/* Add Webhook Form */}
              {whCreating && (
                <Card className="fade-in slide-in-from-top-1 animate-in border-primary/20 bg-primary/5 duration-150 dark:bg-primary/5">
                  <form onSubmit={handleCreateWh}>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="flex items-center gap-1.5 font-semibold text-xs">
                        <Globe className="size-3.5 text-primary" />
                        Configure Target Webhook Endpoint
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4 pt-0">
                      {whError && (
                        <div className="border border-destructive/20 bg-destructive/10 p-2 text-[10px] text-destructive">
                          {whError}
                        </div>
                      )}
                      <div className="space-y-1">
                        <label
                          className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
                          htmlFor="whUrl"
                        >
                          Destination URL (HTTPS highly recommended)
                        </label>
                        <Input
                          id="whUrl"
                          onChange={(e) => setWhUrl(e.target.value)}
                          placeholder="https://api.yourcustomer.com/webhooks"
                          required
                          type="url"
                          value={whUrl}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label
                            className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
                            htmlFor="whDesc"
                          >
                            Description
                          </label>
                          <Input
                            id="whDesc"
                            onChange={(e) => setWhDesc(e.target.value)}
                            placeholder="Primary alerts receiver"
                            value={whDesc}
                          />
                        </div>
                        <div className="space-y-1">
                          <label
                            className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
                            htmlFor="whRate"
                          >
                            Max Rate Limit (req/sec)
                          </label>
                          <Input
                            id="whRate"
                            onChange={(e) => setWhRateLimit(e.target.value)}
                            placeholder="No limit"
                            type="number"
                            value={whRateLimit}
                          />
                        </div>
                      </div>

                      {/* Event selection checkboxes */}
                      <div className="space-y-1.5 border-border/50 border-t pt-2 dark:border-input/50">
                        <span className="font-mono font-semibold text-[10px] text-muted-foreground uppercase">
                          Subscribe to Event Types:
                        </span>
                        {eventTypes.length === 0 ? (
                          <div className="pl-1 text-[10px] text-muted-foreground italic">
                            No events defined in active application. Define
                            event types first.
                          </div>
                        ) : (
                          <div className="grid max-h-36 grid-cols-2 gap-2 overflow-y-auto border border-border/50 bg-background p-2 dark:border-input/50">
                            {eventTypes.map((et) => (
                              <label
                                className="flex cursor-pointer select-none items-center gap-2 text-xs"
                                key={et.id}
                              >
                                <input
                                  checked={whEvents.includes(et.id)}
                                  className="accent-primary"
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setWhEvents([...whEvents, et.id]);
                                    } else {
                                      setWhEvents(
                                        whEvents.filter((id) => id !== et.id)
                                      );
                                    }
                                  }}
                                  type="checkbox"
                                />
                                <span className="truncate font-mono text-[10px]">
                                  {et.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end p-4 pt-0">
                      <Button
                        disabled={createWhMutation.isPending}
                        size="xs"
                        type="submit"
                      >
                        {createWhMutation.isPending
                          ? "Creating..."
                          : "Save Endpoint"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              )}

              {renderWebhooksList()}
            </div>
          </div>
        ) : (
          <div className="flex h-[50vh] flex-col items-center justify-center border border-border border-dashed p-8 text-center dark:border-input">
            <Users className="mb-4 size-10 stroke-1 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Select a subscriber</h3>
            <p className="mt-1 max-w-sm text-muted-foreground text-xs">
              Click on a subscriber from the left list to manage their webhook
              target URLs and signing secrets.
            </p>
          </div>
        )}
      </div>

      <AlertDialog
        onOpenChange={(open) => !open && setSubToDelete(null)}
        open={!!subToDelete}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscriber</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this subscriber? All endpoints
              will be removed!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (subToDelete) {
                  deleteSubMutation.mutate(subToDelete.id);
                  setSubToDelete(null);
                }
              }}
              variant="destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={(open) => !open && setWhToDelete(null)}
        open={!!whToDelete}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook Endpoint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this webhook endpoint permanently?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (whToDelete) {
                  deleteWhMutation.mutate(whToDelete.id);
                  setWhToDelete(null);
                }
              }}
              variant="destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface WebhookCardProps {
  onDelete: (wh: Webhook) => void;
  onToggleReveal: () => void;
  onToggleStatus: (wh: Webhook) => void;
  revealSecret: boolean;
  wh: Webhook;
}

function WebhookCard({
  wh,
  revealSecret,
  onToggleReveal,
  onToggleStatus,
  onDelete,
}: WebhookCardProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <Card
      className={cn("transition-all", wh.disabled && "bg-muted/20 opacity-75")}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="truncate pr-2">
            <CardTitle className="select-all truncate font-mono font-semibold text-foreground text-xs">
              {wh.url}
            </CardTitle>
            {wh.description && (
              <CardDescription className="mt-0.5 text-[10px]">
                {wh.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              className={cn(
                "font-bold font-mono text-[8px]",
                wh.disabled
                  ? "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20"
                  : "border-green-500/20 bg-green-500/10 text-green-500 hover:bg-green-500/20"
              )}
              onClick={() => onToggleStatus(wh)}
              size="xs"
              variant="ghost"
            >
              {wh.disabled ? "DISABLED" : "ACTIVE"}
            </Button>
            <Button
              className="text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(wh)}
              size="icon-xs"
              variant="ghost"
            >
              <Trash className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-2 pb-3">
        {/* Secret Key Display */}
        <div className="flex items-center justify-between border border-border bg-muted/40 p-2 font-mono text-[10px] dark:border-input">
          <div className="truncate pr-2">
            <span className="mr-1 font-bold text-[8px] text-muted-foreground uppercase">
              Signing Secret:
            </span>
            <span className="select-all text-foreground">
              {revealSecret ? wh.secret : "••••••••••••••••••••••••••••••••"}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              className="text-muted-foreground hover:text-foreground"
              onClick={onToggleReveal}
              size="icon-xs"
              title={revealSecret ? "Hide Secret" : "Reveal Secret"}
              variant="ghost"
            >
              {revealSecret ? (
                <EyeOff className="size-3" />
              ) : (
                <Eye className="size-3" />
              )}
            </Button>
            <Button
              className="text-muted-foreground hover:text-foreground"
              onClick={() => copyToClipboard(wh.secret)}
              size="icon-xs"
              title="Copy Secret"
              variant="ghost"
            >
              <Copy className="size-3" />
            </Button>
          </div>
        </div>

        {/* Rate Limit and Creation date */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] text-muted-foreground">
          <span>
            Max Rate: {wh.rateLimit ? `${wh.rateLimit} req/s` : "No limit"}
          </span>
          <span>•</span>
          <span>Created: {new Date(wh.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Event Tags */}
        <div className="space-y-1 border-border/40 border-t pt-1.5 dark:border-input/40">
          <div className="font-bold font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            Subscribed Event Filters:
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {wh.eventTypes.length === 0 ? (
              <span className="text-[9px] text-muted-foreground italic">
                No events subscribed
              </span>
            ) : (
              wh.eventTypes.map((et) => (
                <span
                  className="border border-primary/10 bg-primary/5 px-1 py-0.5 font-mono text-[9px] text-primary"
                  key={et.id}
                >
                  {et.name}
                </span>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

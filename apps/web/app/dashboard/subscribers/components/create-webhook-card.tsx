"use client";

import { Globe, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import { Input } from "@/web/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/web/components/ui/native-select";
import { hc } from "@/web/lib/api-client";
import { useApplicationsStore } from "../../applications/store";
import { useGetEventTypesList } from "../../event-types/hooks/use-get-event-types-list";
import { useCreateWebhook } from "../hooks/use-create-webhook";
import { useSubscribersStore } from "../store";

interface KeyValueRow {
  id: string;
  key: string;
  value: string;
}

export function CreateWebhookCard() {
  const { activeApp } = useApplicationsStore();
  const appId = activeApp?.id || "";

  // Fetch event types for selection
  const { data: eventTypes = [] } = useGetEventTypesList(appId);

  const { selectedSubscriber, isCreateWebhookOpen, setIsCreateWebhookOpen } =
    useSubscribersStore();

  const subId = selectedSubscriber?.id || "";
  const createWhMutation = useCreateWebhook(subId);

  const [whName, setWhName] = useState("");
  const [whMethod, setWhMethod] = useState<
    "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  >("POST");
  const [whUrl, setWhUrl] = useState("");
  const [whDesc, setWhDesc] = useState("");
  const [whRateLimit, setWhRateLimit] = useState("");
  const [whEvents, setWhEvents] = useState<string[]>([]);
  const [whLabels, setWhLabels] = useState<KeyValueRow[]>([
    { id: "l-init", key: "", value: "" },
  ]);
  const [whHeaders, setWhHeaders] = useState<KeyValueRow[]>([
    { id: "h-init", key: "", value: "" },
  ]);
  const [whMetadata, setWhMetadata] = useState<KeyValueRow[]>([
    { id: "m-init", key: "", value: "" },
  ]);
  const [whError, setWhError] = useState<string | null>(null);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [testingStatus, setTestingStatus] = useState<{
    isLoading: boolean;
    success?: boolean;
    status?: number;
    statusText?: string;
  } | null>(null);

  if (!(isCreateWebhookOpen && selectedSubscriber)) {
    return null;
  }

  const parseKeyValueList = (list: KeyValueRow[]) =>
    list.reduce(
      (acc, item) => {
        if (item.key.trim()) {
          acc[item.key.trim()] = item.value.trim();
        }
        return acc;
      },
      {} as Record<string, string>
    );

  const handleTest = async () => {
    if (!whUrl.trim()) {
      toast.error("Please enter an endpoint URL first to test");
      return;
    }
    setTestingStatus({ isLoading: true });
    try {
      const res = await hc.subscribers[":subscriberId"].webhooks.test.$post({
        param: { subscriberId: subId },
        json: {
          url: whUrl.trim(),
          method: whMethod,
          headers: parseKeyValueList(whHeaders),
        },
      });
      const data = await res.json();
      if (res.ok && (data as any).success) {
        setTestingStatus({
          isLoading: false,
          success: true,
          status: (data as any).status,
          statusText: (data as any).statusText,
        });
        toast.success(`Test succeeded! Status: ${(data as any).status}`);
      } else {
        setTestingStatus({
          isLoading: false,
          success: false,
          status: (data as any).status || res.status,
          statusText: (data as any).statusText || res.statusText,
        });
        toast.error(
          `Test failed: ${(data as any).statusText || "Connection error"}`
        );
      }
    } catch (err: any) {
      setTestingStatus({
        isLoading: false,
        success: false,
        statusText: err.message || "Failed to reach backend",
      });
      toast.error("Failed to execute webhook test call");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setWhError(null);

    if (!whName.trim()) {
      setWhError("Name is required.");
      return;
    }

    if (!whUrl.trim()) {
      setWhError("Endpoint URL is required.");
      return;
    }

    if (whEvents.length === 0) {
      setWhError("Please select at least one event type filter.");
      return;
    }

    createWhMutation.mutate(
      {
        name: whName.trim(),
        method: whMethod,
        url: whUrl.trim(),
        description: whDesc || null,
        rateLimit: whRateLimit ? Number.parseInt(whRateLimit, 10) : null,
        eventTypes: whEvents,
        headers: parseKeyValueList(whHeaders),
        labels: parseKeyValueList(whLabels),
      },
      {
        onSuccess: () => {
          setWhName("");
          setWhMethod("POST");
          setWhUrl("");
          setWhDesc("");
          setWhRateLimit("");
          setWhEvents([]);
          setWhLabels([{ id: Math.random().toString(), key: "", value: "" }]);
          setWhHeaders([{ id: Math.random().toString(), key: "", value: "" }]);
          setWhMetadata([{ id: Math.random().toString(), key: "", value: "" }]);
          setTestingStatus(null);
          setIsCreateWebhookOpen(false);
        },
        onError: (err: any) => {
          setWhError(err.message || "Failed to create endpoint.");
        },
      }
    );
  };

  const renderKeyValueEditor = (
    list: KeyValueRow[],
    setList: React.Dispatch<React.SetStateAction<KeyValueRow[]>>,
    keyPlaceholder = "Key",
    valuePlaceholder = "Value"
  ) => {
    const addRow = () =>
      setList([...list, { id: Math.random().toString(), key: "", value: "" }]);
    const removeRow = (index: number) => {
      if (list.length === 1) {
        setList([{ id: Math.random().toString(), key: "", value: "" }]);
      } else {
        setList(list.filter((_, i) => i !== index));
      }
    };
    const updateRow = (index: number, field: "key" | "value", val: string) => {
      const newList = [...list];
      newList[index][field] = val;
      setList(newList);
    };

    return (
      <div className="space-y-1.5">
        {list.map((row, idx) => (
          <div className="flex items-center gap-1.5" key={row.id}>
            <Input
              className="h-7 flex-1 text-xs"
              onChange={(e) => updateRow(idx, "key", e.target.value)}
              placeholder={keyPlaceholder}
              value={row.key}
            />
            <span className="text-muted-foreground text-xs">=</span>
            <Input
              className="h-7 flex-1 text-xs"
              onChange={(e) => updateRow(idx, "value", e.target.value)}
              placeholder={valuePlaceholder}
              value={row.value}
            />
            <Button
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => removeRow(idx)}
              size="icon-xs"
              type="button"
              variant="outline"
            >
              -
            </Button>
            {idx === list.length - 1 && (
              <Button
                className="h-7 w-7"
                onClick={addRow}
                size="icon-xs"
                type="button"
                variant="outline"
              >
                +
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="fade-in slide-in-from-top-1 animate-in border-primary/20 bg-primary/5 duration-150 dark:bg-primary/5">
      <form onSubmit={handleSubmit}>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="flex items-center gap-1.5 font-semibold text-xs">
            <Globe className="size-3.5 text-primary" />
            Configure Target Webhook Endpoint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0">
          {whError && (
            <div className="border border-destructive/20 bg-destructive/10 p-2 text-[10px] text-destructive">
              {whError}
            </div>
          )}

          {/* Section 1: BASICS */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-bold font-mono text-[9px] text-primary uppercase tracking-wider">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground">
                1
              </span>
              Basics
            </div>

            <div className="space-y-1">
              <label
                className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
                htmlFor="whName"
              >
                Name
              </label>
              <Input
                className="h-7 text-xs"
                id="whName"
                onChange={(e) => setWhName(e.target.value)}
                placeholder="e.g., Order notifications"
                required
                type="text"
                value={whName}
              />
            </div>

            <div className="space-y-1">
              <label
                className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
                htmlFor="whUrl"
              >
                Endpoint URL
              </label>
              <div className="flex gap-2">
                <NativeSelect
                  className="h-7 w-20"
                  onChange={(e) => setWhMethod(e.target.value as any)}
                  size="sm"
                  value={whMethod}
                >
                  <NativeSelectOption value="POST">POST</NativeSelectOption>
                  <NativeSelectOption value="PUT">PUT</NativeSelectOption>
                  <NativeSelectOption value="PATCH">PATCH</NativeSelectOption>
                  <NativeSelectOption value="GET">GET</NativeSelectOption>
                  <NativeSelectOption value="DELETE">DELETE</NativeSelectOption>
                </NativeSelect>
                <Input
                  className="h-7 flex-1 text-xs"
                  id="whUrl"
                  onChange={(e) => setWhUrl(e.target.value)}
                  placeholder="https://api.yourcustomer.com/webhooks"
                  required
                  type="url"
                  value={whUrl}
                />
                <Button
                  className="h-7 text-[10px]"
                  disabled={testingStatus?.isLoading}
                  onClick={handleTest}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {testingStatus?.isLoading ? (
                    <RefreshCw className="mr-1 size-3 animate-spin" />
                  ) : null}
                  Test Endpoint
                </Button>
              </div>
              {testingStatus && !testingStatus.isLoading && (
                <div
                  className={`mt-1.5 flex items-center justify-between border p-1.5 font-mono text-[9px] ${
                    testingStatus.success
                      ? "border-green-500/20 bg-green-500/5 text-green-600"
                      : "border-destructive/20 bg-destructive/5 text-destructive"
                  }`}
                >
                  <span>
                    Status:{" "}
                    <strong>
                      {testingStatus.status} {testingStatus.statusText}
                    </strong>
                  </span>
                  <span>{testingStatus.success ? "SUCCESS" : "FAILED"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: FILTERING */}
          <div className="space-y-3 border-border/40 border-t pt-3 dark:border-input/40">
            <div className="flex items-center gap-1.5 font-bold font-mono text-[9px] text-primary uppercase tracking-wider">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground">
                2
              </span>
              Filtering
            </div>

            {/* Event selection checkboxes */}
            <div className="space-y-1">
              <span className="font-mono font-semibold text-[10px] text-muted-foreground uppercase">
                Subscribe to Event Types:
              </span>
              {eventTypes.length === 0 ? (
                <div className="pl-1 text-[10px] text-muted-foreground italic">
                  No events defined in active application. Define event types
                  first.
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
                            setWhEvents(whEvents.filter((id) => id !== et.id));
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

            {/* Subscription labels */}
            <div className="space-y-1">
              <span className="block font-mono font-semibold text-[10px] text-muted-foreground uppercase">
                Subscription labels (Conditional matching)
              </span>
              {renderKeyValueEditor(
                whLabels,
                setWhLabels,
                "Label key (e.g. user_id)",
                "Value"
              )}
            </div>
          </div>

          {/* Section 3: ADVANCED */}
          <div className="border-border/40 border-t pt-3 dark:border-input/40">
            <button
              className="flex items-center gap-1.5 font-bold font-mono text-[9px] text-primary uppercase tracking-wider focus:outline-none"
              onClick={() => setShowAdvanced(!showAdvanced)}
              type="button"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground">
                3
              </span>
              Advanced {showAdvanced ? "▼" : "▶"}
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 pl-5">
                <div className="space-y-1">
                  <span className="block font-mono font-semibold text-[10px] text-muted-foreground uppercase">
                    Endpoint headers
                  </span>
                  {renderKeyValueEditor(
                    whHeaders,
                    setWhHeaders,
                    "Header name",
                    "Value"
                  )}
                </div>
                <div className="space-y-1">
                  <span className="block font-mono font-semibold text-[10px] text-muted-foreground uppercase">
                    Metadata (Key-value tagging)
                  </span>
                  {renderKeyValueEditor(
                    whMetadata,
                    setWhMetadata,
                    "Metadata key",
                    "Value"
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-3 border-border/40 border-t pt-3 sm:grid-cols-2 dark:border-input/40">
            <div className="space-y-1">
              <label
                className="font-mono font-semibold text-[10px] text-muted-foreground uppercase"
                htmlFor="whDesc"
              >
                Description
              </label>
              <Input
                className="h-7 text-xs"
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
                className="h-7 text-xs"
                id="whRate"
                onChange={(e) => setWhRateLimit(e.target.value)}
                placeholder="No limit"
                type="number"
                value={whRateLimit}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 p-4 pt-0">
          <Button
            onClick={() => setIsCreateWebhookOpen(false)}
            size="xs"
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
          <Button disabled={createWhMutation.isPending} size="xs" type="submit">
            {createWhMutation.isPending ? "Creating..." : "Save Endpoint"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

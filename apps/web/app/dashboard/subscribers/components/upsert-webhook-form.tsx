"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/web/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/web/components/ui/field";
import { Input } from "@/web/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/web/components/ui/native-select";
import { hc } from "@/web/lib/api-client";
import { useApplicationsStore } from "../../applications/store";
import { useGetEventTypesList } from "../../event-types/hooks/use-get-event-types-list";
import { useCreateWebhook } from "../hooks/use-create-webhook";
import { useUpdateWebhook } from "../hooks/use-update-webhook";
import { useSubscribersStore } from "../store";

const webhookSchema = z.object({
  name: z.string().min(1, "Webhook name is required"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  url: z.string().url("Must be a valid HTTP/HTTPS URL"),
  description: z.string().optional(),
  rateLimit: z.string().optional().nullable(),
  eventTypes: z
    .array(z.string())
    .min(1, "Please select at least one event type"),
});

type WebhookValues = z.infer<typeof webhookSchema>;

interface KeyValueRow {
  id: string;
  key: string;
  value: string;
}

export function UpsertWebhookForm() {
  const { activeApp } = useApplicationsStore();
  const appId = activeApp?.id || "";

  // Fetch event types for selection
  const { data: eventTypes = [] } = useGetEventTypesList(appId);

  const {
    selectedSubscriber,
    selectedWebhook,
    webhookMutationType,
    setIsUpsertWebhookDialogOpen,
  } = useSubscribersStore();

  const subId = selectedSubscriber?.id || "";
  const isEdit = webhookMutationType === "edit";

  const createMutation = useCreateWebhook(subId);
  const updateMutation = useUpdateWebhook(subId);

  const [whLabels, setWhLabels] = useState<KeyValueRow[]>([
    { id: "l-init", key: "", value: "" },
  ]);
  const [whHeaders, setWhHeaders] = useState<KeyValueRow[]>([
    { id: "h-init", key: "", value: "" },
  ]);
  const [whMetadata, setWhMetadata] = useState<KeyValueRow[]>([
    { id: "m-init", key: "", value: "" },
  ]);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [testingStatus, setTestingStatus] = useState<{
    isLoading: boolean;
    success?: boolean;
    status?: number;
    statusText?: string;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<WebhookValues>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      name: "",
      method: "POST",
      url: "",
      description: "",
      rateLimit: "",
      eventTypes: [],
    },
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (isEdit && selectedWebhook) {
      form.reset({
        name: selectedWebhook.name,
        method: selectedWebhook.method as any,
        url: selectedWebhook.url,
        description: selectedWebhook.description || "",
        rateLimit: selectedWebhook.rateLimit
          ? String(selectedWebhook.rateLimit)
          : "",
        eventTypes: selectedWebhook.eventTypes.map((et) => et.id),
      });

      const labelsList = Object.entries(selectedWebhook.labels || {}).map(
        ([k, v]) => ({
          id: crypto.randomUUID(),
          key: k,
          value: String(v),
        })
      );
      setWhLabels(
        labelsList.length > 0
          ? labelsList
          : [{ id: "l-init", key: "", value: "" }]
      );

      const headersList = Object.entries(selectedWebhook.headers || {}).map(
        ([k, v]) => ({
          id: crypto.randomUUID(),
          key: k,
          value: String(v),
        })
      );
      setWhHeaders(
        headersList.length > 0
          ? headersList
          : [{ id: "h-init", key: "", value: "" }]
      );

      const metaList = Object.entries(selectedWebhook.metadata || {}).map(
        ([k, v]) => ({
          id: crypto.randomUUID(),
          key: k,
          value: String(v),
        })
      );
      setWhMetadata(
        metaList.length > 0 ? metaList : [{ id: "m-init", key: "", value: "" }]
      );
    } else {
      form.reset({
        name: "",
        method: "POST",
        url: "",
        description: "",
        rateLimit: "",
        eventTypes: [],
      });
      setWhLabels([{ id: "l-init", key: "", value: "" }]);
      setWhHeaders([{ id: "h-init", key: "", value: "" }]);
      setWhMetadata([{ id: "m-init", key: "", value: "" }]);
    }
    setTestingStatus(null);
    setFormError(null);
  }, [isEdit, selectedWebhook, form]);

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
    const whUrl = form.getValues("url");
    const whMethod = form.getValues("method");

    if (!whUrl?.trim()) {
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

  const onSubmit = (values: WebhookValues) => {
    setFormError(null);

    const headersObj = parseKeyValueList(whHeaders);
    const labelsObj = parseKeyValueList(whLabels);

    if (isEdit && selectedWebhook) {
      updateMutation.mutate(
        {
          id: selectedWebhook.id,
          payload: {
            name: values.name.trim(),
            method: values.method,
            url: values.url.trim(),
            description: values.description || null,
            rateLimit: values.rateLimit ? Number(values.rateLimit) : null,
            eventTypes: values.eventTypes,
            headers: headersObj,
            labels: labelsObj,
          },
        },
        {
          onSuccess: () => {
            setIsUpsertWebhookDialogOpen(false);
            form.reset();
          },
          onError: (err: any) => {
            setFormError(err.message || "Failed to update endpoint.");
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          name: values.name.trim(),
          method: values.method,
          url: values.url.trim(),
          description: values.description || null,
          rateLimit: values.rateLimit ? Number(values.rateLimit) : null,
          eventTypes: values.eventTypes,
          headers: headersObj,
          labels: labelsObj,
        },
        {
          onSuccess: () => {
            setIsUpsertWebhookDialogOpen(false);
            form.reset();
          },
          onError: (err: any) => {
            setFormError(err.message || "Failed to create endpoint.");
          },
        }
      );
    }
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

  const isPending = createMutation.isPending || updateMutation.isPending;
  const displayError =
    formError ||
    (createMutation.error || (updateMutation.error as any))?.message;

  let submitButtonText = "Save Endpoint";
  if (isPending) {
    submitButtonText = "Saving...";
  } else if (isEdit) {
    submitButtonText = "Save Changes";
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      {displayError && (
        <div className="border border-destructive/20 bg-destructive/10 p-2.5 text-[10px] text-destructive">
          {displayError}
        </div>
      )}

      <div className="space-y-4">
        {/* BASICS SECTION */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 font-bold font-mono text-[9px] text-primary uppercase tracking-wider">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground">
              1
            </span>
            Basics
          </div>

          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  className="h-7 text-xs"
                  disabled={isPending}
                  id={field.name}
                  placeholder="e.g. Order notifications"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="flex items-end gap-2">
            <div className="w-20 shrink-0">
              <Controller
                control={form.control}
                name="method"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Method</FieldLabel>
                    <NativeSelect
                      {...field}
                      className="h-7 w-full"
                      id={field.name}
                      size="sm"
                    >
                      <NativeSelectOption value="POST">POST</NativeSelectOption>
                      <NativeSelectOption value="PUT">PUT</NativeSelectOption>
                      <NativeSelectOption value="PATCH">
                        PATCH
                      </NativeSelectOption>
                      <NativeSelectOption value="GET">GET</NativeSelectOption>
                      <NativeSelectOption value="DELETE">
                        DELETE
                      </NativeSelectOption>
                    </NativeSelect>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <div className="flex-1">
              <Controller
                control={form.control}
                name="url"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Endpoint URL</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      className="h-7 text-xs"
                      disabled={isPending}
                      id={field.name}
                      placeholder="https://api.yourcustomer.com/webhooks"
                      type="url"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
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
              Test
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

        {/* FILTERING SECTION */}
        <div className="space-y-3 border-border/40 border-t pt-3 dark:border-input/40">
          <div className="flex items-center gap-1.5 font-bold font-mono text-[9px] text-primary uppercase tracking-wider">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground">
              2
            </span>
            Filtering
          </div>

          <Controller
            control={form.control}
            name="eventTypes"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Subscribe to Event Types</FieldLabel>
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
                          checked={field.value?.includes(et.id)}
                          className="accent-primary"
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const currentVal = field.value || [];
                            if (checked) {
                              field.onChange([...currentVal, et.id]);
                            } else {
                              field.onChange(
                                currentVal.filter((id) => id !== et.id)
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
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

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

        {/* ADVANCED SECTION */}
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

        {/* OTHERS (DESCRIPTION & RATE LIMIT) */}
        <div className="grid gap-3 border-border/40 border-t pt-3 sm:grid-cols-2 dark:border-input/40">
          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  className="h-7 text-xs"
                  disabled={isPending}
                  id={field.name}
                  placeholder="Primary alerts receiver"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="rateLimit"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Max Rate Limit (req/sec)
                </FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  className="h-7 text-xs"
                  disabled={isPending}
                  id={field.name}
                  placeholder="No limit"
                  type="number"
                  value={field.value ?? ""}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          disabled={isPending}
          onClick={() => setIsUpsertWebhookDialogOpen(false)}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
        <Button disabled={isPending} type="submit">
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
}

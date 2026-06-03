"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/web/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/web/components/ui/field";
import { Input } from "@/web/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/web/components/ui/select";
import { useApplicationsStore } from "../../applications/store";
import { useCreateSubscriber } from "../_hooks/use-create-subscriber";
import { useUpdateSubscriber } from "../_hooks/use-update-subscriber";
import { useSubscribersStore } from "../store";
import {
  getDefaultValueForType,
  getMetadataStringValue,
  getMetadataType,
  type MetadataItem,
  parseMetadataItems,
} from "../utils";

const subscriberSchema = z.object({
  referenceId: z.string().min(1, "Reference ID is required"),
  email: z
    .string()
    .email("Must be a valid email address")
    .min(1, "Notification email is required"),
});

type SubscriberValues = z.infer<typeof subscriberSchema>;

interface MetadataItemRowProps {
  idx: number;
  isPending: boolean;
  item: MetadataItem;
  onKeyChange: (idx: number, val: string) => void;
  onRemove: (id: string) => void;
  onTypeChange: (
    idx: number,
    type: "string" | "number" | "boolean" | "object" | "array"
  ) => void;
  onValueChange: (idx: number, val: string) => void;
}

function MetadataItemRow({
  item,
  idx,
  isPending,
  onKeyChange,
  onValueChange,
  onTypeChange,
  onRemove,
}: MetadataItemRowProps) {
  const getPlaceholder = (type: string) => {
    if (type === "object") {
      return '{"key": "value"}';
    }
    if (type === "array") {
      return "[1, 2, 3]";
    }
    if (type === "number") {
      return "0";
    }
    return "Value";
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        className="h-7 flex-1 px-2 font-mono text-xs"
        disabled={isPending}
        onChange={(e) => onKeyChange(idx, e.target.value)}
        placeholder="Key"
        required
        value={item.key}
      />

      {item.type === "boolean" ? (
        <Select
          disabled={isPending}
          onValueChange={(val) => onValueChange(idx, val || "false")}
          value={item.value || "false"}
        >
          <SelectTrigger className="h-7 flex-1 font-mono text-xs" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="false">false</SelectItem>
            <SelectItem value="true">true</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <Input
          className="h-7 flex-1 px-2 font-mono text-xs"
          disabled={isPending}
          onChange={(e) => onValueChange(idx, e.target.value)}
          placeholder={getPlaceholder(item.type)}
          required
          type={item.type === "number" ? "number" : "text"}
          value={item.value}
        />
      )}

      <Select
        disabled={isPending}
        onValueChange={(val) => {
          if (!val) {
            return;
          }
          onTypeChange(
            idx,
            val as "string" | "number" | "boolean" | "object" | "array"
          );
        }}
        value={item.type}
      >
        <SelectTrigger
          className="h-7 w-24 shrink-0 font-mono text-[10px]"
          size="sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="string">String</SelectItem>
          <SelectItem value="number">Number</SelectItem>
          <SelectItem value="boolean">Boolean</SelectItem>
          <SelectItem value="object">Object</SelectItem>
          <SelectItem value="array">Array</SelectItem>
        </SelectContent>
      </Select>

      <Button
        className="shrink-0 text-muted-foreground hover:text-destructive"
        disabled={isPending}
        onClick={() => onRemove(item.id)}
        size="icon-xs"
        type="button"
        variant="ghost"
      >
        <Trash className="size-3.5" />
      </Button>
    </div>
  );
}

export function UpsertSubscriberForm() {
  const { activeApp } = useApplicationsStore();
  const appId = activeApp?.id || "";

  const {
    selectedSubscriber,
    setSelectedSubscriber,
    subscriberMutationType,
    setIsUpsertSubscriberDialogOpen,
  } = useSubscribersStore();

  const isEdit = subscriberMutationType === "edit";

  const createMutation = useCreateSubscriber(appId);
  const updateMutation = useUpdateSubscriber(appId);

  const [metadataItems, setMetadataItems] = useState<MetadataItem[]>([]);
  const [subError, setSubError] = useState<string | null>(null);

  const form = useForm<SubscriberValues>({
    resolver: zodResolver(subscriberSchema),
    defaultValues: {
      referenceId: "",
      email: "",
    },
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (isEdit && selectedSubscriber) {
      form.reset({
        referenceId: selectedSubscriber.referenceId,
        email: selectedSubscriber.email,
      });

      const parsedMeta = selectedSubscriber.metadata || {};
      const items = Object.entries(parsedMeta).map(([k, v]) => {
        const type = getMetadataType(v);
        return {
          id: crypto.randomUUID(),
          key: k,
          value: getMetadataStringValue(v, type),
          type,
        };
      });
      setMetadataItems(items);
    } else {
      form.reset({
        referenceId: "",
        email: "",
      });
      setMetadataItems([]);
    }
    setSubError(null);
  }, [isEdit, selectedSubscriber, form]);

  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;
  const displayError = subError || (mutationError as any)?.message;

  const onSubmit = (values: SubscriberValues) => {
    setSubError(null);

    const { data: metadataObj, error: parseError } =
      parseMetadataItems(metadataItems);
    if (parseError) {
      setSubError(parseError);
      return;
    }

    if (isEdit && selectedSubscriber) {
      updateMutation.mutate(
        {
          id: selectedSubscriber.id,
          payload: {
            referenceId: values.referenceId.trim(),
            email: values.email.trim(),
            metadata: metadataObj,
          },
        },
        {
          onSuccess: (updatedSub) => {
            setSelectedSubscriber(updatedSub);
            setIsUpsertSubscriberDialogOpen(false);
            form.reset();
          },
          onError: (err: any) => {
            setSubError(err.message || "Failed to update subscriber.");
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          referenceId: values.referenceId.trim(),
          email: values.email.trim(),
          metadata: metadataObj,
        },
        {
          onSuccess: (newSub) => {
            setSelectedSubscriber(newSub);
            setIsUpsertSubscriberDialogOpen(false);
            form.reset();
          },
          onError: (err: any) => {
            setSubError(err.message || "Failed to create subscriber.");
          },
        }
      );
    }
  };

  let buttonText = "Add Subscriber";
  if (isPending) {
    buttonText = "Saving...";
  } else if (isEdit) {
    buttonText = "Save Changes";
  }

  const addMetadataField = () => {
    setMetadataItems([
      ...metadataItems,
      {
        id: crypto.randomUUID(),
        key: "",
        value: "",
        type: "string",
      },
    ]);
  };

  const handleKeyChange = (idx: number, val: string) => {
    const newItems = [...metadataItems];
    newItems[idx].key = val;
    setMetadataItems(newItems);
  };

  const handleValueChange = (idx: number, val: string) => {
    const newItems = [...metadataItems];
    newItems[idx].value = val;
    setMetadataItems(newItems);
  };

  const handleTypeChange = (
    idx: number,
    type: "string" | "number" | "boolean" | "object" | "array"
  ) => {
    const newItems = [...metadataItems];
    newItems[idx].type = type;
    newItems[idx].value = getDefaultValueForType(type);
    setMetadataItems(newItems);
  };

  const handleRemoveItem = (id: string) => {
    setMetadataItems(metadataItems.filter((it) => it.id !== id));
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      {displayError && (
        <div className="border border-destructive/20 bg-destructive/10 p-2.5 text-[10px] text-destructive">
          {displayError}
        </div>
      )}
      <div className="space-y-3">
        <Controller
          control={form.control}
          name="referenceId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Reference ID (unique key)
              </FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                className="h-7 text-xs"
                disabled={isPending}
                id={field.name}
                placeholder="e.g. user_1028"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Notification Email</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                className="h-7 text-xs"
                disabled={isPending}
                id={field.name}
                placeholder="e.g. user@customer.com"
                type="email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Dynamic Key-Value Metadata Editor */}
        <div className="space-y-2 border-border/50 border-t pt-3 dark:border-input/50">
          <div className="flex items-center justify-between">
            <span className="font-mono font-semibold text-[10px] text-muted-foreground uppercase">
              Metadata context
            </span>
            <Button
              onClick={addMetadataField}
              size="xs"
              type="button"
              variant="outline"
            >
              Add Property
            </Button>
          </div>

          {metadataItems.length === 0 ? (
            <p className="py-2 font-mono text-[10px] text-muted-foreground italic">
              No metadata properties added.
            </p>
          ) : (
            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
              {metadataItems.map((item, idx) => (
                <MetadataItemRow
                  idx={idx}
                  isPending={isPending}
                  item={item}
                  key={item.id}
                  onKeyChange={handleKeyChange}
                  onRemove={handleRemoveItem}
                  onTypeChange={handleTypeChange}
                  onValueChange={handleValueChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          disabled={isPending}
          onClick={() => setIsUpsertSubscriberDialogOpen(false)}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
        <Button disabled={isPending} type="submit">
          {buttonText}
        </Button>
      </div>
    </form>
  );
}

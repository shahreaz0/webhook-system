"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/web/components/ui/button";
import { Checkbox } from "@/web/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/web/components/ui/field";
import { Input } from "@/web/components/ui/input";
import { useApplicationsStore } from "../../applications/store";
import { useCreateEventType } from "../hooks/use-create-event-type";
import { useUpdateEventType } from "../hooks/use-update-event-type";
import { useEventTypesStore } from "../store";

const eventTypeSchema = z.object({
  name: z
    .string()
    .min(1, "Event type name is required")
    .regex(/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/, {
      message:
        "Name must follow the format service.resource.verb (e.g. iam.user.created)",
    }),
  description: z.string().optional(),
  groupName: z.string().optional(),
  archived: z.boolean().optional(),
  deprecated: z.boolean().optional(),
});

type EventTypeValues = z.infer<typeof eventTypeSchema>;

export function UpsertEventTypeForm() {
  const { activeApp } = useApplicationsStore();
  const {
    selectedEventType,
    eventTypeMutationType,
    setIsUpsertEventTypeDialogOpen,
  } = useEventTypesStore();

  const appId = activeApp?.id || "";

  const createMutation = useCreateEventType(appId);
  const updateMutation = useUpdateEventType(appId);

  const isEdit = eventTypeMutationType === "edit";

  const form = useForm<EventTypeValues>({
    resolver: zodResolver(eventTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      groupName: "",
      archived: false,
      deprecated: false,
    },
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (isEdit && selectedEventType) {
      form.reset({
        name: selectedEventType.name,
        description: selectedEventType.description || "",
        groupName: selectedEventType.groupName || "",
        archived: selectedEventType.archived,
        deprecated: selectedEventType.deprecated,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        groupName: "",
        archived: false,
        deprecated: false,
      });
    }
  }, [isEdit, selectedEventType, form]);

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  function onSubmit(values: EventTypeValues) {
    if (isEdit && selectedEventType) {
      updateMutation.mutate(
        {
          id: selectedEventType.id,
          name: values.name,
          description: values.description || "",
          groupName: values.groupName || "",
          archived: values.archived,
          deprecated: values.deprecated,
        },
        {
          onSuccess: () => {
            setIsUpsertEventTypeDialogOpen(false);
            form.reset();
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          name: values.name,
          description: values.description || "",
          groupName: values.groupName || "",
          archived: values.archived,
          deprecated: values.deprecated,
        },
        {
          onSuccess: () => {
            setIsUpsertEventTypeDialogOpen(false);
            form.reset();
          },
        }
      );
    }
  }

  let buttonContent: React.ReactNode;
  if (isPending) {
    buttonContent = (
      <span className="flex items-center gap-2">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />{" "}
        SAVING...
      </span>
    );
  } else if (isEdit) {
    buttonContent = "Save Changes";
  } else {
    buttonContent = "Save Event Type";
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      {error && (
        <div className="flex items-center gap-2 border border-destructive/20 bg-destructive/10 p-3 text-destructive text-xs">
          <span className="font-semibold">Error:</span>
          <span>{(error as any)?.message || "Failed to save event type."}</span>
        </div>
      )}
      <div className="space-y-4">
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Event Trigger Name</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                disabled={isPending}
                id={field.name}
                placeholder="e.g. iam.user.created"
              />
              <FieldDescription>
                Follow service.resource.verb convention using dot notation.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="groupName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Category Group</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                disabled={isPending}
                id={field.name}
                placeholder="e.g. Users, Billing"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                disabled={isPending}
                id={field.name}
                placeholder="e.g. Triggered when a new user is created"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {isEdit && (
          <div className="grid grid-cols-2 gap-4 border-border/50 border-t pt-4 dark:border-input/50">
            <Controller
              control={form.control}
              name="deprecated"
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  orientation="horizontal"
                >
                  <Checkbox
                    checked={field.value}
                    disabled={isPending}
                    id={field.name}
                    onCheckedChange={field.onChange}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>Deprecated</FieldLabel>
                    <FieldDescription>
                      Mark this event type as deprecated.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="archived"
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  orientation="horizontal"
                >
                  <Checkbox
                    checked={field.value}
                    disabled={isPending}
                    id={field.name}
                    onCheckedChange={field.onChange}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>Archived</FieldLabel>
                    <FieldDescription>
                      Archive this event type.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              )}
            />
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button
          disabled={isPending}
          onClick={() => setIsUpsertEventTypeDialogOpen(false)}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
        <Button disabled={isPending} type="submit">
          {buttonContent}
        </Button>
      </div>
    </form>
  );
}

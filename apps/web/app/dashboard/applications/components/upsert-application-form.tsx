"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/web/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/web/components/ui/field";
import { Input } from "@/web/components/ui/input";
import { useCreateApplication } from "../hooks/use-create-application";
import { useUpdateApplication } from "../hooks/use-update-application";
import { useApplicationsStore } from "../store";

const applicationSchema = z.object({
  name: z.string().min(1, "Application name is required"),
  description: z.string().optional(),
});

type ApplicationValues = z.infer<typeof applicationSchema>;

export function UpsertApplicationForm() {
  const {
    selectedApplication,
    applicationMutationType,
    setIsUpsertApplicationDialogOpen,
  } = useApplicationsStore();
  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication();

  const isEdit = applicationMutationType === "edit";

  const form = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (isEdit && selectedApplication) {
      form.reset({
        name: selectedApplication.name,
        description: selectedApplication.description || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [isEdit, selectedApplication, form]);

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  function onSubmit(values: ApplicationValues) {
    if (isEdit && selectedApplication) {
      updateMutation.mutate(
        {
          id: selectedApplication.id,
          name: values.name,
          description: values.description || "",
        },
        {
          onSuccess: () => {
            setIsUpsertApplicationDialogOpen(false);
            form.reset();
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          name: values.name,
          description: values.description || "",
        },
        {
          onSuccess: () => {
            setIsUpsertApplicationDialogOpen(false);
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
    buttonContent = "Save Application";
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      {error && (
        <div className="flex items-center gap-2 border border-destructive/20 bg-destructive/10 p-3 text-destructive text-xs">
          <span className="font-semibold">Error:</span>
          <span>
            {(error as any)?.message || "Failed to save application."}
          </span>
        </div>
      )}
      <div className="space-y-4">
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Application Name</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                disabled={isPending}
                id={field.name}
                placeholder="e.g. Stripe Sync Platform"
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
                placeholder="e.g. Syncs transactions and card charges"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button
          disabled={isPending}
          onClick={() => setIsUpsertApplicationDialogOpen(false)}
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

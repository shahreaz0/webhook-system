"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/web/components/ui/field";
import { Input } from "@/web/components/ui/input";
import { useCreateApplication } from "../hooks/use-create-application";

const applicationSchema = z.object({
  name: z.string().min(1, "Application name is required"),
  description: z.string().optional(),
});

type ApplicationValues = z.infer<typeof applicationSchema>;

export function CreateApplicationForm() {
  const createMutation = useCreateApplication();

  const form = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onSubmit(values: ApplicationValues) {
    createMutation.mutate(
      {
        name: values.name,
        description: values.description || "",
      },
      {
        onSuccess: () => {
          form.reset();
        },
      }
    );
  }

  return (
    <Card className="fade-in slide-in-from-top-2 animate-in border-primary/20 bg-primary/5 duration-200 dark:bg-primary/5">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 font-semibold text-sm">
            <Sparkles className="size-4 text-primary" />
            Configure New Application Space
          </CardTitle>
          <CardDescription>
            Define a name and description for your integration module.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {createMutation.error && (
            <div className="flex items-center gap-2 border border-destructive/20 bg-destructive/10 p-3 text-destructive text-xs">
              <span className="font-semibold">Error:</span>
              <span>
                {(createMutation.error as any)?.message ||
                  "Failed to create application."}
              </span>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Application Name</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    disabled={createMutation.isPending}
                    id={field.name}
                    placeholder="e.g. Stripe Sync Platform"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                    disabled={createMutation.isPending}
                    id={field.name}
                    placeholder="e.g. Syncs transactions and card charges"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button disabled={createMutation.isPending} type="submit">
            {createMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />{" "}
                CREATING...
              </span>
            ) : (
              "Save Application"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

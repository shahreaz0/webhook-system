"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Mail, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useRegister } from "../hooks/use-register";

const registerSchema = z.object({
  name: z.string().optional(),
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { mutate, isPending, error, isSuccess } = useRegister();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: RegisterValues) => {
    mutate(values, {
      onSuccess: () => {
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      },
    });
  };

  return (
    <Card className="w-full max-w-md border-border bg-card/60 backdrop-blur-md">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle className="text-lg">Get started</CardTitle>
          <CardDescription>
            Register with your email and password to begin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 border border-destructive/20 bg-destructive/10 p-3 text-destructive text-xs">
              <span className="font-semibold">Error:</span>
              <span>
                {(error as any)?.message ||
                  "Registration failed. Email may already be in use."}
              </span>
            </div>
          )}

          {isSuccess && (
            <div className="flex items-center gap-2 border border-green-500/20 bg-green-500/10 p-3 text-green-500 text-xs">
              <span className="font-semibold">Success!</span>
              <span>Account registered successfully. Redirecting...</span>
            </div>
          )}

          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  className="items-center gap-1.5"
                  htmlFor={field.name}
                >
                  <User className="size-3 text-muted-foreground" />
                  Full Name
                </FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  disabled={isPending || isSuccess}
                  id={field.name}
                  placeholder="Ada Lovelace"
                  type="text"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  className="items-center gap-1.5"
                  htmlFor={field.name}
                >
                  <Mail className="size-3 text-muted-foreground" />
                  Email Address
                </FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  disabled={isPending || isSuccess}
                  id={field.name}
                  placeholder="developer@example.com"
                  type="email"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  className="items-center gap-1.5"
                  htmlFor={field.name}
                >
                  <KeyRound className="size-3 text-muted-foreground" />
                  Password (min 6 chars)
                </FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  disabled={isPending || isSuccess}
                  id={field.name}
                  placeholder="••••••••"
                  type="password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            className="relative h-9 w-full overflow-hidden font-semibold text-xs tracking-wide"
            disabled={isPending || isSuccess}
            type="submit"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />{" "}
                CREATING ACCOUNT...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <Sparkles className="size-3.5" />
                REGISTER
              </span>
            )}
          </Button>

          <div className="text-center text-muted-foreground text-xs">
            Already have an account?{" "}
            <Link
              className="font-semibold text-primary hover:underline"
              href="/signin"
            >
              Sign In
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

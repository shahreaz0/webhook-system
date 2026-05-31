"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Mail, Sparkles } from "lucide-react";
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
import { useSignIn } from "../hooks/use-signin";

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const router = useRouter();
  const { mutate, isPending, error } = useSignIn();

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: SignInValues) => {
    mutate(values, {
      onSuccess: () => {
        router.push("/dashboard");
      },
    });
  };

  return (
    <Card className="w-full max-w-md border-border bg-card/60 backdrop-blur-md">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle className="text-lg">Welcome back</CardTitle>
          <CardDescription>
            Enter your developer credentials below to access the console.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 border border-destructive/20 bg-destructive/10 p-3 text-destructive text-xs">
              <span className="font-semibold">Error:</span>
              <span>
                {(error as any)?.message || "Invalid email or password"}
              </span>
            </div>
          )}

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
                  disabled={isPending}
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
                  Password
                </FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  disabled={isPending}
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
            disabled={isPending}
            type="submit"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />{" "}
                AUTHENTICATING...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <Sparkles className="size-3.5" />
                SIGN IN
              </span>
            )}
          </Button>

          <div className="text-center text-muted-foreground text-xs">
            Don&apos;t have an account?{" "}
            <Link
              className="font-semibold text-primary hover:underline"
              href="/register"
            >
              Register
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

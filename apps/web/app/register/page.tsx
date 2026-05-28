"use client";

import { KeyRound, Mail, Sparkles, Terminal, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/fetch-client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.register({ name, email, password });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(
        err.message || "Registration failed. Email may already be in use."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-primary/10 opacity-30 blur-3xl" />

      {/* Brand logo/title */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 border border-primary/20 bg-primary/5 px-3 py-1 font-medium text-primary text-xs shadow-xs backdrop-blur-xs">
          <Terminal className="size-3.5" />
          <span>WEBHOOK GATEWAY PORTAL</span>
        </div>
        <h1 className="mt-3 font-bold text-2xl tracking-tight md:text-3xl">
          Create an account
        </h1>
        <p className="mt-1.5 text-muted-foreground text-xs">
          Start building your real-time webhook infrastructure.
        </p>
      </div>

      <Card className="w-full max-w-md border-border bg-card/60 backdrop-blur-md">
        <form onSubmit={handleSubmit}>
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
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 border border-green-500/20 bg-green-500/10 p-3 text-green-500 text-xs">
                <span className="font-semibold">Success!</span>
                <span>Account registered successfully. Redirecting...</span>
              </div>
            )}

            <div className="space-y-2">
              <label
                className="flex items-center gap-1.5 font-semibold text-foreground/80 text-xs"
                htmlFor="name"
              >
                <User className="size-3 text-muted-foreground" />
                Full Name
              </label>
              <Input
                disabled={loading || success}
                id="name"
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                value={name}
              />
            </div>

            <div className="space-y-2">
              <label
                className="flex items-center gap-1.5 font-semibold text-foreground/80 text-xs"
                htmlFor="email"
              >
                <Mail className="size-3 text-muted-foreground" />
                Email Address
              </label>
              <Input
                disabled={loading || success}
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div className="space-y-2">
              <label
                className="flex items-center gap-1.5 font-semibold text-foreground/80 text-xs"
                htmlFor="password"
              >
                <KeyRound className="size-3 text-muted-foreground" />
                Password (min 6 chars)
              </label>
              <Input
                disabled={loading || success}
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                type="password"
                value={password}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              className="relative h-9 w-full overflow-hidden font-semibold text-xs tracking-wide"
              disabled={loading || success}
              type="submit"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  CREATING ACCOUNT...{" "}
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
                href="/login"
              >
                Sign In
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

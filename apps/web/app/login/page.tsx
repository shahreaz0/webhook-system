"use client";

import { KeyRound, Mail, Sparkles, Terminal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If already logged in, skip login page
    const user = apiClient.getCurrentUser();
    if (user) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.login({ email, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.message || "Something went wrong. Please check your credentials."
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
          Sign in to your account
        </h1>
        <p className="mt-1.5 text-muted-foreground text-xs">
          Manage subscriptions, endpoints, and event deliveries.
        </p>
      </div>

      <Card className="w-full max-w-md border-border bg-card/60 backdrop-blur-md">
        <form onSubmit={handleSubmit}>
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
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label
                className="flex items-center gap-1.5 font-semibold text-foreground/80 text-xs"
                htmlFor="email"
              >
                <Mail className="size-3 text-muted-foreground" />
                Email Address
              </label>
              <Input
                disabled={loading}
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
                Password
              </label>
              <Input
                disabled={loading}
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
              disabled={loading}
              type="submit"
            >
              {loading ? (
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

      {/* Demo Credentials Helper */}
      <div className="mt-6 w-full max-w-md border border-border bg-muted/40 p-3 text-center backdrop-blur-xs">
        <p className="text-[10px] text-muted-foreground leading-normal">
          <span className="font-semibold text-foreground">
            Offline Demo Mode Available:
          </span>{" "}
          Log in with{" "}
          <span className="font-mono font-semibold text-primary">
            demo@webhook.dev
          </span>{" "}
          & password{" "}
          <span className="font-mono font-semibold text-primary">112233</span>{" "}
          (or sign up with a new email) to explore the interface directly.
        </p>
      </div>
    </div>
  );
}

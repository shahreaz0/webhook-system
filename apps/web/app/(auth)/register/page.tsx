"use client";

import { Terminal } from "lucide-react";
import { RegisterForm } from "./components/register-form";

export default function RegisterPage() {
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

      <RegisterForm />
    </div>
  );
}

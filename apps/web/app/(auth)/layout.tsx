export default function AuthLayout({ children }: Readonly<LayoutProps<"/">>) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-primary/10 opacity-30 blur-3xl" />

      {children}
    </div>
  );
}

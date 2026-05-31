export function DemoHelper() {
  return (
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
        <span className="font-mono font-semibold text-primary">112233</span> (or
        sign up with a new email) to explore the interface directly.
      </p>
    </div>
  );
}

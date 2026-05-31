import { Terminal } from "lucide-react";

interface AuthHeaderProps {
  description: string;
  title: string;
}

export function AuthHeader({ title, description }: AuthHeaderProps) {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <div className="flex items-center gap-2 border border-primary/20 bg-primary/5 px-3 py-1 font-medium text-primary text-xs shadow-xs backdrop-blur-xs">
        <Terminal className="size-3.5" />
        <span>WEBHOOK GATEWAY PORTAL</span>
      </div>
      <h1 className="mt-3 font-bold text-2xl tracking-tight md:text-3xl">
        {title}
      </h1>
      <p className="mt-1.5 text-muted-foreground text-xs">{description}</p>
    </div>
  );
}

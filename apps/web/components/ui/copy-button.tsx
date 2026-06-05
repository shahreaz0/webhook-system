"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/web/components/ui/button";
import { cn } from "@/web/lib/utils";

interface CopyButtonProps {
  value: string;
  successMessage?: string;
  title?: string;
  className?: string;
}

export function CopyButton({
  value,
  successMessage = "Copied!",
  title = "Copy to clipboard",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Button
      className={cn(
        "h-4 w-4 text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
      onClick={handleCopy}
      size="icon-xs"
      title={title}
      variant="ghost"
      type="button"
    >
      {copied ? (
        <Check className="size-2.5 text-green-500 animate-in fade-in zoom-in-50 duration-200" />
      ) : (
        <Copy className="size-2.5" />
      )}
    </Button>
  );
}

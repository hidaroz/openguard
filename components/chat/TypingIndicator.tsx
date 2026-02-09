"use client";

import { Shield } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-message-in">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Shield className="w-4 h-4 text-primary" />
      </div>
      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce-dot" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce-dot-delay-1" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce-dot-delay-2" />
        </div>
      </div>
    </div>
  );
}

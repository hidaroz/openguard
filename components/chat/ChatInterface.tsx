"use client";

import { useRef, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import type { Message } from "@/types/database";

interface ChatInterfaceProps {
  interviewId: string;
  initialMessages?: Message[];
  isCompleted?: boolean;
  onComplete?: () => void;
}

export function ChatInterface({
  interviewId,
  initialMessages = [],
  isCompleted = false,
  onComplete,
}: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { interviewId },
    }),
    messages: initialMessages.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      parts: [{ type: "text" as const, text: m.content }],
    })),
    onFinish: ({ message }) => {
      // Check if the interview is complete (AI signals completion)
      const text = message.parts
        .map((p) => (p.type === "text" ? p.text : ""))
        .join("");
      if (
        text.includes("[INTERVIEW_COMPLETE]") ||
        text.includes("policy is now ready")
      ) {
        onComplete?.();
      }
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !isCompleted) {
      sendMessage({ text: input });
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Helper to get text content from a message
  const getMessageText = (message: typeof messages[0]) => {
    return message.parts
      .map((p) => (p.type === "text" ? p.text : ""))
      .join("")
      .replace("[INTERVIEW_COMPLETE]", "");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <ScrollArea ref={scrollRef} className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Starting your security assessment...
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                role={message.role as "user" | "assistant"}
                content={getMessageText(message)}
                isStreaming={
                  isLoading &&
                  index === messages.length - 1 &&
                  message.role === "assistant"
                }
              />
            ))
          )}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <TypingIndicator />
          )}
        </div>
      </ScrollArea>

      {/* Error display */}
      {error && (
        <div className="px-6 py-3 bg-destructive/10 border-t border-destructive/20">
          <p className="text-sm text-destructive text-center">
            {error.message?.includes("429") || error.message?.includes("Too many requests")
              ? "You're sending messages too quickly. Please wait a few minutes before trying again."
              : "Something went wrong. Please try again."}
          </p>
        </div>
      )}

      {/* Completed state */}
      {isCompleted && (
        <div className="px-6 py-4 bg-success/10 border-t border-success/20">
          <div className="flex items-center justify-center gap-2 text-success">
            <CheckCircle2 className="w-5 h-5" />
            <p className="font-medium">
              Assessment complete! Your policy is being generated.
            </p>
          </div>
        </div>
      )}

      {/* Input area */}
      {!isCompleted && (
        <div className="border-t bg-background p-4">
          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto flex items-end gap-3"
          >
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your response..."
                disabled={isLoading}
                rows={1}
                className="min-h-[48px] max-h-[200px] resize-none pr-4 py-3"
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-12 w-12 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      )}
    </div>
  );
}

import { streamText, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { createClient } from "@/lib/supabase/server";
import { CISO_SYSTEM_PROMPT } from "@/lib/ai/prompts";

// Select AI provider based on available API key
function getModel() {
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic("claude-sonnet-4-20250514");
  }
  if (process.env.OPENAI_API_KEY) {
    return openai("gpt-4o");
  }
  throw new Error("No AI provider API key configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY.");
}

export async function POST(req: Request) {
  try {
    const { messages, interviewId } = await req.json();

    // Verify the user is authenticated and owns this interview
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // If interviewId is provided, verify ownership
    if (interviewId) {
      const { data: interview } = await supabase
        .from("interviews")
        .select("id, organization_id, organizations!inner(user_id)")
        .eq("id", interviewId)
        .single();

      if (!interview) {
        return new Response("Interview not found", { status: 404 });
      }

      // Explicit ownership check (defense-in-depth alongside RLS)
      const org = interview.organizations as unknown as { user_id: string };
      if (org.user_id !== user.id) {
        return new Response("Forbidden", { status: 403 });
      }

      // Save the user's message to the database
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === "user") {
        const content =
          typeof lastMessage.content === "string"
            ? lastMessage.content
            : Array.isArray(lastMessage.parts)
              ? lastMessage.parts
                  .filter((p: { type: string; text?: string }) => p.type === "text")
                  .map((p: { text: string }) => p.text)
                  .join("")
              : "";

        if (content) {
          await supabase.from("messages").insert({
            interview_id: interviewId,
            role: "user",
            content,
          });
        }
      }
    }

    const model = getModel();

    // Convert UI messages to model messages format
    const modelMessages = await convertToModelMessages(messages);

    // Stream the response
    const result = streamText({
      model,
      system: CISO_SYSTEM_PROMPT,
      messages: modelMessages,
      onFinish: async ({ text }) => {
        // Save the assistant's message to the database
        if (interviewId) {
          await supabase.from("messages").insert({
            interview_id: interviewId,
            role: "assistant",
            content: text,
          });

          // Check if interview is complete
          if (text.includes("[INTERVIEW_COMPLETE]")) {
            await supabase
              .from("interviews")
              .update({
                status: "completed",
                completed_at: new Date().toISOString(),
              })
              .eq("id", interviewId);
          }
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    );
  }
}

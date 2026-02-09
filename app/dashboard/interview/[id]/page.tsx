import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InterviewClient } from "./InterviewClient";
import type { Interview, Message } from "@/types/database";

interface InterviewPageProps {
  params: Promise<{ id: string }>;
}

interface InterviewWithOrg extends Interview {
  organizations: {
    user_id: string;
    name: string;
  };
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the interview with organization check
  const { data: interview } = await supabase
    .from("interviews")
    .select(
      `
      *,
      organizations!inner(user_id, name)
    `
    )
    .eq("id", id)
    .single() as { data: InterviewWithOrg | null };

  if (!interview) {
    notFound();
  }

  // Verify ownership
  if (interview.organizations.user_id !== user.id) {
    notFound();
  }

  // Fetch existing messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("interview_id", id)
    .order("created_at", { ascending: true }) as { data: Message[] | null };

  // Check if there's a policy for this interview
  const { data: policy } = await supabase
    .from("policies")
    .select("id")
    .eq("interview_id", id)
    .single() as { data: { id: string } | null };

  return (
    <InterviewClient
      interview={interview}
      initialMessages={messages || []}
      organizationName={interview.organizations.name}
      existingPolicyId={policy?.id || null}
    />
  );
}

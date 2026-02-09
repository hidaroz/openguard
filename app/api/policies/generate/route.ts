import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePolicy, extractComplianceItems } from "@/lib/ai/policy-generator";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import type { Interview, Message, Policy, ComplianceStatus } from "@/types/database";

interface InterviewWithOrg extends Interview {
  organizations: {
    id: string;
    user_id: string;
    name: string;
  };
}

export async function POST(req: Request) {
  try {
    const { interviewId } = await req.json();

    if (!interviewId) {
      return NextResponse.json(
        { error: "Interview ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit check
    const rateLimit = await checkRateLimit(
      supabase,
      `policy-generate:${user.id}`,
      RATE_LIMITS.policyGenerate
    );
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit);
    }

    // Fetch the interview and verify ownership
    const { data: interview } = await supabase
      .from("interviews")
      .select(
        `
        *,
        organizations!inner(id, user_id, name)
      `
      )
      .eq("id", interviewId)
      .single() as { data: InterviewWithOrg | null };

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    if (interview.organizations.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch all messages from the interview
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("interview_id", interviewId)
      .order("created_at", { ascending: true }) as { data: Message[] | null };

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No interview data found" },
        { status: 400 }
      );
    }

    // Generate the policy
    const { title, content } = await generatePolicy(
      messages,
      interview.organizations.name
    );

    // Check for existing policies to determine version
    const { count: existingPolicies } = await supabase
      .from("policies")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", interview.organizations.id);

    const version = (existingPolicies || 0) + 1;

    // Save the policy
    const { data: policy, error: policyError } = await supabase
      .from("policies")
      .insert({
        interview_id: interviewId,
        organization_id: interview.organizations.id,
        title,
        content_markdown: content,
        version,
      })
      .select()
      .single() as { data: Policy | null; error: unknown };

    if (policyError || !policy) {
      console.error("Failed to save policy:", policyError);
      return NextResponse.json(
        { error: "Failed to save policy" },
        { status: 500 }
      );
    }

    // Extract and save compliance items
    try {
      const complianceItems = await extractComplianceItems(content);

      if (complianceItems.length > 0) {
        const itemsToInsert = complianceItems.map((item) => ({
          organization_id: interview.organizations.id,
          policy_id: policy.id,
          category: item.category,
          title: item.title,
          description: item.description,
          status: "pending" as ComplianceStatus,
        }));
        
        await supabase.from("compliance_items").insert(itemsToInsert);
      }
    } catch (error) {
      console.error("Failed to extract compliance items:", error);
      // Continue even if compliance extraction fails
    }

    // Update interview with extracted data
    await supabase
      .from("interviews")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", interviewId);

    return NextResponse.json({
      success: true,
      policyId: policy.id,
    });
  } catch (error) {
    console.error("Policy generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

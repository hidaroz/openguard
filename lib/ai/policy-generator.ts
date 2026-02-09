import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { POLICY_GENERATION_PROMPT, COMPLIANCE_EXTRACTION_PROMPT } from "./prompts";
import type { Message, ComplianceCategory } from "@/types/database";

function getModel() {
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic("claude-sonnet-4-20250514");
  }
  if (process.env.OPENAI_API_KEY) {
    return openai("gpt-4o");
  }
  throw new Error("No AI provider API key configured");
}

interface GeneratedPolicy {
  title: string;
  content: string;
}

interface ComplianceItem {
  category: ComplianceCategory;
  title: string;
  description: string;
}

export async function generatePolicy(
  messages: Message[],
  organizationName: string
): Promise<GeneratedPolicy> {
  const model = getModel();

  // Format the interview transcript
  const transcript = messages
    .map((m) => {
      const role = m.role === "assistant" ? "OpenGuard" : "User";
      return `${role}: ${m.content}`;
    })
    .join("\n\n");

  const prompt = `Based on the following security assessment interview, generate a comprehensive cybersecurity and privacy policy for "${organizationName}".

## Interview Transcript
${transcript}

## Instructions
${POLICY_GENERATION_PROMPT}

Generate the policy now:`;

  const { text } = await generateText({
    model,
    prompt,
  });

  return {
    title: `${organizationName} Cybersecurity & Privacy Policy`,
    content: text,
  };
}

export async function extractComplianceItems(
  policyContent: string
): Promise<ComplianceItem[]> {
  const model = getModel();

  const prompt = `${COMPLIANCE_EXTRACTION_PROMPT}

## Policy Content
${policyContent}

Extract the compliance items as JSON:`;

  const { text } = await generateText({
    model,
    prompt,
  });

  try {
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in compliance extraction response");
      return getDefaultComplianceItems();
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!parsed.items || !Array.isArray(parsed.items)) {
      return getDefaultComplianceItems();
    }

    return parsed.items.map((item: ComplianceItem) => ({
      category: item.category || "short_term",
      title: item.title || "Action Item",
      description: item.description || "",
    }));
  } catch (error) {
    console.error("Failed to parse compliance items:", error);
    return getDefaultComplianceItems();
  }
}

function getDefaultComplianceItems(): ComplianceItem[] {
  return [
    {
      category: "immediate",
      title: "Review and adopt this security policy",
      description: "Have leadership review and formally adopt this cybersecurity policy.",
    },
    {
      category: "immediate",
      title: "Enable two-factor authentication",
      description: "Enable 2FA on all accounts that support it, starting with email and financial systems.",
    },
    {
      category: "short_term",
      title: "Implement regular data backups",
      description: "Set up automated backups of critical data and test restoration procedures.",
    },
    {
      category: "short_term",
      title: "Create an incident response checklist",
      description: "Document who to contact and what steps to take if a security incident occurs.",
    },
    {
      category: "long_term",
      title: "Provide security awareness training",
      description: "Train all staff and volunteers on recognizing phishing and other common threats.",
    },
    {
      category: "ongoing",
      title: "Review access permissions quarterly",
      description: "Regularly review who has access to sensitive systems and remove access for departed staff.",
    },
  ];
}

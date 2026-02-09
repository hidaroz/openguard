import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PolicyViewer } from "@/components/policy/PolicyViewer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Clock,
  FileText,
  CheckSquare,
} from "lucide-react";

interface PolicyPageProps {
  params: Promise<{ id: string }>;
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the policy with organization check
  const { data: policy } = await supabase
    .from("policies")
    .select(
      `
      *,
      organizations!inner(user_id, name)
    `
    )
    .eq("id", id)
    .single();

  if (!policy) {
    notFound();
  }

  // Verify ownership
  if (policy.organizations.user_id !== user.id) {
    notFound();
  }

  // Fetch compliance items for this policy
  const { data: complianceItems, count: complianceCount } = await supabase
    .from("compliance_items")
    .select("*", { count: "exact" })
    .eq("policy_id", id);

  const completedCount =
    complianceItems?.filter((item) => item.status === "completed").length || 0;

  return (
    <div className="h-[calc(100dvh-3.5rem)] md:h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-between px-6 bg-background shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/policies">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <h1 className="font-semibold text-sm">{policy.title}</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(policy.generated_at).toLocaleDateString()}
                <span className="mx-1">•</span>
                Version {policy.version}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {complianceCount && complianceCount > 0 && (
            <Link
              href="/dashboard/compliance"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckSquare className="w-4 h-4" />
              <span>
                {completedCount}/{complianceCount} tasks
              </span>
            </Link>
          )}
          <Badge variant="secondary">v{policy.version}</Badge>
          <Button size="sm" asChild>
            <a
              href={`/api/policies/export?id=${policy.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="w-4 h-4 mr-1" />
              Export PDF
            </a>
          </Button>
        </div>
      </header>

      {/* Policy Content */}
      <div className="flex-1 overflow-hidden bg-card">
        <PolicyViewer content={policy.content_markdown} />
      </div>
    </div>
  );
}

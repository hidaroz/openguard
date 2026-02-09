import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ComplianceChecklist } from "@/components/dashboard/ComplianceChecklist";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckSquare,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { Organization, ComplianceItem } from "@/types/database";

export default async function CompliancePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch organization
  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("user_id", user.id)
    .single() as { data: Organization | null };

  if (!organization) {
    redirect("/dashboard");
  }

  // Fetch all compliance items
  const { data: complianceItems } = await supabase
    .from("compliance_items")
    .select("*")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: true }) as { data: ComplianceItem[] | null };

  const items = complianceItems || [];
  const totalItems = items.length;
  const completedItems = items.filter((item) => item.status === "completed").length;
  const inProgressItems = items.filter((item) => item.status === "in_progress").length;
  const pendingItems = items.filter((item) => item.status === "pending").length;
  const overdueItems = items.filter((item) => item.status === "overdue").length;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Compliance Tracker
          </h1>
          <p className="text-muted-foreground">
            Track your progress on security improvements
          </p>
        </div>

        {totalItems > 0 ? (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Overall Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold">{completionPercentage}%</span>
                  </div>
                  <Progress value={completionPercentage} className="mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="text-2xl font-bold">{completedItems}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    of {totalItems} items
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    In Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-warning" />
                    <span className="text-2xl font-bold">{inProgressItems}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    currently active
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {overdueItems > 0 ? (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    ) : (
                      <CheckSquare className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="text-2xl font-bold">
                      {pendingItems + overdueItems}
                    </span>
                  </div>
                  {overdueItems > 0 && (
                    <p className="text-xs text-destructive mt-1">
                      {overdueItems} overdue
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Compliance Checklist */}
            <ComplianceChecklist items={items} />
          </>
        ) : (
          /* Empty State */
          <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-background border-primary/20">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle>No Compliance Items Yet</CardTitle>
              <CardDescription className="max-w-md mx-auto">
                Complete a security assessment to receive your personalized
                compliance checklist with prioritized action items.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <Button asChild>
                <Link href="/dashboard/interview">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Assessment
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  FileText,
  CheckSquare,
  ArrowRight,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch organization
  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Fetch recent interviews
  const { data: interviews } = await supabase
    .from("interviews")
    .select("*")
    .eq("organization_id", organization?.id || "")
    .order("started_at", { ascending: false })
    .limit(3);

  // Fetch policies count
  const { count: policiesCount } = await supabase
    .from("policies")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organization?.id || "");

  // Fetch compliance items
  const { data: complianceItems } = await supabase
    .from("compliance_items")
    .select("*")
    .eq("organization_id", organization?.id || "");

  const pendingItems = complianceItems?.filter((item) => item.status === "pending").length || 0;
  const completedItems = complianceItems?.filter((item) => item.status === "completed").length || 0;
  const totalItems = complianceItems?.length || 0;

  const hasStarted = interviews && interviews.length > 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Welcome back{organization?.name ? `, ${organization.name}` : ""}
        </h1>
        <p className="text-muted-foreground">
          {hasStarted
            ? "Here's an overview of your security posture"
            : "Let's get started with your security assessment"}
        </p>
      </div>

      {!hasStarted ? (
        /* First-time user experience */
        <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-background border-primary/20">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">
                  Start Your Security Assessment
                </h2>
                <p className="text-muted-foreground mb-4">
                  Answer a few questions about your organization to generate a
                  custom cybersecurity policy. It takes about 15 minutes and
                  requires no technical knowledge.
                </p>
                <Button asChild>
                  <Link href="/dashboard/interview">
                    Begin Assessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Returning user dashboard */
        <>
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Assessments
                </CardTitle>
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{interviews?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {interviews?.filter((i) => i.status === "completed").length || 0}{" "}
                  completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Policies
                </CardTitle>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{policiesCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Security policies generated
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Compliance
                </CardTitle>
                <CheckSquare className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalItems > 0
                    ? Math.round((completedItems / totalItems) * 100)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  {completedItems} of {totalItems} items complete
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Interviews */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Assessments</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/interview">
                      <Plus className="w-4 h-4 mr-1" />
                      New
                    </Link>
                  </Button>
                </div>
                <CardDescription>
                  Your recent security interviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                {interviews && interviews.length > 0 ? (
                  <div className="space-y-3">
                    {interviews.map((interview) => (
                      <Link
                        key={interview.id}
                        href={`/dashboard/interview/${interview.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              Security Assessment
                            </p>
                            <Badge
                              variant={
                                interview.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {interview.status === "completed"
                                ? "Complete"
                                : "In Progress"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {new Date(interview.started_at).toLocaleDateString()}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No assessments yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Compliance Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Compliance Items</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/compliance">View All</Link>
                  </Button>
                </div>
                <CardDescription>
                  Your action items for security improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {complianceItems && complianceItems.length > 0 ? (
                  <div className="space-y-3">
                    {complianceItems.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 rounded-lg border"
                      >
                        {item.status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                        ) : item.status === "overdue" ? (
                          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.category.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                    ))}
                    {pendingItems > 4 && (
                      <p className="text-sm text-muted-foreground text-center pt-2">
                        +{pendingItems - 4} more items
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Complete an assessment to get compliance items
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

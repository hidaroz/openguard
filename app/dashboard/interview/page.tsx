import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  MessageSquare,
  Plus,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { DeleteInterviewButton } from "@/components/dashboard/DeleteInterviewButton";

async function createNewInterview(organizationId: string) {
  "use server";
  
  const supabase = await createClient();
  
  const { data: interview, error } = await supabase
    .from("interviews")
    .insert({
      organization_id: organizationId,
      status: "in_progress",
    })
    .select()
    .single();

  if (error || !interview) {
    throw new Error("Failed to create interview");
  }

  redirect(`/dashboard/interview/${interview.id}`);
}

async function deleteInterview(interviewId: string) {
  "use server";

  const supabase = await createClient();

  const { error } = await supabase
    .from("interviews")
    .delete()
    .eq("id", interviewId);

  if (error) {
    throw new Error("Failed to delete interview");
  }
}

export default async function InterviewListPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get or create organization
  let { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!organization) {
    // Create a default organization for new users
    const { data: newOrg } = await supabase
      .from("organizations")
      .insert({
        user_id: user.id,
        name: "My Organization",
        type: "nonprofit",
      })
      .select()
      .single();
    organization = newOrg;
  }

  if (!organization) {
    return <div>Error loading organization</div>;
  }

  // Fetch all interviews for this organization
  const { data: interviews } = await supabase
    .from("interviews")
    .select("*")
    .eq("organization_id", organization.id)
    .order("started_at", { ascending: false });

  const inProgressInterviews = interviews?.filter(
    (i) => i.status === "in_progress"
  );
  const completedInterviews = interviews?.filter(
    (i) => i.status === "completed"
  );

  const createInterviewAction = createNewInterview.bind(null, organization.id);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">
              Security Assessments
            </h1>
            <p className="text-muted-foreground">
              Start a new assessment or continue an existing one
            </p>
          </div>
          <form action={createInterviewAction}>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              New Assessment
            </Button>
          </form>
        </div>

        {/* In Progress Interviews */}
        {inProgressInterviews && inProgressInterviews.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              In Progress
            </h2>
            <div className="space-y-3">
              {inProgressInterviews.map((interview) => (
                <Link
                  key={interview.id}
                  href={`/dashboard/interview/${interview.id}`}
                >
                  <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-warning" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">Security Assessment</h3>
                          <Badge variant="secondary">In Progress</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          Started{" "}
                          {new Date(interview.started_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <DeleteInterviewButton
                          interviewId={interview.id}
                          deleteAction={deleteInterview}
                        />
                        <Button variant="ghost" size="sm">
                          Continue
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Completed Interviews */}
        {completedInterviews && completedInterviews.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              Completed
            </h2>
            <div className="space-y-3">
              {completedInterviews.map((interview) => (
                <Link
                  key={interview.id}
                  href={`/dashboard/interview/${interview.id}`}
                >
                  <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-success" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">Security Assessment</h3>
                          <Badge>Completed</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          Completed{" "}
                          {interview.completed_at
                            ? new Date(
                                interview.completed_at
                              ).toLocaleDateString()
                            : "Recently"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <DeleteInterviewButton
                          interviewId={interview.id}
                          deleteAction={deleteInterview}
                        />
                        <Button variant="ghost" size="sm">
                          View
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!interviews || interviews.length === 0) && (
          <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-background border-primary/20">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <CardTitle>Start Your First Assessment</CardTitle>
              <CardDescription className="max-w-md mx-auto">
                Answer a few questions about your organization to generate a
                custom cybersecurity policy. It takes about 15 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <form action={createInterviewAction}>
                <Button type="submit" size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Begin Assessment
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

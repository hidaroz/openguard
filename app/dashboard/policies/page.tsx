import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Clock,
  ArrowRight,
  Download,
  MessageSquare,
} from "lucide-react";

export default async function PoliciesListPage() {
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
    .single();

  if (!organization) {
    redirect("/dashboard");
  }

  // Fetch all policies for this organization
  const { data: policies } = await supabase
    .from("policies")
    .select("*")
    .eq("organization_id", organization.id)
    .order("generated_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">
              Security Policies
            </h1>
            <p className="text-muted-foreground">
              View and download your generated security policies
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/interview">
              <Plus className="w-4 h-4 mr-2" />
              New Assessment
            </Link>
          </Button>
        </div>

        {/* Policies List */}
        {policies && policies.length > 0 ? (
          <div className="space-y-4">
            {policies.map((policy) => (
              <Link key={policy.id} href={`/dashboard/policies/${policy.id}`}>
                <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{policy.title}</h3>
                        <Badge variant="secondary">v{policy.version}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Generated{" "}
                        {new Date(policy.generated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {policy.pdf_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={policy.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </a>
                        </Button>
                      )}
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
        ) : (
          /* Empty State */
          <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-background border-primary/20">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle>No Policies Yet</CardTitle>
              <CardDescription className="max-w-md mx-auto">
                Complete a security assessment to generate your first
                customized cybersecurity and privacy policy.
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

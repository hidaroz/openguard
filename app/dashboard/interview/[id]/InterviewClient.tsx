"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  FileText,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type { Interview, Message } from "@/types/database";
import { toast } from "sonner";

interface InterviewClientProps {
  interview: Interview & { organizations: { user_id: string; name: string } };
  initialMessages: Message[];
  organizationName: string;
  existingPolicyId: string | null;
}

export function InterviewClient({
  interview,
  initialMessages,
  organizationName,
  existingPolicyId,
}: InterviewClientProps) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(interview.status === "completed");
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [policyId, setPolicyId] = useState<string | null>(existingPolicyId);

  // Show dialog when interview completes
  useEffect(() => {
    if (isCompleted && !policyId) {
      setShowGenerateDialog(true);
    }
  }, [isCompleted, policyId]);

  const handleComplete = () => {
    setIsCompleted(true);
  };

  const handleGeneratePolicy = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/policies/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId: interview.id }),
      });

      if (response.status === 429) {
        const body = await response.json();
        const retryMinutes = Math.ceil((body.retryAfter || 60) / 60);
        toast.error(
          `Rate limit reached. Please wait ${retryMinutes} minute${retryMinutes !== 1 ? "s" : ""} before trying again.`
        );
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to generate policy");
      }

      const data = await response.json();
      setPolicyId(data.policyId);
      setShowGenerateDialog(false);
      toast.success("Policy generated successfully!");
      router.push(`/dashboard/policies/${data.policyId}`);
    } catch (error) {
      toast.error("Failed to generate policy. Please try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-[calc(100dvh-3.5rem)] md:h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-between px-6 bg-background shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/interview">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="font-semibold">Security Assessment</h1>
            <p className="text-xs text-muted-foreground">{organizationName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isCompleted ? "default" : "secondary"}>
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </>
            ) : (
              "In Progress"
            )}
          </Badge>
          {policyId && (
            <Button size="sm" asChild>
              <Link href={`/dashboard/policies/${policyId}`}>
                <FileText className="w-4 h-4 mr-1" />
                View Policy
              </Link>
            </Button>
          )}
        </div>
      </header>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          interviewId={interview.id}
          initialMessages={initialMessages}
          isCompleted={isCompleted}
          onComplete={handleComplete}
        />
      </div>

      {/* Generate Policy Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-center">
              Assessment Complete!
            </DialogTitle>
            <DialogDescription className="text-center">
              Great job! Based on your responses, we&apos;re ready to generate
              your customized cybersecurity and privacy policy.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              Your policy will include:
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Custom data handling guidelines
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Access control and authentication policies
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Incident response procedures
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Prioritized compliance checklist
              </li>
            </ul>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={handleGeneratePolicy}
              disabled={isGenerating}
              className="min-w-[200px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate My Policy
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

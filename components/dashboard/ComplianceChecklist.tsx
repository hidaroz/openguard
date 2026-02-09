"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ComplianceItem, ComplianceStatus, ComplianceCategory } from "@/types/database";

interface ComplianceChecklistProps {
  items: ComplianceItem[];
}

const categoryConfig: Record<
  ComplianceCategory,
  { label: string; color: string; icon: React.ReactNode }
> = {
  immediate: {
    label: "Immediate (This Week)",
    color: "text-destructive",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  short_term: {
    label: "Short-term (This Month)",
    color: "text-warning",
    icon: <Clock className="w-4 h-4" />,
  },
  long_term: {
    label: "Long-term (This Quarter)",
    color: "text-primary",
    icon: <Clock className="w-4 h-4" />,
  },
  ongoing: {
    label: "Ongoing",
    color: "text-muted-foreground",
    icon: <Circle className="w-4 h-4" />,
  },
};

const statusColors: Record<ComplianceStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-success/10 text-success border-success/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
};

export function ComplianceChecklist({ items }: ComplianceChecklistProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedCategories, setExpandedCategories] = useState<Set<ComplianceCategory>>(
    new Set(["immediate", "short_term"])
  );

  const toggleCategory = (category: ComplianceCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const updateItemStatus = async (itemId: string, newStatus: ComplianceStatus) => {
    const supabase = createClient();

    const updateData: { status: ComplianceStatus; completed_at?: string | null } = {
      status: newStatus,
    };

    if (newStatus === "completed") {
      updateData.completed_at = new Date().toISOString();
    } else {
      updateData.completed_at = null;
    }

    const { error } = await supabase
      .from("compliance_items")
      .update(updateData)
      .eq("id", itemId);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    toast.success(
      newStatus === "completed" ? "Marked as complete!" : "Status updated"
    );

    startTransition(() => {
      router.refresh();
    });
  };

  // Group items by category
  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<ComplianceCategory, ComplianceItem[]>
  );

  const categoryOrder: ComplianceCategory[] = [
    "immediate",
    "short_term",
    "long_term",
    "ongoing",
  ];

  return (
    <div className="space-y-4">
      {categoryOrder.map((category) => {
        const categoryItems = groupedItems[category];
        if (!categoryItems || categoryItems.length === 0) return null;

        const config = categoryConfig[category];
        const isExpanded = expandedCategories.has(category);
        const completedCount = categoryItems.filter(
          (item) => item.status === "completed"
        ).length;

        return (
          <Card key={category}>
            <CardHeader
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => toggleCategory(category)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={config.color}>{config.icon}</span>
                  <CardTitle className="text-base">{config.label}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {completedCount}/{categoryItems.length}
                  </Badge>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border transition-all",
                        item.status === "completed" && "opacity-60"
                      )}
                    >
                      <button
                        onClick={() =>
                          updateItemStatus(
                            item.id,
                            item.status === "completed" ? "pending" : "completed"
                          )
                        }
                        disabled={isPending}
                        className="mt-0.5 shrink-0"
                      >
                        {item.status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4
                            className={cn(
                              "font-medium",
                              item.status === "completed" && "line-through"
                            )}
                          >
                            {item.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", statusColors[item.status])}
                          >
                            {item.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        {item.due_date && (
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due: {new Date(item.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {item.status !== "completed" && (
                        <div className="flex gap-1">
                          {item.status !== "in_progress" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateItemStatus(item.id, "in_progress")
                              }
                              disabled={isPending}
                            >
                              Start
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateItemStatus(item.id, "completed")
                            }
                            disabled={isPending}
                          >
                            Complete
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

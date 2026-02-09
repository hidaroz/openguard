import { Card, CardContent } from "@/components/ui/card";

export default function PoliciesLoading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-7 w-44 bg-muted rounded" />
            <div className="h-4 w-64 bg-muted rounded mt-2" />
          </div>
          <div className="h-10 w-40 bg-muted rounded" />
        </div>

        {/* Policy card skeletons */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-5 w-48 bg-muted rounded" />
                    <div className="h-5 w-10 bg-muted rounded-full" />
                  </div>
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
                <div className="h-8 w-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

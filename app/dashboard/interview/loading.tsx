import { Card, CardContent } from "@/components/ui/card";

export default function InterviewListLoading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-7 w-52 bg-muted rounded" />
            <div className="h-4 w-72 bg-muted rounded mt-2" />
          </div>
          <div className="h-10 w-40 bg-muted rounded" />
        </div>

        {/* Section heading */}
        <div className="h-5 w-28 bg-muted rounded mb-4" />

        {/* Interview card skeletons */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-36 bg-muted rounded" />
                    <div className="h-5 w-20 bg-muted rounded-full" />
                  </div>
                  <div className="h-3 w-24 bg-muted rounded mt-2" />
                </div>
                <div className="h-8 w-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

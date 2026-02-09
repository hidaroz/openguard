import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ComplianceLoading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-7 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded mt-2" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-12 bg-muted rounded" />
                <div className="h-2 w-full bg-muted rounded mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Checklist skeleton */}
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="w-5 h-5 rounded-full bg-muted shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="h-4 w-56 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded mt-1" />
                </div>
                <div className="h-6 w-20 bg-muted rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

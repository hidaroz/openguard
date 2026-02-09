import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-7 w-64 bg-muted rounded" />
        <div className="h-4 w-48 bg-muted rounded mt-2" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content cards skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 w-40 bg-muted rounded" />
              <div className="h-3 w-56 bg-muted rounded mt-1" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="h-5 w-5 bg-muted rounded-full shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-20 bg-muted rounded mt-1" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

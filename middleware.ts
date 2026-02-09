import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Best-effort in-memory IP rate limiter for auth pages.
// Resets on cold start — this is a secondary defense alongside Supabase Auth's own limits.
const AUTH_RATE_LIMIT = parseInt(process.env.RATE_LIMIT_AUTH || "20", 10);
const AUTH_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const ipHits = new Map<string, { count: number; resetAt: number }>();

function checkAuthRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);

  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + AUTH_WINDOW_MS });
    return true;
  }

  if (entry.count >= AUTH_RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

export async function middleware(request: NextRequest) {
  // Clean up expired rate-limit entries on each invocation
  const now = Date.now();
  for (const [ip, entry] of ipHits) {
    if (now > entry.resetAt) {
      ipHits.delete(ip);
    }
  }

  // IP rate limit for auth pages
  const authPaths = ["/login", "/signup"];
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPath) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";

    if (!checkAuthRateLimit(ip)) {
      return new NextResponse("Too many requests. Please try again later.", {
        status: 429,
        headers: {
          "Retry-After": "900",
        },
      });
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Window size in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  remaining: number;
  reset_at: number;
}

/** Default rate limit configurations, overridable via env vars */
export const RATE_LIMITS = {
  chat: {
    limit: parseInt(process.env.RATE_LIMIT_CHAT || "30", 10),
    windowSeconds: 3600, // 1 hour
  },
  policyGenerate: {
    limit: parseInt(process.env.RATE_LIMIT_POLICY_GENERATE || "5", 10),
    windowSeconds: 3600,
  },
  policyExport: {
    limit: parseInt(process.env.RATE_LIMIT_POLICY_EXPORT || "30", 10),
    windowSeconds: 3600,
  },
} as const satisfies Record<string, RateLimitConfig>;

/**
 * Check rate limit for a given key using the database function.
 * Returns the rate limit result with allowed/remaining/reset info.
 */
export async function checkRateLimit(
  supabase: SupabaseClient<Database>,
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_limit: config.limit,
    p_window_seconds: config.windowSeconds,
  });

  if (error) {
    console.error("Rate limit check failed:", error);
    // Fail open: allow the request if the rate limit check itself fails
    return {
      allowed: true,
      count: 0,
      limit: config.limit,
      remaining: config.limit,
      reset_at: Math.floor(Date.now() / 1000) + config.windowSeconds,
    };
  }

  return data as unknown as RateLimitResult;
}

/**
 * Build a 429 Too Many Requests response with standard rate limit headers.
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.max(1, result.reset_at - Math.floor(Date.now() / 1000));

  return new Response(
    JSON.stringify({
      error: "Too many requests",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.reset_at),
        "Retry-After": String(retryAfter),
      },
    }
  );
}

# Security

## Reporting a vulnerability

Report privately via [GitHub Security Advisories](https://github.com/hidaroz/openguard/security/advisories/new).
Please don't open a public issue for anything exploitable.

Expect an acknowledgement within a week. This is a personal project, not a funded
one — there's no bounty, and no guaranteed patch window.

## How tenant isolation works

Every table in `supabase/migrations/` has row-level security enabled, and every
policy resolves ownership back to `organizations.user_id = auth.uid()` through an
`EXISTS` subquery. There are no `USING (true)` policies and no anon-role grants.

**There is no service-role key in this application.** `lib/supabase/server.ts`
and `lib/supabase/middleware.ts` both build their client with the anon key, so
RLS is load-bearing rather than decorative — a policy mistake is a real bug, not
something a privileged key papers over. Don't add a service-role key to work
around a policy; fix the policy.

The API routes check authorisation a second time in application code
(`app/api/chat/route.ts` and `app/api/policies/export/route.ts` both compare
`organizations.user_id` against `auth.getUser()` and return 403 before touching
data). That redundancy is deliberate: RLS is the control, the explicit check is
the thing that fails loudly in a test.

## Fixed

Recorded here because the reasoning is more useful than the patch:

**Cross-tenant read on the `policies` storage bucket.** The bucket's policies
were named "Users can view their policy PDFs" but the predicate was only
`bucket_id = 'policies' AND auth.uid() IS NOT NULL` — no tie back to the owning
organization. Any authenticated account could read and write every other
tenant's generated security policies. Objects are now scoped by their first path
segment, which must be an organization the caller owns. The lesson is that a
policy's *name* is documentation, not enforcement, and the two had drifted.

**A rate limiter that was never wired up.** `lib/rate-limit.ts` called
`supabase.rpc("check_rate_limit", …)` and `types/database.ts` declared the
function, but no migration ever created it. Every call errored into the explicit
fail-open branch, so the LLM endpoints were completely unmetered while appearing
to be rate limited. The function now exists, is `SECURITY DEFINER` with a pinned
`search_path`, and writes to a table with RLS on and no policies — so a client
can neither read other callers' counters nor forge its own.

**Server error messages returned to clients.** `app/api/chat/route.ts` returned
`error.message` verbatim with a 500, leaking provider errors and the model and
prompt details inside them. It returns a generic string now; the detail stays in
the server log.

**Stored XSS in the policy export.** `app/api/policies/export/route.ts` piped
`marked()` output and an uninterpolated `policy.title` into a document served as
`text/html` on the app origin. `marked` passes raw HTML through, and the content
is model-generated from user-supplied interview answers. Output is now sanitised
with DOMPurify and every interpolated value is escaped.

## Known gaps

**The `proxy.ts` rate limiter is per-instance and in-memory.** It sweeps an
in-process `Map`, so on serverless it resets on every cold start and each
concurrent instance keeps its own counter. Under scale-out that is close to no
rate limit at all. It's a secondary defence, and the file says so. The database
limiter above is the real one.

**`proxy.ts` only covers `/login` and `/signup`.** The expensive routes —
`/api/chat` and policy generation — are covered by the database limiter, not by
the edge one, so a burst still reaches the function before it's rejected.

**Client IP attribution is weak.** It reads `x-forwarded-for`, falls back to
`x-real-ip`, then to the literal string `"unknown"`. Traffic arriving without
either header shares one bucket.

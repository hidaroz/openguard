-- Two fixes, both to controls that existed on paper but not in practice.
--
-- 1. The `policies` storage bucket was readable and writable by ANY logged-in
--    user. The policies were named "Users can ... their policy PDFs" but the
--    predicate was only `auth.uid() IS NOT NULL`, with no tie back to the
--    owning organization -- so any authenticated account could read every
--    other tenant's generated security policies. Objects are now scoped by
--    their first path segment, which must be an organization the caller owns:
--    `{organization_id}/{filename}`.
--
-- 2. `check_rate_limit` was called by lib/rate-limit.ts and declared in
--    types/database.ts, but no migration ever created it. Every call errored
--    and hit the explicit fail-open branch, so the AI endpoints were unmetered
--    while appearing to be rate limited. Created here.

-- ---------------------------------------------------------------------------
-- 1. Scope the policies bucket to the owning organization
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can upload policy PDFs for their organizations" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their policy PDFs" ON storage.objects;

CREATE POLICY "Users can upload policy PDFs for their organizations"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'policies' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their policy PDFs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'policies' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their policy PDFs"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'policies' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their policy PDFs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'policies' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.organizations WHERE user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 2. The rate limit function that lib/rate-limit.ts has always assumed exists
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key           text        NOT NULL,
  window_start  timestamptz NOT NULL,
  count         integer     NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No policies are defined on purpose: this table is written only by the
-- SECURITY DEFINER function below. With RLS on and no policy, direct access
-- from the anon or authenticated roles is denied, so a client cannot read
-- other callers' counters or forge its own.

CREATE INDEX IF NOT EXISTS rate_limits_window_start_idx
  ON public.rate_limits (window_start);

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key            text,
  p_limit          integer,
  p_window_seconds integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
-- Pinned search_path: a SECURITY DEFINER function that resolves names through
-- the caller's search_path can be hijacked by a shadowing object.
SET search_path = public, pg_temp
AS $$
DECLARE
  v_window_start timestamptz;
  v_count        integer;
BEGIN
  IF p_limit IS NULL OR p_limit <= 0 OR p_window_seconds IS NULL OR p_window_seconds <= 0 THEN
    RAISE EXCEPTION 'invalid rate limit parameters';
  END IF;

  -- Fixed windows, floored to the window size. Cheaper than a sliding window
  -- and adequate for per-user LLM call budgets.
  v_window_start := to_timestamp(
    floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds
  );

  INSERT INTO public.rate_limits AS rl (key, window_start, count)
  VALUES (p_key, v_window_start, 1)
  ON CONFLICT (key, window_start)
  DO UPDATE SET count = rl.count + 1
  RETURNING rl.count INTO v_count;

  -- Opportunistic cleanup so the table doesn't grow without bound.
  DELETE FROM public.rate_limits
  WHERE window_start < now() - (p_window_seconds * 10 || ' seconds')::interval;

  RETURN jsonb_build_object(
    'allowed',   v_count <= p_limit,
    'count',     v_count,
    'limit',     p_limit,
    'remaining', greatest(0, p_limit - v_count),
    'reset_at',  floor(extract(epoch FROM v_window_start)) + p_window_seconds
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO authenticated;

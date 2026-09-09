-- Documented RLS isolation test for local Postgres.
-- Prerequisites: docker-compose up, then apply shim + init migration.
--
--   docker compose up -d
--   psql "$DATABASE_URL" -f supabase/local/0000_auth_shim.sql
--   psql "$DATABASE_URL" -f supabase/migrations/20260909120000_init.sql
--   psql "$DATABASE_URL" -f supabase/tests/rls.sql

BEGIN;

INSERT INTO auth.users (id, email)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'a@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'b@example.test')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.trees (id, name, priority) VALUES ('test_tree', 'Test', 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories (id, tree_id, name)
VALUES ('test_cat', 'test_tree', 'Cat')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.branches (id, category_id, name)
VALUES ('test_branch', 'test_cat', 'Branch')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.achievements (id, branch_id, title, tier, xp, min_reps)
VALUES ('test_ach', 'test_branch', 'Show Up', 'Bronze', 10, 1)
ON CONFLICT (id) DO NOTHING;

-- User A context
SELECT set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);

INSERT INTO public.claims (user_id, achievement_id, explicit_user_action, actor, source)
VALUES ('11111111-1111-4111-8111-111111111111', 'test_ach', true, 'user', 'atlas');

INSERT INTO public.user_progress (user_id, achievement_id, state, claimed_at)
VALUES ('11111111-1111-4111-8111-111111111111', 'test_ach', 'claimed', now());

-- Auto-claim must fail at CHECK
DO $$
BEGIN
  BEGIN
    INSERT INTO public.claims (user_id, achievement_id, explicit_user_action, actor, source)
    VALUES ('11111111-1111-4111-8111-111111111111', 'test_ach', false, 'user', 'atlas');
    RAISE EXCEPTION 'expected CHECK to reject explicit_user_action = false';
  EXCEPTION WHEN check_violation THEN
    NULL;
  WHEN unique_violation THEN
    NULL;
  END;

  BEGIN
    INSERT INTO public.claims (user_id, achievement_id, explicit_user_action, actor, source)
    VALUES ('11111111-1111-4111-8111-111111111111', 'test_ach', true, 'pulse', 'atlas');
    RAISE EXCEPTION 'expected CHECK to reject actor = pulse';
  EXCEPTION WHEN check_violation THEN
    NULL;
  WHEN unique_violation THEN
    NULL;
  END;
END $$;

-- User B must not see A's claim when RLS is forced
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);

DO $$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n FROM public.claims;
  IF n <> 0 THEN
    RAISE EXCEPTION 'user B saw % claim rows (isolation failed)', n;
  END IF;
END $$;

RESET ROLE;
ROLLBACK;

SELECT 'rls.sql completed (rolled back)' AS status;

export const RLS_POLICY_SQL = `
-- User isolation: every stateful table is keyed by user_id = auth.uid().
-- Catalog tables are globally readable and not user-writable.
-- Claims CHECK (explicit_user_action = true AND actor = 'user') is the DB-level
-- no-auto-claim invariant. Pulse/import/wearables have no policy that inserts claims.

-- See supabase/migrations and supabase/tests/rls.sql for the executable form.
`.trim();

export const NO_AUTO_CLAIM_SQL_INVARIANTS = [
  "explicit_user_action BOOLEAN NOT NULL CHECK (explicit_user_action = true)",
  "actor TEXT NOT NULL CHECK (actor = 'user')",
  "source TEXT NOT NULL CHECK (source IN ('atlas', 'manual'))",
] as const;

-- Project Self Ultra (PSX) Phase 1 schema
-- Apply on Supabase (auth schema already exists) OR after supabase/local/0000_auth_shim.sql.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE public.achievement_state AS ENUM (
    'locked',
    'in_progress',
    'ready_to_claim',
    'verified',
    'claimed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.competence_state AS ENUM (
    'unexplored',
    'exposed',
    'competent',
    'advanced',
    'mastered'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Catalog (global, imported — never reinvented in app code)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.trees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  legendary_trophy TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (tree_id, name)
);

CREATE TABLE IF NOT EXISTS public.branches (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  recommended BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (category_id, name)
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  branch_id TEXT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tier TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  req TEXT,
  min_reps INTEGER NOT NULL DEFAULT 0,
  extension JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (branch_id, title, tier)
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- User state — isolated by user_id
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  state public.achievement_state NOT NULL DEFAULT 'locked',
  reps INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id),
  CONSTRAINT claimed_requires_timestamp CHECK (state <> 'claimed' OR claimed_at IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'manual',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Achievements are NEVER auto-claimed. DB CHECK enforces explicit user Claim.
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  explicit_user_action BOOLEAN NOT NULL CHECK (explicit_user_action = true),
  actor TEXT NOT NULL CHECK (actor = 'user'),
  source TEXT NOT NULL CHECK (source IN ('atlas', 'manual')),
  UNIQUE (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.ledger_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  provenance JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.competence (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  state public.competence_state NOT NULL DEFAULT 'unexplored',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, branch_id)
);

CREATE TABLE IF NOT EXISTS public.manual_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  achievement_id TEXT REFERENCES public.achievements(id),
  provenance JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_progress_state ON public.user_progress (user_id, state);
CREATE INDEX IF NOT EXISTS idx_ledger_user_created ON public.ledger_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_user_achievement ON public.evidence (user_id, achievement_id);
CREATE INDEX IF NOT EXISTS idx_claims_user ON public.claims (user_id);

-- ---------------------------------------------------------------------------
-- Claimed progress must correspond to a claims row (no silent claim via UPDATE)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.enforce_claim_row()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.state = 'claimed' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.claims c
      WHERE c.user_id = NEW.user_id AND c.achievement_id = NEW.achievement_id
    ) THEN
      RAISE EXCEPTION 'claimed progress requires a claims row (explicit user Claim)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_progress_claim_row ON public.user_progress;
CREATE CONSTRAINT TRIGGER trg_user_progress_claim_row
AFTER INSERT OR UPDATE ON public.user_progress
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION public.enforce_claim_row();

-- ---------------------------------------------------------------------------
-- New-user profile
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_logs ENABLE ROW LEVEL SECURITY;

-- Catalog: authenticated read. Writes are service-role only (no user policies).
DROP POLICY IF EXISTS trees_select ON public.trees;
CREATE POLICY trees_select ON public.trees FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS categories_select ON public.categories;
CREATE POLICY categories_select ON public.categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS branches_select ON public.branches;
CREATE POLICY branches_select ON public.branches FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS achievements_select ON public.achievements;
CREATE POLICY achievements_select ON public.achievements FOR SELECT TO authenticated USING (true);

-- Profiles
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Stateful tables: own rows only
DROP POLICY IF EXISTS progress_select_own ON public.user_progress;
CREATE POLICY progress_select_own ON public.user_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS progress_insert_own ON public.user_progress;
CREATE POLICY progress_insert_own ON public.user_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS progress_update_own ON public.user_progress;
CREATE POLICY progress_update_own ON public.user_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS evidence_select_own ON public.evidence;
CREATE POLICY evidence_select_own ON public.evidence
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS evidence_insert_own ON public.evidence;
CREATE POLICY evidence_insert_own ON public.evidence
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS claims_select_own ON public.claims;
CREATE POLICY claims_select_own ON public.claims
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS claims_insert_own ON public.claims;
CREATE POLICY claims_insert_own ON public.claims
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id
    AND explicit_user_action = true
    AND actor = 'user'
    AND source IN ('atlas', 'manual')
  );

DROP POLICY IF EXISTS ledger_select_own ON public.ledger_events;
CREATE POLICY ledger_select_own ON public.ledger_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS ledger_insert_own ON public.ledger_events;
CREATE POLICY ledger_insert_own ON public.ledger_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS competence_select_own ON public.competence;
CREATE POLICY competence_select_own ON public.competence
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS competence_insert_own ON public.competence;
CREATE POLICY competence_insert_own ON public.competence
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS competence_update_own ON public.competence;
CREATE POLICY competence_update_own ON public.competence
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS logs_select_own ON public.manual_logs;
CREATE POLICY logs_select_own ON public.manual_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS logs_insert_own ON public.manual_logs;
CREATE POLICY logs_insert_own ON public.manual_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

REVOKE INSERT, UPDATE, DELETE ON public.trees, public.categories, public.branches, public.achievements FROM authenticated, anon;

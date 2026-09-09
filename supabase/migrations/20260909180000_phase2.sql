-- Project Self Ultra (PSX) Phase 2 — Collections, North Stars, Focus, Seasons.
-- Collections are NOT achievements. Season completion grants no XP.
-- Claims remain user-only (Phase 1 CHECK still applies).

DO $$ BEGIN
  CREATE TYPE public.collection_state AS ENUM (
    'saved',
    'planned',
    'active',
    'competent',
    'completed',
    'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.north_star_state AS ENUM (
    'planned',
    'active',
    'paused',
    'completed',
    'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.season_state AS ENUM (
    'planned',
    'active',
    'completed',
    'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.collection_items (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'item',
  subtype TEXT,
  state public.collection_state NOT NULL DEFAULT 'saved',
  date_added TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  difficulty TEXT,
  notes TEXT NOT NULL DEFAULT '',
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  source TEXT,
  prerequisites JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  rating NUMERIC,
  reflection TEXT,
  repertoire JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.north_stars (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'goal',
  current_value DOUBLE PRECISION NOT NULL DEFAULT 0,
  target_value DOUBLE PRECISION NOT NULL,
  unit TEXT NOT NULL DEFAULT 'units',
  deadline TIMESTAMPTZ,
  reason TEXT NOT NULL DEFAULT '',
  linked_branch_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  linked_category_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  status public.north_star_state NOT NULL DEFAULT 'active',
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.focus_records (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.seasons (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  priority_branch_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  priority_category_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  status public.season_state NOT NULL DEFAULT 'active',
  review JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT season_length_weeks CHECK (
    ends_at > starts_at
    AND ends_at <= starts_at + interval '12 weeks'
    AND ends_at >= starts_at + interval '6 weeks'
  )
);

CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  branch_id TEXT REFERENCES public.branches(id),
  north_star_id TEXT REFERENCES public.north_stars(id),
  done BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, date, title)
);

CREATE INDEX IF NOT EXISTS idx_collection_user_branch ON public.collection_items (user_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_north_stars_user ON public.north_stars (user_id, status);
CREATE INDEX IF NOT EXISTS idx_seasons_user ON public.seasons (user_id, status);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_user_date ON public.daily_challenges (user_id, date);

ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.north_stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS collection_select_own ON public.collection_items;
CREATE POLICY collection_select_own ON public.collection_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS collection_insert_own ON public.collection_items;
CREATE POLICY collection_insert_own ON public.collection_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS collection_update_own ON public.collection_items;
CREATE POLICY collection_update_own ON public.collection_items
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS north_stars_select_own ON public.north_stars;
CREATE POLICY north_stars_select_own ON public.north_stars
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS north_stars_insert_own ON public.north_stars;
CREATE POLICY north_stars_insert_own ON public.north_stars
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS north_stars_update_own ON public.north_stars;
CREATE POLICY north_stars_update_own ON public.north_stars
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS focus_select_own ON public.focus_records;
CREATE POLICY focus_select_own ON public.focus_records
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS focus_insert_own ON public.focus_records;
CREATE POLICY focus_insert_own ON public.focus_records
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS focus_update_own ON public.focus_records;
CREATE POLICY focus_update_own ON public.focus_records
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS seasons_select_own ON public.seasons;
CREATE POLICY seasons_select_own ON public.seasons
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS seasons_insert_own ON public.seasons;
CREATE POLICY seasons_insert_own ON public.seasons
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS seasons_update_own ON public.seasons;
CREATE POLICY seasons_update_own ON public.seasons
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS challenges_select_own ON public.daily_challenges;
CREATE POLICY challenges_select_own ON public.daily_challenges
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS challenges_insert_own ON public.daily_challenges;
CREATE POLICY challenges_insert_own ON public.daily_challenges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS challenges_update_own ON public.daily_challenges;
CREATE POLICY challenges_update_own ON public.daily_challenges
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

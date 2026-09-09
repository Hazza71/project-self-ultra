# Project Self Ultra (PSX)

Personal operating system for real-world capability.

| Mark | Meaning |
| --- | --- |
| **Project Self Ultra** | Full product name |
| **PSX** | Short mark |
| **Pulse** | AI layer brand (home hub) |
| **Atlas** | Manual master map |

Philosophy: build the person, not an app obsession. A successful session is open → understand what matters → act → close → live.

Phase 1 is a working local app plus typed domain rules. Full Pulse voice, wearables, seasons, and collections are out of scope.

## Repo layout

```
apps/mobile          Expo + Expo Router (Pulse home, Atlas, Ledger, Settings)
packages/domain      Typed catalog import, achievement engine, ledger, tests
data/                canonical_data.json (imported, never reinvented)
docs/                Blueprint docs (filled from the canonical handoff)
supabase/            Postgres schema, RLS, local auth shim, RLS SQL test
scripts/             Canonical ingest + optional Postgres seed
```

Canonical hierarchy (must import, never invent): **7 trees / 34 categories / 150 branches / 619 achievements**.

Trees: Character, Body, Capability, Intelligence, Expression, Adventure, Freedom.

## Hard rules

1. Achievements are **never auto-claimed** — not by Pulse, imports, wearables, or any permission tier. Only a deliberate user **Claim** in Atlas.
2. State machine: `Locked → In Progress → Ready to Claim → Verified → Claimed`. Ready to Claim is not Claimed.
3. Eligibility, XP, claim, permissions, and migrations live in `@psx/domain`, not in an LLM.
4. Mastery+ does not block platinum / base completion on the same branch.
5. Every important action has a visible Atlas / Ledger route.

## Prerequisites

- Node 20+
- pnpm 10 (`corepack enable`)
- Optional: Docker (local Postgres), Expo Go, a Supabase project

```bash
pnpm install
pnpm test
```

## Canonical catalog

`data/canonical_data.json` is the source of truth (schema `psx.canonical_data.v1`). Until that file is installed, Atlas shows an empty catalog on purpose.

If you receive the catalog as a **base64 gzip tarball** (parts 1 then 2):

```bash
# part 1
cat part1.b64 > tmp/psx-bundle.b64
# part 2 (append)
cat part2.b64 >> tmp/psx-bundle.b64
chmod +x scripts/ingest-canonical-bundle.sh
./scripts/ingest-canonical-bundle.sh
pnpm verify:canonical
pnpm test
```

`pnpm verify:canonical` fails CI unless imported counts are exactly 7/34/150/619.

Stable IDs are SHA-256 path hashes of `treeId/category/branch/title/tier` so re-imports stay stable.

## Mobile (Pulse + Atlas)

```bash
pnpm mobile          # Expo dev server
pnpm mobile:web      # Web — useful for a quick shell check
```

Home is Pulse-centred (logo, tap-to-talk stub, Focus/Progress cards, System Overview → Atlas). There is no large ULTRA title and no six-tab bar.

Without `data/canonical_data.json`, copy is still wired: after ingest, copy the JSON onto `apps/mobile/assets/canonical_data.json` (the ingest script does this) and reload.

Local progress is stored in AsyncStorage, isolated by a device user id. **Claim** is a labeled button with a confirmation; the domain layer rejects Pulse/import/wearable actors.

## Database / Auth

Schema, RLS, and no-auto-claim CHECKs: `supabase/migrations/20260909120000_init.sql`.

### Hosted Supabase

1. Create a project.
2. Copy `.env.example` → `.env` and `apps/mobile/.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
3. Apply the migration in the SQL editor (or `supabase db push`).
4. Seed catalog (service role / `DATABASE_URL` only — never ship the service key in the app):

```bash
DATABASE_URL=postgres://... pnpm exec tsx scripts/seed-postgres.mjs
```

(`pg` must be installed: `pnpm add -wD pg @types/pg`.)

Auth is Supabase Auth. RLS uses `auth.uid()`. Catalog tables are readable; user progress, evidence, claims, ledger, and competence are own-row only. Claims require `explicit_user_action = true`, `actor = 'user'`, `source ∈ {atlas, manual}`.

### Local Postgres (no Supabase account)

```bash
docker compose up -d
export DATABASE_URL=postgres://psx:psx@localhost:54322/psx
psql "$DATABASE_URL" -f supabase/local/0000_auth_shim.sql
psql "$DATABASE_URL" -f supabase/migrations/20260909120000_init.sql
psql "$DATABASE_URL" -f supabase/tests/rls.sql
```

The shim provides `auth.users` and `auth.uid()` so the same policies apply.

Phase 1 runs fully **without** a live database: the Expo app uses `@psx/domain` `MemoryStore`.

## Tests

```bash
pnpm test                 # Vitest — domain, claim, isolation, import guards
pnpm verify:canonical     # Fails unless 7/34/150/619
```

Covered:

- import counts 7/34/150/619 (skipped until the JSON is present; then required)
- stable IDs across re-import
- no auto-claim under import / Pulse-permission / wearable simulation
- Claim requires explicit user action
- Ready-to-Claim ≠ Claimed
- deterministic eligibility
- Mastery+ does not block platinum
- user isolation (store + SQL policy assertions)

## Design

Matte black / graphite / charcoal / off-white, metallic silver, selective Pulse red and gold. Tokens: `apps/mobile/src/theme/tokens.ts`. Pulse mark: spearhead in a ring with a pulse line (`PulseLogo`) — do not redesign.

## Out of Phase 1

Full Pulse AI, TTS, Collections, Seasons/Compass, Health/Strava/Garmin, Weather, Acquisitions, learner model, Year in Review, finance. Prefer typed stubs over fake UIs.

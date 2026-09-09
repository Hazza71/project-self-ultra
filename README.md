# Project Self Ultra (PSX)

Personal operating system for real-world capability.

| Mark | Meaning |
| --- | --- |
| **Project Self Ultra** | Full product name |
| **PSX** | Short mark |
| **Pulse** | AI layer brand (home hub) |
| **Atlas** | Manual master map |

Philosophy: build the person, not an app obsession. A successful session is open → understand what matters → act → close → live.

Phase 2 adds Collections, North Stars, Focus/Seasons/Compass, and a real Pulse typed-tool layer on top of the Phase 1 catalog and claim engine. Full voice TTS, wearables, weather, finance, and learner-model depth stay out of scope.

## Repo layout

```
apps/mobile          Expo + Expo Router (Pulse home, Atlas, Ledger, Focus, Compass)
packages/domain      Typed catalog import, claim engine, Collections, Pulse tools, tests
data/                canonical_data.json (imported, never reinvented)
docs/                Blueprint docs (written docs win over older visuals)
supabase/            Postgres schema, RLS, local auth shim, RLS SQL test
scripts/             Canonical ingest + optional Postgres seed
```

Canonical hierarchy (must import, never invent): **7 trees / 34 categories / 150 branches / 619 achievements**.

Trees: Character, Body, Capability, Intelligence, Expression, Adventure, Freedom.

## Hard rules

1. Achievements are **never auto-claimed** — not by Pulse, imports, wearables, or any permission tier. Only a deliberate user **Claim** in Atlas. There is no allowed Pulse Claim tool.
2. State machine: `Locked → In Progress → Ready to Claim → Verified → Claimed`. Ready to Claim is not Claimed.
3. Eligibility, XP, claim, permissions, Collections, North Stars, Seasons, and migrations live in `@psx/domain`, not in an LLM.
4. Collections are **not** Achievements. Season completion grants **0 XP**. Buying/spending never grants self-development XP.
5. Mastery+ does not block platinum / base completion on the same branch.
6. Every important action has a visible Atlas / Ledger / Focus / Compass route.

## Prerequisites

- Node 20+
- pnpm 10 (`corepack enable`)
- Optional: Docker (local Postgres), Expo Go, a Supabase project, OpenAI key (server only)

```bash
pnpm install
pnpm test
```

## Canonical catalog

`data/canonical_data.json` is the source of truth (schema `psx.canonical_data.v1`). It is imported by `@psx/domain` — never recreated by hand. Written blueprint docs in `docs/` override older visual/prototype references.

Imported counts must stay exactly **7 / 34 / 150 / 619**. `pnpm verify:canonical` fails CI otherwise.

If the catalog is ever re-delivered as a **base64 gzip tarball**:

```bash
# concatenate parts into tmp/psx-bundle.b64 (base64 only, no markers)
chmod +x scripts/ingest-canonical-bundle.sh
./scripts/ingest-canonical-bundle.sh
pnpm verify:canonical
pnpm test
```

Stable IDs are SHA-256 path hashes of `treeId/category/branch/title/tier` so re-imports stay stable.

## Mobile (Pulse + Atlas)

```bash
pnpm mobile          # Expo dev server
pnpm mobile:web      # Web — useful for a quick shell check
```

Home stays Pulse-centred: logo, typed Pulse input (tools, not a fake chatbot), Focus, one Signal, one North Star, concise progress. Manual routes: Atlas, Compass, Focus/Season, North Stars, Ledger, Settings.

### Phase 2 run notes

1. `pnpm install && pnpm test && pnpm verify:canonical`
2. `pnpm mobile` or `pnpm mobile:web`
3. Open a Branch in Atlas → add a Collection item (music Branches get Repertoire labels/metadata)
4. Home → North Stars → create a concrete target (optional deadline, linked Branches)
5. Focus → pick 2–4 Branches, start a 6–12 week Season, tick the small daily challenge set
6. Compass shows the next useful direction from progress + Focus/Season
7. Type on Home, e.g. `search piano`, `log practised scales`, `open guitar`, `claim Show Up` (the last is **rejected**)

Local progress is stored in AsyncStorage, isolated by a device user id. **Claim** is still only a labeled Atlas button with confirmation.

Without `OPENAI_API_KEY`, Pulse uses the **mock adapter**. Typed tool contracts still execute in `@psx/domain`.

## Pulse tools

Allowed tools (contracts in `packages/domain/src/pulse/tools.ts`):

- `navigate_atlas`, `search_project`, `log_activity`
- `explain_ready_to_claim`, `get_achievement_status` (never claim)
- Collections: `list_collections`, `create_collection_item`, `update_collection_item`
- North Stars: `list_north_stars`, `create_north_star`, `update_north_star`, `record_north_star_progress`
- `summarise_focus_season`, `set_focus`, `set_season`, `get_compass`

`claim_achievement` is forbidden in code. Ready-to-Claim explanations always set `canPulseClaim: false`.

### Env vars

See `.env.example`.

| Variable | Where | Purpose |
| --- | --- | --- |
| `PSX_PULSE_ADAPTER` | server / Node | `mock` (default) or `openai` |
| `EXPO_PUBLIC_PULSE_ADAPTER` | Expo | Keep `mock` unless a server proxies OpenAI |
| `OPENAI_API_KEY` | **server only** | Enables `createOpenAIAdapter`. Never ship in the app. |
| `OPENAI_MODEL` | server | Optional, default `gpt-4o-mini` |
| `OPENAI_BASE_URL` | server | Optional OpenAI-compatible base |
| `EXPO_PUBLIC_SUPABASE_URL` / `ANON_KEY` | Expo | Optional hosted backend |
| `SUPABASE_SERVICE_ROLE_KEY` / `DATABASE_URL` | server | Seed/migrations only |

The OpenAI adapter is implemented and kept; if the key is missing it throws and you stay on mock. That is the intended local/dev path — do not delete the capability.

## Database / Auth

Schema, RLS, and no-auto-claim CHECKs: `supabase/migrations/20260909120000_init.sql`.

Phase 2 tables (Collections, North Stars, Focus, Seasons, daily challenges) + own-row RLS: `supabase/migrations/20260909180000_phase2.sql`.

### Hosted Supabase

1. Create a project.
2. Copy `.env.example` → `.env` and `apps/mobile/.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
3. Apply both migrations in the SQL editor (or `supabase db push`).
4. Seed catalog (service role / `DATABASE_URL` only — never ship the service key in the app):

```bash
DATABASE_URL=postgres://... pnpm exec tsx scripts/seed-postgres.mjs
```

(`pg` must be installed: `pnpm add -wD pg @types/pg`.)

Auth is Supabase Auth. RLS uses `auth.uid()`. Catalog tables are readable; user progress, evidence, claims, ledger, competence, collections, and north stars are own-row only. Claims require `explicit_user_action = true`, `actor = 'user'`, `source ∈ {atlas, manual}`.

### Local Postgres (no Supabase account)

```bash
docker compose up -d
export DATABASE_URL=postgres://psx:psx@localhost:54322/psx
psql "$DATABASE_URL" -f supabase/local/0000_auth_shim.sql
psql "$DATABASE_URL" -f supabase/migrations/20260909120000_init.sql
psql "$DATABASE_URL" -f supabase/migrations/20260909180000_phase2.sql
psql "$DATABASE_URL" -f supabase/tests/rls.sql
```

The shim provides `auth.users` and `auth.uid()` so the same policies apply.

Phase 2 still runs fully **without** a live database: the Expo app uses `@psx/domain` `MemoryStore`.

## Tests

```bash
pnpm test                 # Vitest — domain, claim, collections, Pulse tools, isolation
pnpm verify:canonical     # Fails unless 7/34/150/619
```

Covered:

- import counts 7/34/150/619 against the shipped `canonical_data.json` digest
- stable IDs across re-import
- no auto-claim under import / Pulse-permission / wearable simulation
- Pulse typed tools cannot auto-claim (`claim_achievement` rejected + mock “claim” language)
- Claim requires explicit user action
- Ready-to-Claim ≠ Claimed
- Collections CRUD/state (including music Repertoire labels)
- North Stars + spend/buy grants 0 XP
- Season completion grants 0 XP; non-focus skills stay loggable
- Attention Budget flags too many high-load goals
- Compass suggestions from Focus/Season
- deterministic eligibility
- Mastery+ does not block platinum
- user isolation (store + SQL policy assertions)

## Design

Matte black / graphite / charcoal / off-white, metallic silver, selective Pulse red and gold. Tokens: `apps/mobile/src/theme/tokens.ts`. Pulse mark: spearhead in a ring with a pulse line (`PulseLogo`) — do not redesign.

## Out of Phase 2

Full voice TTS, Health/Strava/Garmin, Weather, Acquisitions research, learner model depth, Year in Review, finance/Open Banking, spatial Atlas zoom polish. Prefer typed stubs over fake UIs.

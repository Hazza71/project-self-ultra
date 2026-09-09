export const PRODUCT_NAME = "Project Self Ultra";
export const PRODUCT_SHORT = "PSX";
export const AI_LAYER_BRAND = "Pulse";
export const MANUAL_MAP_BRAND = "Atlas";

export const CANONICAL_SCHEMA = "psx.canonical_data.v1";

export const EXPECTED_COUNTS = {
  trees: 7,
  categories: 34,
  branches: 150,
  achievements: 619,
} as const;

export const CANONICAL_TREE_NAMES = [
  "Character",
  "Body",
  "Capability",
  "Intelligence",
  "Expression",
  "Adventure",
  "Freedom",
] as const;

export const INVARIANTS = {
  canonicalStructureMustBeImportedNotReinvented:
    "canonical_structure_must_be_imported_not_reinvented",
  achievementsNeverAutoClaim: "achievements_never_auto_claim",
  masteryPlusDoesNotBlockPlatinum: "mastery_plus_does_not_block_platinum",
} as const;

export const ID_NAMESPACE = "psx.canonical.v1";

export const ACHIEVEMENT_STATES = [
  "locked",
  "in_progress",
  "ready_to_claim",
  "verified",
  "claimed",
] as const;

export const COMPETENCE_STATES = [
  "unexplored",
  "exposed",
  "competent",
  "advanced",
  "mastered",
] as const;

/** Claim actors/sources that are allowed. Everything else is auto-claim. */
export const CLAIM_ACTOR_USER = "user" as const;
export const CLAIM_SOURCES = ["atlas", "manual"] as const;

export const FORBIDDEN_CLAIM_SOURCES = [
  "pulse",
  "pulse_stub",
  "import",
  "wearable",
  "strava",
  "garmin",
  "health",
  "system",
  "ai",
  "permission",
] as const;

/** Universal Collection states. Domain labels may differ; these stay stable. */
export const COLLECTION_STATES = [
  "saved",
  "planned",
  "active",
  "competent",
  "completed",
  "archived",
] as const;

export const NORTH_STAR_STATES = [
  "planned",
  "active",
  "paused",
  "completed",
  "archived",
] as const;

export const SEASON_STATES = ["planned", "active", "completed", "archived"] as const;

export const SEASON_MIN_WEEKS = 6;
export const SEASON_MAX_WEEKS = 12;
export const SEASON_RECOMMENDED_PRIORITY_MIN = 2;
export const SEASON_RECOMMENDED_PRIORITY_MAX = 4;
export const FOCUS_RECOMMENDED_MAX = 3;
export const DAILY_CHALLENGE_DEFAULT_COUNT = 3;
/** Stub threshold: more than this many concurrent high-load goals is overload. */
export const ATTENTION_BUDGET_HIGH_LOAD_LIMIT = 4;

export const HIGH_LOAD_COLLECTION_DIFFICULTIES = ["high", "demanding", "intense"] as const;

export const DEFAULT_PULSE_ADAPTER = "mock" as const;

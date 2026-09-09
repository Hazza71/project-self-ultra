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

import {
  ACHIEVEMENT_STATES,
  CLAIM_SOURCES,
  COLLECTION_STATES,
  COMPETENCE_STATES,
  NORTH_STAR_STATES,
  SEASON_STATES,
} from "./constants.js";

export type AchievementState = (typeof ACHIEVEMENT_STATES)[number];
export type CompetenceState = (typeof COMPETENCE_STATES)[number];
export type ClaimSource = (typeof CLAIM_SOURCES)[number];

export type CollectionState = (typeof COLLECTION_STATES)[number];
export type NorthStarState = (typeof NORTH_STAR_STATES)[number];
export type SeasonState = (typeof SEASON_STATES)[number];

export type LedgerEventType =
  | "catalog_imported"
  | "progress_started"
  | "evidence_logged"
  | "eligibility_evaluated"
  | "ready_to_claim"
  | "verified"
  | "claimed"
  | "claim_rejected"
  | "manual_log"
  | "competence_updated"
  | "collection_created"
  | "collection_updated"
  | "north_star_created"
  | "north_star_updated"
  | "north_star_progress"
  | "focus_updated"
  | "season_created"
  | "season_updated"
  | "daily_challenge_generated"
  | "daily_challenge_completed"
  | "attention_budget_flagged"
  | "pulse_tool_invoked"
  | "pulse_claim_rejected";

export type ProvenanceSource =
  | "user"
  | "atlas"
  | "manual"
  | "system"
  | "import"
  | "pulse_stub"
  | "wearable";

export interface Provenance {
  source: ProvenanceSource;
  actor: "user" | "system" | "pulse" | "import" | "wearable";
  permissionTier?: string;
  note?: string;
}

export interface CanonicalAchievementInput {
  title: string;
  tier: string;
  xp: number;
  req?: string | null;
  minReps?: number | null;
  min_reps?: number | null;
  extension?: unknown;
}

export interface CanonicalBranchInput {
  name: string;
  recommended?: boolean | string | number | null;
  achievements?: CanonicalAchievementInput[];
}

export interface CanonicalCategoryInput {
  name: string;
  description?: string | null;
  branches?: CanonicalBranchInput[];
}

export interface CanonicalTreeInput {
  id: string;
  name: string;
  icon?: string | null;
  legendary_trophy?: string | null;
  priority?: number | null;
  categories?: CanonicalCategoryInput[];
}

export interface CanonicalCountsInput {
  trees?: number;
  categories?: number;
  main_categories?: number;
  branches?: number;
  skill_branches?: number;
  achievements?: number;
}

export interface CanonicalFile {
  schema: string;
  product?: unknown;
  counts?: CanonicalCountsInput;
  invariants?: string[];
  trees: CanonicalTreeInput[];
}

export interface CatalogAchievement {
  id: string;
  branchId: string;
  categoryId: string;
  treeId: string;
  title: string;
  tier: string;
  xp: number;
  req: string;
  minReps: number;
  extension: unknown;
  sortOrder: number;
  path: string;
}

export interface CatalogBranch {
  id: string;
  categoryId: string;
  treeId: string;
  name: string;
  recommended: boolean;
  sortOrder: number;
  path: string;
  achievementIds: string[];
}

export interface CatalogCategory {
  id: string;
  treeId: string;
  name: string;
  description: string;
  sortOrder: number;
  path: string;
  branchIds: string[];
}

export interface CatalogTree {
  id: string;
  name: string;
  icon: string;
  legendaryTrophy: string;
  priority: number;
  path: string;
  categoryIds: string[];
}

export interface Catalog {
  schema: string;
  product: unknown;
  invariants: string[];
  trees: CatalogTree[];
  categories: CatalogCategory[];
  branches: CatalogBranch[];
  achievements: CatalogAchievement[];
  counts: {
    trees: number;
    categories: number;
    branches: number;
    achievements: number;
  };
}

export interface UserAchievementProgress {
  userId: string;
  achievementId: string;
  state: AchievementState;
  reps: number;
  startedAt: string | null;
  readyAt: string | null;
  verifiedAt: string | null;
  claimedAt: string | null;
  updatedAt: string;
}

export interface EvidenceRecord {
  id: string;
  userId: string;
  achievementId: string;
  kind: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface ClaimRecord {
  id: string;
  userId: string;
  achievementId: string;
  claimedAt: string;
  explicitUserAction: true;
  actor: "user";
  source: ClaimSource;
}

export interface LedgerEvent {
  id: string;
  userId: string;
  eventType: LedgerEventType;
  payload: Record<string, unknown>;
  provenance: Provenance;
  createdAt: string;
}

export interface CompetenceRecord {
  userId: string;
  branchId: string;
  state: CompetenceState;
  updatedAt: string;
}

export interface ManualLogRecord {
  id: string;
  userId: string;
  body: string;
  achievementId?: string;
  createdAt: string;
  provenance: Provenance;
}

export interface ExplicitClaimInput {
  userId: string;
  achievementId: string;
  /** Must be the boolean literal true. Any other value is rejected. */
  explicitUserAction: true;
  actor: "user";
  source: ClaimSource;
}

export interface SearchFilters {
  query?: string;
  treeId?: string;
  categoryId?: string;
  branchId?: string;
  tier?: string;
  state?: AchievementState;
  recommendedOnly?: boolean;
  readyToClaimOnly?: boolean;
}

export interface SearchHit {
  achievement: CatalogAchievement;
  branch: CatalogBranch;
  category: CatalogCategory;
  tree: CatalogTree;
  progress: UserAchievementProgress | null;
}

export interface TreeRollup {
  treeId: string;
  claimed: number;
  ready: number;
  inProgress: number;
  total: number;
  xpClaimed: number;
  xpTotal: number;
  percent: number;
}

export interface OverallRollup {
  claimed: number;
  ready: number;
  inProgress: number;
  total: number;
  xpClaimed: number;
  xpTotal: number;
  percent: number;
  byTree: TreeRollup[];
}

export interface CollectionEvidence {
  id: string;
  kind: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface RepertoireMetadata {
  arrangement?: string;
  section?: string;
  progressPercent?: number;
  tempoBpm?: number;
  fromMemory: boolean;
  usesSheetOrTab: boolean;
  recordingUrl?: string;
}

export interface CollectionItem {
  id: string;
  userId: string;
  branchId: string;
  title: string;
  type: string;
  subtype?: string;
  state: CollectionState;
  dateAdded: string;
  startedAt: string | null;
  completedAt: string | null;
  difficulty?: string;
  notes: string;
  evidence: CollectionEvidence[];
  source?: string;
  prerequisites: string[];
  tags: string[];
  rating?: number;
  reflection?: string;
  repertoire?: RepertoireMetadata;
  updatedAt: string;
}

export interface CollectionCounts {
  saved: number;
  planned: number;
  active: number;
  competent: number;
  completed: number;
  archived: number;
  total: number;
}

export interface NorthStarHistoryEntry {
  at: string;
  value: number;
  note?: string;
  source: "manual" | "spend" | "pulse" | "system";
  xpGranted: 0;
}

export interface NorthStar {
  id: string;
  userId: string;
  name: string;
  type: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  deadline: string | null;
  reason: string;
  linkedBranchIds: string[];
  linkedCategoryIds: string[];
  status: NorthStarState;
  history: NorthStarHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export type FocusKind = "branch" | "category" | "north_star";

export interface FocusItem {
  kind: FocusKind;
  id: string;
  note?: string;
  load?: "high" | "maintenance" | "temporary";
}

export interface FocusRecord {
  userId: string;
  items: FocusItem[];
  updatedAt: string;
}

export interface Season {
  id: string;
  userId: string;
  name: string;
  startsAt: string;
  endsAt: string;
  priorityBranchIds: string[];
  priorityCategoryIds: string[];
  status: SeasonState;
  review: { intention: string; actual: string; at: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyChallenge {
  id: string;
  userId: string;
  date: string;
  title: string;
  branchId?: string;
  northStarId?: string;
  done: boolean;
  completedAt: string | null;
}

export interface AttentionBudgetItem {
  kind: "focus" | "north_star" | "season_priority" | "collection";
  id: string;
  label: string;
  load: "high" | "maintenance" | "temporary";
}

export interface AttentionBudget {
  highLoadGoalCount: number;
  limit: number;
  overloaded: boolean;
  suggestion: string | null;
  items: AttentionBudgetItem[];
}

export type CompassSuggestionKind =
  | "branch"
  | "achievement"
  | "collection"
  | "north_star"
  | "maintenance"
  | "pause";

export interface CompassSuggestion {
  kind: CompassSuggestionKind;
  id: string;
  title: string;
  reason: string;
  score: number;
  href?: string;
}

export interface ReadyToClaimExplanation {
  achievementId: string;
  title: string;
  state: AchievementState;
  eligible: boolean;
  readyToClaim: boolean;
  claimed: boolean;
  missing: string[];
  canPulseClaim: false;
  nextStep: string;
}

export interface PersistSnapshot {
  version: 1 | 2;
  userId: string;
  progress: UserAchievementProgress[];
  evidence: EvidenceRecord[];
  claims: ClaimRecord[];
  ledger: LedgerEvent[];
  competence: CompetenceRecord[];
  manualLogs: ManualLogRecord[];
  collections?: CollectionItem[];
  northStars?: NorthStar[];
  focus?: FocusRecord | null;
  seasons?: Season[];
  dailyChallenges?: DailyChallenge[];
}

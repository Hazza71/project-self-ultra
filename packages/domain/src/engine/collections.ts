import { COLLECTION_STATES } from "../constants.js";
import { DomainRuleError, NotFoundError } from "../errors.js";
import type {
  Catalog,
  CollectionCounts,
  CollectionItem,
  CollectionState,
  RepertoireMetadata,
} from "../types.js";

const TRANSITIONS: Record<CollectionState, readonly CollectionState[]> = {
  saved: ["planned", "active", "archived"],
  planned: ["active", "saved", "archived"],
  active: ["competent", "completed", "planned", "archived"],
  competent: ["completed", "active", "archived"],
  completed: ["archived", "active"],
  archived: ["saved", "planned"],
};

const MUSIC_HINT = /piano|guitar|bass|sax|voice|violin|drum|instrument|music|repertoire|sing|choir/;

export function isCollectionState(value: string): value is CollectionState {
  return (COLLECTION_STATES as readonly string[]).includes(value);
}

/** Classify imported nodes only — does not invent Branches. */
export function isRepertoireBranch(catalog: Catalog, branchId: string): boolean {
  const branch = catalog.branches.find((item) => item.id === branchId);
  if (!branch) return false;
  const category = catalog.categories.find((item) => item.id === branch.categoryId);
  const haystack = `${branch.name} ${category?.name ?? ""}`.toLowerCase();
  return MUSIC_HINT.test(haystack);
}

export function collectionKindForBranch(catalog: Catalog, branchId: string): "repertoire" | "default" {
  return isRepertoireBranch(catalog, branchId) ? "repertoire" : "default";
}

export function collectionStateLabel(
  state: CollectionState,
  kind: "default" | "repertoire" = "default",
): string {
  if (kind === "repertoire") {
    const labels: Record<CollectionState, string> = {
      saved: "Wanted",
      planned: "Learning",
      active: "Practising",
      competent: "Performance Ready",
      completed: "Completed",
      archived: "Archived",
    };
    return labels[state];
  }
  const labels: Record<CollectionState, string> = {
    saved: "Saved",
    planned: "Planned",
    active: "Active",
    competent: "Competent",
    completed: "Completed",
    archived: "Archived",
  };
  return labels[state];
}

export function canTransitionCollection(from: CollectionState, to: CollectionState): boolean {
  if (from === to) return true;
  return TRANSITIONS[from].includes(to);
}

export function assertCollectionTransition(from: CollectionState, to: CollectionState): void {
  if (!canTransitionCollection(from, to)) {
    throw new DomainRuleError(
      "illegal_collection_transition",
      `Collection cannot move ${from} → ${to}. Collections are not Achievements.`,
    );
  }
}

export function defaultCollectionType(kind: "default" | "repertoire"): string {
  return kind === "repertoire" ? "repertoire" : "item";
}

export function emptyRepertoire(): RepertoireMetadata {
  return {
    fromMemory: false,
    usesSheetOrTab: false,
  };
}

export function countCollections(items: CollectionItem[]): CollectionCounts {
  const counts: CollectionCounts = {
    saved: 0,
    planned: 0,
    active: 0,
    competent: 0,
    completed: 0,
    archived: 0,
    total: items.length,
  };
  for (const item of items) {
    counts[item.state] += 1;
  }
  return counts;
}

export function formatCollectionCounts(counts: CollectionCounts, kind: "default" | "repertoire"): string {
  const parts = COLLECTION_STATES.filter((state) => counts[state] > 0).map(
    (state) => `${counts[state]} ${collectionStateLabel(state, kind)}`,
  );
  if (parts.length === 0) return "No collection items";
  return parts.join(" · ");
}

export function requireBranch(catalog: Catalog, branchId: string): void {
  if (!catalog.branches.some((item) => item.id === branchId)) {
    throw new NotFoundError(`Unknown branch ${branchId}`);
  }
}

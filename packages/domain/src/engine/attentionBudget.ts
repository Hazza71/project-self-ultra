import { ATTENTION_BUDGET_HIGH_LOAD_LIMIT, HIGH_LOAD_COLLECTION_DIFFICULTIES } from "../constants.js";
import type {
  AttentionBudget,
  AttentionBudgetItem,
  CollectionItem,
  FocusRecord,
  NorthStar,
  Season,
} from "../types.js";

function isHighDifficulty(value: string | undefined): boolean {
  if (!value) return false;
  return (HIGH_LOAD_COLLECTION_DIFFICULTIES as readonly string[]).includes(value.toLowerCase());
}

export function evaluateAttentionBudget(input: {
  focus: FocusRecord | null;
  northStars: NorthStar[];
  season: Season | null;
  collections: CollectionItem[];
  labels?: { branchName?: (id: string) => string };
}): AttentionBudget {
  const items: AttentionBudgetItem[] = [];
  const seen = new Set<string>();

  const push = (item: AttentionBudgetItem) => {
    const key = `${item.kind}:${item.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push(item);
  };

  for (const focusItem of input.focus?.items ?? []) {
    const load = focusItem.load ?? "high";
    push({
      kind: "focus",
      id: `${focusItem.kind}:${focusItem.id}`,
      label: focusItem.note || `${focusItem.kind} ${focusItem.id.slice(0, 8)}`,
      load,
    });
  }

  for (const star of input.northStars) {
    if (star.status !== "active") continue;
    push({
      kind: "north_star",
      id: star.id,
      label: star.name,
      load: "high",
    });
  }

  if (input.season?.status === "active") {
    for (const branchId of input.season.priorityBranchIds) {
      push({
        kind: "season_priority",
        id: branchId,
        label: input.labels?.branchName?.(branchId) ?? branchId.slice(0, 12),
        load: "high",
      });
    }
  }

  for (const item of input.collections) {
    if (item.state !== "active" && item.state !== "competent") continue;
    if (!isHighDifficulty(item.difficulty)) continue;
    push({
      kind: "collection",
      id: item.id,
      label: item.title,
      load: "high",
    });
  }

  const highLoadGoalCount = items.filter((item) => item.load === "high").length;
  const overloaded = highLoadGoalCount > ATTENTION_BUDGET_HIGH_LOAD_LIMIT;
  return {
    highLoadGoalCount,
    limit: ATTENTION_BUDGET_HIGH_LOAD_LIMIT,
    overloaded,
    suggestion: overloaded
      ? `Too many high-load goals (${highLoadGoalCount} over a budget of ${ATTENTION_BUDGET_HIGH_LOAD_LIMIT}). Pause or move some to maintenance — you can override.`
      : null,
    items,
  };
}

import type {
  Catalog,
  CollectionItem,
  CompassSuggestion,
  FocusRecord,
  NorthStar,
  Season,
  UserAchievementProgress,
} from "../types.js";
import { branchKind } from "./branchKind.js";
import type { AttentionBudget } from "../types.js";

function inFocus(focus: FocusRecord | null, branchId: string, categoryId: string): boolean {
  return (
    focus?.items.some(
      (item) =>
        (item.kind === "branch" && item.id === branchId) ||
        (item.kind === "category" && item.id === categoryId),
    ) ?? false
  );
}

function inSeason(season: Season | null, branchId: string, categoryId: string): boolean {
  if (!season || season.status !== "active") return false;
  return season.priorityBranchIds.includes(branchId) || season.priorityCategoryIds.includes(categoryId);
}

export function recommendNext(input: {
  catalog: Catalog;
  progress: UserAchievementProgress[];
  focus: FocusRecord | null;
  season: Season | null;
  northStars: NorthStar[];
  collections: CollectionItem[];
  budget: AttentionBudget;
}): CompassSuggestion[] {
  const suggestions: CompassSuggestion[] = [];
  const byId = new Map(input.progress.map((item) => [item.achievementId, item]));

  if (input.budget.overloaded) {
    suggestions.push({
      kind: "pause",
      id: "attention-budget",
      title: "Lighten the load",
      reason: input.budget.suggestion ?? "Too many high-load goals are active.",
      score: 100,
    });
  }

  for (const achievement of input.catalog.achievements) {
    const state = byId.get(achievement.id)?.state ?? "locked";
    const focused = inFocus(input.focus, achievement.branchId, achievement.categoryId);
    const seasonal = inSeason(input.season, achievement.branchId, achievement.categoryId);
    const weight = (focused ? 25 : 0) + (seasonal ? 20 : 0);

    if (state === "ready_to_claim" || state === "verified") {
      suggestions.push({
        kind: "achievement",
        id: achievement.id,
        title: `${achievement.title} is Ready to Claim`,
        reason: "Eligible in Atlas. Pulse will not claim it for you.",
        score: 80 + weight,
        href: `/atlas/achievement/${achievement.id}`,
      });
    } else if (state === "in_progress") {
      suggestions.push({
        kind: "achievement",
        id: achievement.id,
        title: `Continue ${achievement.title}`,
        reason: focused || seasonal ? "It is on Focus/Season and already in progress." : "Nearest open milestone.",
        score: 40 + weight,
        href: `/atlas/achievement/${achievement.id}`,
      });
    }
  }

  for (const star of input.northStars.filter((item) => item.status === "active")) {
    const behind = star.deadline && Date.parse(star.deadline) < Date.now() + 21 * 24 * 60 * 60 * 1000;
    suggestions.push({
      kind: "north_star",
      id: star.id,
      title: star.name,
      reason: behind ? "Deadline is close — one concrete step." : "Active North Star.",
      score: behind ? 70 : 45,
      href: `/north-stars/${star.id}`,
    });
  }

  for (const item of input.collections.filter((entry) => entry.state === "active" || entry.state === "planned")) {
    suggestions.push({
      kind: "collection",
      id: item.id,
      title: item.title,
      reason: item.state === "planned" ? "Planned collection item waiting to start." : "Active collection work.",
      score: item.state === "active" ? 35 : 28,
    });
  }

  const startedBranches = new Set(
    input.progress
      .filter((item) => item.state !== "locked")
      .map((item) => input.catalog.achievements.find((achievement) => achievement.id === item.achievementId)?.branchId)
      .filter((id): id is string => Boolean(id)),
  );

  for (const branch of input.catalog.branches) {
    if (startedBranches.has(branch.id)) continue;
    const kind = branchKind(input.catalog, branch.id);
    if (kind !== "core") continue;
    const focused = inFocus(input.focus, branch.id, branch.categoryId);
    const seasonal = inSeason(input.season, branch.id, branch.categoryId);
    if (!focused && !seasonal) continue;
    suggestions.push({
      kind: "branch",
      id: branch.id,
      title: `Open ${branch.name}`,
      reason: "Core branch on Focus/Season that is still unexplored.",
      score: 55 + (focused ? 10 : 0) + (seasonal ? 8 : 0),
      href: `/atlas/branch/${branch.id}`,
    });
  }

  suggestions.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  const seen = new Set<string>();
  const unique: CompassSuggestion[] = [];
  for (const suggestion of suggestions) {
    const key = `${suggestion.kind}:${suggestion.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(suggestion);
    if (unique.length >= 6) break;
  }
  if (unique.length === 0) {
    unique.push({
      kind: "maintenance",
      id: "show-up",
      title: "Pick one Branch and log something real",
      reason: "No Focus/Season signal yet. Compass recommends; it does not dictate.",
      score: 10,
      href: "/atlas",
    });
  }
  return unique;
}

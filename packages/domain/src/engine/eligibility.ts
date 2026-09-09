import type { CatalogAchievement, UserAchievementProgress } from "../types.js";

function structuredMinReps(achievement: CatalogAchievement): number | null {
  if (!achievement.extension || typeof achievement.extension !== "object") {
    return null;
  }
  const ext = achievement.extension as Record<string, unknown>;
  const eligibility = ext.eligibility;
  if (eligibility && typeof eligibility === "object") {
    const min = (eligibility as Record<string, unknown>).minReps;
    if (typeof min === "number" && Number.isFinite(min)) return min;
  }
  if (typeof ext.minReps === "number" && Number.isFinite(ext.minReps)) {
    return ext.minReps;
  }
  return null;
}

/**
 * Deterministic eligibility. Never claims.
 * Mastery+ (or any other achievement) is evaluated independently — it does not
 * gate platinum/base achievements on the same branch.
 */
export function isEligible(
  achievement: CatalogAchievement,
  progress: UserAchievementProgress | null,
  evidenceCount: number,
): boolean {
  if (!progress || progress.state === "locked") return false;
  if (progress.state === "claimed") return false;

  const minReps = structuredMinReps(achievement) ?? achievement.minReps;

  if (minReps > 0) {
    return progress.reps >= minReps;
  }

  // Zero-rep achievements still require a deliberate start (In Progress)
  // plus at least one manual evidence/log so Pulse/import cannot mark Ready.
  return evidenceCount >= 1;
}

export function normalizeTier(tier: string): string {
  return tier.trim().toLowerCase().replace(/[_ ]+/g, "");
}

export function isMasteryPlusTier(tier: string): boolean {
  const t = normalizeTier(tier);
  return t === "mastery+" || t === "masteryplus" || t === "masteryplus+";
}

export function isPlatinumTier(tier: string): boolean {
  return normalizeTier(tier) === "platinum";
}

/**
 * Base/platinum completion is never blocked by Mastery+ progress or claims.
 */
export function masteryPlusBlocksPlatinum(): false {
  return false;
}

export function canEvaluateIndependently(): true {
  return true;
}

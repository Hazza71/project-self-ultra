import type { Catalog, CatalogAchievement, CompetenceState, UserAchievementProgress } from "../types.js";
import { isMasteryPlusTier, normalizeTier } from "./eligibility.js";

const TIER_RANK: Record<string, number> = {
  bronze: 1,
  iron: 1,
  copper: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
  diamond: 5,
  legendary: 5,
  mastery: 6,
  masteryplus: 7,
  "mastery+": 7,
};

export function tierRank(tier: string): number {
  const key = normalizeTier(tier);
  if (key in TIER_RANK) return TIER_RANK[key]!;
  if (isMasteryPlusTier(tier)) return 7;
  return 0;
}

export function competenceFromProgress(
  achievements: CatalogAchievement[],
  progressById: Map<string, UserAchievementProgress>,
): CompetenceState {
  if (achievements.length === 0) return "unexplored";

  let anyStarted = false;
  let claimedCount = 0;
  let maxClaimedRank = 0;

  for (const achievement of achievements) {
    const progress = progressById.get(achievement.id);
    if (!progress || progress.state === "locked") continue;
    anyStarted = true;
    if (progress.state === "claimed") {
      claimedCount += 1;
      maxClaimedRank = Math.max(maxClaimedRank, tierRank(achievement.tier));
    }
  }

  if (!anyStarted) return "unexplored";
  if (claimedCount === 0) return "exposed";
  if (maxClaimedRank >= 6 || claimedCount === achievements.length) return "mastered";
  if (maxClaimedRank >= 4 || claimedCount >= Math.ceil(achievements.length * 0.66)) {
    return "advanced";
  }
  return "competent";
}

export function competenceForBranch(
  catalog: Catalog,
  branchId: string,
  progress: UserAchievementProgress[],
): CompetenceState {
  const branch = catalog.branches.find((item) => item.id === branchId);
  if (!branch) return "unexplored";
  const achievements = catalog.achievements.filter((item) => item.branchId === branchId);
  const map = new Map(progress.map((item) => [item.achievementId, item]));
  return competenceFromProgress(achievements, map);
}

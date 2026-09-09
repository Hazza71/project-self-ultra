import type { Catalog } from "../types.js";

/**
 * Platinum-facing branch role derived from canonical data.
 * `recommended` marks core/mandatory branches. Legendary/Mythic achievement
 * tiers mark optional Legendary branches. Everything else is elective.
 * Does not invent taxonomy — only classifies imported nodes.
 */
export type BranchKind = "core" | "elective" | "legendary";

const LEGENDARY_TIERS = new Set(["Legendary", "Mythic"]);

export function branchKind(catalog: Catalog, branchId: string): BranchKind {
  const hasLegendary = catalog.achievements.some(
    (achievement) => achievement.branchId === branchId && LEGENDARY_TIERS.has(achievement.tier),
  );
  if (hasLegendary) return "legendary";
  const branch = catalog.branches.find((item) => item.id === branchId);
  return branch?.recommended ? "core" : "elective";
}

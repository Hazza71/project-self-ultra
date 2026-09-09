import { NORTH_STAR_STATES } from "../constants.js";
import { DomainRuleError } from "../errors.js";
import type { NorthStar, NorthStarHistoryEntry, NorthStarState } from "../types.js";

const TRANSITIONS: Record<NorthStarState, readonly NorthStarState[]> = {
  planned: ["active", "archived"],
  active: ["paused", "completed", "archived"],
  paused: ["active", "archived"],
  completed: ["archived", "active"],
  archived: ["planned"],
};

export function isNorthStarState(value: string): value is NorthStarState {
  return (NORTH_STAR_STATES as readonly string[]).includes(value);
}

export function canTransitionNorthStar(from: NorthStarState, to: NorthStarState): boolean {
  if (from === to) return true;
  return TRANSITIONS[from].includes(to);
}

export function assertNorthStarTransition(from: NorthStarState, to: NorthStarState): void {
  if (!canTransitionNorthStar(from, to)) {
    throw new DomainRuleError(
      "illegal_north_star_transition",
      `North Star cannot move ${from} → ${to}.`,
    );
  }
}

/**
 * Buying, spending, or obtaining a material object never grants self-development XP.
 * North Star movement is tracked; XP stays on claimed Achievements only.
 */
export function xpFromNorthStarEvent(_source?: NorthStarHistoryEntry["source"]): 0 {
  return 0;
}

export function northStarProgressRatio(star: NorthStar): number {
  if (star.targetValue === 0) return star.currentValue === 0 ? 1 : 0;
  return star.currentValue / star.targetValue;
}

export function formatNorthStarProgress(star: NorthStar): string {
  const pct = Math.round(Math.max(0, northStarProgressRatio(star)) * 100);
  return `${star.currentValue}/${star.targetValue} ${star.unit} · ${pct}%`;
}

export function isSpendLikeSource(source: string | undefined): boolean {
  if (!source) return false;
  return /spend|buy|bought|purchase|shop|acquire|acquisition/i.test(source);
}
